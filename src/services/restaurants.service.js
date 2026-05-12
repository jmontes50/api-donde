const { restaurants, dishes } = require('../data/db.json');
const HttpError = require('../utils/http-errors');

function findAll({ page, limit, offset, search, district, category }) {
  let results = restaurants;

  if (search) {
    const term = search.toLowerCase();
    results = results.filter(r =>
      r.name.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term))
    );
  }
  if (district) {
    results = results.filter(r => r.district_id === parseInt(district));
  }
  if (category) {
    results = results.filter(r => r.category_id === parseInt(category));
  }

  results = [...results].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const total = results.length;
  const data = results.slice(offset, offset + limit);

  return { data, total };
}

function findById(id) {
  const restaurant = restaurants.find(r => r.id === parseInt(id));
  if (!restaurant) throw new HttpError(404, `Restaurante con id ${id} no encontrado`);

  const restaurantDishes = dishes
    .filter(d => d.restaurant_id === restaurant.id)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));

  return { ...restaurant, dishes: restaurantDishes };
}

module.exports = { findAll, findById };
