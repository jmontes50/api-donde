const express = require('express');
const router = express.Router();
const controller = require('../controllers/districts.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Districts
 *   description: Distritos de Arequipa donde se encuentran los restaurantes
 */

/**
 * @swagger
 * /districts:
 *   get:
 *     summary: Lista todos los distritos
 *     tags: [Districts]
 *     description: |
 *       Devuelve todos los distritos disponibles ordenados por nombre.
 *       No está paginado porque son pocos registros (8 distritos de Arequipa).
 *       Útil para poblar selectores/dropdowns de filtro en el frontend.
 *       **No requiere autenticación.**
 *     responses:
 *       200:
 *         description: Lista de distritos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/District'
 */
router.get('/', controller.list);

/**
 * @swagger
 * /districts/{id}:
 *   get:
 *     summary: Obtiene un distrito por ID
 *     tags: [Districts]
 *     description: |
 *       Devuelve los detalles de un distrito específico.
 *       Devuelve 404 si el ID no existe.
 *       **No requiere autenticación.**
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del distrito
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos del distrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/District'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.detail);

/**
 * @swagger
 * /districts:
 *   post:
 *     summary: Crea un nuevo distrito
 *     tags: [Districts]
 *     description: |
 *       Agrega un nuevo distrito al directorio. El nombre debe ser único.
 *       **Requiere autenticación JWT** — solo administradores pueden crear distritos.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DistrictInput'
 *           example:
 *             name: Hunter
 *             description: Distrito al sur de Arequipa, conocido por sus picanterías tradicionales
 *     responses:
 *       201:
 *         description: Distrito creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/District'
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
 * /districts/{id}:
 *   put:
 *     summary: Actualiza un distrito
 *     tags: [Districts]
 *     description: |
 *       Modifica el nombre o descripción de un distrito existente.
 *       Solo se actualizan los campos enviados en el body.
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
 *             $ref: '#/components/schemas/DistrictInput'
 *           example:
 *             description: Distrito histórico de Arequipa, corazón cultural de la ciudad
 *     responses:
 *       200:
 *         description: Distrito actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/District'
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
 * /districts/{id}:
 *   delete:
 *     summary: Elimina un distrito
 *     tags: [Districts]
 *     description: |
 *       Elimina un distrito del directorio.
 *       **Importante:** si el distrito tiene restaurantes asociados, la operación falla con 409.
 *       Primero debes reasignar o eliminar los restaurantes de ese distrito.
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
 *         description: Distrito eliminado (sin contenido en la respuesta)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.delete('/:id', authMiddleware, controller.remove);

module.exports = router;
