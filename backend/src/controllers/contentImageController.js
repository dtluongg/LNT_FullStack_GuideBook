const path = require("path");
const fs = require("fs");
const contentImageModel = require("../models/contentImageModel");
const { executeQuery } = require("../config/database");

// Upload ảnh mới
const uploadImage = async (req, res) => {
    try {
        const { contentId } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Lấy category để biết folder
        const rows = await executeQuery(
            `SELECT c.id AS category_id, c.title AS category_title, p.title AS parent_title
       FROM contents ct
       JOIN categories c ON ct.category_id = c.id
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE ct.id = ?`,
            [contentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Content not found" });
        }

        const raw = rows[0].parent_title || rows[0].category_title;
        const folderName = raw
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_-]/g, "");
        const uploadDir = path.join("uploads", folderName);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Đường dẫn file cuối cùng (multer đã đặt tên chuẩn)
        const newFilePath = path.join(uploadDir, req.file.filename);

        // Chuyển file từ temp (multer lưu tạm) sang đúng folder
        fs.renameSync(req.file.path, newFilePath);

        const imageUrl = `/${newFilePath.replace(/\\/g, "/")}`;

        const id = await contentImageModel.addImage(contentId, imageUrl);

        res.json({
            success: true,
            message: "Image uploaded successfully",
            data: { id, contentId, imageUrl },
        });
    } catch (err) {
        console.error("Upload image error:", err);
        res.status(500).json({ success: false, message: "Upload failed" });
    }
};

// Lấy danh sách ảnh theo content
const getImagesByContent = async (req, res) => {
    try {
        const { contentId } = req.params;
        const images = await contentImageModel.findImagesByContent(contentId);
        res.json({ success: true, data: images });
    } catch (err) {
        console.error("Get images error:", err);
        res.status(500).json({ success: false, message: "Failed to retrieve images" });
    }
};

// Lấy danh sách ảnh theo category
const getImagesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const images = await contentImageModel.findImagesByCategory(categoryId);
        res.json({ success: true, data: images });
    } catch (err) {
        console.error("Get images by category error:", err);
        res.status(500).json({ success: false, message: "Failed to retrieve images by category" });
    }
};

// Update ảnh (caption, order, hoặc thay file)
const updateImage = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await contentImageModel.findImageById(id);

        if (!existing) {
            return res.status(404).json({ success: false, message: "Image not found" });
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

            let folderName = "uploads";
            if (rows.length > 0) {
                const raw = rows[0].parent_title || rows[0].category_title;
                folderName = `uploads/${raw.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "")}`;
            }

            fs.mkdirSync(folderName, { recursive: true });

            const ext = path.extname(req.file.originalname).toLowerCase();
            const baseName = (
                req.query.filename || path.basename(req.file.originalname, ext)
            ).replace(/\s+/g, "_");

            const finalName = req.query.filename
                ? `${baseName}${ext}` // nếu có query -> giữ nguyên
                : `${baseName}_${Date.now()}${ext}`; // nếu không có query -> thêm timestamp

            const newPath = path.join(folderName, finalName);

            // Xóa file cũ (cần chuẩn hóa path vì DB lưu /uploads/...)
            const oldPath = existing.image_url.startsWith("/")
                ? existing.image_url.substring(1) // bỏ dấu "/" đầu
                : existing.image_url;

            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

            fs.renameSync(req.file.path, newPath);

            // ✅ Lưu vào DB luôn dạng /uploads/... để đồng bộ với uploadImage
            updateData.image_url = `/${newPath.replace(/\\/g, "/")}`;
        }

        await contentImageModel.updateImage(id, updateData);

        res.json({ success: true, message: "Image updated successfully" });
    } catch (err) {
        console.error("Update image error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update image",
            error: err.message,
        });
    }
};

// Xóa ảnh
const deleteImage = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await contentImageModel.findImageById(id);

        if (!existing) {
            return res.status(404).json({ success: false, message: "Image not found" });
        }

        // Xóa file vật lý
        if (fs.existsSync(existing.image_url)) {
            fs.unlinkSync(existing.image_url);
        }

        await contentImageModel.removeImage(id);
        res.json({ success: true, message: "Image deleted successfully" });
    } catch (err) {
        console.error("Delete image error:", err);
        res.status(500).json({ success: false, message: "Failed to delete image" });
    }
};

module.exports = {
    uploadImage,
    getImagesByContent,
    getImagesByCategory,
    updateImage,
    deleteImage,
};
