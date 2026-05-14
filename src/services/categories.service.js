const db = require('../db/database');
const HttpError = require('../utils/http-errors');

async function findAll() {
  const result = await db.execute('SELECT * FROM categories ORDER BY name');
  return result.rows;
}

async function findById(id) {
  const result = await db.execute({
    sql: 'SELECT * FROM categories WHERE id = ?',
    args: [id],
  });
  if (!result.rows[0]) throw new HttpError(404, `Categoría con id ${id} no encontrada`);
  return result.rows[0];
}

async function create({ name, description }) {
  const result = await db.execute({
    sql: 'INSERT INTO categories (name, description) VALUES (?, ?)',
    args: [name, description || null],
  });
  return findById(Number(result.lastInsertRowid));
}

async function update(id, { name, description }) {
  await findById(id);

  const setClauses = [];
  const args = [];
  if (name !== undefined) { setClauses.push('name = ?'); args.push(name); }
  if (description !== undefined) { setClauses.push('description = ?'); args.push(description); }
  if (setClauses.length === 0) return findById(id);

  args.push(id);
  await db.execute({
    sql: `UPDATE categories SET ${setClauses.join(', ')} WHERE id = ?`,
    args,
  });
  return findById(id);
}

async function remove(id) {
  await findById(id);
  try {
    await db.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id] });
  } catch (err) {
    if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
      throw new HttpError(409, 'No se puede eliminar: hay restaurantes asociados a esta categoría');
    }
    throw err;
  }
}

module.exports = { findAll, findById, create, update, remove };
