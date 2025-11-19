# 11/9/2025
- Laid barebones structure and html/css/js files
- Copied over OutBox Games logo
- Created AI handoff folder and files
- Created GitHub Repo for sharing

# 11/12/2025
- Added: automatic board reset on load for a clean slate every session
- Changed: replaced initial drawThreeRandom() with render() so the Welcome screen now displays on startup
- Improved: scrapbook logic now dedupes properly and removes cards after saving
- Fixed: lingering .is-active tab states now reset correctly when switching tabs
- Polish: refined tab overlap and active tilt for a more authentic scrapbook feel

# 11/13/2025, 11/14/2025, and 11/15/2025
- Added two new pattern cards to the manifest
- Restored meta viewport for proper device scaling
- Cleaned and consolidated media queries
- Tabs resized and realigned for iPhone widths
- Banner width tuned via --pc-banner-width
- Welcome text adjusted for readability on small screens
- Resolved issue where only one card appeared during Simple Draw due to manifest only containing one pattern.
- Image clipping fixed temporarily by reducing diagram size (temporary workaround for tired brain mode 😄).
- Full card-height increase deferred for tomorrow’s session.
- System now stable and responsive on desktop + mobile.
- Next up: balanced category set + expanding the pattern deck.

# 11/16/2025, 11/17/2025, 11/18/2025, and 11/19/2025
-Added mode-aware Simple/Deck tab behavior (Simple Draw in simple mode, Deck toggle in other modes).
-Implemented tab art swap between tab_simple.png and tab_deck.png.
-Added panel context system to makeCard() (distinguishes deck cards from panel cards).
-Removed X/remove buttons from Similar and Contrast cards.
-Prevented panel cards from acting as selectable “base” patterns.
-Restricted selection behavior so only deck cards can update Similar/Contrast results.
-Added “Similar” and “Contrast” badges to saved cards to show their origin.
-Added toast notifications for “Added to Scrapbook” and “Already in Scrapbook”.
-Added Press and Hold diagram scaling override with pc-card-img-press-hold class.
-Cleaned up deck filtering duplication (removed double filter logic).
-Adjusted long-pattern-name label rendering on saved cards (multi-line OK).
-Added better handling of panel rendering and deck rendering state.
-Updated rendering functions to respect new context flags.
-Performed multiple layout tests around welcome message behavior.
-Determined welcome screen pushing behavior is acceptable and left as-is after mobile conflicts.
-Verified iOS blank-screen issue was caused by IP address mismatch, not code.
-Validated state persistence and scrapbook rendering after recent feature additions.