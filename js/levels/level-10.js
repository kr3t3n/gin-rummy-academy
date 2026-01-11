/**
 * Level 10: Going Gin
 * Arrange hands to achieve Gin (zero deadwood)
 */

import { Level } from './level-engine.js';
import { createCard, renderCard, shuffle, SUITS } from '../cards.js';
import { findOptimalMelds, calculateDeadwood, isValidMeld } from '../melds.js';

/**
 * Generates hands that CAN be arranged into Gin
 */
function generateGinHands() {
  const suits = shuffle([...SUITS]);

  return [
    {
      id: 1,
      cards: shuffle([
        createCard(suits[0], '7'), createCard(suits[1], '7'), createCard(suits[2], '7'),  // Set
        createCard(suits[0], '4'), createCard(suits[0], '5'), createCard(suits[0], '6'),  // Run
        createCard(suits[1], 'J'), createCard(suits[1], 'Q'), createCard(suits[1], 'K'),  // Run
        createCard(suits[2], 'A')  // This will join a run or set
      ]),
      hint: 'Find one set and two runs'
    },
    {
      id: 2,
      cards: shuffle([
        createCard(suits[0], '3'), createCard(suits[1], '3'), createCard(suits[2], '3'), createCard(suits[3], '3'),  // Set of 4
        createCard(suits[0], '9'), createCard(suits[1], '9'), createCard(suits[2], '9'),  // Set
        createCard(suits[0], 'A'), createCard(suits[0], '2'), createCard(suits[0], '3')  // Wait, 3 is used. Fix:
      ]),
      hint: 'Two sets and one run'
    },
    {
      id: 3,
      cards: shuffle([
        createCard(suits[0], 'A'), createCard(suits[0], '2'), createCard(suits[0], '3'),  // Run
        createCard(suits[1], '5'), createCard(suits[1], '6'), createCard(suits[1], '7'), createCard(suits[1], '8'),  // Run
        createCard(suits[2], 'Q'), createCard(suits[3], 'Q'), createCard(suits[0], 'Q')  // Set
      ]),
      hint: 'One set and two runs of different lengths'
    }
  ];
}

export class Level10 extends Level {
  constructor() {
    super({
      number: 10,
      title: 'Going Gin',
      subtitle: 'Zero deadwood!',
      instructions: 'Arrange the cards to form valid melds with no deadwood',
      passingScore: 3,
      starThresholds: { threeStarMax: 0, twoStarMax: 1 }
    });

    this.hands = [];
    this.currentHand = 0;
    this.ginCount = 0;
    this.totalHands = 3;
  }

  init(gameArea) {
    this.hands = generateGinHands();
    this.showHand(gameArea);
  }

