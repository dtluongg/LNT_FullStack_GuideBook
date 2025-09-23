const { executeQuery } = require('../config/database');

const findAllModules = async () => {
  const rows = await executeQuery('SELECT * FROM modules ORDER BY order_index ASC');
  return rows;
};

const findModuleById = async (id) => {
  const rows = await executeQuery('SELECT * FROM modules WHERE id = ?', [id]);
  return rows[0];
};

const createModule = async ({ name, icon, order_index = 0, is_active = 1 }) => {
  const result = await executeQuery(
    'INSERT INTO modules (name, icon, order_index, is_active) VALUES (?, ?, ?, ?)',
    [name, icon, order_index, is_active]
  );
  return result.insertId; // vẫn ổn vì mysql2 trả về object có insertId
};

const updateModule = async (id, data) => {
  const fields = [];
  const params = [];
  ['name', 'icon', 'order_index', 'is_active'].forEach((key) => {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  });
  if (!fields.length) return;
  params.push(id);
  // await executeQuery(`UPDATE modules SET ${fields.join(', ')} WHERE id = ?`, params);
  const result = await executeQuery(`UPDATE modules SET ${fields.join(', ')} WHERE id = ?`, params);
  return result.affectedRows;
};

const removeModule = async (id) => {
  await executeQuery('DELETE FROM modules WHERE id = ?', [id]);
};

module.exports = {
  findAllModules,
  findModuleById,
  createModule,
  updateModule,
  removeModule
};
