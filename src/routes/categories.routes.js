const express = require('express');
const router = express.Router();
const controller = require('../controllers/categories.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Tipos de cocina o establecimiento (Picantería, Cevichería, etc.)
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lista todas las categorías
 *     tags: [Categories]
 *     description: |
 *       Devuelve todas las categorías disponibles ordenadas por nombre.
 *       Útil para poblar selectores/dropdowns de filtro en el frontend.
 *       **No requiere autenticación.**
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/', controller.list);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtiene una categoría por ID
 *     tags: [Categories]
 *     description: |
 *       Devuelve los detalles de una categoría específica.
 *       Devuelve 404 si el ID no existe.
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
 *         description: Datos de la categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.detail);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crea una nueva categoría
 *     tags: [Categories]
 *     description: |
 *       Agrega una nueva categoría al directorio. El nombre debe ser único.
 *       **Requiere autenticación JWT.**
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *           example:
 *             name: Chifa
 *             description: Restaurantes de cocina chino-peruana, fusión única en el Perú
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/', authMiddleware, controller.create);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Actualiza una categoría
 *     tags: [Categories]
 *     description: |
 *       Modifica el nombre o descripción de una categoría existente.
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
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.put('/:id', authMiddleware, controller.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Elimina una categoría
 *     tags: [Categories]
 *     description: |
 *       Elimina una categoría del directorio.
 *       **Importante:** si tiene restaurantes asociados, falla con 409 Conflict.
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
 *         description: Categoría eliminada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.delete('/:id', authMiddleware, controller.remove);

module.exports = router;
