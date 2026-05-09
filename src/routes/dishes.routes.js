const express = require('express');
const router = express.Router();
const controller = require('../controllers/dishes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Dishes
 *   description: Platos típicos arequipeños del directorio
 */

/**
 * @swagger
 * /dishes:
 *   get:
 *     summary: Lista platos con paginación y filtros
 *     tags: [Dishes]
 *     description: |
 *       Devuelve una lista paginada de platos. Puede filtrarse por restaurante usando el parámetro
 *       `restaurant`. Útil para mostrar el menú de un restaurante específico o para buscar
 *       platos por nombre en todo el directorio.
 *       **No requiere autenticación.**
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca en nombre y descripción
 *         example: rocoto
 *       - in: query
 *         name: restaurant
 *         schema:
 *           type: integer
 *         description: Filtra por ID de restaurante
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista paginada de platos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishListResponse'
 */
router.get('/', controller.list);

/**
 * @swagger
 * /dishes/{id}:
 *   get:
 *     summary: Obtiene un plato por ID
 *     tags: [Dishes]
 *     description: |
 *       Devuelve el detalle de un plato, incluyendo el nombre del restaurante al que pertenece.
 *       **No requiere autenticación.**
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos del plato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.detail);

/**
 * @swagger
 * /dishes:
 *   post:
 *     summary: Agrega un plato a un restaurante
 *     tags: [Dishes]
 *     description: |
 *       Crea un nuevo plato y lo asocia al restaurante indicado en `restaurant_id`.
 *       El precio se expresa en soles peruanos (PEN).
 *       **Requiere autenticación JWT.**
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DishInput'
 *           example:
 *             name: Rocoto Relleno
 *             description: Rocoto relleno de carne molida, pasas y maní, gratinado con queso
 *             price: 28
 *             restaurant_id: 1
 *     responses:
 *       201:
 *         description: Plato creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/', authMiddleware, controller.create);

/**
 * @swagger
 * /dishes/{id}:
 *   put:
 *     summary: Actualiza un plato
 *     tags: [Dishes]
 *     description: |
 *       Modifica los datos de un plato existente. Solo se actualizan los campos enviados.
 *       **Requiere autenticación JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DishInput'
 *           example:
 *             price: 32
 *     responses:
 *       200:
 *         description: Plato actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', authMiddleware, controller.update);

/**
 * @swagger
 * /dishes/{id}:
 *   delete:
 *     summary: Elimina un plato
 *     tags: [Dishes]
 *     description: |
 *       Elimina un plato del directorio. Esta operación es irreversible.
 *       **Requiere autenticación JWT.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Plato eliminado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', authMiddleware, controller.remove);

module.exports = router;
