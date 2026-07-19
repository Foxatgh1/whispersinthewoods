// ============================================================
// WHISPERS IN THE WOODS — Tutorial
// Standalone tutorial experience: real board, custom encounters.
// ============================================================

const TBOARD_RADIUS = 3;
const THEX_SIZE     = 36;
const TSQRT3        = Math.sqrt(3);

// ============================================================
// HEX MATH
// ============================================================
function thk(q, r) { return `${q},${r}`; }

function thexToPixel(q, r) {
    return {
        x: THEX_SIZE * 1.5 * q,
        y: THEX_SIZE * (TSQRT3 / 2 * q + TSQRT3 * r)
    };
}

function taxialNeighbors(q, r) {
    return [
        [q+1, r], [q-1, r], [q, r+1],
        [q, r-1], [q+1, r-1], [q-1, r+1]
    ];
}

function thexPoints(cx, cy) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        pts.push(`${(cx + THEX_SIZE * Math.cos(angle)).toFixed(2)},${(cy + THEX_SIZE * Math.sin(angle)).toFixed(2)}`);
    }
    return pts.join(' ');
}

// ============================================================
// GAME STATE
// ============================================================
let TG;

function newTutorialState() {
    const board = {};
    for (let q = -TBOARD_RADIUS; q <= TBOARD_RADIUS; q++) {
        for (let r = -TBOARD_RADIUS; r <= TBOARD_RADIUS; r++) {
            if (Math.abs(-q - r) <= TBOARD_RADIUS) {
                board[thk(q, r)] = {
                    q, r,
                    currentLevel: 1,
                    visited: false
                };
            }
        }
    }
    return {
        board,
        phase: 'tutorial',
        canEscape: false,
        player: {
            q: 0, r: 0,
            health:      10,
            peaceOfMind: 10,
            knowledge:   0,
            visibility:  1.0,
            strength:    1.0,
            speed:       1.0,
            items:       [],
            attributes:  [],
            powerCards:  [],
            leafTokens:  0
        }
    };
}

// Tutorial-only card — never exists in game.js
const TUTORIAL_CARD = {
    id:          'tutorial_card',
    name:        'Tutorial Card',
    description: 'This is the legendary Tutorial card.',
    type:        'tutorial'
};

// ============================================================
// POWER CARDS
// ============================================================
function ttogglePowerCards() {
    const panel = document.getElementById('power-cards-panel');
    panel.classList.toggle('hidden');
}

function trenderPowerCards() {
    const cards  = TG.player.powerCards;
    const grid   = document.getElementById('power-cards-grid');
    const empty  = document.getElementById('power-cards-empty');
    const count  = document.getElementById('power-card-count');

    count.textContent = cards.length;
    grid.innerHTML = '';

    if (cards.length === 0) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    cards.forEach(card => {
        const div = document.createElement('div');
        div.className = 'power-card';
        const name = document.createElement('div');
        name.className = 'power-card-name';
        name.textContent = card.name;
        const desc = document.createElement('div');
        desc.className = 'power-card-desc';
        desc.textContent = card.description;
        div.appendChild(name);
        div.appendChild(desc);
        grid.appendChild(div);
    });
}

// ============================================================
// BOARD RENDERING
// ============================================================
function trenderBoard() {
    const hexLayer   = document.getElementById('hex-layer');
    const tokenLayer = document.getElementById('token-layer');
    hexLayer.innerHTML   = '';
    tokenLayer.innerHTML = '';

    const pq = TG.player.q;
    const pr = TG.player.r;
    const neighbors = new Set(
        taxialNeighbors(pq, pr)
            .filter(([q, r]) => TG.board[thk(q, r)])
            .map(([q, r]) => thk(q, r))
    );

    Object.values(TG.board).forEach(hex => {
        const { x, y } = thexToPixel(hex.q, hex.r);
        const key = thk(hex.q, hex.r);
        const isPlayer    = hex.q === pq && hex.r === pr;
        const isNeighbor  = neighbors.has(key);
        const lvl         = hex.currentLevel;

        const levelColors = { 1: '#d4d4d4', 2: '#a0a0a0', 3: '#606060', 4: '#282828' };
        let fill = levelColors[lvl] || '#d4d4d4';
        if (isNeighbor) fill = '#ebebeb';

        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', thexPoints(x, y));
        poly.setAttribute('fill', fill);
        poly.setAttribute('stroke', '#000');
        poly.setAttribute('stroke-width', '1');
        poly.style.cursor = isNeighbor ? 'pointer' : 'default';

        if (isNeighbor) {
            poly.addEventListener('mouseenter', () => { poly.setAttribute('fill', '#f5f5f5'); });
            poly.addEventListener('mouseleave', () => { poly.setAttribute('fill', '#ebebeb'); });
            poly.addEventListener('click', () => tonHexClick(hex.q, hex.r));
        }

        hexLayer.appendChild(poly);
    });

    // Player token
    const { x, y } = thexToPixel(pq, pr);
    const img = document.getElementById('player-token-img');
    img.setAttribute('transform', `translate(${x}, ${y})`);

    // Escape button
    const escapeContainer = document.getElementById('escape-container');
    if (TG.canEscape && tisEdgeHex(pq, pr) && TG.phase === 'move') {
        escapeContainer.classList.remove('hidden');
    } else {
        escapeContainer.classList.add('hidden');
    }
}

