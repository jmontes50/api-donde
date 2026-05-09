// Conexión singleton a SQLite.
// Usamos better-sqlite3 cuya API es síncrona, lo que hace el código más
// legible: no hay callbacks ni promesas que manejar en los services.
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Leer la ruta de la BD desde la variable de entorno (con valor por defecto)
const dbPath = process.env.DB_PATH || './data/gastro.db';

// Asegurarse de que el directorio exista antes de crear el archivo
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Crear (o abrir) la base de datos
const db = new Database(dbPath);

// Activar WAL mode: mejora el rendimiento en lecturas concurrentes
db.pragma('journal_mode = WAL');

// Activar foreign keys: SQLite las desactiva por defecto
db.pragma('foreign_keys = ON');

module.exports = db;
