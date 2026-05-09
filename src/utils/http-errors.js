/**
 * HttpError — clase de error personalizada para la API.
 *
 * Permite que los services lancen errores con un código HTTP específico
 * sin necesidad de tocar req/res. El middleware de errores los captura
 * y formatea la respuesta final.
 *
 * Uso:
 *   throw new HttpError(404, 'Restaurante no encontrado');
 *   throw new HttpError(400, 'Datos inválidos', ['name es requerido', 'price debe ser positivo']);
 */
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details || [];
  }
}

module.exports = HttpError;
