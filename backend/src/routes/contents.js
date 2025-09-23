const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// 🔹 Lấy contents theo category_id (?include=all để lấy cả unpublished)
router.get('/', contentController.getContentsByCategory);

// 🔹 Lấy content theo ID
router.get('/:id', contentController.getContentById);

// 🔹 Tìm kiếm content
router.get('/search/query', contentController.searchContents);

// 🔹 Tạo content mới
router.post('/', contentController.createContent);

// 🔹 Cập nhật content
router.put('/:id', contentController.updateContent);

// 🔹 Xoá content
router.delete('/:id', contentController.deleteContent);

module.exports = router;
