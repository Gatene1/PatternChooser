// pcmain.js

// Example pool – expand as you like.
const patterns = [
    { id: 'risk_reward', name: 'Risk & Reward', tags: ['tension','stakes'] },
    { id: 'press_hold',  name: 'Press and Hold', tags: ['input','timing'] },
    { id: 'one_button',  name: 'One Button',     tags: ['accessibility','minimal'] },
    { id: 'glass_cannon',name: 'Glass Cannon',   tags: ['build','tradeoff','tension'] },
    { id: 'safe_zone',   name: 'Safe Zone',      tags: ['pace','relief'] },
    { id: 'fog_of_war',  name: 'Fog of War',     tags: ['information','tension'] },
    { id: 'combo_chain', name: 'Combo Chain',    tags: ['skill','timing'] },
    { id: 'telegraph',   name: 'Telegraphing',   tags: ['signaling','fairness'] },
];

const mainCardsEl  = document.getElementById('mainCards');
const savedStackEl = document.getElementById('savedStack');
const emptyStateEl = document.getElementById('emptyState');

// --- Storage keys & helpers ---
const KEYS = {
    currentDraw: 'pc_current_draw',
    saved:       'pc_saved_cards'
};

/* ---- Always start fresh on page load ---- */
localStorage.removeItem(KEYS.currentDraw);
localStorage.removeItem(KEYS.saved);



let currentDraw = loadJSON(KEYS.currentDraw, []);
let savedCards  = loadJSON(KEYS.saved, [])
    .filter(Boolean)
    .map(x => (x && typeof x === 'object' ? x.id : String(x)));  // always coerce to string ids


function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}
function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Keep a Set in memory to enforce uniqueness
let savedSet = new Set(savedCards);

// Persist helper (always writes the Set → array)
function persistSaved() {
    savedCards = Array.from(savedSet);
    saveJSON(KEYS.saved, savedCards);
}

function setEmptyStateVisible(isVisible) {
    emptyStateEl.style.display = isVisible ? 'block' : 'none';
}




// Normalize & dedupe once on load (handles strings vs objects, stale entries)
function normalizeSaved() {
    savedCards = Array.from(
        new Set(
            savedCards
                .map(x => (x && typeof x === 'object' ? x.id : x)) // coerce to id string
                .filter(Boolean)
        )
    );
    saveJSON(KEYS.saved, savedCards);
}
normalizeSaved();


function render() {
    // main cards
    mainCardsEl.innerHTML = '';
    if (currentDraw.length === 0) {
        setEmptyStateVisible(true);
    } else {
        setEmptyStateVisible(false);
        currentDraw.slice(0,3).forEach(p => {
            const card = document.createElement('article');
            card.className = 'pc-card';
            card.dataset.patternId = p.id;
            card.innerHTML = `
        <h2 class="pc-card-title">${p.name}</h2>
        <p class="pc-card-notes">Short note about how this pattern shapes your game.</p>
        <div class="pc-card-actions">
          <button class="pc-btn pc-btn-ghost" data-action="remove">Remove</button>
          <button class="pc-btn pc-btn-primary" data-action="save">Add to Scrapbook →</button>
        </div>`;
            mainCardsEl.appendChild(card);
        });
    }

    // saved stack (rebuild from Set every time)
    const old = savedStackEl.querySelectorAll('.pc-saved-card');
    old.forEach(n => n.remove());
    Array.from(savedSet).forEach((id, idx) => {
        const p = patterns.find(x => x.id === id);
        if (!p) return;
        const saved = document.createElement('div');
        saved.className = 'pc-saved-card';
        saved.dataset.savedId = id;
        saved.style.marginBottom = idx === savedSet.size - 1 ? '-12px' : '-40px';
        saved.textContent = p.name;
        savedStackEl.appendChild(saved);
    });
}

function drawThreeRandom() {
    const shuffled = [...patterns].sort(() => Math.random() - 0.5);
    currentDraw = shuffled.slice(0,3);
    saveJSON(KEYS.currentDraw, currentDraw);
    render();
}

function addToScrapbook(patternId) {
    const id = String(patternId);
    if (!savedSet.has(id)) {
        savedSet.add(id);
        persistSaved();
    }
    // Remove card from current draw
    currentDraw = currentDraw.filter(p => p.id !== id);
    saveJSON(KEYS.currentDraw, currentDraw);
    render();
}

