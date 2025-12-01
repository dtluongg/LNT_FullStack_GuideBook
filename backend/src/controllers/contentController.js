// src/controllers/contentController.js
const contentModel = require('../models/contentModel');
const { cleanupContentImages } = require('../middleware/helper');
const contentController = {
  // 🔹 GET /api/contents?category_id=1&include=all
  getContentsByCategory: async (req, res) => {
    try {
      const { category_id, include } = req.query;

      if (!category_id) {
        return res.status(400).json({
          success: false,
          message: 'category_id is required'
        });
      }

      const includeUnpublished = include === 'all';
      const contents = await contentModel.findContentsByCategory(
        category_id,
        includeUnpublished
      );

      res.json({
        success: true,
        data: contents,
        total: contents.length
      });
    } catch (err) {
      console.error('❌ getContentsByCategory error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to get contents'
      });
    }
  },

  // 🔹 GET /api/contents/tree/:categoryId
  getContentsTreeByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { include } = req.query;
      if (!categoryId) {
        return res.status(400).json({ success: false, message: 'categoryId is required' });
      }
      const includeUnpublished = include === 'all';
      const tree = await contentModel.getContentsTreeByCategory(categoryId, includeUnpublished);
      return res.json({ success: true, data: tree, total: tree.length });
    } catch (err) {
      console.error('❌ getContentsTreeByCategory error:', err);
      return res.status(500).json({ success: false, message: 'Failed to get contents tree' });
    }
  },

  // 🔹 GET /api/contents/:id
  getContentById: async (req, res) => {
    try {
      const { id } = req.params;
      const content = await contentModel.findContentById(id);

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Tăng view count mỗi lần lấy content
      await contentModel.incrementViewCount(id);

      res.json({ success: true, data: content });
    } catch (err) {
      console.error('❌ getContentById error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to get content'
      });
    }
  },

  // 🔹 POST /api/contents
  createContent: async (req, res) => {
    try {
      const { category_id, parent_id = null, title, html_content, plain_content, is_published } = req.body;

      if (!category_id || !title) {
        return res.status(400).json({ success: false, message: 'category_id and title are required' });
      }

      // nếu có parent_id thì validate parent tồn tại và thuộc cùng category
      if (parent_id) {
        const parent = await contentModel.findContentById(parent_id);
        if (!parent) {
          return res.status(400).json({ success: false, message: 'parent_id not found' });
        }
        if (String(parent.category_id) !== String(category_id)) {
          return res.status(400).json({ success: false, message: 'parent must belong to the same category' });
        }
      }

      const newId = await contentModel.createContent({
        category_id,
        parent_id,
        title,
        html_content,
        plain_content,
        is_published
      });

      res.status(201).json({ success: true, message: 'Content created successfully', data: { id: newId, category_id, parent_id, title, is_published } });
    } catch (err) {
      console.error('❌ createContent error:', err);
      res.status(500).json({ success: false, message: 'Failed to create content' });
    }
  },

  // 🔹 PUT /api/contents/:id
  updateContent: async (req, res) => {
    try {
      const { id } = req.params;
      // Only allow updating safe fields via API
      const allowed = ['title', 'html_content', 'plain_content', 'is_published'];
      const payload = {};
      allowed.forEach((k) => {
        if (req.body[k] !== undefined) payload[k] = req.body[k];
      });

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ success: false, message: 'No updatable fields provided' });
      }

      const result = await contentModel.updateContent(id, payload);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Content not found or no fields updated'
        });
      }

      res.json({
        success: true,
        message: 'Content updated successfully'
      });
    } catch (err) {
      console.error('❌ updateContent error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to update content'
      });
    }
  },

  // 🔹 DELETE /api/contents/:id
  deleteContent: async (req, res) => {
    try {
      const { id } = req.params;

      // 1) dọn file ảnh thuộc content
      await cleanupContentImages(id);

      // 2) xóa content (content_images sẽ tự xóa theo CASCADE)
      const result = await contentModel.removeContent(id);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content deleted successfully (files cleaned)'
      });
      } catch (err) {
        console.error('❌ deleteContent error:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to delete content'
        });
      }
  },

  // 🔹 GET /api/contents/search?q=keyword&module_id=1
  searchContents: async (req, res) => {
    try {
      const { q, module_id } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query (q) is required'
        });
      }

      const results = await contentModel.searchContents(q, module_id);

      res.json({
        success: true,
        data: results,
        total: results.length
      });
    } catch (err) {
      console.error('❌ searchContents error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to search contents'
      });
    }
  }
};

module.exports = contentController;
