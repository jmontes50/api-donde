const service = require('../services/districts.service');
const { requireString, requireId, optional } = require('../utils/validators');

function list(req, res, next) {
  try {
    const districts = service.findAll();
    res.json({ data: districts });
  } catch (err) {
    next(err);
  }
}

function detail(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const district = service.findById(id);
    res.json({ data: district });
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    const name = requireString(req.body.name, 'name');
    const description = optional(req.body.description, (v) => requireString(v, 'description'));
    const district = service.create({ name, description });
    res.status(201).json({ data: district });
  } catch (err) {
    next(err);
  }
}

function update(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const name = optional(req.body.name, (v) => requireString(v, 'name'));
    const description = req.body.description; // puede ser null para limpiar
    const district = service.update(id, { name, description });
    res.json({ data: district });
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
