const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { attachUserToViews} = require('./middleware/authMiddleware');





// Routes
const authRoutes = require('./routes/authRoutes'); // Trasa dla rejestracji/logowania
const userRoutes = require('./routes/userRoutes');
const animRoutes = require('./routes/animRoutes');

// Initialize express server
const app = express();

// Konfiguracja EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware do obsługi plików statycznych
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.use(express.json({ limit: '10mb' })); // Zwiększenie limitu dla JSON
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Zwiększenie limitu dla danych URL-encoded


// Middleware ustawiające zmienne globalne dla EJS
app.use((req, res, next) => {
    res.locals.bootstrapCSS = 'bootstrap/dist/css/bootstrap.min.css';
    res.locals.jquery = 'jquery/dist/jquery.min.js';
    res.locals.bootstrapJS = 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Zmiana na bootstrap.bundle, który zawiera Popper.js
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachUserToViews);

// Routes for apps
app.use('/auth', authRoutes); // Obsługa logowania i rejestracji
app.use('/users', userRoutes); // Obsługa użytkowników
app.use('/anim', animRoutes);


// Main route
app.get('/', (req, res) => {
    res.render('layout', { title: 'Strona Główna', body: 'pages/main' });
});

app.get('/about', (req, res) => {
    res.render('layout', { title: 'Opis', body: 'pages/about' });
})



// Uruchomienie serwera
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
