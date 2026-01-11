/**
 * Level 14: Triangle Theory
 * Find flexible cards that can complete multiple melds
 */

import { Level } from './level-engine.js';
import { createCard, renderCard } from '../cards.js';

export class Level14 extends Level {
  constructor() {
    super({
      number: 14,
      title: 'Triangle Theory',
      subtitle: 'Flexible combinations',
      instructions: 'Find the "triangle" card that could complete multiple melds',
      passingScore: 3,
      starThresholds: { threeStarMax: 0, twoStarMax: 1 }
    });
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
  }

  init(gameArea) {
    // Each scenario shows cards where ONE card is a "triangle" - can complete both a set AND a run
    this.scenarios = [
      {
        hand: [
          createCard('hearts', '7'),   // TRIANGLE: could complete 7s set OR 6-7-8 hearts run
          createCard('spades', '7'),   // Part of potential set
          createCard('hearts', '6'),   // Part of potential run
          createCard('hearts', '8'),   // Part of potential run
          createCard('diamonds', 'K')  // Unrelated
        ],
        triangleId: '7-hearts',
        explanation: 'The 7♥ is the triangle! It could complete a set (7♥ 7♠ + one more 7) OR a run (6♥ 7♥ 8♥).'
      },
      {
        hand: [
          createCard('clubs', '9'),    // TRIANGLE: could complete 9s set OR 8-9-10 clubs run
          createCard('hearts', '9'),   // Part of potential set
          createCard('clubs', '8'),    // Part of potential run
          createCard('clubs', '10'),   // Part of potential run
          createCard('spades', '2')    // Unrelated
        ],
        triangleId: '9-clubs',
        explanation: 'The 9♣ is the triangle! It could join the 9♥ for a set, OR complete 8♣ 9♣ 10♣ run.'
      },
      {
        hand: [
          createCard('diamonds', 'Q'), // TRIANGLE: could complete Qs set OR J-Q-K diamonds run
          createCard('clubs', 'Q'),    // Part of potential set
          createCard('diamonds', 'J'), // Part of potential run
          createCard('diamonds', 'K'), // Part of potential run
          createCard('hearts', '4')    // Unrelated
        ],
        triangleId: 'Q-diamonds',
        explanation: 'The Q♦ is the triangle! It works for a Queens set OR the J♦ Q♦ K♦ run.'
      },
      {
        hand: [
          createCard('spades', '5'),   // TRIANGLE: could complete 5s set OR 4-5-6 spades run
          createCard('diamonds', '5'), // Part of potential set
          createCard('hearts', '5'),   // Part of potential set (already 3!)
          createCard('spades', '4'),   // Part of potential run
          createCard('spades', '6')    // Part of potential run
        ],
        triangleId: '5-spades',
        explanation: 'The 5♠ is the triangle! It could be the 4th five in the set OR complete 4♠ 5♠ 6♠.'
      }
    ];
    this.showScenario(gameArea);
  }

  showScenario(gameArea) {
    gameArea.innerHTML = '';
    const scenario = this.scenarios[this.currentScenario];

    // Button in header (top-right, initially faded)
    const headerBtn = this.createHeaderButton({
      buttonText: 'Pick ↓',
      onButtonClick: () => {}
    });
    if (headerBtn) headerBtn.style.opacity = '0.3';

    // Progress counter in game area
    const progressCount = document.createElement('div');
    progressCount.className = 'selection-count top-bar-progress';
    progressCount.textContent = `${this.currentScenario + 1}/${this.scenarios.length}`;
    progressCount.style.cssText = 'margin-bottom: 12px;';
    gameArea.appendChild(progressCount);

    // Explanation
    const intro = document.createElement('div');
    intro.style.cssText = 'background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin: 12px 0; text-align: center;';
    intro.innerHTML = `
      <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 4px;">
        A <span style="color: var(--success); font-weight: 600;">triangle</span> card can complete EITHER a set OR a run.
      </p>
      <p style="color: var(--text-muted); font-size: 12px;">Tap the triangle card below:</p>
    `;
    gameArea.appendChild(intro);

    // Cards
    const cardsContainer = document.createElement('div');
    cardsContainer.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin: 20px 0;';

    scenario.hand.forEach(card => {
      const el = renderCard(card, { draggable: false });
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => this.handleSelection(card.id, scenario, gameArea));
      cardsContainer.appendChild(el);
    });
    gameArea.appendChild(cardsContainer);

    // Result area
    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = 'margin-top: 16px; text-align: center;';
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);
  }

  handleSelection(cardId, scenario, gameArea) {
    const isCorrect = cardId === scenario.triangleId;
    const resultArea = document.getElementById('result-area');

    // Disable further clicks
    gameArea.querySelectorAll('.card').forEach(el => {
      el.style.pointerEvents = 'none';
      if (el.dataset.cardId === scenario.triangleId) {
        el.classList.add('correct');
      } else if (el.dataset.cardId === cardId && !isCorrect) {
        el.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      this.correctCount++;
      resultArea.innerHTML = `
        <div style="color: var(--success); font-weight: 600; margin-bottom: 8px;">Correct!</div>
        <div style="color: var(--text-light); font-size: 13px;">${scenario.explanation}</div>
      `;
    } else {
      resultArea.innerHTML = `
        <div style="color: var(--error); font-weight: 600; margin-bottom: 8px;">Not quite</div>
        <div style="color: var(--text-light); font-size: 13px;">${scenario.explanation}</div>
      `;
    }

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);

    // Update header button
    if (this.currentScenario < this.scenarios.length - 1) {
      this.updateHeaderButton('Next →', () => {
        this.currentScenario++;
        this.showScenario(gameArea);
      });
    } else {
      this.updateHeaderButton('Finish', () => {
        this.score = this.correctCount;
        this.complete(this.correctCount >= this.passingScore);
      });
    }
  }

  reset() {
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
    super.reset();
  }
}
