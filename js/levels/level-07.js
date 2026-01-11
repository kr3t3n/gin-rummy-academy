/**
 * Level 7: The Discard
 * Teaches discarding strategy - what to throw away
 */

import { Level } from './level-engine.js';
import { createCard, renderCard, shuffle, SUITS, RANK_VALUES } from '../cards.js';
import { findOptimalMelds, calculateDeadwood } from '../melds.js';

/**
 * Generates scenarios for discarding decisions
 */
function generateScenarios() {
  const suits = shuffle([...SUITS]);

  return [
    {
      id: 1,
      hand: [
        createCard(suits[0], '7'), createCard(suits[1], '7'), createCard(suits[2], '7'),  // Set
        createCard(suits[0], '4'), createCard(suits[0], '5'), createCard(suits[0], '6'),  // Run
        createCard(suits[1], 'K'),  // High deadwood - BEST to discard
        createCard(suits[2], '3'),  // Low deadwood
        createCard(suits[3], '2'),  // Low deadwood
        createCard(suits[1], '9'),  // Medium deadwood
        createCard(suits[3], 'A')   // Draw this
      ],
      bestDiscard: `K-${suits[1]}`,
      goodDiscards: [`K-${suits[1]}`, `9-${suits[1]}`],
      explanation: 'Discard the King (10 pts). High cards that aren\'t close to forming melds should go first to reduce deadwood quickly.'
    },
    {
      id: 2,
      hand: [
        createCard(suits[0], 'J'), createCard(suits[1], 'J'),  // Pair - potential set
        createCard(suits[2], '8'), createCard(suits[2], '9'),  // Potential run
        createCard(suits[0], 'Q'),  // Could complete J meld OR join Q meld
        createCard(suits[1], '5'),
        createCard(suits[3], '4'),
        createCard(suits[0], '2'),
        createCard(suits[3], 'K'),  // Isolated high card - BEST
        createCard(suits[2], '3'),
        createCard(suits[1], 'A')
      ],
      bestDiscard: `K-${suits[3]}`,
      goodDiscards: [`K-${suits[3]}`],
      explanation: 'Discard the King. It\'s isolated (not near forming any meld) and costs 10 points. Keep cards that are close to completing melds.'
    },
    {
      id: 3,
      hand: [
        createCard(suits[0], '6'), createCard(suits[0], '7'), createCard(suits[0], '8'),  // Run
        createCard(suits[1], '3'), createCard(suits[2], '3'),  // Pair
        createCard(suits[3], 'Q'),  // High isolated
        createCard(suits[1], '9'),
        createCard(suits[2], '5'),
        createCard(suits[3], '2'),
        createCard(suits[0], 'A'),
        createCard(suits[1], 'K')   // Another high isolated
      ],
      bestDiscard: `Q-${suits[3]}`,
      goodDiscards: [`Q-${suits[3]}`, `K-${suits[1]}`],
      explanation: 'Either Queen or King is good - both are isolated high cards. Discard high deadwood when it\'s not contributing to potential melds.'
    },
    {
      id: 4,
      hand: [
        createCard(suits[0], 'A'), createCard(suits[0], '2'), createCard(suits[0], '3'),  // Run
        createCard(suits[1], '9'), createCard(suits[2], '9'), createCard(suits[3], '9'),  // Set
        createCard(suits[1], '6'),  // Low-ish
        createCard(suits[2], '7'),  // Medium
        createCard(suits[3], '4'),  // Low
        createCard(suits[0], '10'), // Medium
        createCard(suits[1], 'Q')   // High - BEST
      ],
      bestDiscard: `Q-${suits[1]}`,
      goodDiscards: [`Q-${suits[1]}`, `10-${suits[0]}`],
      explanation: 'Discard the Queen. With 6 cards already in melds, focus on minimizing deadwood with the remaining 5. High cards go first!'
    },
    {
      id: 5,
      hand: [
        createCard(suits[0], '5'), createCard(suits[1], '5'),  // Pair
        createCard(suits[2], '5'),  // Completes set! Keep all 5s
        createCard(suits[0], 'J'), createCard(suits[0], 'Q'),  // Potential run
        createCard(suits[1], '8'),
        createCard(suits[2], '2'),
        createCard(suits[3], '9'),
        createCard(suits[1], '3'),
        createCard(suits[3], 'K'),  // Isolated high - BEST
        createCard(suits[2], 'A')
      ],
      bestDiscard: `K-${suits[3]}`,
      goodDiscards: [`K-${suits[3]}`, `9-${suits[3]}`],
      explanation: 'Discard the King. The 5s form a set (keep them!), J-Q might become a run. The King is isolated deadwood.'
    }
  ];
}

