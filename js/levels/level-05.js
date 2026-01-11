/**
 * Level 5: Count Deadwood
 * Calculate deadwood points from hands with melds marked
 */

import { Level } from './level-engine.js';
import { createCard, renderCard, shuffle, SUITS, RANK_VALUES } from '../cards.js';
import { calculateDeadwood } from '../melds.js';

/**
 * Generates hands with increasing difficulty
 */
function generateHands() {
  const hands = [];
  const suits = shuffle([...SUITS]);

  // Hand 1: Easy - 2 deadwood cards, simple values
  hands.push({
    melds: [
      { type: 'set', cards: [createCard(suits[0], '5'), createCard(suits[1], '5'), createCard(suits[2], '5')] },
      { type: 'run', cards: [createCard(suits[0], '7'), createCard(suits[0], '8'), createCard(suits[0], '9'), createCard(suits[0], '10')] }
    ],
    deadwood: [createCard(suits[1], '2'), createCard(suits[2], 'A')],
    difficulty: 'easy'
  });

  // Hand 2: Easy - 3 deadwood cards
  hands.push({
    melds: [
      { type: 'set', cards: [createCard(suits[0], 'J'), createCard(suits[1], 'J'), createCard(suits[2], 'J')] },
      { type: 'run', cards: [createCard(suits[1], '2'), createCard(suits[1], '3'), createCard(suits[1], '4')] }
    ],
    deadwood: [createCard(suits[3], '6'), createCard(suits[0], '3'), createCard(suits[2], 'A')],
    difficulty: 'easy'
  });

  // Hand 3: Medium - 4 deadwood with face cards
  hands.push({
    melds: [
      { type: 'set', cards: [createCard(suits[0], '9'), createCard(suits[1], '9'), createCard(suits[2], '9')] }
    ],
    deadwood: [
      createCard(suits[0], 'K'), createCard(suits[1], '4'),
      createCard(suits[2], '7'), createCard(suits[3], 'A'),
      createCard(suits[0], '2'), createCard(suits[1], 'Q')
    ],
    difficulty: 'medium'
  });

  // Hand 4: Medium - Mixed values
  hands.push({
    melds: [
      { type: 'run', cards: [createCard(suits[2], 'J'), createCard(suits[2], 'Q'), createCard(suits[2], 'K')] },
      { type: 'set', cards: [createCard(suits[0], '3'), createCard(suits[1], '3'), createCard(suits[2], '3')] }
    ],
    deadwood: [
      createCard(suits[0], '8'), createCard(suits[3], '9'),
      createCard(suits[1], 'A'), createCard(suits[3], '5')
    ],
    difficulty: 'medium'
  });

  // Hand 5: Hard - Only one small meld, lots of deadwood
  hands.push({
    melds: [
      { type: 'run', cards: [createCard(suits[0], 'A'), createCard(suits[0], '2'), createCard(suits[0], '3')] }
    ],
    deadwood: [
      createCard(suits[1], 'K'), createCard(suits[2], 'Q'),
      createCard(suits[3], 'J'), createCard(suits[1], '9'),
      createCard(suits[2], '8'), createCard(suits[3], '7'),
      createCard(suits[0], '6')
    ],
    difficulty: 'hard'
  });

  return hands;
}

export class Level05 extends Level {
  constructor() {
    super({
      number: 5,
      title: 'Count Deadwood',
      subtitle: 'Add up your unmatched cards',
      instructions: 'Calculate the total deadwood points for each hand',
      passingScore: 5,
      starThresholds: { threeStarMax: 0, twoStarMax: 2 }
    });

    this.hands = [];
    this.currentHandIndex = 0;
    this.correctCount = 0;
    this.totalHands = 5;
  }

  init(gameArea) {
    this.hands = generateHands();
    this.showHand(gameArea);
  }

