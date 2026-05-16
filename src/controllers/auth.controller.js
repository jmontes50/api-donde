const authService = require('../services/auth.service');
const { requireString, requireEmail } = require('../utils/validators');

async function register(req, res, next) {
  try {
    const username = requireString(req.body.username, 'username');
    const email = requireEmail(req.body.email, 'email');
    const password = requireString(req.body.password, 'password');

    if (password.length < 6) {
      const HttpError = require('../utils/http-errors');
      throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres');
    }

    const user = await authService.register({ username, email, password });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const email = requireEmail(req.body.email, 'email');
    const password = requireString(req.body.password, 'password');

    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
