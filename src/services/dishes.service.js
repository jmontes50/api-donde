const db = require('../db/database');
const HttpError = require('../utils/http-errors');

function findAll({ page, limit, offset, search, restaurant }) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(d.name LIKE ? OR d.description LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (restaurant) {
    conditions.push('d.restaurant_id = ?');
    params.push(restaurant);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) as count FROM dishes d ${where}`).get(...params).count;

  const rows = db.prepare(`
    SELECT d.*, r.name as restaurant_name
    FROM dishes d
    JOIN restaurants r ON d.restaurant_id = r.id
    ${where}
    ORDER BY d.name
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return { data: rows, total };
}

function findById(id) {
  const dish = db.prepare(`
    SELECT d.*, r.name as restaurant_name
    FROM dishes d
    JOIN restaurants r ON d.restaurant_id = r.id
    WHERE d.id = ?
  `).get(id);

  if (!dish) throw new HttpError(404, `Plato con id ${id} no encontrado`);
  return dish;
}

function create({ name, description, price, image_url, restaurant_id }) {
  const restaurant = db.prepare('SELECT id FROM restaurants WHERE id = ?').get(restaurant_id);
  if (!restaurant) throw new HttpError(404, `Restaurante con id ${restaurant_id} no encontrado`);

  const result = db.prepare(`
    INSERT INTO dishes (name, description, price, image_url, restaurant_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, description || null, price, image_url || null, restaurant_id);

  return findById(result.lastInsertRowid);
}

function update(id, fields) {
  findById(id);

  const { name, description, price, image_url, restaurant_id } = fields;

  if (restaurant_id) {
    const restaurant = db.prepare('SELECT id FROM restaurants WHERE id = ?').get(restaurant_id);
    if (!restaurant) throw new HttpError(404, `Restaurante con id ${restaurant_id} no encontrado`);
  }

  db.prepare(`
    UPDATE dishes SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      image_url = COALESCE(?, image_url),
      restaurant_id = COALESCE(?, restaurant_id)
    WHERE id = ?
  `).run(name || null, description || null, price || null, image_url || null, restaurant_id || null, id);

  return findById(id);
}

function remove(id) {
  findById(id);
  db.prepare('DELETE FROM dishes WHERE id = ?').run(id);
}

module.exports = { findAll, findById, create, update, remove };
