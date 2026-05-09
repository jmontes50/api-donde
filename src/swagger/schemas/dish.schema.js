/**
 * @swagger
 * components:
 *   schemas:
 *     Dish:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Rocoto Relleno
 *         description:
 *           type: string
 *           nullable: true
 *           example: Rocoto relleno de carne molida, pasas y maní, gratinado con queso fresco
 *         price:
 *           type: number
 *           format: float
 *           example: 28.00
 *         image_url:
 *           type: string
 *           nullable: true
 *           example: https://placehold.co/600x400?text=Rocoto+Relleno
 *         restaurant_id:
 *           type: integer
 *           example: 1
 *         restaurant_name:
 *           type: string
 *           example: La Nueva Palomino
 *         created_at:
 *           type: string
 *           example: "2024-01-15 10:00:00"
 *
 *     DishInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Chupe de Camarones
 *         description:
 *           type: string
 *           example: Sopa cremosa de camarones del río Chili con leche, queso y huevo
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 45.00
 *         image_url:
 *           type: string
 *           example: https://placehold.co/600x400?text=Chupe+de+Camarones
 *         restaurant_id:
 *           type: integer
 *           example: 1
 *
 *     DishListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Dish'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 */
