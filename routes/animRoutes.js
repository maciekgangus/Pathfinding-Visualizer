const express = require('express');
const {authenticateToken} = require("../middleware/authMiddleware");
const {saveMaze, loadMazes, getMazeById, deleteMaze} = require("../controllers/animController");



const router = express.Router();

router.get('/animation', (req, res) => {
    res.render('layout', { title: 'Animation', body: 'pages/animation', error: null });
})

router.post('/save-maze', authenticateToken, saveMaze);

router.get('/mazes', authenticateToken, loadMazes);

router.get('/mazes/:id', authenticateToken, getMazeById);

router.delete('/mazes/:id', authenticateToken, deleteMaze);

module.exports = router;