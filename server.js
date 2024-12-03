const express = require('express');
const mysql = require('mysql2');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const app = express();

// Configuración de Express
app.set('view engine', 'ejs');
app.set('views', __dirname); // Directorio raíz para vistas
app.use(express.static(__dirname)); // Archivos estáticos
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
    console.log('Conexión establecida con la base de datos');
});

// Configuración del puerto serie
const port = new SerialPort({
    path: 'COM8',  // Asegúrate de que este sea el puerto correcto para tu Arduino
    baudRate: 9600
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Cuando se recibe un mensaje desde Arduino (el valor del contador)
parser.on('data', (data) => {
    console.log(`Datos recibidos: ${data}`);

    // Verificar si el mensaje recibido es "¡Objeto detectado!"
    if (data === "¡Objeto detectado!") {
        // Obtener el último valor del contador desde la base de datos
        db.query('SELECT contador FROM Data ORDER BY id DESC LIMIT 1', (err, results) => {
            if (err) {
                console.error('Error al obtener el último contador:', err);
                return;
            }

            // Si no hay registros, comenzamos con 0
            let nuevoContador = 0;
            if (results.length > 0) {
                nuevoContador = results[0].contador;
            }

            // Incrementar el contador en 1
            nuevoContador += 1;

            // Determinar el estado y la acción a realizar
            let estado = 'No Lleno';
            if (nuevoContador >= 4) {
                estado = 'Bote Lleno';
            }

            // Insertar el nuevo valor del contador en la base de datos
            db.query('INSERT INTO Data (contador, estado) VALUES (?, ?)', [nuevoContador, estado], (err) => {
                if (err) {
                    console.error('Error al insertar en la base de datos:', err);
                } else {
                    console.log(`Contador actualizado en la base de datos: ${nuevoContador}`);
                }
            });

            // Si el contador alcanza 5, limpiar la base de datos y reiniciar el contador
            if (nuevoContador >= 5) {
                db.query('DELETE FROM Data', (err) => {
                    if (err) {
                        console.error('Error al limpiar la base de datos:', err);
                    } else {
                        console.log('Base de datos limpiada y contador reiniciado');
                        // Reiniciar el contador
                        db.query('INSERT INTO Data (contador, estado) VALUES (?, ?)', [0, 'No Lleno'], (err) => {
                            if (err) {
                                console.error('Error al reiniciar el contador:', err);
                            } else {
                                console.log('Contador reiniciado a 0');
                            }
                        });
                    }
                });
            }
        });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    db.query('SELECT * FROM Data ORDER BY id DESC LIMIT 1', (err, results) => {
        if (err) {
            console.error('Error al obtener los datos:', err);
            return res.sendStatus(500);
        }

        const ultimoRegistro = results[0] || { contador: 0, estado: 'No Lleno' };

        res.render('index', {
            aperturasActuales: ultimoRegistro.contador,
            estadoBote: ultimoRegistro.estado
        });
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
