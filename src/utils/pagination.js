/**
 * Helpers de paginación.
 *
 * parsePagination  → extrae y sanitiza page/limit del query string
 * buildPaginationResponse → construye el objeto pagination de la respuesta
 */

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limitRaw = parseInt(query.limit) || 10;
  const limit = Math.min(50, Math.max(1, limitRaw));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildPaginationResponse(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

module.exports = { parsePagination, buildPaginationResponse };
