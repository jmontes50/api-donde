// Conexión singleton a la base de datos.
// Usa @libsql/client que funciona igual en local (file:) y en Turso cloud (libsql:).
// La API es async: todas las queries devuelven Promises.
const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DB_URL || 'file:./data/gastro.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

module.exports = db;
