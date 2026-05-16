/**
 * @swagger
 * components:
 *   schemas:
 *     Restaurant:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: La Nueva Palomino
 *         description:
 *           type: string
 *           nullable: true
 *           example: Picantería tradicional arequipeña con más de 50 años de historia
 *         address:
 *           type: string
 *           example: Leoncio Prado 122, Yanahuara
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "054-252393"
 *         image_url:
 *           type: string
 *           nullable: true
 *           example: https://placehold.co/600x400?text=La+Nueva+Palomino
 *         opening_time:
 *           type: string
 *           nullable: true
 *           example: "12:00"
 *         closing_time:
 *           type: string
 *           nullable: true
 *           example: "17:00"
 *         lat:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: -16.3978
 *         lng:
 *           type: number
 *           format: float
 *           nullable: true
 *           example: -71.5504
 *         district_id:
 *           type: integer
 *           example: 2
 *         category_id:
 *           type: integer
 *           example: 1
 *         district_name:
 *           type: string
 *           example: Yanahuara
 *         category_name:
 *           type: string
 *           example: Picantería
 *         created_at:
 *           type: string
 *           example: "2024-01-15 10:00:00"
 *
 *     RestaurantDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Restaurant'
 *         - type: object
 *           properties:
 *             dishes:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dish'
 *
 *     RestaurantInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Sol de Mayo
 *         description:
 *           type: string
 *           example: Picantería en el corazón de Yanahuara, especialidad en adobo
 *         address:
 *           type: string
 *           example: Jerusalén 207, Yanahuara
 *         phone:
 *           type: string
 *           example: "054-254148"
 *         image_url:
 *           type: string
 *           example: https://placehold.co/600x400?text=Sol+de+Mayo
 *         opening_time:
 *           type: string
 *           example: "11:00"
 *         closing_time:
 *           type: string
 *           example: "17:00"
 *         lat:
 *           type: number
 *           format: float
 *           example: -16.3978
 *         lng:
 *           type: number
 *           format: float
 *           example: -71.5504
 *         district_id:
 *           type: integer
 *           example: 2
 *         category_id:
 *           type: integer
 *           example: 1
 *
 *     RestaurantListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Restaurant'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 */
