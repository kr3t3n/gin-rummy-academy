# Gin Rummy Academy - Game Design Document

## Concept
A progressive tutorial game that teaches Gin Rummy through interactive challenges. Each level introduces one concept, with hands-on practice before moving on.

## Core Design Principles
1. **One concept per level** - Never overwhelm
2. **Learn by doing** - Minimal text, maximum interaction
3. **Immediate feedback** - Show why something is right/wrong
4. **Spaced repetition** - Revisit concepts in later levels
5. **No failure state** - Hints available, retry unlimited

---

## Gin Rummy Rules Summary

### Setup
- 2 players, standard 52-card deck (no jokers)
- Each player gets 10 cards
- Remaining cards form draw pile, top card flipped to start discard pile

### Card Values (for scoring deadwood)
- Ace = 1 point
- 2-10 = face value
- J/Q/K = 10 points each

### Melds (valid combinations)
- **Sets (Groups):** 3-4 cards of same rank (e.g., 7♠ 7♥ 7♦)
- **Runs (Sequences):** 3+ consecutive cards of same suit (e.g., 4♥ 5♥ 6♥)
- Ace is always low (A-2-3 valid, Q-K-A invalid)
- Each card can only belong to ONE meld

### Deadwood
- Cards not in any meld
- Goal: minimize deadwood points

### Turn Structure
1. Draw one card (from draw pile OR discard pile)
2. Optionally: Knock or declare Gin
3. Discard one card

### Ending a Round

**Knocking:** When deadwood ≤ 10 points, you can knock
- Lay down your melds
- Opponent can "lay off" their deadwood onto YOUR melds
- Lower deadwood wins; winner scores the difference

**Going Gin:** Zero deadwood
- 25 bonus points
- Opponent CANNOT lay off cards
- Opponent CANNOT undercut

**Undercut:** Defender has ≤ knocking player's deadwood
- Defender wins and gets 10-25 bonus points

### Scoring
- Knock win: Difference in deadwood
- Gin: 25 + opponent's full deadwood
- Undercut: 10-25 bonus + difference
- Game to 100 points (or other target)

---

## Level Structure

### Chapter 1: The Basics

#### Level 1: Meet the Deck
**Concept:** Card values for deadwood
**Challenge:** Sort cards into point values (1, 2-10, 10)
**Interaction:** Drag cards to correct buckets
**Success:** 8/10 correct

#### Level 2: Spot the Set
**Concept:** Sets (groups of same rank)
**Challenge:** Identify valid sets from card groups
**Interaction:** Tap groups that are valid sets
**Success:** Find all 5 sets, no false positives

#### Level 3: Run for It
**Concept:** Runs (sequences in same suit)
**Challenge:** Identify valid runs from card groups
**Interaction:** Tap groups that are valid runs
**Gotcha:** Show A-2-3 (valid) vs Q-K-A (invalid)
**Success:** Find all 5 runs, no false positives

#### Level 4: Meld or Not?
**Concept:** Combined meld recognition
**Challenge:** Sort a hand into melds vs deadwood
**Interaction:** Drag cards to "Meld" or "Deadwood" zones
**Success:** Perfect sort of 10-card hand

### Chapter 2: Playing the Game

#### Level 5: Count Your Deadwood
**Concept:** Calculating deadwood points
**Challenge:** Given hands with melds marked, calculate deadwood total
**Interaction:** Number input or multiple choice
**Success:** 5 correct calculations

#### Level 6: The Draw
**Concept:** Drawing from deck vs discard pile
**Challenge:** Scenarios where one choice is clearly better
**Interaction:** Choose "Draw Pile" or "Discard Pile"
**Teaching:** Explain why after each choice
**Success:** 4/5 correct with understanding

#### Level 7: The Discard
**Concept:** What to throw away
**Challenge:** Given a hand and goal, pick best discard
**Interaction:** Tap card to discard
**Teaching:** Show deadwood reduction after choice
**Success:** 5 good discards

### Chapter 3: Ending the Round

#### Level 8: Knock Knock
**Concept:** When you CAN knock (≤10 deadwood)
**Challenge:** Determine if hands are knock-eligible
**Interaction:** Yes/No per hand
**Success:** 6/6 correct

#### Level 9: Should You Knock?
**Concept:** Strategic knocking decisions
**Challenge:** Given game state, decide knock vs continue
**Teaching:** Risk of opponent ginning vs undercut
**Success:** 4/5 strategically sound decisions

