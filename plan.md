# Plan de Construcción — Directorio Gastronómico Arequipeño

> Documento de especificación técnica para implementación con Claude Code.
> API REST educativa orientada a estudiantes con fundamentos de Java en backend
> que están aprendiendo Node/Express y consumirán esta API desde React.

---

## 1. Contexto del proyecto

API REST que gestiona un directorio de restaurantes y platos típicos de Arequipa, Perú. Servirá como backend para dos frontends React: un explorador público (proyecto 1, fundamentos) y un panel admin (proyecto 2, avanzado con Zustand y rutas protegidas).

**Audiencia técnica de la API**: estudiantes ~28 años con fundamentos de Java, conocimientos básicos de JS (promesas, manipulación del DOM, Node). NO usan TypeScript.

**Objetivos pedagógicos que la implementación debe cumplir:**
- Estructura clara separando rutas, controladores y servicios (familiar viniendo de Spring MVC)
- Código legible con comentarios explicativos en español en archivos clave
- Swagger detallado en español que sirva como material de estudio
- Errores con mensajes claros que enseñen qué salió mal
- Logs visibles en consola para que entiendan el flujo de requests

---

## 2. Stack técnico

| Componente | Tecnología | Razón |
|------------|-----------|-------|
| Runtime | Node.js (>=18) | Estándar moderno |
| Framework | Express 4 | Simple, ampliamente documentado |
| Base de datos | SQLite vía `better-sqlite3` | Sin servidor, API síncrona más legible |
| Auth | `jsonwebtoken` + `bcrypt` | Estándar de la industria |
| Documentación | `swagger-jsdoc` + `swagger-ui-express` | JSDoc inline, fácil de mantener |
| Logger | `morgan` | Visualización didáctica de requests |
| Variables de entorno | `dotenv` | Estándar |
| CORS | `cors` | Necesario para los dos frontends React |
| Hot reload | `nodemon` (devDependency) | Productividad |

**No usar**: TypeScript, ORMs complejos, librerías de validación pesadas. Validación manual con funciones helper (más didáctico).

---

## 3. Estructura de carpetas

```
gastro-api/
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── districts.routes.js
│   │   ├── categories.routes.js
│   │   ├── restaurants.routes.js
│   │   └── dishes.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── districts.controller.js
│   │   ├── categories.controller.js
│   │   ├── restaurants.controller.js
│   │   └── dishes.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── districts.service.js
│   │   ├── categories.service.js
│   │   ├── restaurants.service.js
│   │   └── dishes.service.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── utils/
│   │   ├── pagination.js
│   │   ├── validators.js
│   │   └── http-errors.js
│   ├── db/
│   │   ├── database.js
│   │   ├── schema.sql
│   │   └── seed.js
│   └── swagger/
│       ├── swagger.js
│       └── schemas/
│           ├── auth.schema.js
│           ├── district.schema.js
│           ├── category.schema.js
│           ├── restaurant.schema.js
│           ├── dish.schema.js
│           └── pagination.schema.js
├── data/
│   └── gastro.db          (generado, .gitignore)
├── .env.example
├── .gitignore
├── app.js
├── server.js
├── package.json
└── README.md
```

**Convenciones:**
- `app.js` configura la app de Express (middlewares, rutas, swagger, error handler). Exporta la instancia.
- `server.js` importa `app.js` y levanta el servidor en el puerto. Único punto de arranque.
- Cada entidad tiene sus tres capas: routes → controllers → services. **No saltearse capas.**
- Los controllers nunca tocan SQL. Solo los services.
- Los services no tocan req/res. Solo reciben parámetros y devuelven datos o lanzan errores.

---

## 4. Variables de entorno

`.env.example`:
```
PORT=4000
JWT_SECRET=cambiar_en_produccion_secreto_largo_y_aleatorio
JWT_EXPIRES_IN=24h
DB_PATH=./data/gastro.db
CORS_ORIGINS=*
NODE_ENV=development
```

**Notas:**
- `PORT=4000` para evitar choque con OpenCLAW y otros servicios típicos en el VPS.
- `CORS_ORIGINS=*` en dev. En producción se setea con los dominios reales separados por coma (ver sección 14).
- `JWT_SECRET` en producción debe generarse con `openssl rand -hex 64` (ver sección 23).

---

## 5. Esquema de base de datos

Archivo: `src/db/schema.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS districts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT,
  image_url TEXT,
  opening_time TEXT,        -- formato HH:MM
  closing_time TEXT,        -- formato HH:MM
  district_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS dishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  restaurant_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_restaurants_district ON restaurants(district_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant ON dishes(restaurant_id);
```

**Notas:**
- `ON DELETE RESTRICT` en restaurants: no se puede borrar un district o category si tiene restaurantes asociados → la API debe devolver 409 Conflict.
- `ON DELETE CASCADE` en dishes: borrar un restaurante borra sus platos automáticamente.
- `created_at` como TEXT en SQLite es la convención más simple y legible.

---

## 6. Endpoints

Todos los endpoints retornan JSON. Códigos de estado consistentes.

