const jwt = require('jsonwebtoken');
const db = require("../config/database");
require('dotenv').config();

exports.authenticateToken = async (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return tryRefreshToken(req, res, next);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err && err.name === 'TokenExpiredError') {
            return tryRefreshToken(req, res, next);
        } else if (err) {
            return handleLogout(res, 'Nieprawidłowy token.');
        }

        req.user = user;
        next();
    });
};


function tryRefreshToken(req, res, next) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return handleLogout(res, 'Brak refresh tokena.');
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

        req.user = user;
        next();
    });
}

function handleLogout(res, message) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    console.error(message);
    return res.status(204).end(); // Wyloguj użytkownika
}






exports.attachUserToViews = async (req, res, next) => {
    const token = req.cookies.accessToken; // Pobierz access token z ciasteczka
    if (!token) {
        res.locals.user = null;
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            res.locals.user = null; // Token nieważny lub wygasły
        } else {
            res.locals.user = user; // Przekaż dane użytkownika do widoków
        }
        next();
    });
}



