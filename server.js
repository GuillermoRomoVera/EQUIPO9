const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost', // change to your database host
    user: 'root', // change to your database user
    password: '', // change to your database password
    database: 'bote_db' // change to your database name
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

// Serve static files like CSS and JS
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
    const query = 'SELECT * FROM historial ORDER BY fecha DESC LIMIT 2'; // Example query to fetch last 2 entries
    db.query(query, (err, result) => {
        if (err) throw err;
        // Pass dynamic data to the template
        res.render('index', {
            aperturasActuales: 5, // Static value or could be dynamically fetched
            estadoBote: 'No Lleno', // Static value or could be dynamically fetched
            historial: result
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
