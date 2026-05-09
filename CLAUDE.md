# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción del proyecto

API REST de directorio gastronómico arequipeño. Backend educativo para estudiantes con fundamentos de Java que aprenden Node/Express. El código debe ser legible y con comentarios explicativos en español en archivos clave (middlewares, swagger config, seed).

## Comandos

```bash
npm run dev        # servidor con hot reload (nodemon)
npm run seed       # crea la BD y pobla con datos de prueba
npm run start      # producción (node directo)

# pm2 en el VPS
npm run pm2:start
npm run pm2:restart
npm run pm2:logs
```

No hay tests en esta fase.

## Stack técnico

- **Runtime**: Node.js >=18, Express 4
- **BD**: SQLite vía `better-sqlite3` (API síncrona, sin servidor)
- **Auth**: `jsonwebtoken` + `bcrypt`
- **Docs**: `swagger-jsdoc` + `swagger-ui-express` en `/api-docs`
- **Logger**: `morgan('dev')` para que los estudiantes vean el flujo de requests
- **Sin**: TypeScript, ORMs, librerías de validación (Joi/Zod)

## Arquitectura

### Capas (estrictas, no saltarse)

```
routes → controllers → services → database.js
```

- **routes**: solo monta handlers y aplica middlewares
- **controllers**: validan input, llaman al service, usan `next(err)` para errores
- **services**: toda la lógica de negocio y SQL. Nunca tocan `req`/`res`. Lanzan `HttpError`
- **`app.js`**: configura Express (middlewares, rutas, swagger, error handler). Exporta la app
- **`server.js`**: único punto de arranque. Solo importa app y levanta el servidor

### Manejo de errores

`HttpError(status, message, details)` en `src/utils/http-errors.js`. El middleware `error.middleware.js` captura todo lo que llega por `next(err)` y formatea la respuesta. En `NODE_ENV=production` no expone el stack.

Formato de error estándar:
```json
{ "error": { "status": 400, "message": "El campo 'name' es obligatorio", "details": [] } }
```

### Autenticación

JWT con header `Authorization: Bearer <token>`. El middleware `auth.middleware.js` verifica el token y agrega `req.user`. Se aplica **selectivamente** solo a rutas POST/PUT/DELETE en cada `*.routes.js`, no globalmente.

### Paginación

Helper `parsePagination(query)` y `buildPaginationResponse(total, page, limit)` en `src/utils/pagination.js`. Límite máximo: 50. Respuesta incluye `{ data, pagination: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }`.

### Validación

Manual con helpers en `src/utils/validators.js` (más didáctico que Joi/Zod). Cada helper lanza `HttpError(400, ...)`. Los controllers validan al inicio del handler antes de llamar al service.

### CORS

Configurable por `CORS_ORIGINS` en `.env` (lista separada por comas). En dev: `CORS_ORIGINS=*`.

## Base de datos

SQLite en `./data/gastro.db` (generado, no versionado). Esquema en `src/db/schema.sql`.

Relaciones clave:
- `restaurants` → `districts` y `categories`: `ON DELETE RESTRICT` → devolver 409 si hay restaurantes al borrar un district/category
- `dishes` → `restaurants`: `ON DELETE CASCADE` → borrar restaurante borra sus platos

## Endpoints

Todos bajo `/api/`. Los GET son públicos; POST/PUT/DELETE requieren JWT.

| Recurso | Ruta base | Filtros en GET |
|---------|-----------|----------------|
| Auth | `/api/auth` | — |
| Districts | `/api/districts` | — |
| Categories | `/api/categories` | — |
| Restaurants | `/api/restaurants` | `page`, `limit`, `search`, `district`, `category` |
| Dishes | `/api/dishes` | `page`, `limit`, `search`, `restaurant` |

Códigos de estado: 200 (GET/PUT), 201 (POST), 204 (DELETE), 400, 401, 404, 409, 500.

## Swagger

Montado en `/api-docs`. Anotaciones JSDoc en los `*.routes.js`. Schemas reutilizables en `src/swagger/schemas/`. Todos los textos en español. Descriptions extensas explicando qué hace el endpoint, cuándo usarlo desde el frontend, si requiere auth y qué códigos puede devolver.

## Seed

`npm run seed` es idempotente: trunca todas las tablas e inserta datos frescos. Usuario admin: `admin@gastro.com` / `admin1234`. Incluye 8 distritos reales de Arequipa, 6 categorías, 20 restaurantes y 40 platos típicos con precios en soles (15–65 PEN).

## Variables de entorno

Ver `.env.example`. Valores mínimos: `PORT=4000`, `JWT_SECRET`, `JWT_EXPIRES_IN=24h`, `DB_PATH=./data/gastro.db`.

## Deploy (VPS CloudCone Ubuntu 24)

- pm2 con `ecosystem.config.js` (versionado en git), `instances: 1` obligatorio (SQLite no soporta múltiples writers)
- Puerto 4000 para evitar conflictos con otras apps del VPS
- Sin Nginx/HTTPS en esta fase (acceso por IP:puerto)
- Actualización: `git pull && npm ci --omit=dev && npm run pm2:restart`

## Restricciones (fuera del scope actual)

No agregar: tests, roles de usuario, rate limiting, refresh tokens, subida de archivos, Docker, CI/CD, HTTPS.
