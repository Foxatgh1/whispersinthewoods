// Tic-tac-toe for the Face of Stone "I will await your decision." branch.
// Called from game.js — exposes initFosTicTacToe(panel, onReady) globally.

function initFosTicTacToe(panel, onReady) {
    panel.style.opacity = '0';
    panel.innerHTML = '';

    let board = Array(9).fill(null); // null | 'X' | 'O'
    let gameOver = false;

    const WINS = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6]          // diagonals
    ];

    function checkWinner(b) {
        for (const [a, c, d] of WINS) {
            if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
        }
        return b.every(Boolean) ? 'draw' : null;
    }

    function aiMove() {
        // 1. Win if possible
        for (const [a, c, d] of WINS) {
            const line = [board[a], board[c], board[d]];
            if (line.filter(v => v === 'O').length === 2 && line.includes(null)) {
                return [a, c, d][line.indexOf(null)];
            }
        }
        // 2. Block player win
        for (const [a, c, d] of WINS) {
            const line = [board[a], board[c], board[d]];
            if (line.filter(v => v === 'X').length === 2 && line.includes(null)) {
                return [a, c, d][line.indexOf(null)];
            }
        }
        // 3. Prefer center, then corners, then edges
        const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        return preferred.find(i => !board[i]);
    }

    // --- DOM ---

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 14px; position: relative; top: -10px;';

    const statusEl = document.createElement('div');
    statusEl.style.cssText = `
        font-family: var(--font);
        font-size: 0.85rem;
        color: #555;
        font-style: italic;
        min-height: 1.2em;
    `;
    statusEl.textContent = 'Your move.';

    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 52px);
        grid-template-rows: repeat(3, 52px);
        gap: 4px;
    `;

    const cells = board.map((_, i) => {
        const cell = document.createElement('div');
        cell.style.cssText = `
            width: 52px; height: 52px;
            background: #fff;
            border: 1.5px solid #333;
            display: flex; align-items: center; justify-content: center;
            font-family: var(--font);
            font-size: 1.4rem;
            font-weight: bold;
            cursor: pointer;
            user-select: none;
            transition: background 0.15s;
        `;
        cell.addEventListener('mouseenter', () => { if (!board[i] && !gameOver) cell.style.background = '#f0f0f0'; });
        cell.addEventListener('mouseleave', () => { cell.style.background = '#fff'; });
        cell.addEventListener('click', () => playerClick(i));
        grid.appendChild(cell);
        return cell;
    });

    function render() {
        board.forEach((val, i) => {
            cells[i].textContent = val || '';
            cells[i].style.color = val === 'X' ? '#222' : '#888';
            cells[i].style.cursor = (!val && !gameOver) ? 'pointer' : 'default';
        });
    }

    function playerClick(i) {
        if (gameOver || board[i]) return;
        board[i] = 'X';
        render();
        const result = checkWinner(board);
        if (result) { endGame(result); return; }
        statusEl.textContent = '...';
        cells.forEach(c => c.style.pointerEvents = 'none');
        setTimeout(() => {
            const idx = aiMove();
            if (idx !== undefined) {
                board[idx] = 'O';
                render();
                const r2 = checkWinner(board);
                if (r2) { endGame(r2); return; }
            }
            statusEl.textContent = 'Your move.';
            cells.forEach(c => c.style.pointerEvents = '');
        }, 420);
    }

    function endGame(result) {
        gameOver = true;
        cells.forEach(c => c.style.pointerEvents = 'none');
        if (result === 'X')         statusEl.textContent = 'You win.';
        else if (result === 'O')    statusEl.textContent = 'You lose.';
        else                        statusEl.textContent = 'A draw.';

        setTimeout(() => {
            board = Array(9).fill(null);
            gameOver = false;
            statusEl.textContent = 'Your move.';
            cells.forEach(c => {
                c.style.pointerEvents = '';
                c.style.background = '#fff';
            });
            render();
        }, 3000);
    }

    const readyBtn = document.createElement('button');
    readyBtn.textContent = 'I am ready.';
    readyBtn.className = 'choice-btn';
    readyBtn.style.cssText = 'display: block; width: 100%; margin-bottom: 8px;';
    readyBtn.addEventListener('click', onReady);

    wrapper.appendChild(statusEl);
    wrapper.appendChild(grid);
    panel.appendChild(wrapper);
    panel.appendChild(readyBtn);

    render();

    // Fade the panel in
    requestAnimationFrame(() => requestAnimationFrame(() => {
        panel.style.transition = 'opacity 0.6s ease';
        panel.style.opacity = '1';
    }));
}
