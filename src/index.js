// Fichero src/index.js

// Importamos los dos módulos de NPM necesarios para trabajar
const express = require('express');
const cors = require('cors');
const { uuid } = require('uuidv4');
const Database = require('better-sqlite3');

// Creamos el servidor
const server = express();

// Configuramos el servidor
server.use(cors());
server.use(express.json({ limit: '25mb' }));
server.set('view engine', 'ejs');

const db = new Database('./src/db/cards.db', {
  verbose: console.log,
});

console.log(process.env);

// Arrancamos el servidor en el puerto 3000
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

const savedCards = [];

//Crear un endpoint para crear la tarjeta en el servidor
server.post('/card', (req, res) => {
  console.log(req.body);
  //Comprobar la información
  if (req.body.palette === '' || req.body.name === '') {
    const responseError = {
      error: 'Faltan datos',
      success: false,
    };
    res.json(responseError);
  } else {
    //Si todo correcto: creo la tarjeta yy envío una respuesta
    const newCard = req.body;

    // TODO: guardarla en bases de datos

    const insertStmt = db.prepare(
      'INSERT INTO card (palette, name, email, image, phone, linkedin, github, job) VALUES (?,?,?,?,?,?,?,?)   '
    );

    const result = insertStmt.run(
      newCard.palette,
      newCard.name,
      newCard.email,
      newCard.photo,
      newCard.phone,
      newCard.linkedin,
      newCard.github,
      newCard.job
    );

    console.log(result);

    //respuesta si todo va bien
    const responseSuccess = {
      cardURL: `http://localhost:4000/card/${result.lastInsertRowid}`, //
      success: true,
    };
    res.json(responseSuccess);
  }
});

//Endpoint: devuelve la tarjeta creada
server.get('/card/:id', (req, res) => {
  //pintar la tarjeta
  const id = req.params.id;
  console.log(id);
  //encontrar la info de la tarjeta: buscar una tarjeta dado un id en la bases datos
  const query = db.prepare('SELECT * FROM card WHERE id = ?');
  const userCard = query.get(req.params.id);
  console.log(userCard);
  res.render('card', userCard);
});

//Servidor estáticos
const staticServerPath = './src/public-react';
server.use(express.static(staticServerPath));

const staticServerCSSPath = './src/public-css';
server.use(express.static(staticServerCSSPath));