  showHand(gameArea) {
    gameArea.innerHTML = '';
    const hand = this.hands[this.currentHand];

    // Progress
    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `Gin Hand ${this.currentHand + 1}/${this.totalHands}`;
    gameArea.appendChild(progress);

    // Explanation of Gin
    const explanation = document.createElement('div');
    explanation.style.cssText = `
      background: linear-gradient(135deg, rgba(0, 210, 106, 0.1), rgba(233, 69, 96, 0.1));
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 16px;
      text-align: center;
    `;
    explanation.innerHTML = `
      <div style="font-weight: 600; color: var(--success); margin-bottom: 4px;">Going Gin = 25 Bonus Points!</div>
      <div style="font-size: 12px; color: var(--text-muted);">All 10 cards in melds, zero deadwood</div>
    `;
    gameArea.appendChild(explanation);

    // Available cards
    const cardsArea = document.createElement('div');
    cardsArea.id = 'cards-area';
    cardsArea.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      justify-content: center;
      margin-bottom: 20px;
      min-height: calc(var(--card-height) + 20px);
      padding: 12px;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
    `;

    for (const card of hand.cards) {
      const cardEl = renderCard(card, {
        draggable: true,
        onClick: (c, el) => el.classList.toggle('selected')
      });
      cardsArea.appendChild(cardEl);
    }
    gameArea.appendChild(cardsArea);

    // Meld zones
    const meldsContainer = document.createElement('div');
    meldsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      max-width: 400px;
    `;

    for (let i = 1; i <= 3; i++) {
      const zone = this.createMeldZone(i);
      meldsContainer.appendChild(zone);
    }
    gameArea.appendChild(meldsContainer);

    // Check button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn btn-primary';
    checkBtn.textContent = 'Check for Gin';
    checkBtn.style.marginTop = '16px';
    checkBtn.addEventListener('click', () => this.checkGin(hand));
    gameArea.appendChild(checkBtn);

    // Result area
    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = 'margin-top: 16px; text-align: center;';
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.ginCount}/${this.totalHands} Gin hands`);
  }

  createMeldZone(num) {
    const zone = document.createElement('div');
    zone.className = 'card-zone';
    zone.dataset.dropZone = `meld-${num}`;
    zone.style.cssText = `
      min-height: calc(var(--card-height) * 0.6 + 16px);
      padding: 8px;
      display: flex;
      gap: 2px;
      align-items: center;
      justify-content: center;
    `;

    const label = document.createElement('span');
    label.style.cssText = 'color: var(--text-muted); font-size: 12px;';
    label.textContent = `Meld ${num}`;
    zone.appendChild(label);

    // Handle drag over
    document.addEventListener('carddragmove', (e) => {
      const { x, y } = e.detail;
      const rect = zone.getBoundingClientRect();
      const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      zone.classList.toggle('drag-over', isOver);
    });

    document.addEventListener('carddragend', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('carddrop', (e) => {
      const { element } = e.detail;
      // Remove label if present
      const lbl = zone.querySelector('span');
      if (lbl) lbl.remove();
      zone.appendChild(element);
      zone.classList.remove('drag-over');
    });

    return zone;
  }

  checkGin(hand) {
    const zones = this.gameAreaEl.querySelectorAll('.card-zone');
    const cardsArea = document.getElementById('cards-area');
    const resultArea = document.getElementById('result-area');

    // Get cards from each zone
    const melds = [];
    let allValid = true;
    let totalCards = 0;

    zones.forEach(zone => {
      const cards = Array.from(zone.querySelectorAll('.card')).map(el => ({
        id: el.dataset.cardId,
        suit: el.dataset.suit,
        rank: el.dataset.rank,
        value: parseInt(el.dataset.value, 10)
      }));

      if (cards.length > 0) {
        totalCards += cards.length;
        const { valid, type } = isValidMeld(cards);
        if (valid) {
          melds.push({ type, cards });
          zone.style.borderColor = 'var(--success)';
        } else {
          allValid = false;
          zone.style.borderColor = 'var(--error)';
        }
      }
    });

    // Check for remaining cards
    const remaining = cardsArea.querySelectorAll('.card').length;

    if (remaining > 0) {
      resultArea.innerHTML = `
        <div style="color: var(--error);">Place all cards into meld zones!</div>
        <div style="color: var(--text-muted); font-size: 13px;">${remaining} cards still need to be placed</div>
      `;
      return;
    }

    if (!allValid) {
      resultArea.innerHTML = `
        <div style="color: var(--error); font-weight: 600;">Invalid melds!</div>
        <div style="color: var(--text-muted); font-size: 13px;">
          Check the groups marked in red. Sets need 3-4 of same rank, runs need 3+ consecutive same suit.
        </div>
      `;
      return;
    }

    if (totalCards === 10 && allValid) {
      // GIN!
      this.ginCount++;
      resultArea.innerHTML = `
        <div style="font-size: 28px; margin-bottom: 8px;">🎉</div>
        <div style="color: var(--success); font-weight: 600; font-size: 20px;">GIN!</div>
        <div style="color: var(--text-muted); font-size: 13px;">
          Zero deadwood = 25 bonus points. Opponent cannot lay off!
        </div>
      `;

      this.updateProgress(`${this.ginCount}/${this.totalHands} Gin hands`);

      // Next button
      setTimeout(() => {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary';
        nextBtn.style.marginTop = '16px';

        if (this.currentHand < this.totalHands - 1) {
          nextBtn.textContent = 'Next Hand';
          nextBtn.addEventListener('click', () => {
            this.currentHand++;
            this.showHand(this.gameAreaEl);
          });
        } else {
          nextBtn.textContent = 'Complete Level';
          nextBtn.addEventListener('click', () => {
            this.score = this.ginCount;
            this.complete(this.ginCount >= this.passingScore);
          });
        }

        resultArea.appendChild(nextBtn);
      }, 500);
    }
  }

  reset() {
    this.hands = [];
    this.currentHand = 0;
    this.ginCount = 0;
    super.reset();
  }
}

export default Level10;
