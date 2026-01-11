/**
 * Level 16: Safe Discards
 * Pick the safest card to discard
 */

import { Level } from './level-engine.js';
import { createCard, renderCard } from '../cards.js';

export class Level16 extends Level {
  constructor() {
    super({
      number: 16,
      title: 'Safe Discards',
      subtitle: 'Defensive play',
      instructions: 'Pick the safest card to discard',
      passingScore: 4,
      starThresholds: { threeStarMax: 0, twoStarMax: 1 }
    });
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
  }

  init(gameArea) {
    this.scenarios = [
      {
        oppDiscards: [createCard('hearts', '7'), createCard('hearts', '9')],
        oppPickedUp: null,
        yourDeadwood: [
          createCard('hearts', '5'),   // SAFE - they're dumping hearts
          createCard('spades', '8'),
          createCard('clubs', 'K'),
          createCard('diamonds', '6')
        ],
        safestId: '5-hearts',
        explanation: 'Hearts are safe - opponent has been discarding them!'
      },
      {
        oppDiscards: [createCard('clubs', '3')],
        oppPickedUp: createCard('diamonds', '7'),
        yourDeadwood: [
          createCard('diamonds', '6'),  // DANGEROUS - near their pickup
          createCard('diamonds', '8'),  // DANGEROUS - near their pickup
          createCard('spades', 'K'),
          createCard('clubs', '4')      // SAFE - same rank/suit as their discard
        ],
        safestId: '4-clubs',
        explanation: 'The 4♣ is safest - similar to what they discarded. Avoid diamonds near their 7♦ pickup!'
      },
      {
        oppDiscards: [createCard('spades', 'Q'), createCard('diamonds', 'K')],
        oppPickedUp: null,
        yourDeadwood: [
          createCard('hearts', 'J'),   // SAFE-ish - they\'re dumping face cards
          createCard('clubs', '5'),
          createCard('spades', '3'),
          createCard('diamonds', '9')
        ],
        safestId: 'J-hearts',
        explanation: 'Face cards seem safe - they discarded Q and K. The J♥ is your best bet.'
      },
      {
        oppDiscards: [createCard('hearts', '4')],
        oppPickedUp: createCard('hearts', '6'),
        yourDeadwood: [
          createCard('hearts', '5'),   // VERY DANGEROUS - exactly what they need!
          createCard('clubs', 'Q'),
          createCard('spades', '2'),
          createCard('diamonds', '8')
        ],
        safestId: '2-spades',
        explanation: 'NEVER give them the 5♥! They picked up 6♥ after discarding 4♥ - they\'re building 5-6-7 hearts! Low spades are safest.'
      },
      {
        oppDiscards: [createCard('clubs', '8'), createCard('spades', '8')],
        oppPickedUp: null,
        yourDeadwood: [
          createCard('hearts', '8'),   // VERY SAFE - they clearly don\'t want 8s
          createCard('diamonds', '4'),
          createCard('clubs', 'J'),
          createCard('spades', '6')
        ],
        safestId: '8-hearts',
        explanation: 'They dumped two 8s - they definitely don\'t need the third! Your 8♥ is very safe.'
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

    // Opponent info section
    const oppSection = document.createElement('div');
    oppSection.style.cssText = 'background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin: 12px 0;';

    // Discards row
    let oppHtml = '<div style="color: var(--text-muted); font-size: 11px; margin-bottom: 6px;">OPPONENT DISCARDED:</div>';
    oppSection.innerHTML = oppHtml;

    const discardRow = document.createElement('div');
    discardRow.style.cssText = 'display: flex; gap: 6px; justify-content: center; margin-bottom: 8px;';
    scenario.oppDiscards.forEach(card => {
      const el = renderCard(card, { draggable: false });
      el.style.setProperty('--card-width', '40px');
      discardRow.appendChild(el);
    });
    oppSection.appendChild(discardRow);

    // Pickup info
    if (scenario.oppPickedUp) {
      const pickupInfo = document.createElement('div');
      pickupInfo.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);';
      pickupInfo.innerHTML = '<span style="color: var(--error); font-size: 11px;">⚠️ PICKED UP:</span>';
      const pickupCard = renderCard(scenario.oppPickedUp, { draggable: false });
      pickupCard.style.setProperty('--card-width', '40px');
      pickupInfo.appendChild(pickupCard);
      oppSection.appendChild(pickupInfo);
    }
    gameArea.appendChild(oppSection);

    // Question
    const questionEl = document.createElement('div');
    questionEl.style.cssText = 'text-align: center; margin: 12px 0; font-size: 14px;';
    questionEl.textContent = 'Which card is SAFEST to discard?';
    gameArea.appendChild(questionEl);

    // Your deadwood options
    const yourSection = document.createElement('div');
    yourSection.style.cssText = 'display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 16px 0;';

    scenario.yourDeadwood.forEach(card => {
      const el = renderCard(card, { draggable: false });
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => this.handleSelection(card.id, scenario, gameArea));
      yourSection.appendChild(el);
    });
    gameArea.appendChild(yourSection);

    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = 'margin-top: 16px; text-align: center;';
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);
  }

  handleSelection(cardId, scenario, gameArea) {
    const isCorrect = cardId === scenario.safestId;
    if (isCorrect) this.correctCount++;

    const resultArea = document.getElementById('result-area');

    // Disable and highlight cards
    gameArea.querySelectorAll('.card').forEach(el => {
      el.style.pointerEvents = 'none';
      if (el.dataset.cardId === scenario.safestId) {
        el.classList.add('correct');
      } else if (el.dataset.cardId === cardId && !isCorrect) {
        el.classList.add('incorrect');
      }
    });

    resultArea.innerHTML = `
      <div style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 600; margin-bottom: 8px;">
        ${isCorrect ? 'Good read!' : 'Risky choice!'}
      </div>
      <div style="color: var(--text-light); font-size: 13px;">${scenario.explanation}</div>
    `;

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
