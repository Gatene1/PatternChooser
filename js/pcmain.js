// pcmain.js

// Example pool – replace with your real pattern data.
const patterns = [
    { id: 'risk_reward', name: 'Risk & Reward', tags: ['tension','stakes'] },
    { id: 'press_hold', name: 'Press and Hold', tags: ['input','timing'] },
    { id: 'one_button', name: 'One Button', tags: ['accessibility','minimal'] },
    // ...etc
];

const mainCardsEl = document.getElementById('mainCards');
const savedStackEl = document.getElementById('savedStack');

function drawMainCards(patternList) {
    mainCardsEl.innerHTML = '';

    patternList.slice(0, 3).forEach(p => {
        const card = document.createElement('article');
        card.className = 'pc-card';
        card.dataset.patternId = p.id;

        card.innerHTML = `
      <h2 class="pc-card-title">${p.name}</h2>
      <p class="pc-card-notes">Short note about how this pattern shapes your game.</p>
      <div class="pc-card-actions">
        <button class="pc-btn pc-btn-ghost" data-action="remove">Remove</button>
        <button class="pc-btn pc-btn-primary" data-action="save">Add to Scrapbook →</button>
      </div>
    `;

        mainCardsEl.appendChild(card);
    });
}

function addToScrapbook(patternId) {
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return;

    // prevent duplicates in stack
    if (savedStackEl.querySelector(`[data-saved-id="${patternId}"]`)) return;

    const saved = document.createElement('div');
    saved.className = 'pc-saved-card';
    saved.dataset.savedId = patternId;
    saved.textContent = pattern.name;
    savedStackEl.appendChild(saved);
}

function removeMainCard(cardEl) {
    cardEl.remove();
}

// Simple Draw = 3 random patterns
function simpleDraw() {
    const shuffled = [...patterns].sort(() => Math.random() - 0.5);
    drawMainCards(shuffled);
}

// Hooks

mainCardsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const card = e.target.closest('.pc-card');
    if (!card) return;

    const patternId = card.dataset.patternId;
    const action = btn.dataset.action;

    if (action === 'save') addToScrapbook(patternId);
    if (action === 'remove') removeMainCard(card);
});

document.querySelectorAll('.pc-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;

        if (mode === 'simple') {
            simpleDraw();
        }

        if (mode === 'similar') {
            // later: use currently selected/saved pattern to fetch similar
            // for now, just reuse simpleDraw or a placeholder
            simpleDraw();
        }

        if (mode === 'contrast') {
            // later: pick patterns with opposite tags; placeholder for now
            simpleDraw();
        }

        if (mode === 'credits') {
            alert('PatternChooser by OutBox Games — Bytecoded with Spruce.');
        }
    });
});

// initial state
simpleDraw();