### 6.1 Auth (públicos)

| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Crea un usuario nuevo |
| POST | `/api/auth/login` | Devuelve token JWT |

**Body register/login**: `{ "email", "password", "username" (solo register) }`
**Response login (200)**: `{ "token": "...", "user": { id, username, email } }`

### 6.2 Districts

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/districts` | público | Lista todos (sin paginar, son pocos) |
| GET | `/api/districts/:id` | público | Detalle |
| POST | `/api/districts` | 🔒 | Crear |
| PUT | `/api/districts/:id` | 🔒 | Actualizar |
| DELETE | `/api/districts/:id` | 🔒 | Eliminar (409 si tiene restaurantes) |

### 6.3 Categories

Mismo patrón que districts.

### 6.4 Restaurants

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/restaurants` | público | Lista paginada con filtros |
| GET | `/api/restaurants/:id` | público | Detalle con district, category y dishes |
| POST | `/api/restaurants` | 🔒 | Crear |
| PUT | `/api/restaurants/:id` | 🔒 | Actualizar |
| DELETE | `/api/restaurants/:id` | 🔒 | Eliminar (cascada borra sus dishes) |

**Query params en GET `/api/restaurants`:**
- `page` (default 1)
- `limit` (default 10, máx 50)
- `search` (busca en `name` y `description`, case-insensitive)
- `district` (id de district)
- `category` (id de category)

