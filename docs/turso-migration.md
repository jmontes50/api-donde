# Migración a Turso

## Qué se hizo

Se reemplazó `better-sqlite3` (SQLite local síncrono) por `@libsql/client` (LibSQL async, compatible con Turso cloud). Esto resuelve el problema de pérdida de datos en Render, cuyo filesystem es efímero.

De paso, se migró toda la lógica de datos: los services de districts, categories, restaurants y dishes leían de un JSON estático — ahora todos usan la base de datos real.

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `package.json` | `better-sqlite3` → `@libsql/client` |
| `src/db/database.js` | Cliente libsql (funciona con `file:` local y `libsql:` Turso) |
| `src/db/seed.js` | Convertido a async; usa `db.execute()` en lugar de `db.prepare().run()` |
| `src/services/*.service.js` | Todos async; districts/categories/restaurants/dishes ahora usan SQL real |
| `src/controllers/*.controller.js` | Todos convertidos a `async function` con `await` |
| `app.js` | Health check `/api/health` convertido a async |
| `.env.example` | Nuevas variables: `TURSO_DB_URL` y `TURSO_AUTH_TOKEN` |
| `render.yaml` | Agregadas las vars de Turso con `sync: false` |

### Cambio de API en la capa de BD

```js
// Antes (better-sqlite3, síncrono)
const row  = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
const rows = db.prepare('SELECT * FROM users').all();
const info = db.prepare('INSERT INTO users ...').run(...args);
info.lastInsertRowid; // número

// Ahora (@libsql/client, async)
const row  = (await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] })).rows[0];
const rows = (await db.execute('SELECT * FROM users')).rows;
const info = await db.execute({ sql: 'INSERT INTO users ...', args: [...] });
Number(info.lastInsertRowid); // BigInt → convertir con Number()
```

---

## Cómo continuar: configurar Turso para producción

### 1. Crear la base de datos en Turso

```bash
# Instalar la CLI de Turso
npm install -g @turso/cli

# Autenticarse (abre el navegador)
turso auth login

# Crear la BD
turso db create gastro-api

# Obtener la URL
turso db show gastro-api
# → URL: libsql://gastro-api-<usuario>.turso.io

# Generar un token de acceso
turso db tokens create gastro-api
# → copiar el token
```

### 2. Poblar la BD en Turso con el seed

```bash
TURSO_DB_URL=libsql://gastro-api-<usuario>.turso.io \
TURSO_AUTH_TOKEN=<token> \
npm run seed
```

### 3. Configurar las variables en Render

En el dashboard de Render → servicio `gastro-api` → **Environment**:

| Variable | Valor |
|---|---|
| `TURSO_DB_URL` | `libsql://gastro-api-<usuario>.turso.io` |
| `TURSO_AUTH_TOKEN` | el token generado en el paso 1 |

> El `render.yaml` ya tiene ambas variables declaradas con `sync: false`, lo que significa que Render las espera pero no las genera automáticamente — hay que pegarlas a mano en el dashboard.

### 4. Hacer deploy

```bash
git checkout main   # o la rama que uses en producción
git merge feature/turso-migration
git push
```

Render detecta el push y hace el redeploy automáticamente.

### 5. Verificar

```
GET https://tu-api.onrender.com/api/health
→ { "status": "ok", "db": "connected" }

GET https://tu-api.onrender.com/api/restaurants
→ lista de 20 restaurantes (del seed)
```

---

## Variables de entorno de referencia

```env
# Desarrollo local
TURSO_DB_URL=file:./data/gastro.db
TURSO_AUTH_TOKEN=                     # vacío, no se necesita en local

# Producción (Turso cloud)
TURSO_DB_URL=libsql://gastro-api-<usuario>.turso.io
TURSO_AUTH_TOKEN=<token>
```

---

## Notas para el código

- `lastInsertRowid` en `@libsql/client` es un `BigInt`. Siempre convertir con `Number()` antes de usarlo como ID.
- `db.batch([...], 'write')` es el equivalente de las transacciones de `better-sqlite3`. Se usa en el seed para truncar tablas en bloque.
- Para desarrollo local el comportamiento es idéntico al anterior: el archivo `./data/gastro.db` se crea automáticamente al correr el seed.
