/**
 * Level 6: The Draw
 * Teaches drawing strategy - when to take from discard pile vs draw pile
 */

import { Level } from './level-engine.js';
import { createCard, renderCard, shuffle, SUITS } from '../cards.js';

/**
 * Generates scenarios for drawing decisions
 */
function generateScenarios() {
  const suits = shuffle([...SUITS]);

  return [
    {
      id: 1,
      hand: [
        createCard(suits[0], '7'), createCard(suits[1], '7'),  // Pair of 7s
        createCard(suits[0], '4'), createCard(suits[0], '5'),  // Potential run
        createCard(suits[2], 'K'), createCard(suits[3], 'Q'),
        createCard(suits[1], '3'), createCard(suits[2], '9'),
        createCard(suits[3], '2'), createCard(suits[0], 'A')
      ],
      discardTop: createCard(suits[2], '7'),  // Third 7!
      correctChoice: 'discard',
      explanation: 'Take the 7 from discard! It completes a set with your two 7s, eliminating deadwood instantly.'
    },
    {
      id: 2,
      hand: [
        createCard(suits[0], '8'), createCard(suits[0], '9'), createCard(suits[0], '10'),  // Run
        createCard(suits[1], 'J'), createCard(suits[2], 'J'),  // Pair
        createCard(suits[3], 'K'), createCard(suits[1], '4'),
        createCard(suits[2], '5'), createCard(suits[0], '2'),
        createCard(suits[3], 'A')
      ],
      discardTop: createCard(suits[1], '3'),  // Random low card
      correctChoice: 'draw',
      explanation: 'Draw from the pile. The 3 doesn\'t help your hand - it would just be more deadwood. Keep your options open.'
    },
    {
      id: 3,
      hand: [
        createCard(suits[0], '4'), createCard(suits[0], '5'),  // Waiting for 3 or 6
        createCard(suits[1], 'Q'), createCard(suits[2], 'Q'),  // Pair
        createCard(suits[3], 'K'), createCard(suits[0], 'J'),
        createCard(suits[1], '9'), createCard(suits[2], '7'),
        createCard(suits[3], '2'), createCard(suits[1], 'A')
      ],
      discardTop: createCard(suits[0], '6'),  // Completes the run!
      correctChoice: 'discard',
      explanation: 'Take the 6! It completes a run with your 4-5 of the same suit.'
    },
    {
      id: 4,
      hand: [
        createCard(suits[0], 'K'), createCard(suits[1], 'K'), createCard(suits[2], 'K'),  // Set of Ks
        createCard(suits[0], '2'), createCard(suits[0], '3'), createCard(suits[0], '4'),  // Run
        createCard(suits[3], '9'), createCard(suits[1], '8'),
        createCard(suits[2], '6'), createCard(suits[3], 'A')
      ],
      discardTop: createCard(suits[3], 'K'),  // 4th King
      correctChoice: 'draw',
      explanation: 'Draw from pile. You already have 3 Kings (a complete set). The 4th King would be deadwood, not help!'
    },
    {
      id: 5,
      hand: [
        createCard(suits[0], '5'), createCard(suits[0], '6'),  // Potential run
        createCard(suits[1], '5'),  // Pair of 5s - need one more for set
        createCard(suits[3], 'J'), createCard(suits[1], 'Q'),
        createCard(suits[2], '9'), createCard(suits[3], '8'),
        createCard(suits[0], '2'), createCard(suits[1], 'A'),
        createCard(suits[2], 'K')
      ],
      discardTop: createCard(suits[2], '5'),  // 3rd 5 - completes set!
      correctChoice: 'discard',
      explanation: 'Take it! The 5 completes a set with your pair of 5s. Always take cards that complete melds.'
    }
  ];
}

