const service = require('../services/restaurants.service');
const { requireString, requireNumber, requireId, optional } = require('../utils/validators');
const { parsePagination, buildPaginationResponse } = require('../utils/pagination');

function list(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const search = req.query.search || null;
    const district = req.query.district ? requireId(req.query.district, 'district') : null;
    const category = req.query.category ? requireId(req.query.category, 'category') : null;

    const { data, total } = service.findAll({ page, limit, offset, search, district, category });
    const pagination = buildPaginationResponse(total, page, limit);

    res.json({ data, pagination });
  } catch (err) {
    next(err);
  }
}

function detail(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const restaurant = service.findById(id);
    res.json({ data: restaurant });
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    const name = requireString(req.body.name, 'name');
    const address = requireString(req.body.address, 'address');
    const district_id = requireId(req.body.district_id, 'district_id');
    const category_id = requireId(req.body.category_id, 'category_id');

    const description = optional(req.body.description, (v) => requireString(v, 'description'));
    const phone = optional(req.body.phone, (v) => requireString(v, 'phone'));
    const image_url = optional(req.body.image_url, (v) => requireString(v, 'image_url'));
    const opening_time = optional(req.body.opening_time, (v) => {
      const { requireTime } = require('../utils/validators');
      return requireTime(v, 'opening_time');
    });
    const closing_time = optional(req.body.closing_time, (v) => {
      const { requireTime } = require('../utils/validators');
      return requireTime(v, 'closing_time');
    });

    const restaurant = service.create({ name, description, address, phone, image_url, opening_time, closing_time, district_id, category_id });
    res.status(201).json({ data: restaurant });
  } catch (err) {
    next(err);
  }
}

function update(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');

    const name = optional(req.body.name, (v) => requireString(v, 'name'));
    const address = optional(req.body.address, (v) => requireString(v, 'address'));
    const district_id = req.body.district_id ? requireId(req.body.district_id, 'district_id') : undefined;
    const category_id = req.body.category_id ? requireId(req.body.category_id, 'category_id') : undefined;
    const description = optional(req.body.description, (v) => requireString(v, 'description'));
    const phone = optional(req.body.phone, (v) => requireString(v, 'phone'));
    const image_url = optional(req.body.image_url, (v) => requireString(v, 'image_url'));
    const opening_time = optional(req.body.opening_time, (v) => {
      const { requireTime } = require('../utils/validators');
      return requireTime(v, 'opening_time');
    });
    const closing_time = optional(req.body.closing_time, (v) => {
      const { requireTime } = require('../utils/validators');
      return requireTime(v, 'closing_time');
    });

    const restaurant = service.update(id, { name, description, address, phone, image_url, opening_time, closing_time, district_id, category_id });
    res.json({ data: restaurant });
  } catch (err) {
    next(err);
  }
}

function remove(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    service.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, create, update, remove };
