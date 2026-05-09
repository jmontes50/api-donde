const db = require('../db/database');
const HttpError = require('../utils/http-errors');

function findAll() {
  return db.prepare('SELECT * FROM categories ORDER BY name').all();
}

function findById(id) {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) throw new HttpError(404, `Categoría con id ${id} no encontrada`);
  return category;
}

function create({ name, description }) {
  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  if (existing) throw new HttpError(409, `Ya existe una categoría con el nombre '${name}'`);

  const result = db.prepare(
    'INSERT INTO categories (name, description) VALUES (?, ?)'
  ).run(name, description || null);

  return findById(result.lastInsertRowid);
}

function update(id, { name, description }) {
  findById(id);

  if (name) {
    const existing = db.prepare('SELECT id FROM categories WHERE name = ? AND id != ?').get(name, id);
    if (existing) throw new HttpError(409, `Ya existe una categoría con el nombre '${name}'`);
  }

  db.prepare(
    'UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?'
  ).run(name || null, description !== undefined ? description : null, id);

  return findById(id);
}

function remove(id) {
  findById(id);

  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  } catch (err) {
    if (err.message.includes('FOREIGN KEY constraint failed')) {
      throw new HttpError(409, 'No se puede eliminar la categoría porque tiene restaurantes asociados');
    }
    throw err;
  }
}

module.exports = { findAll, findById, create, update, remove };