### 6.5 Dishes

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/dishes` | público | Lista paginada con filtros |
| GET | `/api/dishes/:id` | público | Detalle |
| POST | `/api/dishes` | 🔒 | Crear |
| PUT | `/api/dishes/:id` | 🔒 | Actualizar |
| DELETE | `/api/dishes/:id` | 🔒 | Eliminar |

**Query params en GET `/api/dishes`:**
- `page`, `limit`, `search`
- `restaurant` (id de restaurant)

---

## 7. Estructura estándar de respuestas

### 7.1 Respuesta paginada

```json
{
  "data": [ ... ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 7.2 Respuesta de error

```json
{
  "error": {
    "status": 400,
    "message": "El campo 'name' es obligatorio",
    "details": [ ... ]   // opcional, para errores de validación múltiples
  }
}
```

### 7.3 Códigos de estado a usar

| Código | Cuándo |
|--------|--------|
| 200 | GET / PUT exitosos |
| 201 | POST exitoso (recurso creado) |
| 204 | DELETE exitoso (sin body) |
| 400 | Validación fallida, body malformado |
| 401 | Token ausente, inválido o expirado |
| 404 | Recurso no encontrado |
| 409 | Conflicto (FK restrict, email duplicado) |
| 500 | Error inesperado del servidor |

---

## 8. Auth — detalles de implementación

- **Hash**: `bcrypt` con `saltRounds = 10`
- **Token**: `jsonwebtoken`, payload `{ id, email, username }`, expira en `JWT_EXPIRES_IN` (24h)
- **Header esperado**: `Authorization: Bearer <token>`
- **Middleware** `auth.middleware.js`: verifica el token, agrega `req.user`, devuelve 401 si falla
- **Aplicación**: el middleware se aplica selectivamente solo a rutas POST/PUT/DELETE en cada `*.routes.js`

Ejemplo de uso del middleware en una ruta:
```js
router.get('/', controller.list);                      // pública
router.post('/', authMiddleware, controller.create);   // protegida
```

---

## 9. Validación

Validación manual con helpers en `src/utils/validators.js`. No usar libs como Joi o Zod. El objetivo es que el estudiante vea validación explícita.

Helpers mínimos:
- `requireString(value, field)` → string no vacío
- `requireNumber(value, field, { min, max })` → número en rango
- `requireEmail(value, field)` → formato email
- `requireId(value, field)` → entero positivo
- `requireTime(value, field)` → formato HH:MM
- `optional(value, validatorFn)` → si presente, valida

Cada validador lanza un `HttpError` con código 400 y mensaje claro. Los controllers ejecutan validación al inicio del handler, antes de llamar al service.

---

## 10. Manejo de errores

**Clase** `HttpError` en `src/utils/http-errors.js`:
```js
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
```

**Middleware** `error.middleware.js`: captura cualquier error con `next(err)`, formatea la respuesta según la sección 7.2. Si el error no es `HttpError`, devuelve 500 con mensaje genérico (y loguea el stack en consola en development).

**Regla**: los services nunca usan `res`. Lanzan `HttpError`. Los controllers usan try/catch y delegan al middleware con `next(err)`.

---

## 11. Paginación

Helper en `src/utils/pagination.js`:

```js
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limitRaw = parseInt(query.limit) || 10;
  const limit = Math.min(50, Math.max(1, limitRaw));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildPaginationResponse(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total, page, limit, totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
```

Los services de restaurants y dishes reciben `{ page, limit, offset, search, ... }` y devuelven `{ data, total }`. El controller ensambla la respuesta final.

---

## 12. Seed de datos

Archivo: `src/db/seed.js`. Comando: `npm run seed`.

**Comportamiento:**
1. Aplica el schema (CREATE TABLE IF NOT EXISTS).
2. Trunca todas las tablas (DELETE FROM ...) para que sea idempotente.
3. Inserta:
   - **1 usuario admin**: `admin@gastro.com` / `admin1234` (hasheada con bcrypt)
   - **8 distritos reales de Arequipa**: Cercado, Yanahuara, Cayma, Sachaca, Miraflores, Paucarpata, Cerro Colorado, José Luis Bustamante y Rivero
   - **6 categorías**: Picantería, Cevichería, Pollería, Chifa, Pizzería, Café
   - **20 restaurantes** distribuidos: usar nombres reales o realistas (ej: "La Nueva Palomino", "Sol de Mayo", "La Capitana"). Asignar district_id y category_id de forma variada.
   - **40 platos** distribuidos: rocoto relleno, chupe de camarones, adobo arequipeño, ocopa, chicharrón, etc. Precios en soles peruanos (rango 15-65 PEN).
4. Imprime resumen en consola al terminar: `✅ Seed completado: 1 user, 8 districts, 6 categories, 20 restaurants, 40 dishes`.

**Importante**: Las imágenes pueden ser URLs de placeholder (`https://placehold.co/600x400?text=...`) o quedar en NULL. No bloquear el seed por imágenes.

---

## 13. Swagger

Archivo: `src/swagger/swagger.js`. Configurado con `swagger-jsdoc` leyendo anotaciones JSDoc de los archivos `*.routes.js` y `src/swagger/schemas/*.js`.

**Montaje**: `app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))`.

**Tono y estilo de la documentación** (todos los textos en español):
- Cada endpoint debe tener `summary` corto y `description` extensa explicando:
  - Qué hace el endpoint en lenguaje claro
  - Cuándo se usaría desde el frontend
  - Si requiere autenticación y por qué
  - Qué códigos de respuesta puede devolver y qué significa cada uno
- Ejemplos de request body con datos arequipeños reales (no `"string"` o `"foo"`).
- Schemas reutilizables en `src/swagger/schemas/` para evitar duplicación.
- Configurar `securitySchemes` con `bearerAuth` (JWT) y aplicar `security` solo a endpoints protegidos.
- Tags por entidad: `Auth`, `Districts`, `Categories`, `Restaurants`, `Dishes`.

**Ejemplo del nivel de detalle esperado en una description**:
> "Devuelve una lista paginada de restaurantes. Útil para el listado principal de la aplicación. Acepta búsqueda por nombre/descripción mediante el parámetro `search`, y filtros por `district` y `category`. Si la página solicitada está fuera de rango, devuelve un array `data` vacío pero con la paginación correcta. **No requiere autenticación**: cualquier visitante puede consultar el directorio."

---

## 14. CORS

CORS configurable por variable de entorno para soportar dev y producción sin tocar código.

```js
const allowedOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**En desarrollo** (`.env.example`): `CORS_ORIGINS=*`

**En producción** (VPS): `CORS_ORIGINS=https://gastro-public.vercel.app,https://gastro-admin.vercel.app` (los dominios reales de Vercel).

---

## 15. Logger

`morgan('dev')` montado antes de las rutas. Los estudiantes deben ver en consola cada request entrante con su método, path, status y tiempo. Es parte del valor pedagógico.

---

## 16. Scripts de package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node src/db/seed.js"
  }
}
```

---

## 17. README.md

Debe incluir, en español:
1. **Descripción** del proyecto y propósito educativo.
2. **Requisitos**: Node >=18.
3. **Instalación**: `npm install`, copiar `.env.example` a `.env`.
4. **Inicialización**: `npm run seed` (la primera vez y cuando se quieran datos limpios).
5. **Ejecución**: `npm run dev`.
6. **Documentación interactiva**: enlace a `http://localhost:4000/api-docs`.
7. **Credenciales del admin de prueba**: `admin@gastro.com` / `admin1234`.
8. **Resumen de endpoints** en una tabla.
9. **Estructura del proyecto** explicada brevemente.
10. **Notas de uso desde React**: mencionar que los GET son públicos y que para POST/PUT/DELETE se debe enviar el header `Authorization: Bearer <token>` obtenido del endpoint de login.

---

## 18. .gitignore

```
node_modules/
.env
data/*.db
*.log
.DS_Store
```

---

## 19. Orden de implementación recomendado

Para que Claude Code construya en pasos verificables:

1. `package.json` con dependencias y scripts.
2. `.env.example`, `.gitignore`, `README.md` (esqueleto).
3. `src/db/database.js` (conexión SQLite singleton).
4. `src/db/schema.sql`.
5. `src/utils/` completo (`http-errors.js`, `pagination.js`, `validators.js`).
6. `src/middlewares/error.middleware.js`.
7. `src/middlewares/auth.middleware.js`.
8. Capa completa de **auth** (service → controller → routes).
9. Capa completa de **districts** (service → controller → routes).
10. Capa completa de **categories** (idéntica estructura).
11. Capa completa de **restaurants** (con paginación y filtros).
12. Capa completa de **dishes** (con paginación y filtros).
13. `src/swagger/` completo (config + schemas + anotaciones JSDoc en routes).
14. `app.js` (compone todo) y `server.js`.
15. `src/db/seed.js` con datos reales arequipeños.
16. README.md completo con todas las secciones.

