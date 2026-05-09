const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const HttpError = require('../utils/http-errors');

const SALT_ROUNDS = 10;

function register({ username, email, password }) {
  // Verificar si el email o username ya existen
  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    throw new HttpError(409, 'El email o nombre de usuario ya están registrados');
  }

  const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

  const result = db.prepare(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
  ).run(username, email, hashedPassword);

  return { id: result.lastInsertRowid, username, email };
}

function login({ email, password }) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    // Mensaje genérico para no revelar si el email existe o no
    throw new HttpError(401, 'Credenciales inválidas');
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    throw new HttpError(401, 'Credenciales inválidas');
  }

  const payload = { id: user.id, email: user.email, username: user.username };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email },
  };
}

module.exports = { register, login };
