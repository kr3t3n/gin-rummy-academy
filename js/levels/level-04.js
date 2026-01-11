/**
 * Level 4: Meld or Not
 * Combined meld recognition - sort hand into melds vs deadwood
 */

import { Level } from './level-engine.js';
import { createCard, renderCard, shuffle, SUITS, RANKS } from '../cards.js';
import { findOptimalMelds, calculateDeadwood, isValidMeld } from '../melds.js';

/**
 * Generates a hand with known melds and deadwood
 */
function generateHand() {
  // Create a hand with clear melds
  const hand = [];
  const suits = shuffle([...SUITS]);

  // Add a set: three 7s
  hand.push(createCard(suits[0], '7'));
  hand.push(createCard(suits[1], '7'));
  hand.push(createCard(suits[2], '7'));

  // Add a run: 4-5-6 of one suit
  hand.push(createCard(suits[0], '4'));
  hand.push(createCard(suits[0], '5'));
  hand.push(createCard(suits[0], '6'));

  // Add deadwood: 4 unrelated cards
  hand.push(createCard(suits[1], 'K'));  // 10 pts
  hand.push(createCard(suits[2], '2'));  // 2 pts
  hand.push(createCard(suits[3], '9'));  // 9 pts
  hand.push(createCard(suits[3], 'A'));  // 1 pt

  return shuffle(hand);
}

/**
 * Determines which cards should be in melds
 * @param {Array} hand
 * @returns {Set} Set of card IDs that belong in melds
 */
function getMeldCardIds(hand) {
  const { melds } = findOptimalMelds(hand);
  const meldIds = new Set();

  for (const meld of melds) {
    for (const card of meld.cards) {
      meldIds.add(card.id);
    }
  }

  return meldIds;
}

export class Level04 extends Level {
  constructor() {
    super({
      number: 4,
      title: 'Meld or Not',
      subtitle: 'Sort your hand',
      instructions: 'Drag each card to the correct zone: Meld (sets/runs) or Deadwood (unmatched)',
      passingScore: 10,
      starThresholds: { threeStarMax: 0, twoStarMax: 2 }
    });

    this.hand = [];
    this.meldCardIds = new Set();
    this.cardsSorted = 0;
    this.errors = 0;
  }

  init(gameArea) {
    // Generate hand
    this.hand = generateHand();
    this.meldCardIds = getMeldCardIds(this.hand);

    // Calculate expected deadwood
    const { deadwood } = findOptimalMelds(this.hand);
    this.expectedDeadwood = calculateDeadwood(deadwood);

    // Hand area
    const handArea = document.createElement('div');
    handArea.className = 'hand spread';
    handArea.id = 'hand-area';
    handArea.dataset.dropZone = 'hand';
    handArea.style.marginBottom = 'clamp(16px, 4vw, 24px)';

    // Render cards
    for (const card of this.hand) {
      const cardEl = renderCard(card, { draggable: true });
      handArea.appendChild(cardEl);
    }

    gameArea.appendChild(handArea);

    // Drop zones
    const zonesContainer = document.createElement('div');
    zonesContainer.style.cssText = `
      display: flex;
      gap: clamp(12px, 3vw, 20px);
      justify-content: center;
      flex-wrap: wrap;
      width: 100%;
    `;

    // Meld zone
    const meldZone = this.createDropZone('meld', 'Melds', 'Sets & Runs');
    zonesContainer.appendChild(meldZone);

    // Deadwood zone
    const deadwoodZone = this.createDropZone('deadwood', 'Deadwood', 'Unmatched cards');
    zonesContainer.appendChild(deadwoodZone);

    gameArea.appendChild(zonesContainer);

    // Result display (hidden initially)
    const result = document.createElement('div');
    result.id = 'result-display';
    result.style.cssText = `
      margin-top: 16px;
      text-align: center;
      display: none;
    `;
    gameArea.appendChild(result);

    this.updateProgress(`Sort all 10 cards`);
  }