Después de cada capa, verificar manualmente con `curl` o desde Swagger UI que funciona antes de pasar a la siguiente.

---

## 20. Criterios de aceptación

La API se considera lista cuando:

- [ ] `npm install && npm run seed && npm run dev` levanta el servidor sin errores
- [ ] `http://localhost:4000/api-docs` muestra Swagger en español con todos los endpoints
- [ ] POST `/api/auth/login` con `admin@gastro.com / admin1234` devuelve un JWT válido
- [ ] GET `/api/restaurants?page=1&limit=5&search=palomino` devuelve resultados paginados
- [ ] GET `/api/restaurants?district=2&category=1` filtra correctamente
- [ ] POST `/api/restaurants` sin token devuelve 401
- [ ] POST `/api/restaurants` con token y body válido devuelve 201 con el recurso creado
- [ ] DELETE `/api/districts/:id` de un district con restaurantes devuelve 409
- [ ] Errores tienen el formato estándar de la sección 7.2
- [ ] La consola muestra logs de morgan en cada request
- [ ] No hay TypeScript en ningún archivo
- [ ] Comentarios explicativos en español en archivos clave (middlewares, swagger config, seed)

---

## 21. Lo que NO entra en esta fase

Documentar explícitamente para que Claude Code no agregue scope extra:
- ❌ Tests (Jest, Vitest, Supertest)
- ❌ Roles de usuario (admin/user) — un solo rol implícito
- ❌ Rate limiting
- ❌ Refresh tokens
- ❌ Subida de archivos / imágenes (solo URLs)
- ❌ Astro + Starlight (fase 2)
- ❌ Docker / docker-compose
- ❌ GitHub Actions / CI/CD (fase posterior, mencionado en sección 24)
- ❌ Nginx + Certbot (no necesario, Cloudflare Tunnel resuelve HTTPS — ver sección 25)
- ❌ Dominio propio (no se adquiere ahora — upgrade documentado en 25.14)
- ❌ Backups automáticos del .db

---

## 22. Preparación del VPS

**Contexto del entorno:**
- VPS en CloudCone con Ubuntu 24
- Node ya instalado
- Otras aplicaciones corriendo (incluyendo OpenCLAW)
- Sin Nginx instalado previamente (no se instala en esta fase)
- Sin pm2 instalado previamente (se instala ahora)
- Sin dominio (acceso por IP:puerto en esta fase)
- **Estrategia de prueba elegida (camino 3):** los frontends correrán en localhost durante desarrollo, los estudiantes apuntan a la API por IP:puerto. HTTPS y Nginx se dejan para fase posterior.

### 22.1 Puerto asignado a la API

La API correrá en el puerto **`4000`** para evitar choques con OpenCLAW (que típicamente usa 8080/8888) y otras apps Node comunes (3000, 5000).

Ese puerto se define vía variable `PORT=4000` en el `.env` del server, no se hardcodea.

### 22.2 Instalaciones necesarias en el VPS

Comandos a ejecutar **una sola vez** al preparar el server:

```bash
# Verificar Node ya instalado
node -v   # debería ser >=18

# Instalar pm2 globalmente
sudo npm install -g pm2

# Instalar pm2-logrotate para rotación automática de logs
pm2 install pm2-logrotate

# Configurar rotación: máx 10MB por archivo, retener 7 días
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# Configurar pm2 para que arranque al boot del VPS
pm2 startup
# (ejecutar el comando que pm2 imprime, requiere sudo)
```

### 22.3 Estructura de carpetas en el server

Convención sugerida (no obligatoria):

```
/home/<usuario>/apps/gastro-api/    ← clone del repo aquí
/home/<usuario>/apps/gastro-api/data/gastro.db   ← la BD persiste acá
```

El directorio `data/` debe ser escribible por el usuario que corre pm2.

### 22.4 Firewall

El VPS ya tiene otras cosas corriendo, así que **no tocar el firewall existente**. Solo asegurarse de que el puerto `4000` esté accesible desde fuera. En CloudCone normalmente se gestiona desde el panel además de `ufw`.

```bash
# Verificar estado actual antes de cambiar nada
sudo ufw status
```

Si `ufw` está activo, abrir el puerto:
```bash
sudo ufw allow 4000/tcp
```

---

## 23. Configuración para producción

### 23.1 Variables de entorno del server

En el VPS, crear `.env` (NO versionado) con valores reales:

```
PORT=4000
JWT_SECRET=<generar con: openssl rand -base64 48>
JWT_EXPIRES_IN=24h
DB_PATH=./data/gastro.db
NODE_ENV=production
CORS_ORIGINS=http://localhost:5173,http://localhost:4321
```

