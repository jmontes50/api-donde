# Directorio Gastronómico Arequipeño — API

API REST educativa que gestiona un directorio de restaurantes y platos típicos de Arequipa, Perú.

Diseñada para servir como backend de dos frontends React: un explorador público y un panel de administración. El código usa una estructura familiar para quienes vienen de Java/Spring MVC (rutas → controladores → servicios).

---

## Requisitos

- Node.js >= 18

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo> && cd gastro-api

# 2. Instalar dependencias
npm install

# 3. Copiar las variables de entorno
cp .env.example .env
```

---

## Inicialización

Ejecuta el seed **la primera vez** y cada vez que quieras restaurar los datos de ejemplo:

```bash
npm run seed
```

Esto crea la base de datos SQLite, aplica el esquema e inserta 8 distritos, 6 categorías, 20 restaurantes y 40 platos típicos arequipeños.

---

## Ejecución

```bash
npm run dev   # desarrollo con hot reload
npm start     # producción
```

El servidor arranca en `http://localhost:4000`

---

## Documentación interactiva

Una vez levantado el servidor, accede a Swagger UI en:

**http://localhost:4000/api-docs**

Desde ahí puedes explorar todos los endpoints, ver los schemas de request/response y probar las rutas directamente desde el navegador.

---

## Credenciales de prueba

| Campo | Valor |
|-------|-------|
| Email | admin@gastro.com |
| Contraseña | admin1234 |

Para usar endpoints protegidos: haz POST a `/api/auth/login`, copia el `token` de la respuesta y en Swagger pulsa **Authorize** (candado arriba a la derecha) para pegarlo.

---

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| POST | `/api/auth/register` | — | Registrar usuario |
| POST | `/api/auth/login` | — | Obtener token JWT |
| GET | `/api/districts` | — | Listar distritos |
| GET | `/api/districts/:id` | — | Detalle de distrito |
| POST | `/api/districts` | 🔒 | Crear distrito |
| PUT | `/api/districts/:id` | 🔒 | Actualizar distrito |
| DELETE | `/api/districts/:id` | 🔒 | Eliminar distrito |
| GET | `/api/categories` | — | Listar categorías |
| GET | `/api/categories/:id` | — | Detalle de categoría |
| POST | `/api/categories` | 🔒 | Crear categoría |
| PUT | `/api/categories/:id` | 🔒 | Actualizar categoría |
| DELETE | `/api/categories/:id` | 🔒 | Eliminar categoría |
| GET | `/api/restaurants` | — | Listar restaurantes (paginado + filtros) |
| GET | `/api/restaurants/:id` | — | Detalle con platos incluidos |
| POST | `/api/restaurants` | 🔒 | Crear restaurante |
| PUT | `/api/restaurants/:id` | 🔒 | Actualizar restaurante |
| DELETE | `/api/restaurants/:id` | 🔒 | Eliminar restaurante |
| GET | `/api/dishes` | — | Listar platos (paginado + filtros) |
| GET | `/api/dishes/:id` | — | Detalle de plato |
| POST | `/api/dishes` | 🔒 | Crear plato |
| PUT | `/api/dishes/:id` | 🔒 | Actualizar plato |
| DELETE | `/api/dishes/:id` | 🔒 | Eliminar plato |

### Filtros disponibles

**GET `/api/restaurants`**: `page`, `limit`, `search`, `district`, `category`

**GET `/api/dishes`**: `page`, `limit`, `search`, `restaurant`

---

## Estructura del proyecto

```
src/
├── routes/       → Define las rutas y aplica middlewares
├── controllers/  → Valida el input y llama al service
├── services/     → Lógica de negocio y consultas SQL
├── middlewares/  → auth.middleware.js y error.middleware.js
├── utils/        → http-errors.js, pagination.js, validators.js
├── db/           → database.js (conexión), schema.sql, seed.js
└── swagger/      → Configuración y schemas de la documentación
app.js            → Configura Express (middlewares, rutas, swagger)
server.js         → Levanta el servidor en el puerto configurado
```

---

## Notas de uso desde React

Los endpoints GET son públicos: cualquier `fetch` sin headers adicionales funciona.

Para los endpoints POST, PUT y DELETE necesitas autenticación:

```js
// 1. Hacer login y guardar el token
const res = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@gastro.com', password: 'admin1234' }),
});
const { token } = await res.json();

// 2. Usar el token en las peticiones protegidas
await fetch('http://localhost:4000/api/restaurants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ name: 'Mi Restaurante', ... }),
});
```
