/**
 * Seed de datos para el directorio gastronómico arequipeño.
 *
 * Comportamiento: trunca todas las tablas e inserta datos frescos.
 * Es idempotente: se puede ejecutar múltiples veces sin duplicar datos.
 *
 * Ejecutar con: npm run seed
 */
require('dotenv').config();

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const db = require('./database');

// Aplicar el schema (crea las tablas si no existen)
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Limpiar todas las tablas en orden (respetando FK)
db.exec(`
  DELETE FROM dishes;
  DELETE FROM restaurants;
  DELETE FROM categories;
  DELETE FROM districts;
  DELETE FROM users;
  DELETE FROM sqlite_sequence WHERE name IN ('dishes','restaurants','categories','districts','users');
`);

// ── 1. Usuario admin ──────────────────────────────────────────────────────────
const hashedPassword = bcrypt.hashSync('admin1234', 10);
db.prepare(
  'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
).run('admin', 'admin@gastro.com', hashedPassword);

// ── 2. Distritos de Arequipa ──────────────────────────────────────────────────
const insertDistrict = db.prepare('INSERT INTO districts (name, description) VALUES (?, ?)');

const districts = [
  ['Cercado', 'Centro histórico de Arequipa, declarado Patrimonio de la Humanidad. Corazón cultural y gastronómico de la ciudad.'],
  ['Yanahuara', 'Distrito residencial y turístico famoso por su mirador con vista al volcán Misti y sus picanterías tradicionales.'],
  ['Cayma', 'Distrito al norte de la ciudad con casonas coloniales y restaurantes con vista panorámica a los volcanes.'],
  ['Sachaca', 'Conocido por sus campiñas y el tradicional molino. Concentra algunas de las picanterías más antiguas de Arequipa.'],
  ['Miraflores', 'Distrito popular con amplia oferta gastronómica accesible y mercados locales muy concurridos.'],
  ['Paucarpata', 'Uno de los distritos más grandes de Arequipa, con tradición en chicherías y comida de mercado.'],
  ['Cerro Colorado', 'Distrito en expansión al norte, con centros comerciales y restaurantes modernos junto a opciones tradicionales.'],
  ['José Luis Bustamante y Rivero', 'Distrito residencial del sur con restaurantes familiares, pollerías y cevicherías de barrio.'],
];

const districtRows = {};
for (const [name, description] of districts) {
  const result = insertDistrict.run(name, description);
  districtRows[name] = result.lastInsertRowid;
}

// ── 3. Categorías ─────────────────────────────────────────────────────────────
const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');

const categories = [
  ['Picantería', 'Restaurantes tradicionales que sirven platos típicos arequipeños en ambiente familiar. Son el símbolo gastronómico de la región.'],
  ['Cevichería', 'Especialistas en ceviche y preparaciones a base de pescados y mariscos frescos del litoral peruano.'],
  ['Pollería', 'Restaurantes especializados en pollo a la brasa, plato más popular del Perú según encuestas nacionales.'],
  ['Chifa', 'Restaurantes de cocina chino-peruana, una fusión única en el mundo nacida de la migración cantonesa al Perú.'],
  ['Pizzería', 'Pizzerías artesanales e italianas adaptadas al gusto arequipeño, con ingredientes locales.'],
  ['Café', 'Cafeterías y cafés con opciones de desayuno, brunch, repostería y bebidas de especialidad.'],
];

const categoryRows = {};
for (const [name, description] of categories) {
  const result = insertCategory.run(name, description);
  categoryRows[name] = result.lastInsertRowid;
}