**Notas importantes:**
- `JWT_SECRET` debe generarse aleatoriamente con `openssl rand -base64 48`. Nunca usar el placeholder de `.env.example`.
- `CORS_ORIGINS` es una lista separada por comas. En esta fase incluye `localhost` para que los estudiantes puedan probar desde sus máquinas locales. Cuando los frontends suban a Vercel, se agregan los dominios de Vercel a esta variable y se reinicia pm2.
- `NODE_ENV=production` desactiva trazas de error detalladas en respuestas HTTP.

### 23.2 Ajuste del CORS para soportar múltiples orígenes

El plan original tenía CORS permisivo (`origin: '*'`). Hay que cambiarlo para producción para que lea desde la variable de entorno:

```js
// app.js
const corsOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: corsOrigins.includes('*') ? '*' : corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

En desarrollo local, si `CORS_ORIGINS` no está definida, queda permisivo (`*`). En producción, lee la lista del `.env`.

### 23.3 Ajuste del error middleware en producción

Cuando `NODE_ENV=production`:
- No incluir `stack` ni detalles internos en las respuestas 500
- Mensaje genérico: `"Error interno del servidor"`
- Loguear el stack completo a `console.error` (pm2 lo captura)

En desarrollo, sí mostrar el stack para depuración.

### 23.4 Archivo `ecosystem.config.js` de pm2

Crear en la raíz del proyecto, **versionado en git**:

```js
module.exports = {
  apps: [
    {
      name: 'gastro-api',
      script: './server.js',
      instances: 1,                    // 1 sola instancia (SQLite no soporta múltiples writers)
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      // pm2 lee automáticamente el .env del directorio de trabajo
      // No hardcodear secrets aquí
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      time: true,                      // timestamp en cada línea de log
    },
  ],
};
```

**Notas:**
- `instances: 1` es crítico con SQLite. No usar cluster mode porque SQLite no soporta múltiples procesos escribiendo simultáneamente.
- `max_memory_restart` reinicia la app si supera 300MB (protección contra leaks).
- `logs/` debe estar en `.gitignore`.

### 23.5 Actualizar `.gitignore`

Sumar al `.gitignore` original:

```
logs/
ecosystem.config.local.js
```

(El `ecosystem.config.js` SÍ se versiona; solo se ignora una eventual versión local con overrides).

### 23.6 Actualizar scripts de `package.json`

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node src/db/seed.js",
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop gastro-api",
    "pm2:restart": "pm2 restart gastro-api",
    "pm2:logs": "pm2 logs gastro-api",
    "pm2:status": "pm2 status"
  }
}
```

---

## 24. Despliegue inicial y flujo de actualización

### 24.1 Despliegue inicial (una sola vez)

Asumiendo que el repo está en GitHub:

```bash
# 1. Conectarse al VPS por SSH
ssh usuario@<ip-del-vps>

# 2. Clonar el proyecto
mkdir -p ~/apps && cd ~/apps
git clone <url-del-repo> gastro-api
cd gastro-api

# 3. Instalar dependencias (sin devDependencies en producción)
npm ci --omit=dev

# 4. Crear el .env con los valores reales
cp .env.example .env
nano .env
# editar: PORT, JWT_SECRET (generado), CORS_ORIGINS, NODE_ENV=production

# 5. Generar el JWT_SECRET aleatorio
openssl rand -base64 48
# copiar el output al .env

# 6. Crear la BD y poblarla
mkdir -p data logs
npm run seed

# 7. Levantar con pm2
npm run pm2:start

# 8. Guardar el estado de pm2 para que se restaure al reboot
pm2 save

# 9. Verificar que está corriendo
pm2 status
curl http://localhost:4000/api/districts
```

### 24.2 Verificación post-deploy

Desde tu máquina local:

```bash
# Reemplazar <ip> por la IP del VPS
curl http://<ip>:4000/api/districts
curl http://<ip>:4000/api-docs   # debe redirigir a la UI de swagger
```

Si funciona, abrir `http://<ip>:4000/api-docs` en el navegador para confirmar que Swagger se ve correctamente.

### 24.3 Flujo de actualización (cada vez que haya cambios)

```bash
ssh usuario@<ip-del-vps>
cd ~/apps/gastro-api

git pull origin main
npm ci --omit=dev          # solo si cambió package.json
npm run pm2:restart        # reinicio sin downtime perceptible

pm2 logs gastro-api --lines 30   # verificar que arrancó OK
```

### 24.4 Comandos útiles de pm2

```bash
pm2 status                      # ver todos los procesos
pm2 logs gastro-api              # logs en vivo (Ctrl+C para salir)
pm2 logs gastro-api --lines 100  # últimas 100 líneas
pm2 logs gastro-api --err        # solo logs de error
pm2 monit                        # monitor interactivo CPU/RAM
pm2 restart gastro-api           # reiniciar
pm2 reload gastro-api            # reload sin downtime (no aplica con instances:1, equivale a restart)
pm2 stop gastro-api              # detener
pm2 delete gastro-api            # quitar de pm2
pm2 flush                        # vaciar archivos de log
```

