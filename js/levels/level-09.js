/**
 * Level 9: Should You Knock?
 * Strategic knocking decisions - when to knock vs continue
 */

import { Level } from './level-engine.js';
import { createCard, renderCard, shuffle, SUITS } from '../cards.js';

/**
 * Generates strategic scenarios
 */
function generateScenarios() {
  return [
    {
      id: 1,
      yourDeadwood: 8,
      opponentPickups: 'few cards from discard',
      turnNumber: 'early',
      shouldKnock: false,
      explanation: 'With only 8 deadwood early in the game, you\'re close to Gin. Continue playing - the 25 point Gin bonus is worth pursuing!'
    },
    {
      id: 2,
      yourDeadwood: 10,
      opponentPickups: 'many cards, seems close to meld',
      turnNumber: 'late',
      shouldKnock: true,
      explanation: 'Knock now! Late game with opponent looking ready - if they go Gin first, you lose big. Lock in your lead.'
    },
    {
      id: 3,
      yourDeadwood: 3,
      opponentPickups: 'few',
      turnNumber: 'mid',
      shouldKnock: false,
      explanation: 'Only 3 deadwood - you\'re very close to Gin! One more good draw could give you the 25 point bonus. Keep playing.'
    },
    {
      id: 4,
      yourDeadwood: 9,
      opponentPickups: 'took several discards, organized hand',
      turnNumber: 'late',
      shouldKnock: true,
      explanation: 'Knock! Opponent has been building melds actively. Don\'t risk them going Gin - take your points now.'
    },
    {
      id: 5,
      yourDeadwood: 6,
      opponentPickups: 'drawing from deck only',
      turnNumber: 'early',
      shouldKnock: false,
      explanation: 'Continue! Opponent isn\'t finding helpful cards in discards. You have time to go for Gin with just 6 deadwood.'
    }
  ];
}

export class Level09 extends Level {
  constructor() {
    super({
      number: 9,
      title: 'Should You Knock?',
      subtitle: 'Strategic decisions',
      instructions: 'Decide whether to knock or continue based on the game state',
      passingScore: 4,
      starThresholds: { threeStarMax: 0, twoStarMax: 1 }
    });

    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
    this.totalScenarios = 5;
  }

  init(gameArea) {
    this.scenarios = generateScenarios();
    this.showScenario(gameArea);
  }

  showScenario(gameArea) {
    gameArea.innerHTML = '';
    const scenario = this.scenarios[this.currentScenario];

    // Button in header (top-right, initially faded)
    const headerBtn = this.createHeaderButton({
      buttonText: 'Choose ↓',
      onButtonClick: () => {}
    });
    if (headerBtn) headerBtn.style.opacity = '0.3';

    // Progress counter in game area
    const progressCount = document.createElement('div');
    progressCount.className = 'selection-count top-bar-progress';
    progressCount.textContent = `${this.currentScenario + 1}/${this.totalScenarios}`;
    progressCount.style.cssText = 'margin-bottom: 12px;';
    gameArea.appendChild(progressCount);

    // Game state display
    const stateCard = document.createElement('div');
    stateCard.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: clamp(16px, 4vw, 24px);
      margin: 16px 0;
      max-width: 350px;
    `;

    stateCard.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Your Deadwood</div>
        <div style="font-size: 32px; font-weight: 700; color: var(--accent);">${scenario.yourDeadwood}</div>
      </div>
      <div style="margin-bottom: 12px;">
        <div style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Game Phase</div>
        <div style="font-size: 16px; color: var(--text-light);">${scenario.turnNumber} game</div>
      </div>
      <div>
        <div style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Opponent Behavior</div>
        <div style="font-size: 14px; color: var(--text-light);">${scenario.opponentPickups}</div>
      </div>
    `;
    gameArea.appendChild(stateCard);

    // Question
    const question = document.createElement('div');
    question.style.cssText = `
      font-size: clamp(16px, 4vw, 20px);
      font-weight: 600;
      text-align: center;
      margin: 20px 0 16px;
    `;
    question.textContent = 'Should you knock?';
    gameArea.appendChild(question);

    // Choice buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'choice-buttons';

    const knockBtn = document.createElement('button');
    knockBtn.className = 'choice-btn';
    knockBtn.textContent = 'Knock Now';
    knockBtn.addEventListener('click', () => this.handleAnswer(true, scenario));

    const continueBtn = document.createElement('button');
    continueBtn.className = 'choice-btn';
    continueBtn.textContent = 'Keep Playing';
    continueBtn.addEventListener('click', () => this.handleAnswer(false, scenario));

    buttonsContainer.appendChild(knockBtn);
    buttonsContainer.appendChild(continueBtn);
    gameArea.appendChild(buttonsContainer);

    // Result area
    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = 'margin-top: 20px; text-align: center;';
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.correctCount}/${this.totalScenarios} correct`);
  }

  handleAnswer(userKnocks, scenario) {
    const isCorrect = userKnocks === scenario.shouldKnock;
    const resultArea = document.getElementById('result-area');

    // Disable and highlight buttons
    const buttons = this.gameAreaEl.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === 'Knock Now' && scenario.shouldKnock) {
        btn.classList.add('correct');
      } else if (btn.textContent === 'Keep Playing' && !scenario.shouldKnock) {
        btn.classList.add('correct');
      } else if ((btn.textContent === 'Knock Now' && userKnocks && !scenario.shouldKnock) ||
                 (btn.textContent === 'Keep Playing' && !userKnocks && scenario.shouldKnock)) {
        btn.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      this.correctCount++;
    }

    resultArea.innerHTML = `
      <div style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 600; margin-bottom: 8px;">
        ${isCorrect ? 'Good thinking!' : 'Not optimal'}
      </div>
      <div style="color: var(--text-light); font-size: 14px; max-width: 350px; margin: 0 auto;">
        ${scenario.explanation}
      </div>
    `;

    this.updateProgress(`${this.correctCount}/${this.totalScenarios} correct`);

    // Update header button to Next or See Results
    if (this.currentScenario < this.totalScenarios - 1) {
      this.updateHeaderButton('Next →', () => {
        this.currentScenario++;
        this.showScenario(this.gameAreaEl);
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

export default Level09;
