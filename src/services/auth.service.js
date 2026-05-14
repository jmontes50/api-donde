const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const HttpError = require('../utils/http-errors');

const SALT_ROUNDS = 10;

async function register({ username, email, password }) {
  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ? OR username = ?',
    args: [email, username],
  });
  if (existing.rows[0]) {
    throw new HttpError(409, 'El email o nombre de usuario ya están registrados');
  }

  const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

  const result = await db.execute({
    sql: 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    args: [username, email, hashedPassword],
  });

  return { id: Number(result.lastInsertRowid), username, email };
}

async function login({ email, password }) {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  const user = result.rows[0];

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