### 24.5 Notas sobre acceso desde frontends

**Acceso por IP:puerto directo (HTTP, sin túnel):**
- Los frontends React **solo pueden consumir la API desde `localhost`** durante desarrollo
- Si los frontends se suben a Vercel, **NO van a poder llamar a `http://<ip>:4000`** porque Vercel sirve por HTTPS y los navegadores bloquean mixed content

**Acceso vía Cloudflare Tunnel (HTTPS, recomendado — ver sección 25):**
- Funciona desde localhost y desde frontends desplegados en Vercel
- URL es del tipo `https://random-words-1234.trycloudflare.com`
- IP del VPS queda oculta

**Para los estudiantes durante el desarrollo:**
- Apuntan su React local (Vite/Next dev server) a la URL del túnel
- O prueban directamente con Postman, Thunder Client, Insomnia o curl
- La URL del túnel se publica en un lugar único (ver sección 25.10)

### 24.6 Backup manual del .db

SQLite es un archivo único, así que el backup es trivial:

```bash
# Desde tu máquina local
scp usuario@<ip>:~/apps/gastro-api/data/gastro.db ./backup-$(date +%Y%m%d).db
```

Hacerlo manualmente cada cierto tiempo es suficiente para esta fase.

### 24.7 Próximos pasos (fuera del scope actual)

Cuando quieras evolucionar el deploy:

**A) Agregar HTTPS con dominio + Certbot**
1. Conseguir un subdominio (DuckDNS gratis o subdominio propio)
2. Apuntarlo a la IP del VPS (registro A)
3. Instalar Nginx como reverse proxy del puerto 4000 al 443
4. Ejecutar `sudo certbot --nginx -d api.tudominio.com`
5. Renovación automática queda configurada por Certbot
6. Actualizar `CORS_ORIGINS` con los dominios reales de Vercel
7. Reiniciar pm2

**B) Agregar GitHub Actions para CI/CD**
Workflow recomendado:
1. Trigger: push a `main`
2. Job: SSH al VPS y ejecutar `git pull && npm ci --omit=dev && pm2 restart gastro-api`
3. Secrets necesarios en GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
4. Action sugerida: `appleboy/ssh-action@master`

Ambas mejoras se documentarán en una fase posterior. El plan actual deja todo listo para que se sumen sin refactor.

---

## 25. Cloudflare Tunnel (ocultar IP del VPS)

### 25.1 Objetivo

Exponer la API a internet sin revelar la IP del VPS, sin abrir puertos al exterior, y con HTTPS automático. Esto resuelve además el problema de **mixed content con Vercel**: como Cloudflare provee la URL HTTPS, los frontends desplegados en Vercel pueden consumir la API sin bloqueo del navegador.

### 25.2 Modo elegido: Quick Tunnel (sin dominio propio)

**Decisión tomada:** no se cuenta con dominio propio y no se planea adquirir uno. Se usará **Quick Tunnel** (TryCloudflare), que no requiere cuenta de Cloudflare ni dominio.

**Cómo funciona:** un solo comando `cloudflared tunnel --url http://localhost:4000` levanta un túnel que expone el puerto 4000 local a una URL pública del tipo `https://palabras-aleatorias-1234.trycloudflare.com`.

**Ventajas:**
- Cero configuración previa
- HTTPS automático
- Oculta la IP del VPS
- No requiere abrir el puerto 4000 al exterior (el túnel es saliente)

**Limitaciones que hay que conocer y aceptar:**

| Limitación | Implicancia práctica |
|-----------|----------------------|
| URL cambia cuando `cloudflared` se reinicia | Si el VPS rebootea, la URL será nueva |
| Límite de 200 requests concurrentes | Suficiente para una clase, no para producción real |
| No tiene SLA garantizado por Cloudflare | Aceptable para uso educativo |
| No soporta Server-Sent Events | No aplica acá (la API no usa SSE) |

**Mitigación de la URL cambiante:** se publica la URL actual en un lugar accesible para los estudiantes (canal del curso, Notion, README de un repo público, Google Doc). Cuando cambie, se actualiza ese único lugar.

### 25.3 Instalación de cloudflared en el VPS

Comandos a ejecutar **una sola vez**:

```bash
# Descargar el paquete .deb oficial para Ubuntu
curl -L --output cloudflared.deb \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Instalar
sudo dpkg -i cloudflared.deb

# Verificar instalación
cloudflared --version

# Limpiar el archivo descargado
rm cloudflared.deb
```

### 25.4 Levantar el túnel manualmente (prueba inicial)

Para verificar que funciona antes de automatizarlo:

```bash
# Asumiendo que pm2 ya está corriendo gastro-api en el puerto 4000
cloudflared tunnel --url http://localhost:4000
```

La consola va a mostrar algo como:

```
Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
https://random-words-1234.trycloudflare.com
```

Probar desde el navegador o curl:
```bash
curl https://random-words-1234.trycloudflare.com/api/districts
```

Si responde, el túnel funciona. Cortar con Ctrl+C y pasar a 25.5.

### 25.5 Correr el túnel persistentemente con pm2