function removeMainCard(cardEl) {
    const id = cardEl.dataset.patternId;
    currentDraw = currentDraw.filter(p => p.id !== id);
    saveJSON(KEYS.currentDraw, currentDraw);
    render();
}

function overlapCount(a, b) {
    const s = new Set(a);
    return b.reduce((n, t) => n + (s.has(t) ? 1 : 0), 0);
}

function chooseSeed() {
    // prefer the first saved card; fall back to first current card; otherwise null
    if (savedCards.length) {
        const p = patterns.find(x => x.id === savedCards[0]);
        if (p) return p;
    }
    return currentDraw[0] || null;
}

function similarDraw() {
    const seed = chooseSeed();
    if (!seed) { drawThreeRandom(); return; }

    const ranked = patterns
        .filter(p => p.id !== seed.id)
        .map(p => ({ p, score: overlapCount(seed.tags, p.tags) }))
        .sort((a,b) => b.score - a.score);

    currentDraw = ranked.slice(0,3).map(x => x.p);
    saveJSON(KEYS.currentDraw, currentDraw);
    render();
}

function contrastDraw() {
    const seed = chooseSeed();
    if (!seed) { drawThreeRandom(); return; }

    // “Contrast” = fewest overlapping tags (and prefer those that introduce brand-new tags)
    const ranked = patterns
        .filter(p => p.id !== seed.id)
        .map(p => ({
            p,
            overlap: overlapCount(seed.tags, p.tags),
            novelty: p.tags.filter(t => !seed.tags.includes(t)).length
        }))
        .sort((a,b) => (a.overlap - b.overlap) || (b.novelty - a.novelty));

    currentDraw = ranked.slice(0,3).map(x => x.p);
    saveJSON(KEYS.currentDraw, currentDraw);
    render();
}

/* ---- Credits modal ---- */
function openCredits() {
    const backdrop = document.createElement('div');
    backdrop.className = 'pc-modal-backdrop';
    backdrop.innerHTML = `
    <div class="pc-modal" role="dialog" aria-modal="true" aria-label="Credits">
      <h3>PatternChooser</h3>
      <p>By OutBox Games — Bytecoded with Spruce.</p>
      <p>Part of the <em>Actionary</em> toolkit (Topic Creator · PatternChooser · MechanicVerber).</p>
      <div class="pc-modal-actions">
        <button class="pc-modal-close">Close</button>
      </div>
    </div>
  `;
    backdrop.addEventListener('click', (e) => {
        if (e.target.classList.contains('pc-modal-backdrop') || e.target.classList.contains('pc-modal-close')) {
            backdrop.remove();
        }
    });
    document.body.appendChild(backdrop);
}

/* ---- Event wiring ---- */

// main card buttons (save/remove)
mainCardsEl.addEventListener('click', (e) => {
    const btn  = e.target.closest('button');
    if (!btn) return;
    const card = e.target.closest('.pc-card');
    if (!card) return;

    const patternId = card.dataset.patternId;
    const action    = btn.dataset.action;

    if (action === 'save')   addToScrapbook(patternId);
    if (action === 'remove') removeMainCard(card);
});

// top nav tabs (image version)
document.querySelectorAll('.pc-nav-img').forEach(btn => {
    btn.addEventListener('click', () => {
        // flatten EVERY tab first
        document.querySelectorAll('.pc-nav-img').forEach(b => {
            b.classList.remove('is-active');
            b.blur(); // drop focus so it can't hold a state visually
        });

        // raise the clicked one
        btn.classList.add('is-active');

        // run the mode
        const mode = btn.dataset.mode;
        if (mode === 'simple')   drawThreeRandom();
        if (mode === 'similar')  similarDraw();
        if (mode === 'contrast') contrastDraw();
        if (mode === 'credits')  openCredits();
    });
});

// set initial active if none
const firstImgTab = document.querySelector('.pc-nav-img[data-mode="simple"]');
if (firstImgTab && !document.querySelector('.pc-nav-img.is-active')) {
    firstImgTab.classList.add('is-active');
}

render();
/*// --- Initial render ---
if (currentDraw.length === 0) {
    drawThreeRandom();   // or: render();  // <-- use this instead if you prefer showing the Welcome first
} else {
    render();
}*/

