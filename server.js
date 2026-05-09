require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n🍽️  Directorio Gastronómico Arequipeño — API`);
  console.log(`   Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Documentación:     http://localhost:${PORT}/api-docs`);
  console.log(`   Entorno:           ${process.env.NODE_ENV || 'development'}\n`);
});
