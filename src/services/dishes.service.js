const db = require('../db/database');
const HttpError = require('../utils/http-errors');

async function findAll({ page, limit, offset, search, restaurant }) {
  const conditions = [];
  const args = [];

  if (search) {
    conditions.push('(d.name LIKE ? OR d.description LIKE ?)');
    args.push(`%${search}%`, `%${search}%`);
  }
  if (restaurant) {
    conditions.push('d.restaurant_id = ?');
    args.push(restaurant);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM dishes d ${where}`,
    args,
  });
  const total = Number(countResult.rows[0].total);

  const dataResult = await db.execute({
    sql: `SELECT * FROM dishes d ${where} ORDER BY d.name LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  return { data: dataResult.rows, total };
}

async function findById(id) {
  const result = await db.execute({
    sql: 'SELECT * FROM dishes WHERE id = ?',
    args: [id],
  });
  if (!result.rows[0]) throw new HttpError(404, `Plato con id ${id} no encontrado`);
  return result.rows[0];
}

async function create({ name, description, price, image_url, restaurant_id }) {
  const result = await db.execute({
    sql: 'INSERT INTO dishes (name, description, price, image_url, restaurant_id) VALUES (?, ?, ?, ?, ?)',
    args: [name, description || null, price, image_url || null, restaurant_id],
  });
  return findById(Number(result.lastInsertRowid));
}

async function update(id, fields) {
  await findById(id);

  const allowed = ['name', 'description', 'price', 'image_url', 'restaurant_id'];
  const setClauses = [];
  const args = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      args.push(fields[key]);
    }
  }
  if (setClauses.length === 0) return findById(id);

  args.push(id);
  await db.execute({
    sql: `UPDATE dishes SET ${setClauses.join(', ')} WHERE id = ?`,
    args,
  });
  return findById(id);
}

async function remove(id) {
  await findById(id);
  await db.execute({ sql: 'DELETE FROM dishes WHERE id = ?', args: [id] });
}

module.exports = { findAll, findById, create, update, remove };