export class Level07 extends Level {
  constructor() {
    super({
      number: 7,
      title: 'The Discard',
      subtitle: 'What to throw away',
      instructions: 'Select the best card to discard from your hand',
      passingScore: 5,
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

    // Find melds in hand for display
    const { melds, deadwood } = findOptimalMelds(scenario.hand.slice(0, -1)); // Exclude "drawn" card

    // Progress
    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `Scenario ${this.currentScenario + 1}/${this.totalScenarios}`;
    gameArea.appendChild(progress);

    // Instructions
    const instr = document.createElement('p');
    instr.style.cssText = `
      color: var(--text-muted);
      font-size: clamp(12px, 2.5vw, 14px);
      text-align: center;
      margin-bottom: 12px;
    `;
    instr.textContent = 'You drew a card. Now pick one to discard:';
    gameArea.appendChild(instr);

    // Hand display
    const handContainer = document.createElement('div');
    handContainer.className = 'hand spread';
    handContainer.style.marginBottom = '16px';

    for (const card of scenario.hand) {
      const cardEl = renderCard(card, {
        draggable: false,
        onClick: (c, el) => this.handleDiscard(c, el, scenario)
      });
      cardEl.style.cursor = 'pointer';
      cardEl.style.transition = 'transform 0.15s, box-shadow 0.15s';

      // Hover effect
      cardEl.addEventListener('mouseenter', () => {
        if (!cardEl.classList.contains('selected')) {
          cardEl.style.transform = 'translateY(-8px)';
          cardEl.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
        }
      });
      cardEl.addEventListener('mouseleave', () => {
        if (!cardEl.classList.contains('selected')) {
          cardEl.style.transform = '';
          cardEl.style.boxShadow = '';
        }
      });

      handContainer.appendChild(cardEl);
    }
    gameArea.appendChild(handContainer);

    // Deadwood indicator
    const dwIndicator = document.createElement('div');
    dwIndicator.id = 'dw-indicator';
    dwIndicator.style.cssText = `
      text-align: center;
      color: var(--text-muted);
      font-size: 13px;
      margin-bottom: 12px;
    `;
    dwIndicator.innerHTML = `Current deadwood: <strong>${calculateDeadwood(deadwood)}</strong> points`;
    gameArea.appendChild(dwIndicator);

    // Result area
    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = `
      margin-top: 16px;
      text-align: center;
      min-height: 80px;
    `;
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.correctCount}/${this.totalScenarios} correct`);
  }

  handleDiscard(card, element, scenario) {
    // Prevent multiple selections
    if (this.gameAreaEl.querySelector('.card.selected')) return;

    element.classList.add('selected');
    element.style.transform = 'translateY(-12px)';
    element.style.boxShadow = '0 0 20px var(--accent)';

    // Calculate new deadwood without this card
    const remainingHand = scenario.hand.filter(c => c.id !== card.id);
    const { deadwood } = findOptimalMelds(remainingHand);
    const newDeadwood = calculateDeadwood(deadwood);

    // Check if good discard
    const isGood = scenario.goodDiscards.includes(card.id);
    const isBest = card.id === scenario.bestDiscard;

    // Update indicator
    const indicator = document.getElementById('dw-indicator');
    const oldDeadwood = parseInt(indicator.textContent.match(/\d+/)[0], 10);
    const change = newDeadwood - oldDeadwood;

    indicator.innerHTML = `
      New deadwood: <strong>${newDeadwood}</strong> points
      <span style="color: ${change <= 0 ? 'var(--success)' : 'var(--error)'}">
        (${change <= 0 ? '' : '+'}${change})
      </span>
    `;

    // Show result
    const resultArea = document.getElementById('result-area');

    if (isGood) {
      this.correctCount++;
      resultArea.innerHTML = `
        <div style="color: var(--success); font-weight: 600; margin-bottom: 8px;">
          ${isBest ? 'Perfect choice!' : 'Good choice!'}
        </div>
        <div style="color: var(--text-light); font-size: 14px; max-width: 350px; margin: 0 auto;">
          ${scenario.explanation}
        </div>
      `;
      element.classList.add('correct');
    } else {
      resultArea.innerHTML = `
        <div style="color: var(--error); font-weight: 600; margin-bottom: 8px;">
          Not optimal
        </div>
        <div style="color: var(--text-light); font-size: 14px; max-width: 350px; margin: 0 auto;">
          ${scenario.explanation}
        </div>
      `;
      element.classList.add('incorrect');

      // Highlight the best choice
      const cards = this.gameAreaEl.querySelectorAll('.card');
      cards.forEach(c => {
        if (c.dataset.cardId === scenario.bestDiscard) {
          c.style.boxShadow = '0 0 20px var(--success)';
        }
      });
    }

    // Disable all cards
    const allCards = this.gameAreaEl.querySelectorAll('.card');
    allCards.forEach(c => c.style.pointerEvents = 'none');

    this.updateProgress(`${this.correctCount}/${this.totalScenarios} correct`);

    // Next button
    setTimeout(() => {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.style.marginTop = '16px';

      if (this.currentScenario < this.totalScenarios - 1) {
        nextBtn.textContent = 'Next Scenario';
        nextBtn.addEventListener('click', () => {
          this.currentScenario++;
          this.showScenario(this.gameAreaEl);
        });
      } else {
        nextBtn.textContent = 'See Results';
        nextBtn.addEventListener('click', () => {
          this.score = this.correctCount;
          this.complete(this.correctCount >= this.passingScore);
        });
      }

      resultArea.appendChild(nextBtn);
    }, 500);
  }

  reset() {
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
    super.reset();
  }
}

export default Level07;
