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




// Panels for Similar / Contrast views
const panels = {
    similar: document.getElementById('similarPanel'),
    contrast: document.getElementById('contrastPanel')
};

// Track which main view is active: 'simple' | 'similar' | 'contrast'
let currentMode = 'simple';


function updateSimpleTabAppearance() {
    const btn = tabs.simple;
    if (!btn) return;

    if (currentMode === 'simple') {
        // In Simple mode, this is "Simple Draw"
        btn.classList.add('pc-tab-simple');
        btn.classList.remove('pc-tab-deck');
        btn.setAttribute('aria-label', 'Simple Draw');
    } else {
        // In Similar / Contrast modes, this becomes "Deck"
        btn.classList.remove('pc-tab-simple');
        btn.classList.add('pc-tab-deck');
        btn.setAttribute('aria-label', 'Deck');
    }
}



// Lightweight toast for "Added to Scrapbook" etc.
let toastTimeout = null;
function showToast(message) {
    let toast = document.getElementById('pc-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'pc-toast';
        toast.className = 'pc-toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-visible');

    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 1500);
}





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
const pcLogoImg = document.getElementsByClassName('pc-logo-img');
const pcTape = document.getElementsByClassName('pc-tape');

// --- Storage keys & helpers ---
const KEYS = {
    currentDraw: 'pc_current_draw',
    saved:       'pc_saved_cards'
};

const CATEGORY_LABEL_IMAGES = {
    progression: 'Images/cards/progression_orange_blank.png',
    aesthetic:   'Images/cards/aesthetic_violet_blank.png',
    dynamic:     'Images/cards/dynamic_green_blank.png',
    mechanic:    'Images/cards/mechanic_blue_blank.png'
};

const maxNumOfCards = 8;

let manifest, defaults, buttonsByCat;


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

// Special-case Press and Hold so the diagram fits better
    if (p.id === 'press_and_hold' || p.id === 'risk_reward_tradeoff') {
        img.classList.add('pc-card-img-shrink-by-35');
    } else if (p.id === 'soft_failure_state' || p.id === 'stacking_buffs') {
        img.classList.add('pc-card-img-shrink-a-tiny-bit');
    } else if (p.id === 'escalating_stakes' || p.id === 'context_sensitive_actions' || p.id === 'priority_targeting' || p.id === 'deferred_choice') {
        img.classList.add('pc-card-img-grow-a-tiny-bit');
    } else if (p.id === 'interruptible_actions' || p.id === 'toggle_state_mechanic' || p.id === 'tempo_management') {
        img.classList.add('pc-card-img-grow-by-half');
    }

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

    const chunks = [];

    // First noted game (existing behavior)
    const fg = p.sources?.first_game;
    if (fg) {
        chunks.push(
            `<strong>First noted:</strong> ${fg.title} (${fg.year}) — ${fg.note}`
        );
    }

    // New: games that feature this pattern
    if (Array.isArray(p.games) && p.games.length) {
        const listed = p.games
            .map(g => `• ${g}`)
            .join('<br>');

        chunks.push(
            `<strong>Featured In:</strong><br>${listed}`
        );
    }

    // Fallback if we somehow have neither
    if (!chunks.length) {
        chunks.push('No notes recorded yet. This pattern is waiting for its first spotlight.');
    }

    body.innerHTML = chunks.join('<br><br>');

    const actions = document.createElement('div');
    actions.className = 'pc-card-actions';
    actions.appendChild(imgBtn(catBtns.back, 'Back'));

    face.append(h2, body, actions);
    return face;
}


