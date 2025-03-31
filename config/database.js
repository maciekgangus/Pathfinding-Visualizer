const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
    if (err) console.error('Error connecting to database:', err.message);
    else console.log('Connected to SQLite database');
});


module.exports = db;
