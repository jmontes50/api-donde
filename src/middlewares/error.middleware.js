/**
 * Middleware global de manejo de errores.
 *
 * Express lo reconoce como middleware de error por tener 4 parámetros (err, req, res, next).
 * Debe ser el ÚLTIMO middleware registrado en app.js.
 *
 * - Si el error es HttpError: usa su status y message.
 * - Si es otro error: responde 500 con mensaje genérico.
 * - En desarrollo muestra el stack en consola para depurar.
 * - En producción no expone detalles internos en la respuesta.
 */
const HttpError = require('../utils/http-errors');

function errorMiddleware(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Siempre loguear el error en consola (pm2 lo captura en producción)
  if (isDev) {
    console.error('[Error]', err.stack || err);
  } else {
    console.error('[Error]', err.message);
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        status: err.status,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Error inesperado del servidor
  res.status(500).json({
    error: {
      status: 500,
      message: isDev ? err.message : 'Error interno del servidor',
      details: [],
    },
  });
}

module.exports = errorMiddleware;
