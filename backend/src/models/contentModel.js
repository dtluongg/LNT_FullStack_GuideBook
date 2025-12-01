const { executeQuery } = require('../config/database');

// 🔹 Lấy tất cả content theo category_id
// includeUnpublished: có lấy cả những content chưa publish hay không, nếu false thì chỉ lấy những content đã publish
const findContentsByCategory = async (categoryId, includeUnpublished = false) => {
  const whereClause = includeUnpublished
    ? 'WHERE c.category_id = ?'
    : 'WHERE c.category_id = ? AND c.is_published = true';

  const query = `
    SELECT 
      c.id,
      c.category_id,
      c.parent_id,
      c.title,
      c.html_content,
      c.plain_content,
      c.is_published,
      c.view_count,
      c.order_index,
      c.create_update_at,
      cat.title AS category_title,
      m.name AS module_name
    FROM contents c
    JOIN categories cat ON c.category_id = cat.id
    JOIN modules m ON cat.module_id = m.id
    ${whereClause}
    ORDER BY c.order_index ASC
  `;
  return await executeQuery(query, [categoryId]);
};

// 🔹 Lấy content theo ID
const findContentById = async (id) => {
  const query = `
    SELECT 
      c.id,
      c.category_id,
      c.parent_id,
      c.title,
      c.html_content,
      c.plain_content,
      c.is_published,
      c.view_count,
      c.order_index,
      c.create_update_at,
      cat.title AS category_title,
      m.name AS module_name
    FROM contents c
    JOIN categories cat ON c.category_id = cat.id
    JOIN modules m ON cat.module_id = m.id
    WHERE c.id = ?
  `;
  const rows = await executeQuery(query, [id]);
  return rows[0];
};

// 🔹 Tạo content mới
const createContent = async ({ category_id, parent_id = null, title, html_content, plain_content, is_published = true }) => {
  // tính order_index theo cùng category AND cùng parent_id (sibling group)
  const maxOrderRes = await executeQuery(
    'SELECT MAX(order_index) as max_order FROM contents WHERE category_id = ? AND (parent_id = ? OR (parent_id IS NULL AND ? IS NULL))',
    [category_id, parent_id, parent_id]
  );
  const nextOrderIndex = (maxOrderRes[0]?.max_order ?? -1) + 1;

  const query = `
    INSERT INTO contents (category_id, parent_id, title, html_content, plain_content, is_published, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await executeQuery(query, [
    category_id,
    parent_id,
    title,
    html_content || '',
    plain_content || '',
    is_published,
    nextOrderIndex
  ]);
  return result.insertId;
};

// 🔹 Cập nhật content
const updateContent = async (id, data) => {
  const fields = [];
  const params = [];

  // Only allow updating the following safe fields via API
  ['title', 'html_content', 'plain_content', 'is_published'].forEach((key) => {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  });

  if (!fields.length) return { affectedRows: 0 };

  const query = `UPDATE contents SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);

  return await executeQuery(query, params);
};

// 🔹 Xoá content
const removeContent = async (id) => {
  return await executeQuery('DELETE FROM contents WHERE id = ?', [id]);
};

// 🔹 Tăng view count
const incrementViewCount = async (id) => {
  return await executeQuery('UPDATE contents SET view_count = view_count + 1 WHERE id = ?', [id]);
};

// 🔹 Search content theo keyword
const searchContents = async (keyword, moduleId = null) => {
  let query = `
    SELECT 
      c.id,
      c.category_id,
      c.parent_id,
      c.title,
      c.plain_content,
      c.view_count,
      c.create_update_at,
      cat.title as category_title,
      m.name as module_name
    FROM contents c
    JOIN categories cat ON c.category_id = cat.id
    JOIN modules m ON cat.module_id = m.id
    WHERE c.is_published = true
    AND (c.title LIKE ? OR c.plain_content LIKE ?)
  `;

  const params = [`%${keyword}%`, `%${keyword}%`];

  if (moduleId) {
    query += ' AND m.id = ?';
    params.push(moduleId);
  }

  query += ' ORDER BY c.view_count DESC, c.create_update_at DESC LIMIT 20';

  return await executeQuery(query, params);
};

// Helper: trả về cấu trúc cây content theo category
const getContentsTreeByCategory = async (categoryId, includeUnpublished = false) => {
  const whereClause = includeUnpublished
    ? 'WHERE c.category_id = ?'
    : 'WHERE c.category_id = ? AND c.is_published = true';

  const query = `
    SELECT 
      c.id,
      c.category_id,
      c.parent_id,
      c.title,
      c.html_content,
      c.plain_content,
      c.is_published,
      c.view_count,
      c.order_index,
      c.create_update_at,
      cat.title AS category_title,
      m.name AS module_name
    FROM contents c
    JOIN categories cat ON c.category_id = cat.id
    JOIN modules m ON cat.module_id = m.id
    ${whereClause}
    ORDER BY c.order_index ASC, c.create_update_at ASC
  `;

  const rows = await executeQuery(query, [categoryId]);
  const nodesById = {};
  rows.forEach(r => {
    nodesById[r.id] = { ...r, children: [] };
  });
  const roots = [];
  rows.forEach(r => {
    const node = nodesById[r.id];
    if (r.parent_id && nodesById[r.parent_id]) {
      nodesById[r.parent_id].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

module.exports = {
  findContentsByCategory,
  findContentById,
  createContent,
  updateContent,
  removeContent,
  incrementViewCount,
  searchContents
  ,getContentsTreeByCategory
};
