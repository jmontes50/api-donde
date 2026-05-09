/**
 * @swagger
 * components:
 *   schemas:
 *     District:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Yanahuara
 *         description:
 *           type: string
 *           nullable: true
 *           example: Distrito residencial y turístico, famoso por su mirador y picanterías
 *         created_at:
 *           type: string
 *           example: "2024-01-15 10:00:00"
 *
 *     DistrictInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre del distrito (debe ser único)
 *           example: Cayma
 *         description:
 *           type: string
 *           description: Descripción opcional del distrito
 *           example: Distrito al norte de Arequipa, conocido por sus casonas coloniales
 */
