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

# 11/25/2025 and 11/26/2026
- Added sixteen more cards to bring total to 32 different patterns
- Added 10 custom width styles for specific illustrations to make them fit the cards on the site more.

# 11/27/2025 and 11/28/2026
- Added the other 18 cards to bring the total of game design cards to 50!
- Added 8 custom width styles for specific illustrations to make them fit the cards on the site better.

# 9/16/2026 and 9/17/2026
- Began adding another set of 16 cards to catch up with Follow the Butterflies.
- Changed the flexbox layout to make the bottom button column begin only when the middle column ends.
- Added an image resizing system to use more of the card real estate.
- Made the image size default to 75% its original size, but made 2 other presets (small and medium) for each image to fit comofortably in its card.

# 9/18/2026
- Changed the flexbox layout of the cards as a whole to a gridbox layout that shows the cards in Z order, and each card has varying height.
- Changed CSS rules to make the card display better.
- Created the images necessary to make the search function.
- Added the search bar to the "Simple Draw" and "Search" modes.
- Created the "Search" mode, and placed the images into it.
- Created the "Search" mode tab.
- Added Event Listeners for the search bar for when activated, it jumps into "Search" mode, and searches the keyword.
- Updated version to 1.1.0.52 (SimVer compliant with minor release being the Search mode).
- Added the search function functionality.
- Fixed a bug that allowed cards to stack when returning to the Deck.