export class Level06 extends Level {
  constructor() {
    super({
      number: 6,
      title: 'The Draw',
      subtitle: 'Where to draw from?',
      instructions: 'Choose whether to draw from the deck or take the discard',
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

    // Hand display
    const handSection = document.createElement('div');
    handSection.style.cssText = `
      margin: 16px 0;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
    `;

    const handLabel = document.createElement('div');
    handLabel.style.cssText = `
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
    `;
    handLabel.textContent = 'Your Hand';
    handSection.appendChild(handLabel);

    const handCards = document.createElement('div');
    handCards.className = 'hand spread';
    handCards.style.gap = 'clamp(2px, 1vw, 6px)';

    for (const card of scenario.hand) {
      const cardEl = renderCard(card, { draggable: false });
      cardEl.style.setProperty('--card-width', 'clamp(32px, 7vw, 45px)');
      handCards.appendChild(cardEl);
    }
    handSection.appendChild(handCards);
    gameArea.appendChild(handSection);

    // Draw options
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = `
      display: flex;
      gap: clamp(16px, 4vw, 32px);
      justify-content: center;
      align-items: center;
      margin: 20px 0;
    `;

    // Draw pile option
    const drawPileOption = this.createOption('draw', 'Draw Pile', '?', 'Unknown card');
    optionsContainer.appendChild(drawPileOption);

    // VS text
    const vs = document.createElement('span');
    vs.textContent = 'or';
    vs.style.cssText = 'color: var(--text-muted); font-size: 14px;';
    optionsContainer.appendChild(vs);

    // Discard pile option
    const discardOption = this.createOption('discard', 'Discard', scenario.discardTop, 'Known card');
    optionsContainer.appendChild(discardOption);

    gameArea.appendChild(optionsContainer);

    // Result area
    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = `
      margin-top: 16px;
      text-align: center;
      min-height: 100px;
    `;
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.correctCount}/${this.totalScenarios} correct`);
  }

  createOption(type, label, card, sublabel) {
    const option = document.createElement('div');
    option.className = 'draw-option';
    option.dataset.choice = type;
    option.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 12px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.15s;
      min-width: 100px;
    `;

    // Card display
    if (card === '?') {
      // Face-down card for draw pile
      const faceDown = document.createElement('div');
      faceDown.className = 'card flipped';
      faceDown.style.setProperty('--card-width', 'clamp(50px, 12vw, 70px)');
      faceDown.innerHTML = `
        <div class="card-face card-front"></div>
        <div class="card-face card-back"></div>
      `;
      option.appendChild(faceDown);
    } else {
      // Actual card for discard
      const cardEl = renderCard(card, { draggable: false });
      cardEl.style.setProperty('--card-width', 'clamp(50px, 12vw, 70px)');
      option.appendChild(cardEl);
    }

    // Label
    const labelEl = document.createElement('div');
    labelEl.style.cssText = 'font-weight: 600; font-size: clamp(12px, 3vw, 14px);';
    labelEl.textContent = label;
    option.appendChild(labelEl);

    // Sublabel
    const subEl = document.createElement('div');
    subEl.style.cssText = 'font-size: 11px; color: var(--text-muted);';
    subEl.textContent = sublabel;
    option.appendChild(subEl);

    // Hover effect
    option.addEventListener('mouseenter', () => {
      option.style.borderColor = 'var(--accent)';
      option.style.background = 'rgba(233, 69, 96, 0.1)';
    });
    option.addEventListener('mouseleave', () => {
      if (!option.classList.contains('selected')) {
        option.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        option.style.background = 'transparent';
      }
    });

    // Click handler
    option.addEventListener('click', () => this.handleChoice(type));

    return option;
  }

  handleChoice(choice) {
    const scenario = this.scenarios[this.currentScenario];
    const isCorrect = choice === scenario.correctChoice;
    const resultArea = document.getElementById('result-area');

    // Disable further clicks
    const options = document.querySelectorAll('.draw-option');
    options.forEach(opt => {
      opt.style.pointerEvents = 'none';
      if (opt.dataset.choice === scenario.correctChoice) {
        opt.style.borderColor = 'var(--success)';
        opt.style.background = 'rgba(0, 210, 106, 0.15)';
      } else if (opt.dataset.choice === choice && !isCorrect) {
        opt.style.borderColor = 'var(--error)';
        opt.style.background = 'rgba(255, 107, 107, 0.15)';
      }
    });

    if (isCorrect) {
      this.correctCount++;
      resultArea.innerHTML = `
        <div style="color: var(--success); font-weight: 600; margin-bottom: 8px;">Correct!</div>
        <div style="color: var(--text-light); font-size: 14px; max-width: 350px; margin: 0 auto;">
          ${scenario.explanation}
        </div>
      `;
    } else {
      resultArea.innerHTML = `
        <div style="color: var(--error); font-weight: 600; margin-bottom: 8px;">Not quite</div>
        <div style="color: var(--text-light); font-size: 14px; max-width: 350px; margin: 0 auto;">
          ${scenario.explanation}
        </div>
      `;
    }

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

export default Level06;