function makeCard(p, options = {}) {
    const context = options.context || 'deck'; // 'deck' or 'panel'
    const card = document.createElement('article');
    card.className = 'pc-card';

    if (p.id != null) {
        card.dataset.patternId = String(p.id);
    } else if (p.title) {
        card.dataset.patternId = String(p.title);
    }

    // Re-apply selected state when re-rendering
    const thisId = card.dataset.patternId;
    if (thisId && typeof selectedPatternId !== 'undefined' && selectedPatternId === thisId) {
        card.classList.add('is-selected');
    }

    // tape
    const tape = document.createElement('img');
    tape.className = 'pc-card-tape';
    tape.src = p.tape || defaults.tape;
    tape.alt = '';
    tape.ariaHidden = 'true';
    card.appendChild(tape);

    // NEW: close (X) button sitting on the tape
    if (context === 'deck') {
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'pc-card-close';
        closeBtn.setAttribute('aria-label', 'Remove this card');
        closeBtn.textContent = 'X';

        closeBtn.addEventListener('click', (evt) => {
            evt.stopPropagation();   // don’t trigger flips or other events

            const id = p && (p.id ?? p.title);
            if (!id) return;

            const sid = String(id);

            if (typeof selectedPatternId !== 'undefined' && selectedPatternId === sid) {
                selectedPatternId = null;
            }

            currentDraw = currentDraw.filter(q => {
                const qid = q && (q.id ?? q.title);
                return String(qid) !== sid;
            });

            persistCurrentDraw();
            renderDeck();
        });

        card.appendChild(closeBtn);
    }


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


    // --- Card selection (for Similar / Contrast modes) ---
    if (context === "deck") {
        card.addEventListener('click', (evt) => {
            // Ignore clicks on the Flip/Add/X buttons
            if (evt.target.closest('.pc-imgbtn') || evt.target.closest('.pc-card-close')) {
                return;
            }

            const id = card.dataset.patternId;
            if (!id) return;

            // If already selected, unselect
            if (selectedPatternId === id) {
                selectedPatternId = null;
                card.classList.remove('is-selected');
                return;
            }

            // Otherwise, select this one and clear others
            selectedPatternId = id;

            document.querySelectorAll('.pc-card.is-selected').forEach(el => {
                if (el !== card) {
                    el.classList.remove('is-selected');
                }
            });

            // Mark this card as selected
            card.classList.add('is-selected');

            if (context === 'panel') {
                card.style.cursor = 'default';
            }

            // Update Similar / Contrast views if one is open
            updateSimilarAndContrastPanels();
        });
    }

    return card;
}



// ===== states =====
function showWelcome(){
    els.empty.style.display = '';
    clearDeck();
}

function onSimpleDraw(){
    if (currentDraw.length >= maxNumOfCards) {
        alert("You can only have up to " + maxNumOfCards + " game design patterns out at one time.");
        return;
    }

    els.empty.style.display = 'none';

    const newCards = drawRandomPatterns(3);

    // If we’re out of room or no available cards, just keep whatever’s there
    if (!newCards.length) {
        return;
    }

    // Track what’s already in the deck by id/title
    const idsInDraw = new Set(
        currentDraw.map(c => String(c.id ?? c.title))
    );


    for (let i = 0; i < newCards.length; i++) {
        const actualCardDraw = newCards[i];
        const thisId = String(actualCardDraw.id ?? actualCardDraw.title);

        // 2) Stop once we hit the limit
        if (currentDraw.length >= maxNumOfCards) {
            break;
        }

        // 1) Skip duplicates
        if (idsInDraw.has(thisId) || savedSet.has(thisId)) {
            newCards[i] = getOneRandomPattern();
            i--;
            continue;
        }

        // CENTRALIZED: only push if rules pass
        if (addCardToDeck(actualCardDraw)) {
            idsInDraw.add(thisId);
        }
    }

    persistCurrentDraw();
    renderDeck();
}


// ===== dealing =====
// kept for future modes (similar / contrast)
function deal(n){
    const poolSource = (manifest && Array.isArray(manifest.patterns))
        ? manifest.patterns
        : [];
    currentDraw = poolSource.slice(0, n);
    persistCurrentDraw();
    renderDeck();
}


document.addEventListener('DOMContentLoaded', boot);

// Click handler on scrapbook for removal
els.saved.addEventListener('click', (e) => {
    const btn = e.target.closest('.pc-saved-card-remove');
    if (!btn) return;
    const card = btn.closest('.pc-saved-card');
    if (!card) return;
    const id = card.dataset.patternId;
    removeFromSaved(id);
});



