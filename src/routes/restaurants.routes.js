const express = require('express');
const router = express.Router();
const controller = require('../controllers/restaurants.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurantes del directorio gastronómico arequipeño
 */

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Lista restaurantes con paginación y filtros
 *     tags: [Restaurants]
 *     description: |
 *       Devuelve una lista paginada de restaurantes. Útil para el listado principal de la aplicación.
 *       Acepta búsqueda por nombre/descripción mediante el parámetro `search`, y filtros por
 *       `district` y `category`. Si la página solicitada está fuera de rango, devuelve un array
 *       `data` vacío pero con la paginación correcta.
 *       **No requiere autenticación**: cualquier visitante puede consultar el directorio.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Registros por página (máximo 50)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca en nombre y descripción (case-insensitive)
 *         example: palomino
 *       - in: query
 *         name: district
 *         schema:
 *           type: integer
 *         description: Filtra por ID de distrito
 *         example: 2
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filtra por ID de categoría
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista paginada de restaurantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RestaurantListResponse'
 */
router.get('/', controller.list);

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Obtiene un restaurante con todos sus platos
 *     tags: [Restaurants]
 *     description: |
 *       Devuelve el detalle completo de un restaurante, incluyendo el nombre del distrito,
 *       el nombre de la categoría y el listado completo de sus platos.
 *       Útil para la vista de detalle del restaurante en el frontend.
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
 *         description: Datos del restaurante con sus platos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantDetail'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.detail);

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Crea un nuevo restaurante
 *     tags: [Restaurants]
 *     description: |
 *       Agrega un restaurante al directorio. Requiere que el `district_id` y `category_id`
 *       existan en la base de datos; si no, devuelve 404.
 *       **Requiere autenticación JWT.**
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestaurantInput'
 *           example:
 *             name: La Nueva Palomino
 *             description: Picantería tradicional arequipeña con más de 50 años de historia
 *             address: Leoncio Prado 122, Yanahuara
 *             phone: "054-252393"
 *             opening_time: "12:00"
 *             closing_time: "17:00"
 *             district_id: 2
 *             category_id: 1
 *     responses:
 *       201:
 *         description: Restaurante creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantDetail'
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
 * /restaurants/{id}:
 *   put:
 *     summary: Actualiza un restaurante
 *     tags: [Restaurants]
 *     description: |
 *       Modifica los datos de un restaurante existente. Solo se actualizan los campos enviados.
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
 *             $ref: '#/components/schemas/RestaurantInput'
 *           example:
 *             phone: "054-252400"
 *             closing_time: "18:00"
 *     responses:
 *       200:
 *         description: Restaurante actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantDetail'
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
 * /restaurants/{id}:
 *   delete:
 *     summary: Elimina un restaurante y sus platos
 *     tags: [Restaurants]
 *     description: |
 *       Elimina el restaurante y **en cascada** todos sus platos asociados.
 *       Esta operación es irreversible.
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
 *         description: Restaurante eliminado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', authMiddleware, controller.remove);

module.exports = router;