// ── 4. Restaurantes ───────────────────────────────────────────────────────────
const insertRestaurant = db.prepare(`
  INSERT INTO restaurants (name, description, address, phone, image_url, opening_time, closing_time, lat, lng, district_id, category_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Columnas: name, description, address, phone, image_url, opening_time, closing_time, lat, lng, district, category
const restaurants = [
  // Picanterías
  ['La Nueva Palomino', 'Picantería tradicional con más de 50 años de historia, considerada una de las mejores de Arequipa. Sus rocoto relleno y chupe de camarones son legendarios.', 'Leoncio Prado 122', '054-252393', 'https://placehold.co/600x400?text=La+Nueva+Palomino', '12:00', '17:00', -16.3978, -71.5504, 'Yanahuara', 'Picantería'],
  ['Sol de Mayo', 'Emblemática picantería en plena campiña de Yanahuara. Ambiente arequipeño auténtico con vista al Misti desde sus mesas al aire libre.', 'Jerusalén 207', '054-254148', 'https://placehold.co/600x400?text=Sol+de+Mayo', '11:00', '17:00', -16.3993, -71.5511, 'Yanahuara', 'Picantería'],
  ['La Capitana', 'Picantería familiar reconocida por su adobo arequipeño y chicharrones. Funciona desde 1978 en el corazón de Sachaca.', 'Av. Fernandini 215', '054-271832', 'https://placehold.co/600x400?text=La+Capitana', '08:00', '16:00', -16.4282, -71.5731, 'Sachaca', 'Picantería'],
  ['El Rancho', 'Picantería con amplio jardín, ideal para grupos. Especialidad en ocopa arequipeña y pastel de papa.', 'Calle Peral 301', '054-265410', 'https://placehold.co/600x400?text=El+Rancho', '11:30', '17:00', -16.4270, -71.5718, 'Sachaca', 'Picantería'],
  ['La Lucila', 'Reconocida picantería del centro histórico. Ganadora de varios premios gastronómicos regionales por su sazón tradicional.', 'Calle Mercaderes 229', '054-213764', 'https://placehold.co/600x400?text=La+Lucila', '11:00', '16:00', -16.4082, -71.5381, 'Cercado', 'Picantería'],
  ['Tradiciones Arequipeñas', 'Ambiente rústico con paredes de sillar blanco. Sirven el desayuno tradicional: adobo con pan de tres puntas todos los domingos.', 'Av. Dolores 111', '054-289543', 'https://placehold.co/600x400?text=Tradiciones', '07:00', '15:00', -16.4312, -71.5201, 'José Luis Bustamante y Rivero', 'Picantería'],

  // Cevicherías
  ['El Muelle', 'Cevichería de referencia en Arequipa. Traen ingredientes frescos tres veces por semana directamente desde el puerto de Camaná.', 'Av. Ejército 406', '054-231847', 'https://placehold.co/600x400?text=El+Muelle', '11:00', '17:00', -16.3965, -71.5484, 'Yanahuara', 'Cevichería'],
  ['Mar y Tierra', 'Fusión entre los sabores del mar y la cocina arequipeña. Su tiradito de pejerrey con salsa de ocopa es único en la ciudad.', 'Calle Melgar 112', '054-208931', 'https://placehold.co/600x400?text=Mar+y+Tierra', '12:00', '17:00', -16.4070, -71.5392, 'Cercado', 'Cevichería'],
  ['La Cevichería del Puerto', 'Local popular en Miraflores con precios accesibles. Conocida por sus porciones generosas y leche de tigre potente.', 'Av. Mariscal Castilla 780', '054-432156', 'https://placehold.co/600x400?text=Cevicheria+del+Puerto', '11:30', '16:30', -16.4165, -71.5219, 'Miraflores', 'Cevichería'],

  // Pollerías
  ['Don Pollo', 'Pollería familiar con más de 30 años en el mercado arequipeño. Su pollo a la brasa con papas fritas y ensalada es el favorito del barrio.', 'Av. Aviación 567', '054-471230', 'https://placehold.co/600x400?text=Don+Pollo', '12:00', '22:00', -16.3689, -71.5601, 'Cerro Colorado', 'Pollería'],
  ['El Brasero', 'Pollería con horno de leña tradicional. El aroma que sale a la calle a las 11am es imposible de ignorar.', 'Calle Alfonso Ugarte 234', '054-455678', 'https://placehold.co/600x400?text=El+Brasero', '11:00', '22:00', -16.4203, -71.5076, 'Paucarpata', 'Pollería'],
  ['Pollo Real', 'Cadena local arequipeña con tres locales en la ciudad. Relación calidad-precio muy valorada por las familias del distrito.', 'Av. Los Incas 890', '054-398123', 'https://placehold.co/600x400?text=Pollo+Real', '12:00', '23:00', -16.4289, -71.5185, 'José Luis Bustamante y Rivero', 'Pollería'],

  // Chifas
  ['China House', 'Chifa de segunda generación, fundado por la familia Wong. Ambiente tradicional con mesas redondas y dim sum los domingos.', 'Calle San José 145', '054-223456', 'https://placehold.co/600x400?text=China+House', '12:00', '22:00', -16.4091, -71.5362, 'Cercado', 'Chifa'],
  ['Dragón de Oro', 'Fusión chino-arequipeña que incorpora ingredientes locales como el rocoto y la quinua en platos clásicos del chifa.', 'Av. Pumacahua 678', '054-381234', 'https://placehold.co/600x400?text=Dragon+de+Oro', '11:30', '22:30', -16.3821, -71.5528, 'Cayma', 'Chifa'],

  // Pizzerías
  ['Pizzería Quattro', 'Pizzería artesanal con horno de piedra importado de Italia. Sus ingredientes locales (queso de Cayma, orégano de Cotahuasi) le dan un sabor único.', 'Calle Álvarez Thomas 321', '054-251890', 'https://placehold.co/600x400?text=Quattro', '18:00', '23:00', -16.3985, -71.5497, 'Yanahuara', 'Pizzería'],
  ['La Piazza', 'Ambiente italiano en el centro histórico. Perfecta para cenas con vista a la Plaza de Armas después de un día de turismo.', 'Portal de Flores 142', '054-201234', 'https://placehold.co/600x400?text=La+Piazza', '12:00', '23:00', -16.4080, -71.5370, 'Cercado', 'Pizzería'],

  // Cafés
  ['Café Valenzuela', 'El café más antiguo de Arequipa, fundado en 1914. Sus tejas arequipeñas, queso helado y chocolates son los souvenirs gastronómicos de la ciudad.', 'Calle Moral 114', '054-218798', 'https://placehold.co/600x400?text=Cafe+Valenzuela', '08:00', '21:00', -16.4063, -71.5368, 'Cercado', 'Café'],
  ['Cafeto', 'Café de especialidad con granos del Valle del Colca. Ambiente acogedor para trabajar o reunirse. Terraza con vista a los volcanes.', 'Av. Bolognesi 245', '054-287654', 'https://placehold.co/600x400?text=Cafeto', '07:30', '20:00', -16.3803, -71.5512, 'Cayma', 'Café'],
  ['El Turko', 'Cafetería con opciones de desayuno y almuerzo ligero. Muy popular entre estudiantes universitarios por su wifi rápido y precios cómodos.', 'Calle San Francisco 304', '054-219087', 'https://placehold.co/600x400?text=El+Turko', '07:00', '22:00', -16.4089, -71.5355, 'Cercado', 'Café'],
  ['Brunch & Co.', 'Moderna cafetería en Cerro Colorado especializada en brunch. Sus pancakes con manjar blanco arequipeño son un hit en redes sociales.', 'C.C. El Quinde, Local 45', '054-487321', 'https://placehold.co/600x400?text=Brunch+Co', '08:00', '18:00', -16.3701, -71.5567, 'Cerro Colorado', 'Café'],
];

const restaurantIds = {};
for (const [name, description, address, phone, image_url, opening_time, closing_time, lat, lng, districtName, categoryName] of restaurants) {
  const result = insertRestaurant.run(
    name, description, address, phone, image_url, opening_time, closing_time, lat, lng,
    districtRows[districtName], categoryRows[categoryName]
  );
  restaurantIds[name] = result.lastInsertRowid;
}

// ── 5. Platos ─────────────────────────────────────────────────────────────────
const insertDish = db.prepare(`
  INSERT INTO dishes (name, description, price, image_url, restaurant_id)
  VALUES (?, ?, ?, ?, ?)
`);

const dishes = [
  // La Nueva Palomino
  ['Rocoto Relleno', 'Rocoto arequipeño relleno de carne molida, cebolla, maní y pasas, gratinado con queso y acompañado de pastel de papa', 28, 'https://placehold.co/600x400?text=Rocoto+Relleno', 'La Nueva Palomino'],
  ['Chupe de Camarones', 'Chowder cremoso elaborado con camarones del río Chili, papas, leche evaporada, queso fresco, ají colorado y huevo pochado', 52, 'https://placehold.co/600x400?text=Chupe+Camarones', 'La Nueva Palomino'],
  ['Adobo Arequipeño', 'Cerdo marinado en chicha de jora, ají panca, vinagre y especias. Se sirve en caldo con pan de tres puntas', 32, 'https://placehold.co/600x400?text=Adobo', 'La Nueva Palomino'],

  // Sol de Mayo
  ['Ocopa Arequipeña', 'Papa cocida bañada en salsa de ají mirasol, queso fresco, maní tostado, huacatay y galletas. Servida fría.', 22, 'https://placehold.co/600x400?text=Ocopa', 'Sol de Mayo'],
  ['Solterito de Queso', 'Ensalada de habas, choclo, queso fresco arequipeño, aceitunas negras, rocoto y hierbabuena', 18, 'https://placehold.co/600x400?text=Solterito', 'Sol de Mayo'],
  ['Chicharrón de Cerdo', 'Costillas y pierna de cerdo fritas en su propia grasa hasta quedar crocantes. Se sirve con mote, zarza y tamales verdes', 38, 'https://placehold.co/600x400?text=Chicharron', 'Sol de Mayo'],

  // La Capitana
  ['Adobo Dominguero', 'El clásico desayuno arequipeño: caldo de cerdo con ají panca, muy demandado los domingos desde las 7am', 28, 'https://placehold.co/600x400?text=Adobo+Dominguero', 'La Capitana'],
  ['Pastel de Papa', 'Capas de papa cocida con queso derretido y salsa de ají amarillo. Acompañamiento clásico del rocoto relleno.', 15, 'https://placehold.co/600x400?text=Pastel+de+Papa', 'La Capitana'],

  // El Rancho
  ['Cuy Chactado', 'Cuy aplastado y frito en aceite de oliva hasta quedar crocante. Acompañado de papas nativas y ensalada criolla', 45, 'https://placehold.co/600x400?text=Cuy+Chactado', 'El Rancho'],
  ['Espesado de Camarones', 'Sopa espesa con camarones del río Chili, maíz choclo molido, queso y hierbabuena. Plato de temporada.', 48, 'https://placehold.co/600x400?text=Espesado', 'El Rancho'],

  // La Lucila
  ['Timpusca', 'Caldo de cabeza de res con papas, habas, yuca y hierbabuena. Plato de reconfortante en los días fríos de Arequipa.', 25, 'https://placehold.co/600x400?text=Timpusca', 'La Lucila'],
  ['Soltero de Habas', 'Versión de la campiña con habas tiernas, queso mantecoso, aceitunas, tomate y ajíes frescos', 16, 'https://placehold.co/600x400?text=Soltero+Habas', 'La Lucila'],

  // Tradiciones Arequipeñas
  ['Adobo con Pan de Tres Puntas', 'El desayuno dominical por excelencia: caldillo de cerdo con chicha de jora y pan artesanal horneado a leña', 30, 'https://placehold.co/600x400?text=Adobo+Pan', 'Tradiciones Arequipeñas'],
  ['Queso Helado', 'Postre arequipeño helado a base de leche de coco, canela y menta. El sabor que todos recuerdan de Arequipa.', 8, 'https://placehold.co/600x400?text=Queso+Helado', 'Tradiciones Arequipeñas'],

  // El Muelle
  ['Ceviche Mixto', 'Corvina y mariscos frescos marinados en leche de tigre arequipeña con rocoto y ají limo. Servido con choclo y camote.', 42, 'https://placehold.co/600x400?text=Ceviche+Mixto', 'El Muelle'],
  ['Leche de Tigre', 'La esencia del ceviche servida como shots. Mezcla del jugo cítrico de la marinada con ají, rocoto y pulpito.', 18, 'https://placehold.co/600x400?text=Leche+de+Tigre', 'El Muelle'],
  ['Tiradito de Lenguado', 'Finas láminas de lenguado fresco con salsa de ají amarillo y un toque de jengibre y sésamo', 38, 'https://placehold.co/600x400?text=Tiradito', 'El Muelle'],

  // Mar y Tierra
  ['Tiradito con Salsa de Ocopa', 'Innovación arequipeña: tiradito de pejerrey bañado en salsa de ocopa con maní y huacatay', 35, 'https://placehold.co/600x400?text=Tiradito+Ocopa', 'Mar y Tierra'],
  ['Arroz con Mariscos', 'Arroz cremoso tipo risotto con camarones, almejas y pulpo. Versión fusión de la cocina arequipeña.', 40, 'https://placehold.co/600x400?text=Arroz+Mariscos', 'Mar y Tierra'],

  // La Cevichería del Puerto
  ['Ceviche de Camarones', 'Camarones del río Chili marinados en limón con rocoto, cebolla morada y hierbabuena. Sabor 100% arequipeño', 35, 'https://placehold.co/600x400?text=Ceviche+Camarones', 'La Cevichería del Puerto'],

  // Don Pollo
  ['Pollo a la Brasa (1/2)', 'Medio pollo a la brasa marinado en hierbas locales. Acompañado de papas fritas, ensalada y dos salsas.', 32, 'https://placehold.co/600x400?text=Pollo+Brasa', 'Don Pollo'],
  ['Pollo a la Brasa (1/4)', 'Cuarto de pollo a la brasa, ideal para comer solo. Incluye papas fritas y ensalada.', 18, 'https://placehold.co/600x400?text=Pollo+1_4', 'Don Pollo'],

  // El Brasero
  ['Pollo a la Brasa con Leña', 'Pollo entero asado a fuego lento con leña de eucalipto. El humo le da un sabor ahumado único.', 55, 'https://placehold.co/600x400?text=Pollo+Lena', 'El Brasero'],

  // Pollo Real
  ['Combo Familiar', 'Pollo entero, dos porciones de papas fritas, ensalada grande y cuatro gaseosas', 65, 'https://placehold.co/600x400?text=Combo+Familiar', 'Pollo Real'],

  // China House
  ['Arroz Chaufa Especial', 'Arroz saltado al wok con pollo, chancho, mariscos, huevo y verduras. El chaufa de casa, con receta familiar de 40 años', 28, 'https://placehold.co/600x400?text=Chaufa', 'China House'],
  ['Lomo Saltado Chifa', 'Versión chifa del clásico lomo saltado: tiras de res con pimientos, tomate y sillao, sobre arroz blanco', 32, 'https://placehold.co/600x400?text=Lomo+Saltado', 'China House'],
  ['Dim Sum (6 piezas)', 'Seis dumplings de camarón y cerdo al vapor. Los domingos se sirven en carrito tradicional.', 22, 'https://placehold.co/600x400?text=Dim+Sum', 'China House'],

  // Dragón de Oro
  ['Chaufa con Quinua', 'Fusión arequipeña: arroz chaufa con quinua blanca del altiplano, incorporando sabores andinos al wok', 30, 'https://placehold.co/600x400?text=Chaufa+Quinua', 'Dragón de Oro'],

  // Pizzería Quattro
  ['Pizza de Queso Cayma', 'Pizza artesanal con queso fresco de Cayma, tomates cherry, albahaca y aceite de oliva. Masa madre de 48 horas.', 38, 'https://placehold.co/600x400?text=Pizza+Queso', 'Pizzería Quattro'],
  ['Pizza Arequipeña', 'Base de tomate con queso, salchicha huachana, rocoto confitado y aceitunas de Yauca', 42, 'https://placehold.co/600x400?text=Pizza+Arequipena', 'Pizzería Quattro'],

  // La Piazza
  ['Pizza Margarita', 'La clásica italiana con salsa de tomate, mozzarella y albahaca fresca. Simple y perfecta.', 32, 'https://placehold.co/600x400?text=Margarita', 'La Piazza'],
  ['Pasta al Rocoto', 'Fusión italo-arequipeña: pasta fresca con salsa de rocoto, crema de leche y queso parmesano.', 28, 'https://placehold.co/600x400?text=Pasta+Rocoto', 'La Piazza'],

  // Café Valenzuela
  ['Teja Arequipeña', 'El dulce más famoso de Arequipa: nuez o pecana bañada en manjar blanco y cubierta con fondant. Desde 1914.', 6, 'https://placehold.co/600x400?text=Teja', 'Café Valenzuela'],
  ['Queso Helado Artesanal', 'El postre arequipeño por excelencia, elaborado con leche de coco y canela desde la receta original de 1914.', 8, 'https://placehold.co/600x400?text=Queso+Helado+Artesanal', 'Café Valenzuela'],
  ['Café Pasado con Leche', 'Café de altura preparado por goteo lento y servido con leche caliente y un trozo de bizcochuelo casero', 12, 'https://placehold.co/600x400?text=Cafe+Pasado', 'Café Valenzuela'],

  // Cafeto
  ['Cappuccino de Colca', 'Cappuccino elaborado con café de altura del Valle del Colca, con crema de leche arequipeña y canela', 14, 'https://placehold.co/600x400?text=Cappuccino+Colca', 'Cafeto'],
  ['Tostada con Palta', 'Pan artesanal de masa madre con palta de Camaná, huevo poche y sal de maras', 18, 'https://placehold.co/600x400?text=Tostada+Palta', 'Cafeto'],

  // El Turko
  ['Desayuno Universitario', 'Café con leche, jugo de naranja, dos tostadas con mantequilla y mermelada de fresa', 15, 'https://placehold.co/600x400?text=Desayuno', 'El Turko'],

  // Brunch & Co.
  ['Pancakes con Manjar', 'Torre de tres pancakes esponjosos cubiertos con manjar blanco arequipeño, fresas y helado de vainilla', 22, 'https://placehold.co/600x400?text=Pancakes', 'Brunch & Co.'],
  ['Huevos Benedictinos', 'Huevos pochados sobre pan inglés tostado con jamón serrano y salsa holandesa. Brunch de autor.', 28, 'https://placehold.co/600x400?text=Huevos+Benedict', 'Brunch & Co.'],
];

for (const [name, description, price, image_url, restaurantName] of dishes) {
  insertDish.run(name, description, price, image_url, restaurantIds[restaurantName]);
}

// ── Resumen ───────────────────────────────────────────────────────────────────
console.log('\n✅ Seed completado:');
console.log(`   1 usuario admin (admin@gastro.com / admin1234)`);
console.log(`   ${districts.length} distritos de Arequipa`);
console.log(`   ${categories.length} categorías`);
console.log(`   ${restaurants.length} restaurantes`);
console.log(`   ${dishes.length} platos\n`);