function setMode(mode) {
    currentMode = mode;

    // Button highlighting
    Object.values(tabs).forEach(btn => {
        if (!btn) return;
        btn.classList.remove('is-active');
    });

    if (mode === 'simple' && tabs.simple) {
        tabs.simple.classList.add('is-active');
    } else if (mode === 'similar' && tabs.similar) {
        tabs.similar.classList.add('is-active');
    } else if (mode === 'contrast' && tabs.contrast) {
        tabs.contrast.classList.add('is-active');
    }

    // Section visibility
    if (mode === 'simple') {
        // Deck on, panels off
        els.empty.style.display = currentDraw.length ? 'none' : '';
        els.deck.style.display = 'flex';

        if (panels.similar) {
            panels.similar.style.display = 'none';
            panels.similar.hidden = true;
        }
        if (panels.contrast) {
            panels.contrast.style.display = 'none';
            panels.contrast.hidden = true;
        }
    } else {
        // Deck off, both panels off, then switch the one we care about on
        els.empty.style.display = 'none';
        els.deck.style.display = 'none';

        ['similar', 'contrast'].forEach(key => {
            const panel = panels[key];
            if (!panel) return;
            panel.style.display = 'none';
            panel.hidden = true;
        });

        const activePanel = panels[mode];
        if (activePanel) {
            activePanel.style.display = 'block';
            activePanel.hidden = false;
        }

        renderRelationPanel(mode);
    }
    // Update Simple/Deck tab art + label based on mode
    updateSimpleTabAppearance();
}

function getSelectedPattern() {
    if (!selectedPatternId) return null;
    return getPatternById(selectedPatternId);
}

function findSimilarPatterns(base) {
    if (!base || !manifest || !manifest.patterns) return [];
    const baseTags = new Set((base.tags || []).map(String));

    return manifest.patterns.filter(p => {
        if (p === base) return false;
        const tags = (p.tags || []).map(String);
        return tags.some(t => baseTags.has(t));
    });
}

function findContrastPatterns(base) {
    if (!base || !manifest || !manifest.patterns) return [];
    const baseTags = new Set((base.tags || []).map(String));

    return manifest.patterns.filter(p => {
        if (p === base) return false;
        const tags = (p.tags || []).map(String);

        // If either side has no tags, treat as "wildcard contrast"
        if (!tags.length || !baseTags.size) {
            return true;
        }
        // Contrast = no overlapping tags
        return !tags.some(t => baseTags.has(t));
    });
}

function renderRelationPanel(mode) {
    const panelKey = mode === 'contrast' ? 'contrast' : 'similar';
    const panel = panels[panelKey];
    if (!panel) return;

    const inner = panel.querySelector('.pc-panel-inner');
    if (!inner) return;

    inner.innerHTML = '';

    const base = getSelectedPattern();

    const title = document.createElement('h2');
    title.className = 'pc-panel-title';
    title.textContent = panelKey === 'similar'
        ? 'Similar Patterns'
        : 'Contrasting Patterns';

    const subtitle = document.createElement('p');
    subtitle.className = 'pc-panel-subtitle';

    if (!base) {
        subtitle.textContent = 'Select a pattern from the Deck or Scrapbook to see related suggestions.';
        inner.append(title, subtitle);
        return;
    }

    subtitle.textContent = `${base.title || base.name || 'Selected pattern'} (${base.category || 'Uncategorized'})`;

    const list = document.createElement('div');
    list.className = 'pc-panel-cards';

    const pool = panelKey === 'similar'
        ? findSimilarPatterns(base)
        : findContrastPatterns(base);

    if (!pool.length) {
        const msg = document.createElement('p');
        msg.textContent = 'No matches found in the current manifest. Try another pattern.';
        inner.append(title, subtitle, msg);
        return;
    }

    pool.forEach(p => {
        const card = makeCard(p, { context: 'panel' });
        if (p.id != null) {
            card.dataset.patternId = String(p.id);
        } else if (p.title) {
            card.dataset.patternId = String(p.title);
        }
        list.appendChild(card);
    });

    inner.append(title, subtitle, list);
}

// Called after any card selection change
function updateSimilarAndContrastPanels() {
    if (currentMode === 'similar' || currentMode === 'contrast') {
        renderRelationPanel(currentMode);
    }
}





