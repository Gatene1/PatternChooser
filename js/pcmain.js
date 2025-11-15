// pcmain.js

//alert ("oh 5");

const tabs = {
    simple:  document.getElementById('tabSimple'),
    similar: document.getElementById('tabSimilar'),
    contrast:document.getElementById('tabContrast'),
    credits: document.getElementById('tabCredits'),
};

// Core els
const els = {
    deck:  document.getElementById('mainCards'),
    saved: document.getElementById('savedStack'),
    empty: document.getElementById('emptyState'),
    modal: null
};

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

let manifest, defaults, buttonsByCat;

// util: fetch + allow // comments in JSON
async function loadManifest(path) {
    const raw = await fetch(path).then(r => r.text());
    const noComments = raw.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
    return JSON.parse(noComments);
}

// filename fallback helper (handles risk_vs_reward vs riskVsReward)
function tryPaths(p) {
    const tried = [p];
    if (p.includes('_')) tried.push(p.replace(/_([a-z])/g, (_,c)=>c.toUpperCase()));
    return tried;
}





function imgBtn(src, alt, onClick) {
    const b = document.createElement('button');
    b.className = 'pc-imgbtn';
    const i = document.createElement('img');
    i.src = src; i.alt = alt || '';
    b.appendChild(i);
    if (onClick) b.addEventListener('click', onClick);
    return b;
}

function makeFront(p, catBtns) {
    const face = document.createElement('section');
    face.className = 'pc-face front';

    const h2 = document.createElement('h2');
    h2.className = 'pc-card-title';
    h2.textContent = p.title;

    const body = document.createElement('p');
    body.className = 'pc-card-body';
    body.textContent = p.front;

    const fig = document.createElement('figure');
    fig.className = 'pc-card-fig';
    const img = document.createElement('img');
    // resolve diagram path w/ fallback
    const diagramPaths = tryPaths(p.diagram);
    img.src = diagramPaths[0];
    img.onerror = () => { if (diagramPaths[1]) img.src = diagramPaths[1]; };
    img.alt = `${p.title} diagram`;
    img.className = 'pc-card-img';
    fig.appendChild(img);

    const actions = document.createElement('div');
    actions.className = 'pc-card-actions';
    actions.appendChild(imgBtn(catBtns.flip, 'Flip'));
    actions.appendChild(imgBtn(catBtns.ats, 'Add To Scrapbook'));

    face.append(h2, body, fig, actions);
    return face;
}

function makeBack(p, catBtns) {
    const face = document.createElement('section');
    face.className = 'pc-face back';

    const h2 = document.createElement('h2');
    h2.className = 'pc-card-title';
    h2.textContent = p.title;

    const body = document.createElement('div');
    body.className = 'pc-card-body';

    // Show ONLY the first recorded game (short + readable)
    const fg = p.sources?.first_game;
    if (fg) {
        body.innerHTML = `<strong>First noted:</strong> ${fg.title} (${fg.year}) — ${fg.note}`;
    }

    const actions = document.createElement('div');
    actions.className = 'pc-card-actions';
    actions.appendChild(imgBtn(catBtns.back, 'Back'));

    face.append(h2, body, actions);
    return face;
}

function makeCard(p) {
    const card = document.createElement('article');
    card.className = 'pc-card';

    // tape
    const tape = document.createElement('img');
    tape.className = 'pc-card-tape';
    tape.src = p.tape || defaults.tape;
    tape.alt = ''; tape.ariaHidden = 'true';
    card.appendChild(tape);

    // flip core
    const inner = document.createElement('div');
    inner.className = 'pc-card-inner';
    card.appendChild(inner);

    const catBtns = buttonsByCat[p.category] || Object.values(buttonsByCat)[0];
    const front = makeFront(p, catBtns);
    const back  = makeBack(p, catBtns);

    inner.append(front, back);

    // flip wiring
    const [flipBtn, atsBtnFront] = front.querySelectorAll('.pc-imgbtn');
    const [backBtn, atsBtnBack]  = back.querySelectorAll('.pc-imgbtn');

    flipBtn.addEventListener('click', () => card.classList.add('is-flipped'));
    backBtn.addEventListener('click', () => card.classList.remove('is-flipped'));

    const add = () => addToSaved(p);
    atsBtnFront.addEventListener('click', add);
    //atsBtnBack .addEventListener('click', add);

    return card;
}

