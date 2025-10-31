const { executeQuery } = require('../config/database');

const findByUsernameOrEmail = async (usernameOrEmail) => {
  const rows = await executeQuery(
    'SELECT id, username, email, password_hash, role, is_active, token_version FROM users WHERE (username=? OR email=?) LIMIT 1',
    [usernameOrEmail, usernameOrEmail]
  );
  return rows[0];
};

const existsUsernameOrEmail = async (username, email) => {
  const rows = await executeQuery(
    'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
    [username, email]
  );
  return rows.length > 0;
};

const createUser = async ({ username, email, password_hash, role = 'customer' }) => {
  const result = await executeQuery(
    'INSERT INTO users (username,email,password_hash,role,is_active,token_version) VALUES (?,?,?,?,1,0)',
    [username, email, password_hash, role]
  );
  return result.insertId;
};

const findById = async (id) => {
  const rows = await executeQuery(
    'SELECT id, username, email, role, is_active, last_login_at, password_changed_at, token_version FROM users WHERE id=?',
    [id]
  );
  return rows[0];
};

const updateLastLogin = async (id) => {
  await executeQuery('UPDATE users SET last_login_at = NOW() WHERE id=?', [id]);
};

const updatePasswordAndRevoke = async (id, newHash) => {
  await executeQuery(
    'UPDATE users SET password_hash=?, token_version=token_version+1, password_changed_at=NOW() WHERE id=?',
    [newHash, id]
  );
};

const getTokenVersionRoleUsername = async (id) => {
  const rows = await executeQuery('SELECT token_version, role, username FROM users WHERE id=?', [id]);
  return rows[0];
};

module.exports = {
  findByUsernameOrEmail,
  existsUsernameOrEmail,
  createUser,
  findById,
  updateLastLogin,
  updatePasswordAndRevoke,
  getTokenVersionRoleUsername,
};
