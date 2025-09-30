// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { executeQuery } = require("../config/database");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { categoryId } = req.params;
      let folderName = "uploads";

      if (categoryId) {
        // 🔹 Lấy category + parent từ DB
        const query = `
          SELECT c.title as category_title, p.title as parent_title
          FROM categories c
          LEFT JOIN categories p ON c.parent_id = p.id
          WHERE c.id = ?
        `;
        const rows = await executeQuery(query, [categoryId]);

        if (rows.length > 0) {
          const raw = rows[0].parent_title || rows[0].category_title;

          // 🔹 Làm sạch tên folder
          folderName = `uploads/${raw
            .replace(/\s+/g, "_")        // khoảng trắng -> "_"
            .replace(/[^a-zA-Z0-9_-]/g, "") // bỏ ký tự đặc biệt
          }`;
        }
      }

      // 🔹 Tạo thư mục nếu chưa có
      fs.mkdirSync(folderName, { recursive: true });
      cb(null, folderName);
    } catch (err) {
      cb(err, "uploads");
    }
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    let baseName = req.query.filename || req.body?.filename;

    if (!baseName) {
      // 🔹 Nếu không truyền custom name, lấy tên gốc (không dấu cách)
      baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    } else {
      // 🔹 Nếu có custom name thì làm sạch
      baseName = baseName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
    }

    // 🔹 Luôn thêm timestamp để tránh ghi đè
    cb(null, `${baseName}_${Date.now()}${ext}`);
  }
});

// 🔹 Chỉ cho phép các loại file ảnh
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only jpg, png, gif, webp allowed"), false);
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