// ============================================================
// PLAYER MOVEMENT
// ============================================================
function tonHexClick(q, r) {
    if (TG.phase !== 'move') return;
    const neighbors = taxialNeighbors(TG.player.q, TG.player.r);
    const isAdj = neighbors.some(([nq, nr]) => nq === q && nr === r);
    if (!isAdj) return;

    // Dismiss the board callout on first hex click
    const overlay = document.getElementById('tutorial-overlay');
    if (!overlay.classList.contains('hidden')) tadvanceTutorial();

    TG.board[thk(TG.player.q, TG.player.r)].visited = true;
    TG.player.q = q;
    TG.player.r = r;
    trenderBoard();

}

// ============================================================
// STATS DISPLAY
// ============================================================
function tupdateStats() {
    const p = TG.player;
    document.getElementById('health-value').textContent      = p.health;
    document.getElementById('pom-value').textContent         = p.peaceOfMind;
    document.getElementById('knowledge-value').textContent   = p.knowledge;
    document.getElementById('visibility-value').textContent  = p.visibility.toFixed(1);
    document.getElementById('strength-value').textContent    = p.strength.toFixed(1);
    document.getElementById('speed-value').textContent       = p.speed.toFixed(1);
}

function tupdateLeafDisplay() {
    for (let i = 0; i < 3; i++) {
        const leaf = document.getElementById(`leaf-${i}`);
        if (i < TG.player.leafTokens) {
            leaf.classList.remove('hidden');
            setTimeout(() => leaf.classList.add('visible'), i * 150);
        } else {
            leaf.classList.add('hidden');
            leaf.classList.remove('visible');
        }
    }
}

function tisEdgeHex(q, r) {
    return taxialNeighbors(q, r).some(([nq, nr]) => !TG.board[thk(nq, nr)]);
}

function tattemptEscape() {
    TG.phase = 'tutorial';
    const overlay = document.getElementById('tutorial-overlay');
    overlay.innerHTML = '';
    overlay.style.opacity = '0';
    overlay.classList.remove('hidden');

    const box = document.createElement('div');
    box.id = 'tutorial-box';
    box.textContent = 'One last thing. Do not spend too long in the woods. There is more here than meets the eye. Good luck!';
    box.addEventListener('click', () => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '0';
        setTimeout(() => window.location.href = 'index.html', 500);
    });
    overlay.appendChild(box);

    requestAnimationFrame(() => {
        overlay.style.transition = 'opacity 0.4s ease';
        overlay.style.opacity = '1';
    });
}

