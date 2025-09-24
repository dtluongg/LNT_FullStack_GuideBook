const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { executeQuery } = require('../config/database'); // ✅ gọi DB

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { categoryId } = req.params;

      let folderName = 'uploads';

      if (categoryId) {
        // Lấy category + parent từ DB
        const query = `
          SELECT c.title as category_title, p.title as parent_title
          FROM categories c
          LEFT JOIN categories p ON c.parent_id = p.id
          WHERE c.id = ?
        `;
        const rows = await executeQuery(query, [categoryId]);
        if (rows.length > 0) {
          if (rows[0].parent_title) {
            folderName = `uploads/${rows[0].parent_title.replace(/\s+/g, '_')}`;
          } else {
            folderName = `uploads/${rows[0].category_title.replace(/\s+/g, '_')}`;
          }
        }
      }

      // Tạo thư mục nếu chưa tồn tại
      fs.mkdirSync(folderName, { recursive: true });

      cb(null, folderName);
    } catch (err) {
      cb(err, 'uploads');
    }
  },
  filename: (req, file, cb) => {
    // Dùng query param cho chắc
    let customName = req.query.filename || file.originalname.split('.')[0];
    customName = customName.replace(/\s+/g, '_');
    const ext = path.extname(file.originalname).toLowerCase();
    const finalName = `${customName}_${Date.now()}${ext}`;
    cb(null, finalName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (png, jpg, jpeg, gif)'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
