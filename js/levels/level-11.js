/**
 * Level 11: The Layoff
 * Add to opponent's melds after they knock
 */

import { Level } from './level-engine.js';
import { createCard, renderCard } from '../cards.js';

export class Level11 extends Level {
  constructor() {
    super({
      number: 11,
      title: 'The Layoff',
      subtitle: 'Add to opponent\'s melds',
      instructions: 'Find cards from your deadwood that can lay off onto opponent melds',
      passingScore: 3,
      starThresholds: { threeStarMax: 0, twoStarMax: 1 }
    });
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
  }

  init(gameArea) {
    this.scenarios = [
      {
        opponentMelds: [
          { type: 'set', cards: [createCard('hearts', '7'), createCard('diamonds', '7'), createCard('clubs', '7')] },
          { type: 'run', cards: [createCard('spades', '4'), createCard('spades', '5'), createCard('spades', '6')] }
        ],
        yourDeadwood: [
          createCard('spades', '7'),  // Can lay off on set
          createCard('spades', '3'),  // Can lay off on run (low end)
          createCard('hearts', 'K'),  // Cannot
          createCard('diamonds', '2') // Cannot
        ],
        validLayoffs: ['7-spades', '3-spades']
      },
      {
        opponentMelds: [
          { type: 'run', cards: [createCard('hearts', 'J'), createCard('hearts', 'Q'), createCard('hearts', 'K')] }
        ],
        yourDeadwood: [
          createCard('hearts', '10'),  // Can lay off (extends low)
          createCard('hearts', 'A'),   // Cannot (K-A not allowed)
          createCard('diamonds', 'Q'), // Cannot (wrong suit)
          createCard('clubs', '5')
        ],
        validLayoffs: ['10-hearts']
      },
      {
        opponentMelds: [
          { type: 'set', cards: [createCard('hearts', 'Q'), createCard('diamonds', 'Q'), createCard('clubs', 'Q')] },
          { type: 'run', cards: [createCard('clubs', '8'), createCard('clubs', '9'), createCard('clubs', '10')] }
        ],
        yourDeadwood: [
          createCard('spades', 'Q'),  // Can lay off
          createCard('clubs', '7'),   // Can lay off (extends run low)
          createCard('clubs', 'J'),   // Can lay off (extends run high)
          createCard('hearts', '3')
        ],
        validLayoffs: ['Q-spades', '7-clubs', 'J-clubs']
      }
    ];
    this.showScenario(gameArea);
  }

  showScenario(gameArea) {
    gameArea.innerHTML = '';
    const scenario = this.scenarios[this.currentScenario];

    // Top bar with progress and Check button
    const topBar = this.createTopBar({
      progress: `${this.currentScenario + 1}/3`,
      buttonText: 'Check ✓',
      onButtonClick: () => this.checkAnswer(scenario)
    });
    gameArea.appendChild(topBar);

    // Explain Gin blocks layoffs
    const note = document.createElement('p');
    note.style.cssText = 'color: var(--text-muted); font-size: 12px; text-align: center; margin-bottom: 12px;';
    note.textContent = 'Note: If opponent went Gin, you cannot lay off. This is after a knock.';
    gameArea.appendChild(note);

    // Opponent melds
    const oppSection = document.createElement('div');
    oppSection.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; margin-bottom: 8px;">OPPONENT\'S MELDS</div>';
    oppSection.style.cssText = 'background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 16px;';

    const meldsRow = document.createElement('div');
    meldsRow.style.cssText = 'display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;';
    scenario.opponentMelds.forEach(meld => {
      const meldGroup = document.createElement('div');
      meldGroup.style.cssText = 'display: flex; gap: 2px; padding: 4px; background: rgba(0,210,106,0.1); border-radius: 6px;';
      meld.cards.forEach(c => {
        const el = renderCard(c, { draggable: false });
        el.style.setProperty('--card-width', '40px');
        meldGroup.appendChild(el);
      });
      meldsRow.appendChild(meldGroup);
    });
    oppSection.appendChild(meldsRow);
    gameArea.appendChild(oppSection);

    // Your deadwood
    const yourSection = document.createElement('div');
    yourSection.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; margin-bottom: 8px;">YOUR DEADWOOD - Tap cards that can lay off</div>';
    yourSection.style.marginBottom = '16px';

    const dwRow = document.createElement('div');
    dwRow.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;';
    scenario.yourDeadwood.forEach(card => {
      const el = renderCard(card, { draggable: false });
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        el.classList.toggle('selected');
      });
      dwRow.appendChild(el);
    });
    yourSection.appendChild(dwRow);
    gameArea.appendChild(yourSection);

    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.marginTop = '16px';
    gameArea.appendChild(resultArea);
  }

  checkAnswer(scenario) {
    const selected = Array.from(this.gameAreaEl.querySelectorAll('.card.selected')).map(el => el.dataset.cardId);
    const valid = scenario.validLayoffs;

    const allCorrect = selected.length === valid.length && selected.every(id => valid.includes(id));
    const resultArea = document.getElementById('result-area');

    // Highlight correct answers
    this.gameAreaEl.querySelectorAll('.card').forEach(el => {
      if (valid.includes(el.dataset.cardId)) {
        el.classList.add('correct');
      } else if (el.classList.contains('selected')) {
        el.classList.add('incorrect');
      }
    });

    if (allCorrect) {
      this.correctCount++;
      resultArea.innerHTML = `<div style="color: var(--success); font-weight: 600;">Perfect! You found all ${valid.length} valid layoffs.</div>`;
    } else {
      resultArea.innerHTML = `<div style="color: var(--error);">Not quite. The valid layoffs are highlighted in green.</div>`;
    }

    // Update top bar button
    if (this.currentScenario < 2) {
      this.updateTopBarButton('Next →', () => { this.currentScenario++; this.showScenario(this.gameAreaEl); });
    } else {
      this.updateTopBarButton('Finish', () => { this.score = this.correctCount; this.complete(this.correctCount >= 3); });
    }
  }

  reset() { this.currentScenario = 0; this.correctCount = 0; super.reset(); }
}