#### Level 10: Going Gin
**Concept:** Zero deadwood and its benefits
**Challenge:** Arrange hand to achieve Gin
**Interaction:** Drag cards to form melds, verify Gin
**Success:** Achieve Gin with 3 different hands

#### Level 11: The Layoff
**Concept:** Adding deadwood to opponent's melds after knock
**Challenge:** Find all valid layoffs
**Interaction:** Drag your deadwood to opponent's melds
**Success:** Find all layoff opportunities (3 scenarios)

#### Level 12: Undercut!
**Concept:** Beating the knocker with lower deadwood
**Challenge:** Calculate if undercut is possible
**Scenarios:** Show hands, determine winner and score
**Success:** 5/5 correct winner + score

### Chapter 4: Scoring & Strategy

#### Level 13: Score the Round
**Concept:** Full round scoring
**Challenge:** Given end states, calculate exact scores
**Includes:** Knock wins, Gin bonus, undercut bonus
**Success:** 4/4 perfect scores

#### Level 14: Triangle Theory
**Concept:** Building flexible card combinations
**Challenge:** Identify "triangles" (cards that could form multiple melds)
**Example:** 7♥ 7♠ 8♥ - could become set OR run
**Success:** Find triangles in 4 hands

#### Level 15: Reading Discards
**Concept:** Opponent tells from their discards
**Challenge:** Deduce what opponent might be collecting
**Interaction:** Multiple choice predictions
**Success:** 3/4 correct reads

#### Level 16: Safe Discards
**Concept:** Minimizing what you give opponent
**Challenge:** Pick safest discard based on game state
**Teaching:** Recently discarded cards are "safe"
**Success:** 4/5 safe choices

### Chapter 5: Full Game

#### Level 17: Guided Game
**Concept:** Complete game with hints
**Flow:** Play full game, hints highlight good moves
**Success:** Complete one game

#### Level 18: Solo Practice
**Concept:** Play without training wheels
**Flow:** Full game vs AI, no hints
**Success:** Win one game

#### Level 19: Challenge Mode
**Concept:** Specific scenarios to solve
**Challenges:**
- Win with a Gin
- Successfully undercut
- Win with under 5 deadwood knock
**Success:** Complete all 3 challenges

#### Level 20: Ready to Play!
**Concept:** Graduation
**Content:** Summary of all concepts, link to play vs Adelina
**Unlocks:** Two-player mode

---

## UI/UX Design

### Visual Style
- Clean, minimal, card-focused
- Dark background, bright cards
- Subtle animations for feedback
- Mobile-first touch targets

### Card Design
- Large, readable
- Clear suit colors (red/black)
- Touch-friendly size on mobile

### Feedback System
- Green glow = correct
- Red shake = incorrect
- Particle effect = perfect/Gin
- Progress bar per level
- Stars (1-3) based on attempts

### Navigation
- Chapter overview screen
- Levels unlock sequentially
- Can replay any completed level
- Progress saved to localStorage

---

## Technical Implementation

### Stack
- Vanilla JavaScript (no framework needed)
- HTML5 Canvas for card rendering
- CSS animations for UI
- localStorage for progress

### File Structure
```
/gin-rummy-learn
  index.html          # Entry point
  /css
    main.css          # Global styles
    cards.css         # Card styling
    levels.css        # Level UI
  /js
    app.js            # Main app logic
    cards.js          # Card/deck utilities
    melds.js          # Meld detection logic
    levels/
      level-01.js     # Each level is a module
      level-02.js
      ...
    ui.js             # UI components
    progress.js       # Save/load progress
  /assets
    /cards            # Card images or CSS sprites
```

### Core Systems
1. **Card System:** Deck generation, shuffling, dealing
2. **Meld Detection:** Algorithm to find valid melds in hand
3. **Deadwood Calculator:** Sum unmelded card values
4. **Level Engine:** Load level config, track completion
5. **AI Opponent:** Simple AI for practice games

---

## Sources

- [Gin Rummy Palace - Rules](https://www.ginrummy-palace.com/gin-rummy-rules/)
- [Official Game Rules - Gin Rummy](https://officialgamerules.org/game-rules/gin-rummy/)
- [Gin Rummy Palace - Strategy](https://www.ginrummy-palace.com/gin-rummy-strategies/)
- [Bar Games 101 - Strategy Tips](https://bargames101.com/gin-rummy-strategies/)
- [Gamification Progressive Challenge Pattern](https://www.linkedin.com/pulse/gamification-progressive-challenge-design-pattern-robert-bilyk)
- [eLearning Industry - Gamification Design](https://elearningindustry.com/gamification-design-elements-for-learning)
