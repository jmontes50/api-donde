const { districts } = require('../data/db.json');
const HttpError = require('../utils/http-errors');

function findAll() {
  return [...districts].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

function findById(id) {
  const district = districts.find(d => d.id === parseInt(id));
  if (!district) throw new HttpError(404, `Distrito con id ${id} no encontrado`);
  return district;
}

module.exports = { findAll, findById };
