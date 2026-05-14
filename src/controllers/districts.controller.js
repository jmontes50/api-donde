const service = require('../services/districts.service');
const { requireString, requireId, optional } = require('../utils/validators');

async function list(req, res, next) {
  try {
    const districts = await service.findAll();
    res.json({ data: districts });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const district = await service.findById(id);
    res.json({ data: district });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const name = requireString(req.body.name, 'name');
    const description = optional(req.body.description, (v) => requireString(v, 'description'));
    const district = await service.create({ name, description });
    res.status(201).json({ data: district });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const name = optional(req.body.name, (v) => requireString(v, 'name'));
    const description = req.body.description;
    const district = await service.update(id, { name, description });
    res.json({ data: district });
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