async function boot() {
    manifest = await loadManifest('Images/patterns.json');
    defaults = manifest.defaults || {};
    buttonsByCat = manifest.buttons || {};

    // Always start fresh
    currentDraw = [];
    savedSet = new Set();

    showWelcome();
    renderSaved(); // harmless but consistent

    // --- Initial state ---
    setMode('simple'); // deck mode is the starting mode

    // --- Tab wiring ---

    // SIMPLE DRAW TAB
    // SIMPLE / DECK TAB
    tabs.simple?.addEventListener('click', (e) => {
        e.preventDefault();

        // Whenever we land back on Deck, restore the main scrapbook look
        document.documentElement.style.setProperty(
            '--pc-main-background',
            'url(\'../Images/paper_doodles.png\') center/1024px auto repeat'
        );
        pcLogoImg[0].setAttribute('src', 'Images/pc_logo.png');
        pcTape[0].setAttribute('src', 'Images/tapes/tape_yellow_left_tilt.png');

        if (currentMode === 'simple') {
            // In Simple mode, this tab is "Simple Draw" → actually deal 3 cards
            setMode('simple');   // ensure highlighting is correct
            onSimpleDraw();
        } else {
            // In Similar / Contrast modes, this tab is "Deck"
            // → just go back to the Deck view, no new draw
            setMode('simple');

            // If there are no cards yet, let the welcome text show
            els.empty.style.display = currentDraw.length ? 'none' : '';
        }
    });


    // SIMILAR TAB
    tabs.similar?.addEventListener('click', (e)=>{
        e.preventDefault();
        setMode('similar');
        document.documentElement.style.setProperty('--pc-main-background',
            'url(\'../Images/similar_patterns_bg.png\') center/1024px auto repeat');
        pcLogoImg[0].setAttribute('src', 'Images/sp_logo.png');
        pcTape[0].setAttribute('src', 'Images/tapes/tape_blue_straight.png');
        // panel auto-renders based on selectedPatternId
        updateSimilarAndContrastPanels();
    });

    // CONTRAST TAB
    tabs.contrast?.addEventListener('click', (e)=>{
        e.preventDefault();
        setMode('contrast');
        document.documentElement.style.setProperty('--pc-main-background',
            'url(\'../Images/contrasting_patterns_bg.png\') center/1024px auto repeat');
        pcLogoImg[0].setAttribute('src', 'Images/contp_logo.png');
        pcTape[0].setAttribute('src', 'Images/tapes/tape_orange_straight.png');
        updateSimilarAndContrastPanels();
    });

    // CREDITS TAB
    tabs.credits?.addEventListener('click',(e)=>{
        e.preventDefault();
        openCredits();
    });
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

function getSavedLabelImage(p) {
    const cat = (p.category || '').toLowerCase();
    return CATEGORY_LABEL_IMAGES[cat] || CATEGORY_LABEL_IMAGES.progression;
}

// ===== Memory & state management =====

let currentDraw = [];        // patterns currently on the left
let savedSet    = new Set(); // pattern ids currently in the scrapbook
// Tracks where a pattern was added from: 'simple' | 'similar' | 'contrast'
let savedOrigins = {};

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        // localStorage may be unavailable; ignore
    }
}

function hydrateState() {
    // restore current draw from ids
    const currentIds = loadJSON(KEYS.currentDraw, []);
    currentDraw = Array.isArray(currentIds)
        ? currentIds.map(getPatternById).filter(Boolean)
        : [];

    // restore saved scrapbook ids
    const savedIds = loadJSON(KEYS.saved, []);
    if (Array.isArray(savedIds)) {
        savedSet = new Set(
            savedIds
                .map(id => String(id))
                .filter(Boolean)
        );
    } else {
        savedSet = new Set();
    }
}

function persistCurrentDraw() {
    const ids = currentDraw
        .map(p => p && (p.id ?? p.title))
        .filter(Boolean)
        .map(String);
    saveJSON(KEYS.currentDraw, ids);
}

function persistSaved() {
    const ids = Array.from(savedSet);
    saveJSON(KEYS.saved, ids);
}

// Deck rendering (left side)


function getCurrentUsedCount() {
    // Unique ids of everything currently “in play”
    const ids = new Set(savedSet);
    currentDraw.forEach(p => {
        if (!p) return;
        const id = p.id ?? p.title;
        if (id != null) ids.add(String(id));
    });
    return ids.size;
}


// Random draw helper for Simple Draw
function drawRandomPatterns(n) {
    const poolSource = (manifest && Array.isArray(manifest.patterns))
        ? manifest.patterns
        : [];

    if (!poolSource.length) return [];

    // Don’t redraw anything that’s already in the deck or saved
    const usedIds = new Set();
    currentDraw.forEach(p => {
        if (!p) return;
        const id = p.id ?? p.title;
        if (id != null) usedIds.add(String(id));
    });
    savedSet.forEach(id => usedIds.add(String(id)));

    const available = poolSource.filter(p => {
        const id = p && (p.id ?? p.title);
        if (id == null) return false;
        return !usedIds.has(String(id));
    });

    if (!available.length) {
        return [];
    }

    // Shuffle
    const pool = [...available];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const target = Math.min(n, pool.length);
    return pool.slice(0, target);
}
