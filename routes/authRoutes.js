const express = require('express');
const { login, logout, me } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const db = require("../config/database");



const router = express.Router();

router.get('/login', (req, res) => {
    res.render('layout', { title: 'Login', body: 'pages/login', error: null });
});
router.get('/register', (req, res) => {
    res.render('layout', { title: 'Register', body: 'pages/register', error: null });
});

router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return handleLogout(res, 'Brak refresh tokena.');
    }

    const query = 'SELECT * FROM refresh_tokens WHERE token = ?';
    db.get(query, [refreshToken], (err, dbToken) => {
        if (err) {
            console.error('Błąd zapytania do bazy danych:', err);
            return res.status(500).json({ message: 'Błąd serwera.' });
        }

        if (!dbToken) {
            return handleLogout(res, 'Refresh token nie istnieje w bazie.');
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) {
                return handleLogout(res, 'Nieprawidłowy refresh token.');
            }

            const newAccessToken = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION }
            );

            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                sameSite: 'lax',
            });

            return res.status(200).json({ accessToken: newAccessToken });
        });
    });
});

function handleLogout(res, message) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    console.error(message);
    return res.status(204).end(); // Wyloguj użytkownika
}


router.get('/me', me)

router.post('/login', login);

router.delete('/logout', logout);


module.exports = router;
