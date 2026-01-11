# Gin Rummy Academy

Progressive tutorial game teaching Gin Rummy through 20 interactive levels.

## Live URL
https://gin-rummy-learn.vercel.app/

## Project Structure

```
/css
  main.css              # All styles, CSS variables, responsive design
/js
  app.js                # Main app, level metadata, navigation, progress
  cards.js              # Card creation, rendering, drag/drop system
  melds.js              # Meld validation, deadwood calculation
  /levels
    level-engine.js     # Base Level class all levels extend
    level-01.js         # Card Values
    level-02.js         # Spot the Set
    ...
    level-11-20.js      # Levels 11-20 (combined file)
index.html              # Entry point
DESIGN.md               # Original design document
PRD.json                # Requirements tracker with story completion status
progress.txt            # Development session log
```

## Architecture

### Level System
All levels extend the base `Level` class from `level-engine.js`:

```javascript
class LevelXX extends Level {
  constructor() {
    super({
      number: X,
      title: 'Title',
      subtitle: 'Subtitle',
      instructions: 'What to do',
      passingScore: N,
      starThresholds: { threeStarMax: 0, twoStarMax: 1 }
    });
  }

  init(gameArea) { }      // Setup level, generate content
  reset() { }             // Clean up for replay
}
```

### Card System (`cards.js`)
- `createCard(suit, rank)` - Creates card object with id, suit, rank, value
- `renderCard(card, options)` - Returns DOM element with proper styling
- Drag/drop via custom events: `carddragstart`, `carddragmove`, `carddragend`, `carddrop`
- Standard 2.5:3.5 ratio enforced via CSS `--card-width` variable

### Meld Validation (`melds.js`)
- `isValidMeld(cards)` - Returns `{valid, type}` for set/run validation
- `findOptimalMelds(cards)` - Finds best meld arrangement
- `calculateDeadwood(cards)` - Sums unmelded card values

### App Metadata (`app.js`)
Level intros and metadata stored in `LEVEL_DATA` object:
```javascript
LEVEL_DATA[14] = {
  title: 'Triangle Theory',
  emoji: '🔺',
  chapter: 'Advanced Tactics',
  intro: `...`,
  lesson: '...'
}
```

## Common Bugs & Fixes

### DOM Selector Specificity
**Problem**: Generic selectors like `querySelector('span')` can match unintended elements.
**Solution**: Add specific classes (e.g., `.meld-label`) and use targeted selectors.

Example from Level 10:
```javascript
// BAD - matches any span including card rank
const lbl = zone.querySelector('span');

// GOOD - matches only the label
const label = document.createElement('span');
label.className = 'meld-label';
// ...
const lbl = zone.querySelector('.meld-label');
```

### Placeholder/Stub Levels
**Problem**: Some levels in `level-11-20.js` are stubs that just show tips.
**Solution**: Implement proper interactive scenarios following the pattern of working levels.

Stub pattern to replace:
```javascript
// BAD - stub that just shows tips
init(gameArea) {
  this.showTip(gameArea, 0);
}
showTip(gameArea, index) {
  // Just shows text and "Got it!" button
}
```

### Card Generation
**Problem**: Hands that are impossible to complete (e.g., Gin hands that can't actually form Gin).
**Solution**: Manually verify all generated scenarios are solvable.

## CSS Variables

Key variables in `main.css`:
```css
--card-width: clamp(50px, 12vw, 80px);
--card-height: calc(var(--card-width) * 1.4);  /* 2.5:3.5 ratio */
--bg-dark: #1a1d23;
--accent: #e94560;
--success: #00d26a;
--error: #ff6b6b;
--text-light: #e8e8e8;
--text-muted: #8a8a8a;
```

## Development Workflow

1. Run local server: `python -m http.server 8080`
2. Test at: http://localhost:8080
3. Browser hard reload after changes: `Cmd+Shift+R`
4. Vercel auto-deploys on push to main

## Level Types by Pattern

### Selection Levels (1, 2, 3, 4)
User taps cards to select, then validates selection.

### Choice Levels (6, 9, 14)
User chooses between options (draw/discard, knock/continue, pick correct card).

### Drag & Drop Levels (5, 10)
User drags cards into zones to arrange melds.

### Calculation Levels (5, 8, 13)
User calculates and enters a number (deadwood, score).

## Testing Checklist

- [ ] Cards display with proper 2.5:3.5 ratio
- [ ] Card ranks visible (not clipped)
- [ ] Drag and drop works on mobile (touch events)
- [ ] Level completes and shows results
- [ ] Progress saves to localStorage
- [ ] Works on 320px mobile viewport

## Git Workflow

Commits follow pattern:
```
Fix Level X: brief description of what was fixed
Add Level X: new level implementation
Update metadata: changes to app.js LEVEL_DATA
```

Always test locally before pushing - Vercel deploys automatically.
