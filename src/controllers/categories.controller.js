const service = require('../services/categories.service');
const { requireString, requireId, optional } = require('../utils/validators');

function list(req, res, next) {
  try {
    const categories = service.findAll();
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
}

function detail(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const category = service.findById(id);
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    const name = requireString(req.body.name, 'name');
    const description = optional(req.body.description, (v) => requireString(v, 'description'));
    const category = service.create({ name, description });
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
}

function update(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const name = optional(req.body.name, (v) => requireString(v, 'name'));
    const description = req.body.description;
    const category = service.update(id, { name, description });
    res.json({ data: category });
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
