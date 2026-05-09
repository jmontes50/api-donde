const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registro e inicio de sesión de usuarios
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     description: |
 *       Crea una cuenta nueva en el sistema. La contraseña se almacena hasheada con bcrypt.
 *       Útil para crear cuentas de administrador que puedan gestionar el directorio.
 *       Devuelve los datos del usuario creado (sin la contraseña).
 *       **No requiere autenticación previa.**
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *           example:
 *             username: administrador
 *             email: admin@gastro.com
 *             password: admin1234
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserPublic'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/register', controller.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y obtiene un token JWT
 *     tags: [Auth]
 *     description: |
 *       Autentica al usuario con email y contraseña. Si son válidos, devuelve un token JWT
 *       que expira en 24 horas.
 *
 *       **Cómo usar el token desde React:**
 *       Guarda el token en `localStorage` o en un estado global (Zustand). En cada petición
 *       a rutas protegidas (POST/PUT/DELETE), envíalo en el header:
 *       ```
 *       Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       ```
 *       **No requiere autenticación previa.**
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           example:
 *             email: admin@gastro.com
 *             password: admin1234
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token y datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/login', controller.login);

module.exports = router;
