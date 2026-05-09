/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Picantería
 *         description:
 *           type: string
 *           nullable: true
 *           example: Restaurantes tradicionales que sirven platos típicos arequipeños en ambiente familiar
 *         created_at:
 *           type: string
 *           example: "2024-01-15 10:00:00"
 *
 *     CategoryInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre de la categoría (debe ser único)
 *           example: Cevichería
 *         description:
 *           type: string
 *           description: Descripción opcional
 *           example: Especialistas en ceviche y platos a base de pescados y mariscos
 */
