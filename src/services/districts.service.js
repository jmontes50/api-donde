const db = require('../db/database');
const HttpError = require('../utils/http-errors');

function findAll() {
  return db.prepare('SELECT * FROM districts ORDER BY name').all();
}

function findById(id) {
  const district = db.prepare('SELECT * FROM districts WHERE id = ?').get(id);
  if (!district) throw new HttpError(404, `Distrito con id ${id} no encontrado`);
  return district;
}

function create({ name, description }) {
  const existing = db.prepare('SELECT id FROM districts WHERE name = ?').get(name);
  if (existing) throw new HttpError(409, `Ya existe un distrito con el nombre '${name}'`);

  const result = db.prepare(
    'INSERT INTO districts (name, description) VALUES (?, ?)'
  ).run(name, description || null);

  return findById(result.lastInsertRowid);
}

function update(id, { name, description }) {
  findById(id); // lanza 404 si no existe

  if (name) {
    const existing = db.prepare('SELECT id FROM districts WHERE name = ? AND id != ?').get(name, id);
    if (existing) throw new HttpError(409, `Ya existe un distrito con el nombre '${name}'`);
  }

  db.prepare(
    'UPDATE districts SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?'
  ).run(name || null, description !== undefined ? description : null, id);

  return findById(id);
}

function remove(id) {
  findById(id); // lanza 404 si no existe

  try {
    db.prepare('DELETE FROM districts WHERE id = ?').run(id);
  } catch (err) {
    // SQLite lanza SQLITE_CONSTRAINT cuando hay FK RESTRICT activa
    if (err.message.includes('FOREIGN KEY constraint failed')) {
      throw new HttpError(409, 'No se puede eliminar el distrito porque tiene restaurantes asociados');
    }
    throw err;
  }
}

module.exports = { findAll, findById, create, update, remove };
