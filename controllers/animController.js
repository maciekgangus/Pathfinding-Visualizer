const db = require('../config/database');
const zlib = require('zlib');

function compressData(data) {
    const jsonData = JSON.stringify(data);
    const compressed = zlib.deflateSync(jsonData);
    return compressed.toString('base64');
}

function decompressData(compressedData) {
    const buffer = Buffer.from(compressedData, 'base64');
    const decompressed = zlib.inflateSync(buffer);
    return JSON.parse(decompressed.toString());
}

exports.saveMaze = async (req, res) => {
    const { name, gridSize, maze, color } = req.body;
    const userId = req.user.id; // Zakładam, że identyfikator użytkownika jest dostępny w `req.user`
    const compressedMaze = compressData(maze); // Kompresuj dane
    console.log(compressedMaze.length);
    if (!name || !gridSize || !maze) {
        return res.status(400).json({ error: 'Wszystkie pola są wymagane.' });
    }

    try {
        const query = `
            INSERT INTO mazes (name, user_id, grid_size, maze, color)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.run(query, [name, userId, gridSize, compressedMaze, color]);

        res.status(201).json({ message: 'Labirynt zapisany pomyślnie.' });
    } catch (error) {
        console.error('Błąd podczas zapisywania labiryntu:', error);
        res.status(500).json({ error: 'Nie udało się zapisać labiryntu.' });
    }
};

exports.loadMazes = async (req, res) => {
    const {id} = req.user;

        const query = `SELECT id, name, created_at FROM mazes WHERE user_id = ? ORDER BY created_at DESC`;
        db.all(query,[id] ,async (err, rows) => {
            if (err) {
                console.error('Błąd pobierania labiryntów:', err);
                res.status(500).json({ message: 'Nie udało się pobrać labiryntów.' });
                return;
            }
            console.log(rows);
            res.status(200).json(rows);
        })


}

exports.getMazeById = async (req, res) => {
    const { id } = req.params;

    const query = `SELECT * FROM mazes WHERE id = ?`;
    db.get(query,[id] ,async (err, row) => {
        if (err) {
            console.error('Błąd pobierania labiryntu:', err);
            res.status(500).json({ message: 'Nie udało się pobrać labiryntu.' });
            return;
        }
        if(!row)
        {
            res.status(404).json({ message: 'Labirynt nie został znaleziony.' });
            return;
        }
        const decompressedMaze = decompressData(row.maze);
        console.log(row.grid_size);
        res.status(200).json({
            name: row.name,
            gridSize: row.grid_size,
            maze: decompressedMaze,
            color: row.color
        });
    })
};

exports.deleteMaze = async (req, res) => {
    const mazeId = req.params.id;


    db.run('DELETE FROM mazes WHERE id = ?', [mazeId], async function (err) {
        if (err) {
            console.error('Błąd usuwania labiryntu:', err);
            res.status(500).json({ message: 'Nie udało się usunac labiryntu.' });
            return;
        }
        if (this.changes > 0) {
            res.status(200).json({ message: 'Labirynt został usunięty.' });
        } else {
            res.status(404).json({ message: 'Labirynt nie został znaleziony.' });
        }

    })
};


