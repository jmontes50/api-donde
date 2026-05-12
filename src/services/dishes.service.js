const { dishes } = require('../data/db.json');
const HttpError = require('../utils/http-errors');

function findAll({ page, limit, offset, search, restaurant }) {
  let results = dishes;

  if (search) {
    const term = search.toLowerCase();
    results = results.filter(d =>
      d.name.toLowerCase().includes(term) ||
      (d.description && d.description.toLowerCase().includes(term))
    );
  }
  if (restaurant) {
    results = results.filter(d => d.restaurant_id === parseInt(restaurant));
  }

  results = [...results].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const total = results.length;
  const data = results.slice(offset, offset + limit);

  return { data, total };
}

function findById(id) {
  const dish = dishes.find(d => d.id === parseInt(id));
  if (!dish) throw new HttpError(404, `Plato con id ${id} no encontrado`);
  return dish;
}

module.exports = { findAll, findById };
