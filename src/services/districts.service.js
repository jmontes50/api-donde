const db = require('../db/database');
const HttpError = require('../utils/http-errors');

async function findAll() {
  const result = await db.execute('SELECT * FROM districts ORDER BY name');
  return result.rows;
}

async function findById(id) {
  const result = await db.execute({
    sql: 'SELECT * FROM districts WHERE id = ?',
    args: [id],
  });
  if (!result.rows[0]) throw new HttpError(404, `Distrito con id ${id} no encontrado`);
  return result.rows[0];
}

async function create({ name, description }) {
  const result = await db.execute({
    sql: 'INSERT INTO districts (name, description) VALUES (?, ?)',
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
    sql: `UPDATE districts SET ${setClauses.join(', ')} WHERE id = ?`,
    args,
  });
  return findById(id);
}

async function remove(id) {
  await findById(id);
  try {
    await db.execute({ sql: 'DELETE FROM districts WHERE id = ?', args: [id] });
  } catch (err) {
    if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
      throw new HttpError(409, 'No se puede eliminar: hay restaurantes asociados a este distrito');
    }
    throw err;
  }
}

module.exports = { findAll, findById, create, update, remove };
