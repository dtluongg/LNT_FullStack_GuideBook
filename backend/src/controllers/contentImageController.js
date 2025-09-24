const path = require('path');
const fs = require('fs');
const contentImageModel = require('../models/contentImageModel');

// Upload ảnh mới
const uploadImage = async (req, res) => {
  try {
    const { contentId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imageUrl = path.join(req.file.destination, req.file.filename).replace(/\\/g, '/');

    const id = await contentImageModel.addImage(contentId, imageUrl, req.body.caption || null);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: { id, contentId, imageUrl, caption: req.body.caption || null }
    });
  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

// Lấy danh sách ảnh theo content
const getImagesByContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const images = await contentImageModel.findImagesByContent(contentId);
    res.json({ success: true, data: images });
  } catch (err) {
    console.error('Get images error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve images' });
  }
};

// Lấy danh sách ảnh theo category
const getImagesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const images = await contentImageModel.findImagesByCategory(categoryId);
    res.json({ success: true, data: images });
  } catch (err) {
    console.error('Get images by category error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve images by category' });
  }
};

// Update ảnh (caption, order, hoặc thay file)
const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await contentImageModel.findImageById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    let updateData = { caption: req.body.caption, order_index: req.body.order_index };

    if (req.file) {
      // Lấy category name của content này
      const query = `
        SELECT c.id as category_id, c.title as category_title, p.title as parent_title
        FROM contents ct
        JOIN categories c ON ct.category_id = c.id
        LEFT JOIN categories p ON c.parent_id = p.id
        WHERE ct.id = ?
      `;
      const rows = await executeQuery(query, [existing.content_id]);

      let folderName = 'uploads';
      if (rows.length > 0) {
        if (rows[0].parent_title) {
          folderName = `uploads/${rows[0].parent_title.replace(/\s+/g, '_')}`;
        } else {
          folderName = `uploads/${rows[0].category_title.replace(/\s+/g, '_')}`;
        }
      }

      // Tạo thư mục nếu chưa có
      fs.mkdirSync(folderName, { recursive: true });

      // Tạo tên file mới
      const ext = path.extname(req.file.originalname).toLowerCase();
      const baseName = (req.query.filename || req.file.originalname.split('.')[0]).replace(/\s+/g, '_');
      const finalName = `${baseName}_${Date.now()}${ext}`;
      const newPath = path.join(folderName, finalName).replace(/\\/g, '/');

      // Xóa file cũ
      if (fs.existsSync(existing.image_url)) fs.unlinkSync(existing.image_url);

      // Di chuyển file từ multer temp → thư mục đúng
      fs.renameSync(req.file.path, newPath);

      updateData.image_url = newPath;
    }

    await contentImageModel.updateImage(id, updateData);

    res.json({ success: true, message: 'Image updated successfully' });
  } catch (err) {
    console.error('Update image error:', err);
    res.status(500).json({ success: false, message: 'Failed to update image' });
  }
};


// Xóa ảnh
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await contentImageModel.findImageById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Xóa file vật lý
    if (fs.existsSync(existing.image_url)) {
      fs.unlinkSync(existing.image_url);
    }

    await contentImageModel.removeImage(id);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
};

module.exports = {
  uploadImage,
  getImagesByContent,
  getImagesByCategory,
  updateImage,
  deleteImage
};
