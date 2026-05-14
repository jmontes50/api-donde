const db = require('../db/database');
const HttpError = require('../utils/http-errors');

async function findAll({ page, limit, offset, search, district, category }) {
  const conditions = [];
  const args = [];

  if (search) {
    conditions.push('(r.name LIKE ? OR r.description LIKE ?)');
    args.push(`%${search}%`, `%${search}%`);
  }
  if (district) {
    conditions.push('r.district_id = ?');
    args.push(district);
  }
  if (category) {
    conditions.push('r.category_id = ?');
    args.push(category);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM restaurants r ${where}`,
    args,
  });
  const total = Number(countResult.rows[0].total);

  const dataResult = await db.execute({
    sql: `SELECT * FROM restaurants r ${where} ORDER BY r.name LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  return { data: dataResult.rows, total };
}

async function findById(id) {
  const rResult = await db.execute({
    sql: 'SELECT * FROM restaurants WHERE id = ?',
    args: [id],
  });
  if (!rResult.rows[0]) throw new HttpError(404, `Restaurante con id ${id} no encontrado`);

  const dResult = await db.execute({
    sql: 'SELECT * FROM dishes WHERE restaurant_id = ? ORDER BY name',
    args: [id],
  });

  return { ...rResult.rows[0], dishes: dResult.rows };
}

async function create({ name, description, address, phone, image_url, opening_time, closing_time, district_id, category_id }) {
  const result = await db.execute({
    sql: `INSERT INTO restaurants (name, description, address, phone, image_url, opening_time, closing_time, district_id, category_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [name, description || null, address, phone || null, image_url || null, opening_time || null, closing_time || null, district_id, category_id],
  });
  return findById(Number(result.lastInsertRowid));
}

async function update(id, fields) {
  await findById(id);

  const allowed = ['name', 'description', 'address', 'phone', 'image_url', 'opening_time', 'closing_time', 'district_id', 'category_id'];
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
    sql: `UPDATE restaurants SET ${setClauses.join(', ')} WHERE id = ?`,
    args,
  });
  return findById(id);
}

async function remove(id) {
  await findById(id);
  // dishes se borran por CASCADE
  await db.execute({ sql: 'DELETE FROM restaurants WHERE id = ?', args: [id] });
}

module.exports = { findAll, findById, create, update, remove };