// ============================================================
// TUTORIAL OVERLAY SYSTEM
// ============================================================
let _tutorialStep = 0;
const _tutorialSteps = [
    {
        render: (overlay) => {
            const box = document.createElement('div');
            box.id = 'tutorial-box';
            box.textContent = 'Welcome to Whispers in the Woods! You are lost in the forests of West Virginia and must find your way home. This tutorial will show you how to do so.';
            box.addEventListener('click', () => tadvanceTutorial());
            overlay.appendChild(box);
        }
    },
    {
        render: (overlay) => {
            TG.phase = 'move';

            const callout = document.createElement('div');
            callout.id = 'tutorial-callout-board';

            const box = document.createElement('div');
            box.id = 'tutorial-box';
            box.textContent = 'This hexagon grid represents the forest. By clicking on the hexagons surrounding you (the glasses), you can move. Try it now.';
            callout.appendChild(box);

            const arrow = document.createElement('img');
            arrow.src = 'assets/arrow.webp';
            arrow.id = 'tutorial-arrow';
            callout.appendChild(arrow);

            callout.addEventListener('click', () => tadvanceTutorial());
            overlay.appendChild(callout);
        }
    },
    {
        render: (overlay) => {
            TG.phase = 'tutorial';
            const callout = tmakeRightCallout(
                'During normal gameplay, each move you make will trigger an encounter. They can be read and dealt with here.',
                'bottom'
            );
            callout.addEventListener('click', () => tadvanceTutorial());
            overlay.appendChild(callout);
        }
    },
    {
        render: (overlay) => {
            const callout = tmakeRightCallout(
                'Your success during encounters will usually be determined by your Speed, Strength, and Visibility stats. These stats can be increased or decreased at different points during the game.',
                'top',
                '260px'
            );
            callout.addEventListener('click', () => tadvanceTutorial());
            overlay.appendChild(callout);
        }
    },
    {
        render: (overlay) => {
            const callout = document.createElement('div');
            callout.className = 'tutorial-callout-stats';

            const arrow = document.createElement('img');
            arrow.src = 'assets/arrowleft.webp';
            arrow.className = 'tutorial-arrow-sm';
            callout.appendChild(arrow);

            const box = document.createElement('div');
            box.id = 'tutorial-box';
            box.textContent = 'You must take care of your HEALTH and PEACE OF MIND. If either reaches 0, then you will lose the game. Your KNOWLEDGE will also dictate some of the choices you may make.';
            callout.appendChild(box);

            callout.addEventListener('click', () => tadvanceTutorial());
            overlay.appendChild(callout);
        }
    },
    {
        render: (overlay) => {
            const callout = document.createElement('div');
            callout.className = 'tutorial-callout-stats';
            callout.style.top = 'calc(50% + 43px)';

            const arrow = document.createElement('img');
            arrow.src = 'assets/arrowleft.webp';
            arrow.className = 'tutorial-arrow-sm';
            callout.appendChild(arrow);

            const box = document.createElement('div');
            box.id = 'tutorial-box';
            box.textContent = 'During your encounters, you may gain ATTRIBUTES that impact your characteristics and the choices you may make during the game. Most, though not all, of these are permanent.';
            callout.appendChild(box);

            callout.addEventListener('click', () => tadvanceTutorial());
            overlay.appendChild(callout);
        }
    },
    {
        render: (overlay) => {
            const callout = document.createElement('div');
            callout.className = 'tutorial-callout-stats';
            callout.style.top = 'calc(50% + 290px)';

            const arrow = document.createElement('img');
            arrow.src = 'assets/arrowleft.webp';
            arrow.className = 'tutorial-arrow-sm';
            callout.appendChild(arrow);

            const box = document.createElement('div');
            box.id = 'tutorial-box';
            box.textContent = 'You may also acquire ITEMS from your encounters. ITEMS can be used during encounters and typically have limited uses.';
            callout.appendChild(box);

            callout.addEventListener('click', () => tadvanceTutorial());
            overlay.appendChild(callout);
        },
        onAdvance: () => {
            TG.player.powerCards.push(TUTORIAL_CARD);
            trenderPowerCards();
        }
    },
    {
        render: (overlay) => {
            const callout = document.createElement('div');
            callout.className = 'tutorial-callout-powertab';

            const box = document.createElement('div');
            box.id = 'tutorial-box';
            box.textContent = 'You may also acquire Power Cards throughout the game. You may only carry a maximum of 5 at any given time. These cards have a variety of effects, most good, a few bad.';
            callout.appendChild(box);

            const arrow = document.createElement('img');
            arrow.src = 'assets/arrowdown.webp';
            arrow.className = 'tutorial-arrow-down';
            callout.appendChild(arrow);

            callout.addEventListener('click', () => tadvanceTutorial());
            overlay.appendChild(callout);
        },
        onAdvance: () => {
            TG.player.leafTokens = 3;
            TG.canEscape = true;
            tupdateLeafDisplay();
        }
    },
    {
        render: (overlay) => {
            const box = document.createElement('div');
            box.id = 'tutorial-box';
            box.textContent = 'There are many endings to this game, but the best way to leave the woods is by gathering 3 Leaf tokens. Once you have enough, move to the edge of the map, at which point you can then choose to escape the woods. Try it now.';
            box.addEventListener('click', () => tadvanceTutorial());
            overlay.appendChild(box);
        },
        onAdvance: () => { TG.phase = 'move'; trenderBoard(); }
    }
];

// Builds a callout on the right side (left of the right column) pointing at it
function tmakeRightCallout(text, vAlign, boxWidth) {
    const callout = document.createElement('div');
    callout.className = 'tutorial-callout-right';
    callout.style.top = vAlign === 'top' ? '20px' : '';
    callout.style.bottom = vAlign === 'bottom' ? '255px' : '';

    const box = document.createElement('div');
    box.id = 'tutorial-box';
    if (boxWidth) box.style.maxWidth = boxWidth;
    box.textContent = text;
    callout.appendChild(box);

    const arrow = document.createElement('img');
    arrow.src = 'assets/arrow.webp';
    arrow.className = 'tutorial-arrow-sm';
    callout.appendChild(arrow);

    return callout;
}


function tshowStep(step) {
    const overlay = document.getElementById('tutorial-overlay');
    overlay.innerHTML = '';
    overlay.classList.remove('hidden');
    step.render(overlay);
}

function tadvanceTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    const box = overlay.querySelector('#tutorial-box');
    if (!box) return;

    // Fade out the whole overlay content
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';

    setTimeout(() => {
        overlay.style.opacity = '';
        overlay.style.transition = '';

        const step = _tutorialSteps[_tutorialStep];
        _tutorialStep++;

        if (step.onAdvance) step.onAdvance();
        if (_tutorialStep >= _tutorialSteps.length) {
            overlay.classList.add('hidden');
            TG.phase = 'move';
            return;
        }
        tshowStep(_tutorialSteps[_tutorialStep]);
    }, 300);
}

// ============================================================
// INIT
// ============================================================
function initTutorial() {
    TG = newTutorialState();
    tupdateStats();
    trenderBoard();
    trenderPowerCards();
    tshowStep(_tutorialSteps[0]);
    document.body.style.opacity = '1';
}

window.addEventListener('DOMContentLoaded', initTutorial);
