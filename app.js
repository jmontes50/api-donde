require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/swagger/swagger');

// Rutas
const authRoutes = require('./src/routes/auth.routes');
const districtsRoutes = require('./src/routes/districts.routes');
const categoriesRoutes = require('./src/routes/categories.routes');
const restaurantsRoutes = require('./src/routes/restaurants.routes');
const dishesRoutes = require('./src/routes/dishes.routes');

// Middleware de errores (siempre al final)
const errorMiddleware = require('./src/middlewares/error.middleware');

const app = express();

// CORS configurable por variable de entorno
const corsOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: corsOrigins.includes('*') ? '*' : corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Morgan: loguea cada request en consola (útil para aprender el flujo HTTP)
app.use(morgan('dev'));

// Parsear JSON en el body de los requests
app.use(express.json());

// Documentación interactiva en /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Gastro API — Documentación',
}));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/districts', districtsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/dishes', dishesRoutes);

// Health check — útil para verificar que la API y la BD responden tras el deploy
const db = require('./src/db/database');
app.get('/api/health', async (req, res) => {
  try {
    await db.execute('SELECT 1');
    res.json({
      status: 'ok',
      uptime: Math.round(process.uptime() * 100) / 100,
      db: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      db: 'unreachable',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    message: 'Directorio Gastronómico Arequipeño — API',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

// Middleware de errores — debe ser el último
app.use(errorMiddleware);

module.exports = app;
