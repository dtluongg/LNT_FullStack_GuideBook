const multer = require('multer');
const path = require('path');

// Đặt storage engine cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // thư mục lưu file (tạo sẵn ở root project)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// Kiểm tra loại file (chỉ ảnh)
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only jpg, png, gif allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
