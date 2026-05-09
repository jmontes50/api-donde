/**
 * Helpers de validación manual.
 *
 * Cada función lanza un HttpError(400) si el valor no es válido.
 * Usar en los controllers al inicio de cada handler, antes de llamar al service.
 *
 * Ejemplo:
 *   requireString(req.body.name, 'name');
 *   requireNumber(req.body.price, 'price', { min: 0 });
 */
const HttpError = require('./http-errors');

// Verifica que el valor sea un string no vacío
function requireString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `El campo '${field}' es obligatorio y debe ser texto no vacío`);
  }
  return value.trim();
}

// Verifica que el valor sea un número dentro del rango opcional { min, max }
function requireNumber(value, field, options = {}) {
  const num = Number(value);
  if (value === undefined || value === null || value === '' || isNaN(num)) {
    throw new HttpError(400, `El campo '${field}' es obligatorio y debe ser un número`);
  }
  if (options.min !== undefined && num < options.min) {
    throw new HttpError(400, `El campo '${field}' debe ser mayor o igual a ${options.min}`);
  }
  if (options.max !== undefined && num > options.max) {
    throw new HttpError(400, `El campo '${field}' debe ser menor o igual a ${options.max}`);
  }
  return num;
}

// Verifica que el valor tenga formato de email básico
function requireEmail(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `El campo '${field}' es obligatorio`);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    throw new HttpError(400, `El campo '${field}' debe ser un email válido`);
  }
  return value.trim().toLowerCase();
}

// Verifica que el valor sea un entero positivo (útil para IDs de FK)
function requireId(value, field) {
  const num = parseInt(value);
  if (isNaN(num) || num <= 0) {
    throw new HttpError(400, `El campo '${field}' debe ser un ID numérico positivo`);
  }
  return num;
}

// Verifica que el valor tenga formato HH:MM
function requireTime(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `El campo '${field}' es obligatorio`);
  }
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(value.trim())) {
    throw new HttpError(400, `El campo '${field}' debe tener formato HH:MM (ej: 08:30)`);
  }
  return value.trim();
}

// Si el valor está presente (no undefined/null), aplica el validador dado
function optional(value, validatorFn) {
  if (value === undefined || value === null) return value;
  return validatorFn(value);
}

module.exports = { requireString, requireNumber, requireEmail, requireId, requireTime, optional };
