/**
 * Level 1: Card Values
 * Teaches card point values by sorting cards into buckets
 */

import { Level } from './level-engine.js';
import { createDeck, shuffle, renderCard, RANK_VALUES } from '../cards.js';

/**
 * Value bucket definitions
 */
const BUCKETS = [
  { id: 'one', label: '1 Point', sublabel: 'Aces', validValues: [1] },
  { id: 'face', label: '2-10 Points', sublabel: 'Number cards', validValues: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { id: 'ten', label: '10 Points', sublabel: 'Face cards', validValues: ['face'] }
];

/**
 * Checks if a card value matches a bucket
 */
function cardMatchesBucket(cardRank, bucket) {
  const value = RANK_VALUES[cardRank];

  if (bucket.validValues.includes('face')) {
    // Face cards: J, Q, K (value 10 but not number 10)
    return ['J', 'Q', 'K'].includes(cardRank);
  }

  if (bucket.id === 'face') {
    // Number cards 2-10 (not face cards)
    return !['A', 'J', 'Q', 'K'].includes(cardRank) && value >= 2 && value <= 10;
  }

  return bucket.validValues.includes(value);
}

export class Level01 extends Level {
  constructor() {
    super({
      number: 1,
      title: 'Card Values',
      subtitle: 'Learn what each card is worth',
      instructions: 'Drag each card to the correct point value bucket',
      passingScore: 8,
      starThresholds: { threeStarMax: 0, twoStarMax: 2 }
    });

    this.totalCards = 10;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.cards = [];
    this.bucketElements = {};
  }

  init(gameArea) {
    // Create card pile
    const cardPile = document.createElement('div');
    cardPile.className = 'card-pile';
    cardPile.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      margin-bottom: clamp(16px, 4vw, 24px);
      min-height: calc(var(--card-height) + 16px);
    `;
    cardPile.dataset.dropZone = 'pile';

    // Create value buckets
    const bucketsContainer = document.createElement('div');
    bucketsContainer.className = 'value-buckets';

    for (const bucket of BUCKETS) {
      const bucketEl = this.createBucket(bucket);
      bucketsContainer.appendChild(bucketEl);
      this.bucketElements[bucket.id] = bucketEl;
    }

    gameArea.appendChild(cardPile);
    gameArea.appendChild(bucketsContainer);

    // Generate cards (mix of all types)
    this.generateCards(cardPile);

    // Update progress
    this.updateProgress(`0/${this.totalCards} correct`);
  }

  createBucket(bucket) {
    const el = document.createElement('div');
    el.className = 'value-bucket';
    el.dataset.dropZone = bucket.id;
    el.dataset.bucketId = bucket.id;

    const label = document.createElement('div');
    label.className = 'bucket-label';
    label.textContent = bucket.label;

    const sublabel = document.createElement('div');
    sublabel.className = 'bucket-sublabel';
    sublabel.textContent = bucket.sublabel;

    const cardsArea = document.createElement('div');
    cardsArea.className = 'bucket-cards';

    el.appendChild(label);
    el.appendChild(sublabel);
    el.appendChild(cardsArea);

    // Set up drag over handling
    document.addEventListener('carddragmove', (e) => {
      const { x, y } = e.detail;
      const rect = el.getBoundingClientRect();
      const isOver = x >= rect.left && x <= rect.right &&
                     y >= rect.top && y <= rect.bottom;
      el.classList.toggle('drag-over', isOver);
    });

    document.addEventListener('carddragend', () => {
      el.classList.remove('drag-over');
    });

    // Handle drops
    el.addEventListener('carddrop', (e) => {
      const { card, element } = e.detail;
      this.handleDrop(card, element, bucket, el);
    });

    return el;
  }

  generateCards(container) {
    // Create a balanced set: 2 aces, 5 number cards, 3 face cards
    const deck = shuffle(createDeck());

    const aces = deck.filter(c => c.rank === 'A').slice(0, 2);
    const numbers = deck.filter(c => !['A', 'J', 'Q', 'K'].includes(c.rank)).slice(0, 5);
    const faces = deck.filter(c => ['J', 'Q', 'K'].includes(c.rank)).slice(0, 3);

    this.cards = shuffle([...aces, ...numbers, ...faces]);

    // Render cards
    for (const card of this.cards) {
      const cardEl = renderCard(card, {
        draggable: true,
        onClick: null
      });
      container.appendChild(cardEl);
    }
  }

  handleDrop(card, element, bucket, bucketEl) {
    const isCorrect = cardMatchesBucket(card.rank, bucket);
    const cardsArea = bucketEl.querySelector('.bucket-cards');

    if (isCorrect) {
      this.correctCount++;
      cardsArea.appendChild(element);
      element.style.pointerEvents = 'none'; // Can't drag anymore

      this.showCorrect(element);

      // Explain the value
      const value = RANK_VALUES[card.rank];
      let explanation;
      if (card.rank === 'A') {
        explanation = `Ace = 1 point. Aces are always worth 1.`;
      } else if (['J', 'Q', 'K'].includes(card.rank)) {
        explanation = `${card.rank} = 10 points. All face cards are worth 10.`;
      } else {
        explanation = `${card.rank} = ${value} points. Number cards equal their face value.`;
      }
      this.showExplanation(explanation, 'success');

    } else {
      this.wrongCount++;
      this.showIncorrect(element);

      // Return to pile
      const pile = this.gameAreaEl.querySelector('.card-pile');
      pile.appendChild(element);

      // Explain the error
      const value = RANK_VALUES[card.rank];
      let correctBucket;
      if (card.rank === 'A') {
        correctBucket = '1 Point (Aces)';
      } else if (['J', 'Q', 'K'].includes(card.rank)) {
        correctBucket = '10 Points (Face cards)';
      } else {
        correctBucket = '2-10 Points (Number cards)';
      }
      this.showExplanation(`${card.rank} is worth ${value} points. It belongs in ${correctBucket}.`, 'error');
    }

    // Update progress
    this.updateProgress(`${this.correctCount}/${this.totalCards} correct`);

    // Check completion
    if (this.correctCount + this.wrongCount >= this.totalCards ||
        this.correctCount >= this.totalCards) {
      this.checkCompletion();
    }
  }

  checkCompletion() {
    const pile = this.gameAreaEl.querySelector('.card-pile');
    const remaining = pile.querySelectorAll('.card').length;

    if (remaining === 0) {
      // All cards placed
      this.score = this.correctCount;
      const passed = this.correctCount >= this.passingScore;
      this.complete(passed);
    }
  }

  reset() {
    this.correctCount = 0;
    this.wrongCount = 0;
    this.cards = [];
    this.bucketElements = {};
    super.reset();
  }
}

export default Level01;
