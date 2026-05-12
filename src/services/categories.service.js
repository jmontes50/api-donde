const { categories } = require('../data/db.json');
const HttpError = require('../utils/http-errors');

function findAll() {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

function findById(id) {
  const category = categories.find(c => c.id === parseInt(id));
  if (!category) throw new HttpError(404, `Categoría con id ${id} no encontrada`);
  return category;
}

module.exports = { findAll, findById };
