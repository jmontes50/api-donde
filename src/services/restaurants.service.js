const db = require('../db/database');
const HttpError = require('../utils/http-errors');

function findAll({ page, limit, offset, search, district, category }) {
  // Construir la query dinámicamente según los filtros recibidos
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(r.name LIKE ? OR r.description LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (district) {
    conditions.push('r.district_id = ?');
    params.push(district);
  }
  if (category) {
    conditions.push('r.category_id = ?');
    params.push(category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) as count FROM restaurants r ${where}`).get(...params).count;

  const rows = db.prepare(`
    SELECT
      r.*,
      d.name as district_name,
      c.name as category_name
    FROM restaurants r
    JOIN districts d ON r.district_id = d.id
    JOIN categories c ON r.category_id = c.id
    ${where}
    ORDER BY r.name
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return { data: rows, total };
}

function findById(id) {
  const restaurant = db.prepare(`
    SELECT
      r.*,
      d.name as district_name,
      c.name as category_name
    FROM restaurants r
    JOIN districts d ON r.district_id = d.id
    JOIN categories c ON r.category_id = c.id
    WHERE r.id = ?
  `).get(id);

  if (!restaurant) throw new HttpError(404, `Restaurante con id ${id} no encontrado`);

  // Incluir los platos del restaurante en el detalle
  const dishes = db.prepare('SELECT * FROM dishes WHERE restaurant_id = ? ORDER BY name').all(id);
  return { ...restaurant, dishes };
}

function create({ name, description, address, phone, image_url, opening_time, closing_time, district_id, category_id }) {
  // Verificar que el district y category existen
  const district = db.prepare('SELECT id FROM districts WHERE id = ?').get(district_id);
  if (!district) throw new HttpError(404, `Distrito con id ${district_id} no encontrado`);

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
  if (!category) throw new HttpError(404, `Categoría con id ${category_id} no encontrada`);

  const result = db.prepare(`
    INSERT INTO restaurants (name, description, address, phone, image_url, opening_time, closing_time, district_id, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description || null, address, phone || null, image_url || null, opening_time || null, closing_time || null, district_id, category_id);

  return findById(result.lastInsertRowid);
}

function update(id, fields) {
  findById(id);

  const { name, description, address, phone, image_url, opening_time, closing_time, district_id, category_id } = fields;

  if (district_id) {
    const district = db.prepare('SELECT id FROM districts WHERE id = ?').get(district_id);
    if (!district) throw new HttpError(404, `Distrito con id ${district_id} no encontrado`);
  }
  if (category_id) {
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!category) throw new HttpError(404, `Categoría con id ${category_id} no encontrada`);
  }

  db.prepare(`
    UPDATE restaurants SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      address = COALESCE(?, address),
      phone = COALESCE(?, phone),
      image_url = COALESCE(?, image_url),
      opening_time = COALESCE(?, opening_time),
      closing_time = COALESCE(?, closing_time),
      district_id = COALESCE(?, district_id),
      category_id = COALESCE(?, category_id)
    WHERE id = ?
  `).run(
    name || null, description || null, address || null, phone || null,
    image_url || null, opening_time || null, closing_time || null,
    district_id || null, category_id || null, id
  );

  return findById(id);
}

function remove(id) {
  findById(id);
  // Las dishes se eliminan en cascada automáticamente (ON DELETE CASCADE en el schema)
  db.prepare('DELETE FROM restaurants WHERE id = ?').run(id);
}

module.exports = { findAll, findById, create, update, remove };