Para que el túnel arranque al boot del VPS y se reinicie si crashea, lo manejamos con pm2 igual que la API.

**Actualizar `ecosystem.config.js` de la sección 23.4 para sumar una segunda app:**

```js
module.exports = {
  apps: [
    {
      name: 'gastro-api',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/api-err.log',
      out_file: './logs/api-out.log',
      merge_logs: true,
      time: true,
    },
    {
      name: 'gastro-tunnel',
      script: 'cloudflared',
      args: 'tunnel --url http://localhost:4000 --no-autoupdate',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      error_file: './logs/tunnel-err.log',
      out_file: './logs/tunnel-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
```

**Notas:**
- `--no-autoupdate` evita que cloudflared se actualice solo en medio de la operación
- Los logs del túnel se guardan separados de los logs de la API para facilitar debugging
- Ambos procesos se reinician automáticamente si caen

### 25.6 Levantar todo de cero

Después de actualizar `ecosystem.config.js`:

```bash
cd ~/apps/gastro-api
pm2 delete all                    # limpia procesos viejos si los hay
npm run pm2:start                  # levanta API + túnel
pm2 save                           # guarda el estado para reboot
pm2 status                         # verificar que ambos están "online"
```

### 25.7 Obtener la URL pública del túnel

La URL queda en los logs del proceso `gastro-tunnel`. Para verla:

```bash
pm2 logs gastro-tunnel --lines 50 --nostream | grep trycloudflare
```

O directamente leyendo el archivo de log:
```bash
grep trycloudflare ~/apps/gastro-api/logs/tunnel-out.log | tail -1
```

Va a aparecer una línea con la URL del tipo `https://random-words-1234.trycloudflare.com`. Esa es la URL que se comparte con los estudiantes.

### 25.8 Cuándo cambia la URL del túnel

| Acción | ¿Cambia la URL? |
|--------|-----------------|
| `pm2 restart gastro-api` (solo la API) | No |
| `pm2 restart gastro-tunnel` | **Sí** |
| `pm2 restart all` | **Sí** |
| Reboot del VPS | **Sí** |
| `git pull` + `pm2 restart gastro-api` | No |
| Crash del proceso cloudflared y autorestart | **Sí** |

**Conclusión:** mientras NO reinicies el proceso `gastro-tunnel`, la URL se mantiene estable. Para los updates rutinarios de la API, usar `pm2 restart gastro-api` (no `restart all`).

### 25.9 Actualizar CORS_ORIGINS

Una vez que tengas la URL del túnel y los dominios de Vercel donde estarán los frontends, actualizar el `.env` del VPS:

```
CORS_ORIGINS=http://localhost:5173,http://localhost:4321,https://gastro-public.vercel.app,https://gastro-admin.vercel.app
```

Y reiniciar **solo** la API (no el túnel):
```bash
pm2 restart gastro-api
```

### 25.10 Compartir la URL con los estudiantes

Como la URL cambia cuando se reinicia el túnel o el VPS, conviene tener un único punto de actualización. Opciones:

1. **README de un repo público en GitHub** que ellos consulten — cuando cambie la URL, hacés un commit
2. **Un documento en Notion / Google Doc** compartido con el curso
3. **Un canal de Discord / WhatsApp / Telegram** del curso con mensaje fijado

Recomendación: la opción del repo público porque los estudiantes ya están con git constantemente y queda versionado el cambio.

### 25.11 Verificación de que la IP queda oculta

Después de levantar el túnel, hacer:

```bash
# Desde tu máquina local
curl -I https://random-words-1234.trycloudflare.com/api/districts
```

En los headers verás `server: cloudflare`, no la IP de tu VPS. Adicionalmente:

```bash
# Resolver el dominio del túnel
dig random-words-1234.trycloudflare.com +short
```

Las IPs que aparezcan son de Cloudflare, **no la del VPS**. Confirmado: tu IP queda oculta.

### 25.12 Comandos útiles

```bash
# Ver estado de ambos procesos
pm2 status

# Logs en vivo del túnel (donde aparece la URL al arrancar)
pm2 logs gastro-tunnel

# Logs en vivo de la API
pm2 logs gastro-api

# Ver la URL actual del túnel sin abrir logs en vivo
grep trycloudflare ~/apps/gastro-api/logs/tunnel-out.log | tail -1

# Forzar nueva URL (raro que lo necesites, pero por si acaso)
pm2 restart gastro-tunnel

# Detener solo el túnel (la API sigue corriendo en localhost del VPS)
pm2 stop gastro-tunnel
```

### 25.13 Alternativa documentada: DuckDNS (sin dominio, pero con URL fija)

Si la URL cambiante de Quick Tunnel se vuelve un problema operativo, una alternativa **gratis y con URL fija** es:

