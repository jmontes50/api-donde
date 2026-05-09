/**
 * Middleware de autenticación JWT.
 *
 * Verifica el token enviado en el header Authorization: Bearer <token>.
 * Si el token es válido, agrega req.user con los datos del payload (id, email, username).
 * Si falta o es inválido, devuelve 401.
 *
 * Se aplica selectivamente en cada *.routes.js solo a las rutas que lo necesitan:
 *   router.post('/', authMiddleware, controller.create);
 */
const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-errors');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Token de autenticación requerido. Envía el header Authorization: Bearer <token>'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Agregar los datos del usuario al request para que el controller los use si necesita
    req.user = { id: payload.id, email: payload.email, username: payload.username };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new HttpError(401, 'El token ha expirado. Inicia sesión nuevamente'));
    }
    return next(new HttpError(401, 'Token inválido'));
  }
}

module.exports = authMiddleware;
