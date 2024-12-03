const express = require('express');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Configuración de la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para obtener el estado del bote de basura
app.get('/api/trashcans/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM trashcans WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).send('Error al consultar el estado del bote');
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Bote no encontrado');
    }
  });
});

// Ruta para actualizar la cantidad de aperturas del bote
app.post('/api/trashcans/:id/open', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM trashcans WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).send('Error al consultar el estado del bote');
    }

    const trashcan = results[0];
    if (trashcan.status === 'full') {
      return res.status(400).send('El bote está lleno, no se puede seguir llenando');
    }

    const newOpenCount = trashcan.open_count + 1;
    const status = newOpenCount >= trashcan.limit ? 'full' : 'available';

    db.query('UPDATE trashcans SET open_count = ?, status = ? WHERE id = ?', [newOpenCount, status, id], (err) => {
      if (err) {
        return res.status(500).send('Error al actualizar el estado del bote');
      }
      res.json({ message: 'Bote actualizado', status, open_count: newOpenCount });
    });
  });
});

// Ruta para inicializar un bote de basura
app.post('/api/trashcans', (req, res) => {
  const { trashcan_number, limit } = req.body;

  db.query('INSERT INTO trashcans (trashcan_number, limit) VALUES (?, ?)', [trashcan_number, limit], (err) => {
    if (err) {
      return res.status(500).send('Error al crear el bote');
    }
    res.status(201).send('Bote creado');
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
