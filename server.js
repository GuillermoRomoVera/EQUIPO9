const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 8083;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Carpeta para frontend

// Configuración de MySQL
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "tu_password",
    database: "bote_inteligente",
};

// Función para conectar a la base de datos
async function connectDB() {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
}

// Función para calcular el estado basado en el número de aperturas
function calcularEstado(apertura) {
    if (apertura === 1) return "vacio";
    if (apertura === 2) return "medio";
    if (apertura === 3) return "critico";
    if (apertura >= 4) return "lleno";  // Lleno, no se puede seguir registrando
}

// Endpoints del CRUD
app.get("/aperturas", async (req, res) => {
    try {
        const connection = await connectDB();
        const [rows] = await connection.query("SELECT * FROM aperturas ORDER BY id DESC");

        // Verificar si el último estado es "lleno"
        const ultimoEstado = rows.length > 0 ? rows[0].estado : "vacio";  // Si no hay aperturas, se asume que está vacio

        if (ultimoEstado === "lleno") {
            res.json({ message: "El bote está lleno. No se pueden registrar más aperturas." });
        } else {
            res.json({ aperturas: rows });
        }

        await connection.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/aperturas", async (req, res) => {
    try {
        const connection = await connectDB();
        const [lastRow] = await connection.query("SELECT apertura FROM aperturas ORDER BY id DESC LIMIT 1");

        let apertura = lastRow.length > 0 ? lastRow[0].apertura + 1 : 1; // Incrementar apertura
        let estado = calcularEstado(apertura);

        // Si el estado es "lleno", no permitir más aperturas
        if (estado === "lleno") {
            return res.status(400).json({ error: "El bote ya está lleno. No se pueden registrar más aperturas." });
        }

        const query = "INSERT INTO aperturas (apertura, estado) VALUES (?, ?)";
        const [result] = await connection.execute(query, [apertura, estado]);

        res.json({ id: result.insertId, apertura, estado });

        await connection.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/aperturas/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await connectDB();
        const query = "DELETE FROM aperturas WHERE id = ?";
        const [result] = await connection.execute(query, [id]);

        if (result.affectedRows === 0) {
            res.status(404).json({ error: "No se encontró el registro" });
        } else {
            res.json({ id });
        }

        await connection.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
