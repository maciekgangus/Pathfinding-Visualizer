$(document).ready(function () {
    const canvas = $('#mazeCanvas')[0];
    const ctx = canvas.getContext('2d');

    let grid = [];
    let cellSize = 0;
    const lineWidth = 1;
    let gridSize = getSelectedGridSize();
    let wallColor = '#000000';
    let isGenerating = false;
    let isCancelled = false;


    // Funkcja obsługująca zmianę koloru ścian
    $('#wallColor').on('change', function () {
        wallColor = $(this).val();
        drawMaze(grid, cellSize, ctx, lineWidth);
    });

    function initializeCanvas() {

        const containerRect = canvas.getBoundingClientRect();


        const size = Math.min(containerRect.width, containerRect.height);
        canvas.width = size;
        canvas.height = size;

        gridSize = getSelectedGridSize();

        cellSize = (size - (lineWidth * (gridSize - 1))) / gridSize;


        isGenerating = false;


        grid = createGrid(gridSize, 'path');


        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'start' || cell.type === 'end') {
                cell.type = 'path';
            }
        }));

        drawGrid(ctx, gridSize, cellSize, lineWidth);
        drawMaze(grid, cellSize, ctx, lineWidth);
    }



    function createGrid(gridSize, initialType = 'wall') {
        const grid = [];
        for (let y = 0; y < gridSize; y++) {
            const row = [];
            for (let x = 0; x < gridSize; x++) {
                row.push({
                    x: x,
                    y: y,
                    type: initialType,
                });
            }
            grid.push(row);
        }
        return grid;
    }

    function drawGrid(ctx, gridSize, cellSize, lineWidth) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = lineWidth;

        for (let i = 0; i <= gridSize; i++) {
            const pos = i * (cellSize + lineWidth) - (lineWidth / 2);


            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, canvas.height);
            ctx.stroke();


            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(canvas.width, pos);
            ctx.stroke();
        }
    }

    function addRandomOpenings(grid, gridSize, probability) {
        for (let y = 1; y < gridSize - 1; y++) {
            for (let x = 1; x < gridSize - 1; x++) {
                if (grid[y][x].type === 'wall') {

                    if (Math.random() < probability) {

                        const neighbors = [
                            { dx: 0, dy: -1 }, // Góra
                            { dx: 0, dy: 1 },  // Dół
                            { dx: -1, dy: 0 }, // Lewo
                            { dx: 1, dy: 0 },  // Prawo
                        ];

                        let openCount = 0;
                        let wallCount = 0;

                        for (const { dx, dy } of neighbors) {
                            const nx = x + dx;
                            const ny = y + dy;

                            if (grid[ny][nx].type === 'path') {
                                openCount++;
                            } else if (grid[ny][nx].type === 'wall') {
                                wallCount++;
                            }
                        }

                        if (openCount > 0 && wallCount < 4) {
                            grid[y][x].type = 'path';
                        }
                    }
                }
            }
        }
    }

    async function generateMazeDFS() {
        if (isGenerating) {
            console.warn('Algorytm już działa, zatrzymywanie poprzedniego.');
            isGenerating = false;
            await sleep(50);
        }

        isGenerating = true;
        disableButtons();
        grid = createGrid(gridSize, 'wall');
        drawMaze(grid, cellSize, ctx, lineWidth);

        let stack = [];
        const directions = [
            { x: 0, y: -1 }, // Góra
            { x: 1, y: 0 },  // Prawo
            { x: 0, y: 1 },  // Dół
            { x: -1, y: 0 }, // Lewo
        ];

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }


        const edge = Math.floor(Math.random() * 4);
        let startX, startY;

        switch (edge) {
            case 0:
                startX = Math.floor(Math.random() * (gridSize - 2)) + 1;
                startY = 1;
                break;
            case 1:
                startX = Math.floor(Math.random() * (gridSize - 2)) + 1;
                startY = gridSize - 2;
                break;
            case 2:
                startX = 1;
                startY = Math.floor(Math.random() * (gridSize - 2)) + 1;
                break;
            case 3:
                startX = gridSize - 2;
                startY = Math.floor(Math.random() * (gridSize - 2)) + 1;
                break;
        }

        grid[startY][startX].type = 'start';
        stack.push({ x: startX, y: startY });

        let lastVisited = { x: startX, y: startY }; // Śledzenie ostatniej komórki


        while (stack.length > 0 && isGenerating) {
            const current = stack[stack.length - 1];
            const { x, y } = current;


            shuffle(directions);

            let found = false;
            for (const direction of directions) {
                const nx = x + direction.x * 2;
                const ny = y + direction.y * 2;

                if (
                    nx > 0 &&
                    ny > 0 &&
                    nx < gridSize - 1 &&
                    ny < gridSize - 1 &&
                    grid[ny][nx].type === 'wall'
                ) {
                    const wallX = x + direction.x;
                    const wallY = y + direction.y;

                    grid[wallY][wallX].type = 'path';
                    grid[ny][nx].type = 'path';

                    stack.push({ x: nx, y: ny });
                    lastVisited = { x: nx, y: ny };


                    found = true;
                    break;
                }
            }

            if (!found) {
                stack.pop();
            }

            drawMaze(grid, cellSize, ctx, lineWidth);
            await sleep(1);
        }
        if(isGenerating){
            grid[lastVisited.y][lastVisited.x].type = 'end';
        }

        addRandomOpenings(grid, gridSize, 0.05); // Prawdopodobieństwo 10% na otwarcie ściany

        isGenerating = false;
        drawMaze(grid, cellSize, ctx, lineWidth);
        enableButtons();
    }


    function drawMaze(grid, cellSize, ctx, lineWidth) {
        drawGrid(ctx, gridSize, cellSize, lineWidth);

        grid.forEach(row => {
            row.forEach(cell => {
                if (cell.type === 'start') {
                    ctx.fillStyle = '#01fc00';
                } else if (cell.type === 'end') {
                    ctx.fillStyle = '#fd0000';
                } else if (cell.type === 'visited') {
                    ctx.fillStyle = '#0bc4d8';
                } else if (cell.type === 'alg-path') {
                    ctx.fillStyle = '#EFFF00';
                } else {
                    ctx.fillStyle = cell.type === 'wall' ? wallColor : 'white'; // Ściany i zwykłe ścieżki
                }

                const pixelX = cell.x * (cellSize + lineWidth);
                const pixelY = cell.y * (cellSize + lineWidth);
                ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
            });
        });
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    initializeCanvas();

    function updateStartPosition(newX, newY) {
        if (grid[newY][newX].type === 'wall') {
            console.warn('Nie można ustawić punktu startowego na ścianie.');
            return;
        }


        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'start') {
                cell.type = 'path';
            }
        }));

        grid[newY][newX].type = 'start';
    }

    function updateEndPosition(newX, newY) {

        if (grid[newY][newX].type === 'wall') {
            console.warn('Nie można ustawić punktu końcowego na ścianie.');
            return;
        }


        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'end') {
                cell.type = 'path';
            }
        }));

        grid[newY][newX].type = 'end';
    }

    async function runDijkstra() {
        if (isGenerating) {
            console.warn("Trwa generowanie, nie można uruchomić algorytmu.");
            return;
        }

        disableButtons();



        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'visited' || cell.type === 'alg-path') {
                cell.type = 'path';
            }
        }));
        drawMaze(grid, cellSize, ctx, lineWidth);

        // Znajdź punkty startowy i końcowy
        let start = null;
        let end = null;
        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'start') start = cell;
            if (cell.type === 'end') end = cell;
        }));

        if (!start || !end) {
            console.error("Punkt startowy lub końcowy nie został ustawiony.");
            return;
        }


        const distances = grid.map(row => row.map(() => Infinity));
        const visited = grid.map(row => row.map(() => false));
        const previous = grid.map(row => row.map(() => null));
        const priorityQueue = [{ x: start.x, y: start.y, dist: 0 }];

        distances[start.y][start.x] = 0;

        const directions = [
            { x: 0, y: -1 }, // Góra
            { x: 1, y: 0 },  // Prawo
            { x: 0, y: 1 },  // Dół
            { x: -1, y: 0 }, // Lewo
        ];

        while (priorityQueue.length > 0) {

            priorityQueue.sort((a, b) => a.dist - b.dist);
            const { x, y, dist } = priorityQueue.shift();

            if (visited[y][x]) continue;
            visited[y][x] = true;


            if (grid[y][x].type !== 'start' && grid[y][x].type !== 'end') {
                grid[y][x].type = 'visited';
                drawMaze(grid, cellSize, ctx, lineWidth);
                await sleep(10);
            }

            if (x === end.x && y === end.y) {
                console.log("Znaleziono ścieżkę!");
                break;
            }

            for (const { x: dx, y: dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (
                    nx >= 0 &&
                    ny >= 0 &&
                    nx < gridSize &&
                    ny < gridSize &&
                    !visited[ny][nx] &&
                    grid[ny][nx].type !== 'wall'
                ) {
                    const newDist = dist + 1;
                    if (newDist < distances[ny][nx]) {
                        distances[ny][nx] = newDist;
                        previous[ny][nx] = { x, y };
                        priorityQueue.push({ x: nx, y: ny, dist: newDist });
                    }
                }
            }
        }


        let current = previous[end.y][end.x];
        while (current) {
            const { x, y } = current;
            if (grid[y][x].type !== 'start') {
                grid[y][x].type = 'alg-path';
            }
            drawMaze(grid, cellSize, ctx, lineWidth);
            await sleep(30);
            current = previous[y][x];
        }
        enableButtons();
        console.log("Algorytm zakończony.");
    }

    async function runAStar() {
        if (isGenerating) {
            console.warn("Trwa generowanie, nie można uruchomić algorytmu.");
            return;
        }
        disableButtons();


        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'visited' || cell.type === 'alg-path') {
                cell.type = 'path';
            }
        }));

        drawMaze(grid, cellSize, ctx, lineWidth);


        let start = null;
        let end = null;
        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'start') start = cell;
            if (cell.type === 'end') end = cell;
        }));

        if (!start || !end) {
            console.error("Punkt startowy lub końcowy nie został ustawiony.");
            return;
        }


        const openSet = [{ x: start.x, y: start.y, f: 0, g: 0 }];
        const gScores = grid.map(row => row.map(() => Infinity));
        const fScores = grid.map(row => row.map(() => Infinity));
        const cameFrom = grid.map(row => row.map(() => null));

        gScores[start.y][start.x] = 0;
        fScores[start.y][start.x] = heuristic(start.x, start.y, end.x, end.y);

        const directions = [
            { x: 0, y: -1 }, // Góra
            { x: 1, y: 0 },  // Prawo
            { x: 0, y: 1 },  // Dół
            { x: -1, y: 0 }, // Lewo
        ];

        while (openSet.length > 0) {

            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();

            const { x, y } = current;


            if (x === end.x && y === end.y) {
                console.log("Ścieżka znaleziona!");
                break;
            }


            if (grid[y][x].type !== 'start' && grid[y][x].type !== 'end') {
                grid[y][x].type = 'visited';
            }

            for (const { x: dx, y: dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;


                if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize && grid[ny][nx].type !== 'wall') {
                    const tentativeGScore = gScores[y][x] + 1; // Koszt dojścia do sąsiada

                    if (tentativeGScore < gScores[ny][nx]) {

                        cameFrom[ny][nx] = { x, y };
                        gScores[ny][nx] = tentativeGScore;
                        fScores[ny][nx] = tentativeGScore + heuristic(nx, ny, end.x, end.y);


                        if (!openSet.some(node => node.x === nx && node.y === ny)) {
                            openSet.push({ x: nx, y: ny, f: fScores[ny][nx], g: gScores[ny][nx] });
                        }
                    }
                }
            }

            drawMaze(grid, cellSize, ctx, lineWidth);
            await sleep(10);
        }


        let current = cameFrom[end.y][end.x];
        while (current) {
            const { x, y } = current;
            if (grid[y][x].type !== 'start') {
                grid[y][x].type = 'alg-path';
            }
            drawMaze(grid, cellSize, ctx, lineWidth);
            await sleep(30);
            current = cameFrom[y][x];
        }
        enableButtons();
        console.log("Algorytm zakończony.");
    }

    function heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    async function runDFS() {
        if (isGenerating) {
            console.warn("Trwa generowanie, nie można uruchomić algorytmu.");
            return;
        }

        disableButtons();



        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'visited' || cell.type === 'alg-path') {
                cell.type = 'path';
            }
        }));

        drawMaze(grid, cellSize, ctx, lineWidth);


        let start = null;
        let end = null;
        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'start') start = cell;
            if (cell.type === 'end') end = cell;
        }));

        if (!start || !end) {
            console.error("Punkt startowy lub końcowy nie został ustawiony.");
            return;
        }

        const stack = [{ x: start.x, y: start.y }];
        const visited = grid.map(row => row.map(() => false));
        const previous = grid.map(row => row.map(() => null));

        while (stack.length > 0) {
            const current = stack.pop();
            const { x, y } = current;

            if (visited[y][x]) continue; // Jeśli już odwiedzono, pomiń

            visited[y][x] = true;


            if (grid[y][x].type !== 'start' && grid[y][x].type !== 'end') {
                grid[y][x].type = 'visited';
                drawMaze(grid, cellSize, ctx, lineWidth);
                await sleep(10);
            }

            if (x === end.x && y === end.y) {
                console.log("Znaleziono ścieżkę!");
                break;
            }


            const directions = [
                { x: 0, y: -1 }, // Góra
                { x: 1, y: 0 },  // Prawo
                { x: 0, y: 1 },  // Dół
                { x: -1, y: 0 }  // Lewo
            ];

            for (const { x: dx, y: dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize && !visited[ny][nx] && grid[ny][nx].type !== 'wall') {
                    stack.push({ x: nx, y: ny });
                    previous[ny][nx] = { x, y }; // Zapisz poprzednika
                }
            }
        }


        let current = previous[end.y][end.x];
        while (current) {
            const { x, y } = current;
            if (grid[y][x].type !== 'start') {
                grid[y][x].type = 'alg-path';
                drawMaze(grid, cellSize, ctx, lineWidth);
                await sleep(30);
            }
            current = previous[y][x];
        }
        enableButtons();
        console.log("Algorytm zakończony.");
    }

    async function runBFS() {
        if (isGenerating) {
            console.warn("Trwa generowanie, nie można uruchomić algorytmu.");
            return;
        }
        disableButtons();

        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'visited' || cell.type === 'alg-path') {
                cell.type = 'path';
            }
        }));

        drawMaze(grid, cellSize, ctx, lineWidth);

        let start = null;
        let end = null;
        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'start') start = cell;
            if (cell.type === 'end') end = cell;
        }));

        if (!start || !end) {
            console.error("Punkt startowy lub końcowy nie został ustawiony.");
            return;
        }

        const queue = [{ x: start.x, y: start.y }];
        const visited = grid.map(row => row.map(() => false));
        const previous = grid.map(row => row.map(() => null));

        visited[start.y][start.x] = true;

        while (queue.length > 0) {
            const current = queue.shift();
            const { x, y } = current;

            if (grid[y][x].type !== 'start' && grid[y][x].type !== 'end') {
                grid[y][x].type = 'visited';
                drawMaze(grid, cellSize, ctx, lineWidth);
                await sleep(10);
            }

            if (x === end.x && y === end.y) {
                console.log("Znaleziono ścieżkę!");
                break;
            }

            const directions = [
                { x: 0, y: -1 }, // Góra
                { x: 1, y: 0 },  // Prawo
                { x: 0, y: 1 },  // Dół
                { x: -1, y: 0 }  // Lewo
            ];

            for (const { x: dx, y: dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize && !visited[ny][nx] && grid[ny][nx].type !== 'wall') {
                    visited[ny][nx] = true;
                    previous[ny][nx] = { x, y }; // Zapisz poprzednika
                    queue.push({ x: nx, y: ny });
                }
            }
        }

        let current = previous[end.y][end.x];
        while (current) {
            const { x, y } = current;
            if (grid[y][x].type !== 'start') {
                grid[y][x].type = 'alg-path'; // Oznacz ścieżkę kolorem
                drawMaze(grid, cellSize, ctx, lineWidth);
                await sleep(30);
            }
            current = previous[y][x];
        }
        enableButtons()
        console.log("Algorytm zakończony.");
    }



    function getSelectedGridSize() {
        return parseInt($('input[name="gridSize"]:checked').val(), 10);
    }



    function adjustCanvasSize() {
        const containerRect = canvas.getBoundingClientRect();
        const newSize = Math.min(containerRect.width, containerRect.height);
        const newCellSize = (newSize - (lineWidth * (gridSize - 1))) / gridSize;

        canvas.width = newSize;
        canvas.height = newSize;
        cellSize = newCellSize;

        drawGrid(ctx, gridSize, cellSize, lineWidth);
        drawMaze(grid, cellSize, ctx, lineWidth); // Ponowne narysowanie istniejącego labiryntu
    }

    $(window).on('resize', function () {
        adjustCanvasSize(); // Dostosuj rozmiar canvasu i ponownie narysuj labirynt
    });




    $(canvas).on('mousedown', function (e) {
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;

        const gridX = Math.floor(mouseX / (cellSize + lineWidth));
        const gridY = Math.floor(mouseY / (cellSize + lineWidth));


        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
            if (e.button === 0) {
                updateStartPosition(gridX, gridY);
            } else if (e.button === 2) {
                updateEndPosition(gridX, gridY);
            }
            drawMaze(grid, cellSize, ctx, lineWidth);
        }
    });

    $(canvas).on('contextmenu', function (e) {
        e.preventDefault();
    });

    $('input[name="gridSize"]').on('change', function () {
        isGenerating = false;
        initializeCanvas();
    });

    $('#generateMazeBtn').on('click', function () {
        generateMazeDFS();

    });

    $('#runDijkstraBtn').on('click', function () {
        runDijkstra();
    });
    $('#runAStarBtn').on('click', function () {
        runAStar();
    });
    $('#runDFSBtn').on('click', function () {
        runDFS();
    });
    $('#runBFSBtn').on('click', function () {
        runBFS();
    });

    function resetAndStop() {
        isCancelled = true; //
        isGenerating = false; //


        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'visited' || cell.type === 'alg-path') {
                cell.type = 'path';
            }
        }));

        drawMaze(grid, cellSize, ctx, lineWidth); // Odśwież labirynt
    }

    function disableButtons() {
        $("button").prop("disabled", true);
    }

    function enableButtons() {
        $("button").prop("disabled", false);
    }

    $('#saveMazeBtn').on('click', function () {
        const mazeName = $('#mazeName').val().trim();
        const mazeColor = $('#wallColor').val(); // Pobierz wybrany kolor


        if (!mazeName) {
            showMessage('Proszę podać nazwę labiryntu przed zapisaniem.', 'error');
            return;
        }
        grid.forEach(row => row.forEach(cell => {
            if (cell.type === 'visited' || cell.type === 'alg-path') {
                cell.type = 'path';
            }
        }));
        const dataToSend = {
            name: mazeName,
            gridSize: gridSize,
            maze: JSON.stringify(grid),
            color: mazeColor
        };

        $.ajax({
            url: '/anim/save-maze',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataToSend),
            success: function () {
                showMessage('Labirynt został zapisany pomyślnie!', 'success', '#saveMessage');
                loadSavedMazes();
            },
            error: function () {
                showMessage('Nie udało się zapisać labiryntu. Spróbuj ponownie.', 'error', '#saveMessage');
            },
        });
    });

    function showMessage(message, type, id) {
        const messageDiv = $(id.toString());
        messageDiv.removeClass();
        if (type === 'success') {
            messageDiv.addClass('text-success');
        } else if (type === 'error') {
            messageDiv.addClass('text-danger');
        }
        messageDiv.text(message);
        messageDiv.show();

        // Ukryj wiadomość po 5 sekundach
        setTimeout(() => {
            messageDiv.fadeOut();
        }, 5000);
    }

    loadSavedMazes();

    function loadSavedMazes() {
        $.ajax({
            url: '/anim/mazes',
            method: 'GET',
            success: function (mazes) {
                const savedMazes = $('#savedMazes');
                savedMazes.empty();
                savedMazes.append('<option value="" disabled selected>Wybierz labirynt...</option>');
                if (mazes && mazes.length > 0) {
                    mazes.forEach(maze => {
                        savedMazes.append(
                            `<option value="${maze.id}">${maze.name} (utworzony: ${new Date(maze.created_at).toLocaleDateString()})</option>`
                        );
                    });
                } else {
                    console.warn('Brak zapisanych labiryntów do wyświetlenia.');
                }
            },
            error: function (error) {
                console.error('Błąd ładowania labiryntów:', error);
                showMessage('Nie udało się pobrać listy labiryntów.', 'error', '#loadMessage');
            }
        });
    }

    $('#loadMazeBtn').on('click', function () {
        const selectedMazeId = $('#savedMazes').val(); // Pobierz wybrany ID labiryntu


        $.ajax({
            url: `/anim/mazes/${selectedMazeId}`,
            method: 'GET',
            success: function (data) {

                gridSize = data.gridSize; // Ustaw odpowiedni rozmiar siatki
                console.log(gridSize);
                if (gridSize === 51) {
                    $('#grid50x50').prop('checked', true);
                } else if (gridSize === 71) {
                    $('#grid70x70').prop('checked', true);
                }

                $('input[name="gridSize"]').trigger('change');
                initializeCanvas();
                $('#wallColor').val(data.color).trigger('change');
                grid = JSON.parse(data.maze);
                drawMaze(grid, cellSize, ctx, lineWidth);
                showMessage(`Labirynt ${data.name} został pomyślnie załadowany.`, `success`, '#loadMessage');

            },
            error: function () {
                showMessage('Nie udało się załadować labiryntu', 'error', '#loadMessage');
            }
        });
    });

    $('#deleteMazeBtn').on('click', function () {
        const selectedMazeId = $('#savedMazes').val();

        if (!selectedMazeId) {
            showMessage('Wybierz labirynt do usunięcia', 'error', '#loadMessage');
            return;
        }




        $.ajax({
            url: `/anim/mazes/${selectedMazeId}`,
            method: 'DELETE',
            success: function (response) {
                showMessage(`Usunięto labirynt`, 'success', '#loadMessage');
                loadSavedMazes(); // Odśwież listę zapisanych labiryntów
            },
            error: function (xhr, status, error) {
                showMessage('Nie udało się usunąć labiryntu', 'error', '#loadMessage');
                console.error('Błąd usuwania labiryntu:', error);
            },
        });
    });






});












