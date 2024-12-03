const express = require('express');
const mysql = require('mysql2');
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

// Límite de aperturas
const LIMITE_APERTURAS = 5;

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

// Ruta para incrementar el contador
app.post('/incrementar', (req, res) => {
    db.query('SELECT * FROM Data ORDER BY id DESC LIMIT 1', (err, results) => {
        if (err) {
            console.error('Error al obtener el estado:', err);
            return res.sendStatus(500);
        }

        let nuevoContador = 1;
        let estado = 'No Lleno';

        // Si hay un registro previo
        if (results.length > 0) {
            nuevoContador = results[0].contador + 1;

            // Cuando el contador sea 4 o 5, el estado será "Lleno"
            if (nuevoContador === 4 || nuevoContador === 5) {
                estado = 'Lleno';
                
                // Insertar el estado 'Lleno' cuando se llegue a 4 o 5
                db.query('INSERT INTO Data (contador, estado) VALUES (?, ?)', [nuevoContador, estado], (err) => {
                    if (err) {
                        console.error('Error al insertar estado lleno:', err);
                        return res.sendStatus(500);
                    }

                    // Si el contador llega a 5, reiniciamos
                    if (nuevoContador === 5) {
                        db.query('DELETE FROM Data', (err) => {
                            if (err) {
                                console.error('Error al borrar registros:', err);
                                return res.sendStatus(500);
                            }

                            // Insertamos un nuevo registro con contador 0 y estado 'No Lleno'
                            db.query('INSERT INTO Data (contador, estado) VALUES (?, ?)', [0, 'No Lleno'], (err) => {
                                if (err) {
                                    console.error('Error al reiniciar el contador:', err);
                                    return res.sendStatus(500);
                                }

                                res.redirect('/');
                            });
                        });
                    } else {
                        res.redirect('/');
                    }
                });
                return; // Detener la ejecución para evitar la inserción del mismo registro otra vez
            }
        }

        // Si no llega a 4 o 5, insertamos normalmente
        db.query('INSERT INTO Data (contador, estado) VALUES (?, ?)', [nuevoContador, estado], (err) => {
            if (err) {
                console.error('Error al insertar en la base de datos:', err);
                return res.sendStatus(500);
            }
            res.redirect('/');
        });
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