1. Registrarse en [duckdns.org](https://www.duckdns.org/) (gratis, login con Google/GitHub)
2. Crear un subdominio: `tu-api.duckdns.org`
3. Apuntarlo a la IP del VPS
4. Abrir el puerto 4000 al firewall del VPS
5. Compartir `http://tu-api.duckdns.org:4000` con los estudiantes

**Ventajas:**
- URL fija que nunca cambia
- Sin instalación adicional en el VPS

**Desventajas vs Cloudflare Tunnel:**
- **NO oculta la IP del VPS** (DNS resuelve a la IP real)
- **NO da HTTPS** automático (los frontends en Vercel no podrán consumirla por mixed content)
- Hay que abrir el puerto al firewall

**Cuándo usar DuckDNS:** si los estudiantes solo van a probar desde React local (`localhost`), DuckDNS funciona y la URL es estable. Si necesitás que los frontends desplegados en Vercel consuman la API, Cloudflare Tunnel es necesario.

### 25.14 Upgrade futuro: dominio propio en Cloudflare

Cuando se decida adquirir un dominio (~$10/año o `.xyz` desde ~$2/año):

1. Comprar el dominio en cualquier registrador
2. Cambiar los nameservers del dominio a los de Cloudflare (gratis)
3. Crear un tunnel persistente con `cloudflared tunnel create gastro-api`
4. Mapear `api.tudominio.com` al tunnel desde el dashboard de Cloudflare
5. URL fija definitiva: `https://api.tudominio.com`

Este upgrade no requiere refactor del código, solo cambia el `CORS_ORIGINS` y la URL que consumen los estudiantes.

---
---

## 25. Ajustes previos al primer push a producción

Esta sección cubre los detalles que impiden un deploy limpio en CloudCone y que no estaban cubiertos en las secciones anteriores.

### 25.1 Directorios requeridos que no se versionan

`data/` y `logs/` están en `.gitignore`, pero deben existir en el servidor desde el primer `npm run seed` y para que pm2 pueda escribir sus logs.

**Solución**: agregar archivos `.gitkeep` vacíos en cada directorio. Git no versiona directorios vacíos, pero sí archivos dentro de ellos. El `.gitignore` ya excluye `data/*.db` y `logs/`, así que hay que afinar las reglas para que los `.gitkeep` sí se incluyan.

Actualizar `.gitignore`:
```
# BD y logs generados en runtime — no versionar
data/*.db
logs/*.log

# Sí versionar la estructura de carpetas
!data/.gitkeep
!logs/.gitkeep
```

Crear los archivos:
```bash
touch data/.gitkeep logs/.gitkeep
```

### 25.2 Versión mínima de Node en package.json

El VPS tiene Node instalado pero su versión exacta no se conoce de antemano. `better-sqlite3` v12 requiere Node >= 18. Declararlo en `package.json` hace que `npm install` falle con mensaje claro si la versión es incompatible, en lugar de fallar con errores crípticos de compilación.

```json
"engines": {
  "node": ">=18"
}
```

### 25.3 Endpoint de health check

Permite verificar en segundos que la API está viva y la BD responde, tanto desde el VPS con `curl` como desde herramientas externas de monitoreo.

```
GET /api/health
```

Respuesta 200 cuando todo está bien:
```json
{
  "status": "ok",
  "uptime": 123.45,
  "db": "connected",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

Respuesta 500 si la BD no responde (raro con SQLite, pero protege ante corrupción del archivo).

El endpoint hace una query mínima (`SELECT 1`) para confirmar que la BD responde. No requiere autenticación.

### 25.4 Checklist final antes del primer push

```bash
# En tu máquina local, desde la raíz del proyecto:

# 1. Verificar que el .env de desarrollo existe
[ -f .env ] && echo "✅ .env existe" || echo "❌ falta .env"

# 2. Verificar que la BD de prueba no se va a subir al repo
git status --short | grep "data/" | head -5

# 3. Instalar y levantar limpio una vez más
npm install && npm run seed && npm run dev
# → debe mostrar el banner sin errores

# 4. Probar health check antes de subir
curl http://localhost:4000/api/health

# 5. Detener el servidor y hacer el commit inicial
# (Ctrl+C para detener nodemon)
```

### 25.5 Flujo completo de primer deploy en CloudCone

Una vez que el repo esté en GitHub y los pasos anteriores estén listos:

```bash
# Desde tu máquina local
git add .
git commit -m "feat: initial implementation of gastro API"
git push origin main

# En el VPS (SSH)
ssh usuario@<ip-vps>

# Verificar Node >= 18
node -v

# Instalar pm2 si no está
sudo npm install -g pm2

# Clonar e instalar
mkdir -p ~/apps && cd ~/apps
git clone <url-repo> gastro-api
cd gastro-api
npm ci --omit=dev

# Crear .env de producción
cp .env.example .env
nano .env
# Editar: JWT_SECRET (con openssl rand -base64 48), NODE_ENV=production, CORS_ORIGINS

# Sembrar la BD y levantar
npm run seed
npm run pm2:start
pm2 save

# Verificar
curl http://localhost:4000/api/health
curl http://localhost:4000/api/districts
```

Desde fuera del VPS:
```bash
curl http://<ip-vps>:4000/api/health
```

Si responde `{"status":"ok",...}` → la API está accesible públicamente.
