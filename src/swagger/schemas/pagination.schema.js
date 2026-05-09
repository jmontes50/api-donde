/**
 * @swagger
 * components:
 *   schemas:
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de registros que coinciden con los filtros
 *           example: 20
 *         page:
 *           type: integer
 *           description: Página actual
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Registros por página
 *           example: 10
 *         totalPages:
 *           type: integer
 *           description: Total de páginas disponibles
 *           example: 2
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           example: false
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: object
 *           properties:
 *             status:
 *               type: integer
 *               example: 400
 *             message:
 *               type: string
 *               example: El campo 'name' es obligatorio
 *             details:
 *               type: array
 *               items:
 *                 type: string
 *               example: []
 *   responses:
 *     BadRequest:
 *       description: Datos inválidos o faltantes
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             error:
 *               status: 400
 *               message: "El campo 'name' es obligatorio y debe ser texto no vacío"
 *               details: []
 *     Unauthorized:
 *       description: Token ausente, inválido o expirado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             error:
 *               status: 401
 *               message: Token de autenticación requerido. Envía el header Authorization Bearer <token>
 *               details: []
 *     NotFound:
 *       description: Recurso no encontrado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             error:
 *               status: 404
 *               message: Restaurante con id 99 no encontrado
 *               details: []
 *     Conflict:
 *       description: Conflicto — recurso duplicado o restricción de FK
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             error:
 *               status: 409
 *               message: No se puede eliminar el distrito porque tiene restaurantes asociados
 *               details: []
 */
