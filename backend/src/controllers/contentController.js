// src/controllers/contentController.js
const contentModel = require('../models/contentModel');

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
      const { category_id, title, html_content, plain_content, is_published } = req.body;

      if (!category_id || !title) {
        return res.status(400).json({
          success: false,
          message: 'category_id and title are required'
        });
      }

      const newId = await contentModel.createContent({
        category_id,
        title,
        html_content,
        plain_content,
        is_published
      });

      res.status(201).json({
        success: true,
        message: 'Content created successfully',
        data: { id: newId, category_id, title, is_published }
      });
    } catch (err) {
      console.error('❌ createContent error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to create content'
      });
    }
  },

  // 🔹 PUT /api/contents/:id
  updateContent: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await contentModel.updateContent(id, req.body);

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
      const result = await contentModel.removeContent(id);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content deleted successfully'
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
