const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const req = require("express/lib/request");




exports.login = (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM main.users WHERE username = ?';
    db.get(query, [username], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Niepoprawne hasło' });
        }

        const accessToken = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        const refreshToken = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
        );

        const replaceQuery = 'REPLACE INTO refresh_tokens (token, user_id) VALUES (?, ?)';
        db.run(replaceQuery, [refreshToken, user.id], (err) => {
            if (err) {
                console.error('Error replacing refresh token:', err.message);
                return res.status(500).json({ message: 'Server error' });
            }

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                sameSite: 'lax',
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'lax',
            });

            res.redirect('/');
        });
    });
};

exports.logout = (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token provided' });
    }

    const deleteQuery = 'DELETE FROM refresh_tokens WHERE token = ?';
    db.run(deleteQuery, [refreshToken], (err) => {
        if (err) {
            console.error('Error deleting refresh token:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }

        // Wyczyść oba ciasteczka
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
    });
};


exports.me = (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: 'Brak tokena' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ accessToken: token, user });
    } catch (err) {
        return res.status(403).json({ message: 'Token nieważny' });
    }
};