  createDropZone(id, label, sublabel) {
    const zone = document.createElement('div');
    zone.className = 'value-bucket';
    zone.dataset.dropZone = id;
    zone.dataset.zoneId = id;
    zone.style.minWidth = '140px';
    zone.style.minHeight = 'calc(var(--card-height) + 80px)';

    zone.innerHTML = `
      <div class="bucket-label">${label}</div>
      <div class="bucket-sublabel">${sublabel}</div>
      <div class="bucket-cards" data-zone-cards="${id}"></div>
    `;

    // Drag over handling
    document.addEventListener('carddragmove', (e) => {
      const { x, y } = e.detail;
      const rect = zone.getBoundingClientRect();
      const isOver = x >= rect.left && x <= rect.right &&
                     y >= rect.top && y <= rect.bottom;
      zone.classList.toggle('drag-over', isOver);
    });

    document.addEventListener('carddragend', () => {
      zone.classList.remove('drag-over');
    });

    // Handle drops
    zone.addEventListener('carddrop', (e) => {
      const { card, element } = e.detail;
      this.handleDrop(card, element, id, zone);
    });

    return zone;
  }

  handleDrop(card, element, zoneId, zoneEl) {
    const cardsArea = zoneEl.querySelector('.bucket-cards');
    const shouldBeMeld = this.meldCardIds.has(card.id);
    const isCorrect = (zoneId === 'meld' && shouldBeMeld) ||
                      (zoneId === 'deadwood' && !shouldBeMeld);

    if (isCorrect) {
      cardsArea.appendChild(element);
      element.style.pointerEvents = 'none';
      this.showCorrect(element);
      this.cardsSorted++;

      // Brief explanation
      if (shouldBeMeld) {
        this.showExplanation(`Correct! This ${card.rank} is part of a meld.`, 'success');
      } else {
        this.showExplanation(`Correct! This ${card.rank} is deadwood (${card.value} points).`, 'success');
      }
    } else {
      this.errors++;
      this.showIncorrect(element);

      // Return to hand
      const hand = document.getElementById('hand-area');
      hand.appendChild(element);

      // Explain
      if (shouldBeMeld) {
        this.showExplanation(`Not quite. This ${card.rank} can form a meld with other cards.`, 'error');
      } else {
        this.showExplanation(`Not quite. This ${card.rank} doesn't complete any meld.`, 'error');
      }
    }

    this.updateProgress(`${this.cardsSorted}/10 sorted`);

    // Check if all sorted
    if (this.cardsSorted === 10) {
      this.showResult();
    }
  }

  showResult() {
    // Calculate actual deadwood from deadwood zone
    const deadwoodZone = document.querySelector('[data-zone-cards="deadwood"]');
    const deadwoodCards = deadwoodZone.querySelectorAll('.card');
    let actualDeadwood = 0;
    for (const cardEl of deadwoodCards) {
      actualDeadwood += parseInt(cardEl.dataset.value, 10);
    }

    const result = document.getElementById('result-display');
    result.style.display = 'block';
    result.innerHTML = `
      <div style="font-size: clamp(18px, 4vw, 24px); font-weight: 600; margin-bottom: 8px;">
        Deadwood: ${actualDeadwood} points
      </div>
      <div style="color: var(--text-muted); font-size: clamp(12px, 2.5vw, 14px);">
        ${this.errors === 0 ? 'Perfect sort!' : `${this.errors} mistake(s) along the way`}
      </div>
    `;

    // Complete level
    this.score = 10 - this.errors;
    const passed = this.errors === 0;

    if (passed) {
      this.showExplanation(
        `Perfect! You correctly identified all melds and deadwood.`,
        'success'
      );
    }

    setTimeout(() => this.complete(passed), 1000);
  }

  reset() {
    this.hand = [];
    this.meldCardIds = new Set();
    this.cardsSorted = 0;
    this.errors = 0;
    super.reset();
  }
}

export default Level04;
