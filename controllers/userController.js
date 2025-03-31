const bcrypt = require("bcryptjs");
const db = require("../config/database");

exports.registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO main.users (username, password) VALUES (?, ?)';
        db.run(query, [username, hashedPassword], function (err) {
            if (err) {
                console.error(err.message);
                return res.status(400).json({ message: 'Nazwa użytkownika jest już zajęta.' });
            }
            res.status(201).json({ message: 'Rejestracja zakończona pomyślnie!' });
        });
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ message: 'Wystąpił błąd serwera. Spróbuj ponownie później.' });
    }
};

exports.getUserInfo = async (req, res) => {
    const { id, username } = req.user;

    res.render('layout', {
        title: 'Profil użytkownika',
        body: 'pages/profile',
        username: username,
    });
};

exports.changePassword = async (req, res) => {
    const userId  = req.user.id;
    const { oldPassword, newPassword } = req.body;



    const query = 'SELECT password FROM main.users WHERE id = ?';
    db.get(query, [userId], async (err, user) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Błąd serwera.' });
        }

        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
        }

        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Nieprawidłowe stare hasło.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateQuery = 'UPDATE main.users SET password = ? WHERE id = ?';
        db.run(updateQuery, [hashedPassword, userId], (err) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ message: 'Błąd podczas aktualizacji hasła.' });
            }

            res.status(200).json({ message: 'Hasło zostało zmienione.' });
        });
    });
};


