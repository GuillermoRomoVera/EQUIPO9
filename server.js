const express = require('express');
const path = require('path');
const app = express();

// Configuración de Express
app.set('view engine', 'ejs');
app.set('views', __dirname);  // Usar el directorio raíz para las vistas
app.use(express.static(__dirname));  // Usar el directorio raíz para archivos estáticos
app.use(express.urlencoded({ extended: true }));

// Variables en memoria
let aperturas = 0;
const LIMITE_APERTURAS = 5; // Limite de aperturas para que el bote se considere lleno

// Ruta para mostrar la página y el estado del bote
app.get('/', (req, res) => {
    const estado = aperturas >= LIMITE_APERTURAS ? 'Lleno' : 'No Lleno';
    res.render('index', {
        aperturasActuales: aperturas,
        estadoBote: estado,
    });
});

// Ruta para incrementar el contador de aperturas
app.post('/incrementar', (req, res) => {
    aperturas++; // Incrementamos el contador
    res.redirect('/'); // Redirigimos para mostrar el nuevo estado
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
