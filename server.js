const express = require('express');
const path = require('path');
const mysql = require('mysql2'); // Importar mysql2
const app = express();

// Configuración de Express
app.set('view engine', 'ejs');
app.set('views', __dirname);  // Usar el directorio raíz para las vistas
app.use(express.static(__dirname));  // Usar el directorio raíz para archivos estáticos
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'autorack.proxy.rlwy.net',
    user: 'root',
    password: 'gdyeJxAyIROKBOyACzomwnshJbkTsmUH',
    database: 'railway',
    port: 36293
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

// Variables en memoria (no es necesario, se manejará todo desde la base de datos)
let aperturas = 0;
const LIMITE_APERTURAS = 5; // Limite de aperturas para que el bote se considere lleno

// Ruta para mostrar la página y el estado del bote
app.get('/', (req, res) => {
    db.query('SELECT * FROM Data ORDER BY id DESC LIMIT 1', (err, results) => {
        if (err) {
            console.error('Error al obtener el estado:', err);
            return res.sendStatus(500);
        }

        const estado = results.length > 0 ? results[0].estado : 'No Lleno';
        const aperturasActuales = results.length > 0 ? results[0].contador : 0;

        res.render('index', {
            aperturasActuales: aperturasActuales,
            estadoBote: estado,
        });
    });
});

// Ruta para incrementar el contador de aperturas
app.post('/incrementar', (req, res) => {
    db.query('SELECT * FROM Data ORDER BY id DESC LIMIT 1', (err, results) => {
        if (err) {
            console.error('Error al obtener el estado:', err);
            return res.sendStatus(500);
        }

        let nuevoContador = 1; // Comenzamos con 1 si no hay registros previos
        let estado = 'No Lleno';

        if (results.length > 0) {
            nuevoContador = results[0].contador + 1;
            if (nuevoContador >= LIMITE_APERTURAS) {
                estado = 'Lleno';
            }
        }

        // Insertamos el nuevo valor en la base de datos
        db.query('INSERT INTO Data (contador, estado) VALUES (?, ?)', [nuevoContador, estado], (err) => {
            if (err) {
                console.error('Error al insertar en la base de datos:', err);
                return res.sendStatus(500);
            }

            res.redirect('/'); // Redirigimos para mostrar el nuevo estado
        });
    });
});

// Iniciar el servidors
const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
