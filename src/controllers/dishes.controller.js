const service = require('../services/dishes.service');
const { requireString, requireNumber, requireId, optional } = require('../utils/validators');
const { parsePagination, buildPaginationResponse } = require('../utils/pagination');

async function list(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const search = req.query.search || null;
    const restaurant = req.query.restaurant ? requireId(req.query.restaurant, 'restaurant') : null;

    const { data, total } = await service.findAll({ page, limit, offset, search, restaurant });
    const pagination = buildPaginationResponse(total, page, limit);

    res.json({ data, pagination });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const dish = await service.findById(id);
    res.json({ data: dish });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const name = requireString(req.body.name, 'name');
    const price = requireNumber(req.body.price, 'price', { min: 0 });
    const restaurant_id = requireId(req.body.restaurant_id, 'restaurant_id');
    const description = optional(req.body.description, (v) => requireString(v, 'description'));
    const image_url = optional(req.body.image_url, (v) => requireString(v, 'image_url'));

    const dish = await service.create({ name, description, price, image_url, restaurant_id });
    res.status(201).json({ data: dish });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const name = optional(req.body.name, (v) => requireString(v, 'name'));
    const price = req.body.price !== undefined ? requireNumber(req.body.price, 'price', { min: 0 }) : undefined;
    const restaurant_id = req.body.restaurant_id ? requireId(req.body.restaurant_id, 'restaurant_id') : undefined;
    const description = optional(req.body.description, (v) => requireString(v, 'description'));
    const image_url = optional(req.body.image_url, (v) => requireString(v, 'image_url'));

    const dish = await service.update(id, { name, description, price, image_url, restaurant_id });
    res.json({ data: dish });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    await service.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, create, update, remove };
