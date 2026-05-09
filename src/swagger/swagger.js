/**
 * Configuración de Swagger (OpenAPI 3.0).
 *
 * swagger-jsdoc lee las anotaciones @swagger de los archivos de rutas y schemas
 * y genera la especificación OpenAPI en memoria.
 * swagger-ui-express sirve esa especificación como una UI interactiva en /api-docs.
 */
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Directorio Gastronómico Arequipeño — API',
      version: '1.0.0',
      description: `
API REST del directorio gastronómico de Arequipa, Perú.

Gestiona restaurantes, platos típicos, distritos y categorías.

## Autenticación
Los endpoints de consulta (GET) son **públicos** — no requieren token.
Los endpoints de escritura (POST, PUT, DELETE) requieren un token JWT en el header:
\`Authorization: Bearer <token>\`

Obtén el token haciendo POST a \`/api/auth/login\` con las credenciales de administrador.

## Credenciales de prueba
- **Email:** admin@gastro.com
- **Contraseña:** admin1234
      `,
      contact: {
        name: 'Soporte del proyecto',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Servidor de desarrollo local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /api/auth/login',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Registro e inicio de sesión' },
      { name: 'Districts', description: 'Distritos de Arequipa' },
      { name: 'Categories', description: 'Categorías de restaurantes' },
      { name: 'Restaurants', description: 'Directorio de restaurantes' },
      { name: 'Dishes', description: 'Platos típicos arequipeños' },
    ],
  },
  // Archivos donde swagger-jsdoc buscará anotaciones @swagger
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, './schemas/*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