  showHand(gameArea) {
    gameArea.innerHTML = '';

    const hand = this.hands[this.currentHandIndex];
    const correctAnswer = calculateDeadwood(hand.deadwood);

    // Check button in header (top-right)
    this.createHeaderButton({
      buttonText: 'Check ✓',
      onButtonClick: () => this.checkAnswer(correctAnswer)
    });

    // Progress counter in game area
    const progressCount = document.createElement('div');
    progressCount.className = 'selection-count top-bar-progress';
    progressCount.textContent = `Hand ${this.currentHandIndex + 1}/${this.totalHands}`;
    progressCount.style.cssText = 'margin-bottom: 8px;';
    gameArea.appendChild(progressCount);

    // Difficulty badge below progress
    const diffBadge = document.createElement('span');
    diffBadge.style.cssText = `
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      text-transform: uppercase;
      margin-bottom: 8px;
      background: ${hand.difficulty === 'easy' ? 'var(--success)' :
                    hand.difficulty === 'medium' ? '#f0ad4e' : 'var(--accent)'};
      color: white;
    `;
    diffBadge.textContent = hand.difficulty;
    gameArea.appendChild(diffBadge);

    // Melds section
    const meldsSection = document.createElement('div');
    meldsSection.style.cssText = `
      margin: 16px 0;
      padding: 12px;
      background: rgba(0, 210, 106, 0.1);
      border-radius: 12px;
      border: 2px solid var(--success);
    `;

    const meldsLabel = document.createElement('div');
    meldsLabel.style.cssText = `
      font-size: 12px;
      color: var(--success);
      margin-bottom: 8px;
      text-transform: uppercase;
      font-weight: 600;
    `;
    meldsLabel.textContent = 'Melds (0 points)';
    meldsSection.appendChild(meldsLabel);

    const meldsCards = document.createElement('div');
    meldsCards.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    `;

    for (const meld of hand.melds) {
      const meldGroup = document.createElement('div');
      meldGroup.style.cssText = `
        display: flex;
        gap: 2px;
        padding: 4px;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
      `;
      for (const card of meld.cards) {
        const cardEl = renderCard(card, { draggable: false });
        cardEl.style.setProperty('--card-width', 'clamp(35px, 8vw, 50px)');
        meldGroup.appendChild(cardEl);
      }
      meldsCards.appendChild(meldGroup);
    }
    meldsSection.appendChild(meldsCards);
    gameArea.appendChild(meldsSection);

    // Deadwood section
    const deadwoodSection = document.createElement('div');
    deadwoodSection.style.cssText = `
      margin: 16px 0;
      padding: 12px;
      background: rgba(233, 69, 96, 0.1);
      border-radius: 12px;
      border: 2px solid var(--accent);
    `;

    const deadwoodLabel = document.createElement('div');
    deadwoodLabel.style.cssText = `
      font-size: 12px;
      color: var(--accent);
      margin-bottom: 8px;
      text-transform: uppercase;
      font-weight: 600;
    `;
    deadwoodLabel.textContent = 'Deadwood (? points)';
    deadwoodSection.appendChild(deadwoodLabel);

    const deadwoodCards = document.createElement('div');
    deadwoodCards.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      justify-content: center;
    `;

    for (const card of hand.deadwood) {
      const cardEl = renderCard(card, { draggable: false });
      cardEl.style.setProperty('--card-width', 'clamp(40px, 9vw, 55px)');
      deadwoodCards.appendChild(cardEl);
    }
    deadwoodSection.appendChild(deadwoodCards);
    gameArea.appendChild(deadwoodSection);

    // Input section (without submit button - using top bar)
    const inputSection = document.createElement('div');
    inputSection.className = 'deadwood-input-container';
    inputSection.style.marginTop = '20px';

    const label = document.createElement('span');
    label.textContent = 'Total:';
    label.style.cssText = 'font-size: 18px; font-weight: 600;';

    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.pattern = '[0-9]*';
    input.className = 'deadwood-input';
    input.id = 'deadwood-input';
    input.placeholder = '?';
    input.autocomplete = 'off';

    // Submit on Enter
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.checkAnswer(correctAnswer);
      }
    });

    inputSection.appendChild(label);
    inputSection.appendChild(input);
    gameArea.appendChild(inputSection);

    // Breakdown area (shown after answer)
    const breakdown = document.createElement('div');
    breakdown.id = 'breakdown';
    breakdown.style.cssText = `
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
      display: none;
      text-align: center;
    `;
    gameArea.appendChild(breakdown);

    this.updateProgress(`${this.correctCount}/${this.totalHands} correct`);

    // Focus input
    setTimeout(() => input.focus(), 100);
  }

  checkAnswer(correctAnswer) {
    const input = document.getElementById('deadwood-input');
    const userAnswer = parseInt(input.value, 10);
    const breakdown = document.getElementById('breakdown');
    const hand = this.hands[this.currentHandIndex];

    // Show breakdown
    breakdown.style.display = 'block';

    const cardBreakdown = hand.deadwood
      .map(c => `${c.rank}=${RANK_VALUES[c.rank]}`)
      .join(' + ');

    if (userAnswer === correctAnswer) {
      this.correctCount++;
      breakdown.style.background = 'rgba(0, 210, 106, 0.15)';
      breakdown.innerHTML = `
        <div style="color: var(--success); font-weight: 600; margin-bottom: 8px;">Correct!</div>
        <div style="color: var(--text-muted); font-size: 13px;">${cardBreakdown} = ${correctAnswer}</div>
      `;
      this.showExplanation(`${correctAnswer} points is right!`, 'success');
    } else {
      breakdown.style.background = 'rgba(255, 107, 107, 0.15)';
      breakdown.innerHTML = `
        <div style="color: var(--error); font-weight: 600; margin-bottom: 8px;">
          The answer was ${correctAnswer}
        </div>
        <div style="color: var(--text-muted); font-size: 13px;">${cardBreakdown} = ${correctAnswer}</div>
      `;
      this.showExplanation(`Not quite. The total was ${correctAnswer}.`, 'error');
    }

    // Disable input
    input.disabled = true;

    this.updateProgress(`${this.correctCount}/${this.totalHands} correct`);

    // Update header button to Next or See Results
    if (this.currentHandIndex < this.totalHands - 1) {
      this.updateHeaderButton('Next →', () => {
        this.currentHandIndex++;
        this.showHand(this.gameAreaEl);
      });
    } else {
      this.updateHeaderButton('Finish', () => {
        this.score = this.correctCount;
        this.complete(this.correctCount >= this.passingScore);
      });
    }
  }

  reset() {
    this.hands = [];
    this.currentHandIndex = 0;
    this.correctCount = 0;
    super.reset();
  }
}

export default Level05;