function addToSaved(p) {
    const item = document.createElement('div');
    item.style.margin = '8px 0';
    item.textContent = p.title;
    els.saved.appendChild(item);
}

/*async function boot() {
    manifest = await loadManifest('Images/patterns.json');
    defaults = manifest.defaults || {};
    buttonsByCat = manifest.buttons || {};
    // deal the first 3
    manifest.patterns.slice(0,3).forEach(p => {
        els.deck.appendChild(makeCard(p));
    });
}*/


// ===== states =====
function showWelcome(){
    els.empty.style.display = '';
    clearDeck();
}

function onSimpleDraw(){
    els.empty.style.display = 'none';
    clearDeck();
    deal(3);
}

function clearDeck(){
    els.deck.innerHTML = '';
}

// ===== dealing =====
function deal(n){
    manifest.patterns.slice(0,n).forEach(p=>{
        els.deck.appendChild(makeCard(p));
    });
}

document.addEventListener('DOMContentLoaded', boot);

async function boot() {
    manifest = await loadManifest('Images/patterns.json');
    defaults = manifest.defaults || {};
    buttonsByCat = manifest.buttons || {};

    // Start in welcome state
    showWelcome();

    // Wire tabs
    tabs.simple?.addEventListener('click', (e)=>{ e.preventDefault(); onSimpleDraw(); });
    tabs.credits?.addEventListener('click',(e)=>{ e.preventDefault(); openCredits(); });

    // (Optional) keep placeholders for future:
    tabs.similar?.addEventListener('click',(e)=>e.preventDefault());
    tabs.contrast?.addEventListener('click',(e)=>e.preventDefault());
}

function openCredits(){
    if(!els.modal){
        els.modal = document.createElement('div');
        els.modal.id = 'pc-modal';
        els.modal.innerHTML = `
      <div class="pc-modal-backdrop"></div>
      <div class="pc-modal-dialog" role="dialog" aria-modal="true" aria-label="Credits">
        <h2>Credits</h2>
        <p><strong>PatternChooser</strong></p>
        <p>A joint creation by David Riley<br>
        and AI Partner (Spruce).<br>
        David handled the scrapbook vibes,<br>
        layout flair, diagrams, and the entire<br>
        visual identity.<br>
        Spruce wrangled the wiring, logic, and kept<br>
        the tabs from falling off the digital<br>
        notebook.<br><br>

        Fonts: Patrick Hand + Kalam<br>
        Powered by too many late-night ideas<br>
        and a dangerous amount of creativity.<br>
        <button class="pc-modal-close" aria-label="Close">Close</button>
      </div>`;
        document.body.appendChild(els.modal);
        els.modal.querySelector('.pc-modal-backdrop').addEventListener('click', closeCredits);
        els.modal.querySelector('.pc-modal-close').addEventListener('click', closeCredits);
    }
    document.body.classList.add('modal-open');     // ⟵ lock background
    els.modal.classList.add('is-open');
}

function closeCredits(){
    document.body.classList.remove('modal-open');
    els.modal?.classList.remove('is-open');
}

/*
/* ---- Always start fresh on page load ----
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

/* ---- Credits modal ----
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

/* ---- Event wiring ----

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
// --- Initial render ---
if (currentDraw.length === 0) {
    drawThreeRandom();   // or: render();  // <-- use this instead if you prefer showing the Welcome first
} else {
    render();
}*/

