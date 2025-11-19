// ===== Memory & state management =====

//let currentDraw = [];        // patterns currently on the left
//let savedSet    = new Set(); // pattern ids currently in the scrapbook
let selectedPatternId = null; // <- NEW: currently selected card (deck)

function canAddToDeck(p) {
    if (!p) return false;

    const id = String(p.id ?? p.title);
    if (!id) return false;

    // Respect global cap (deck only)
    if (currentDraw.length >= maxNumOfCards) {
        return false;
    }

    // Don’t add if it’s already in the deck
    const alreadyInDeck = currentDraw.some(c =>
        String(c.id ?? c.title) === id
    );

    return !alreadyInDeck;
}


function addCardToDeck(p) {
    if (!canAddToDeck(p)) return false;
    currentDraw.push(p);
    return true;
}

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

function getOneRandomPattern() {
    const pool = manifest.patterns;
    return pool[Math.floor(Math.random() * pool.length)];
}

function clearDeck(){
    els.deck.innerHTML = '';
    currentDraw = [];
    persistCurrentDraw();
}

function getPatternById(id) {
    if (!manifest || !manifest.patterns) return null;
    const sid = String(id);
    return manifest.patterns.find(p =>
        String(p.id) === sid || String(p.title) === sid
    ) || null;
}

function renderDeck() {
    els.deck.innerHTML = '';

    if (!currentDraw.length) {
        showWelcome();
        return;
    }

    els.empty.style.display = 'none';

    currentDraw.forEach(p => {
        const card = makeCard(p, { context: 'deck' });
        if (p.id != null) {
            card.dataset.patternId = String(p.id);
        } else if (p.title) {
            card.dataset.patternId = String(p.title);
        }
        els.deck.appendChild(card);
    });
}

// Scrapbook rendering (right side)
function renderSaved() {
    const old = els.saved.querySelectorAll('.pc-saved-card');
    old.forEach(n => n.remove());

    if (!savedSet.size) return;

    Array.from(savedSet).forEach(id => {
        const p = getPatternById(id);
        if (!p) return;

        const sid = String(p.id ?? p.title ?? id);

        const item = document.createElement('div');
        item.className = 'pc-saved-card';
        item.dataset.patternId = sid;

        // Optional origin badge (Similar / Contrast only)
        if (typeof savedOrigins !== 'undefined' && savedOrigins && savedOrigins[sid]) {
            const origin = savedOrigins[sid];
            if (origin === 'similar' || origin === 'contrast') {
                const badge = document.createElement('div');
                badge.className = 'pc-saved-card-badge' +
                    (origin === 'contrast' ? ' is-contrast' : '');
                badge.textContent = origin === 'similar' ? 'Similar' : 'Contrast';
                item.appendChild(badge);
            }
        }

        const img = document.createElement('img');
        img.className = 'pc-saved-card-img';
        img.src = getSavedLabelImage(p);
        img.alt = p.category ? `${p.category} pattern label` : 'Pattern label';

        const label = document.createElement('div');
        label.className = 'pc-saved-card-text';
        label.textContent = p.title || p.name || String(id);
        label.addEventListener('click', () => {
            const sid = String(p.id ?? p.title ?? id);

            // 1) Make sure we’re allowed to add to deck first
            if (!canAddToDeck(p)) {
                alert("You can only have " + maxNumOfCards + " Pattern cards in the deck at any given time.");
                return;
            }

            // 2) Add to deck
            if (addCardToDeck(p)) {
                persistCurrentDraw();
                renderDeck();
            }

            // 3) THEN remove from scrapbook
            removeFromSaved(sid);
        });


        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'pc-saved-card-remove';
        removeBtn.setAttribute('aria-label', 'Remove from Scrapbook');
        removeBtn.textContent = '×';

        item.append(img, label, removeBtn);
        els.saved.appendChild(item);
    });
}

// Public actions
function addToSaved(p) {
    const id = p && (p.id ?? p.title);
    if (!id) return;

    const sid = String(p.id ?? p.title);

    if (typeof selectedPatternId !== 'undefined' && selectedPatternId === sid) {
        selectedPatternId = null;
    }

    // Already saved? Just give a tiny nudge and bail
    if (savedSet.has(sid)) {
        if (typeof showToast === 'function') {
            showToast('Already in Scrapbook');
        }
        return;
    }

    // Track where this came from (simple / similar / contrast)
    if (typeof savedOrigins !== 'undefined') {
        const mode = (typeof currentMode !== 'undefined') ? currentMode : 'simple';
        savedOrigins[sid] = mode;
    }

    // Add to saved set
    savedSet.add(sid);
    persistSaved();

    // Remove from currentDraw so it disappears from the deck
    currentDraw = currentDraw.filter(q => {
        const qid = q && (q.id ?? q.title);
        return String(qid) !== sid;
    });
    persistCurrentDraw();

    // Re-render both sides
    renderDeck();
    renderSaved();

    if (typeof showToast === 'function') {
        showToast('Added to Scrapbook');
    }
}



function removeFromSaved(id) {
    if (!id) return;
    const sid = String(id);
    if (!savedSet.has(sid)) return;

    savedSet.delete(sid);
    if (typeof savedOrigins !== 'undefined' && savedOrigins[sid]) {
        delete savedOrigins[sid];
    }
    persistSaved();
    renderSaved();
}



