/**
 * Level 8: Knock Knock
 * Teaches when you CAN knock (deadwood <= 10)
 */

import { Level } from './level-engine.js';
import { createCard, renderCard, shuffle, SUITS } from '../cards.js';
import { findOptimalMelds, calculateDeadwood } from '../melds.js';

/**
 * Generates hands for knock eligibility questions
 */
function generateHands() {
  const suits = shuffle([...SUITS]);

  return [
    {
      id: 1,
      hand: [
        createCard(suits[0], '7'), createCard(suits[1], '7'), createCard(suits[2], '7'),  // Set (0)
        createCard(suits[0], '4'), createCard(suits[0], '5'), createCard(suits[0], '6'),  // Run (0)
        createCard(suits[1], '3'),  // 3
        createCard(suits[2], '2'),  // 2
        createCard(suits[3], 'A'),  // 1
        createCard(suits[1], '4')   // 4 = total 10
      ],
      canKnock: true,
      deadwood: 10,
      explanation: 'Yes! Deadwood is exactly 10 (3+2+1+4). You CAN knock with 10 or less.'
    },
    {
      id: 2,
      hand: [
        createCard(suits[0], 'J'), createCard(suits[1], 'J'), createCard(suits[2], 'J'),  // Set (0)
        createCard(suits[0], '9'), createCard(suits[0], '10'), createCard(suits[0], 'Q'),  // Not a run!
        createCard(suits[1], 'K'),  // 10
        createCard(suits[2], '5'),  // 5
        createCard(suits[3], '3'),  // 3
        createCard(suits[1], '2')   // 2 = total 29 (9+10+10 not meld)
      ],
      canKnock: false,
      deadwood: 29,
      explanation: 'No! The 9-10-Q is not a run (skips Jack). Deadwood is 29 points - way over 10.'
    },
    {
      id: 3,
      hand: [
        createCard(suits[0], 'A'), createCard(suits[0], '2'), createCard(suits[0], '3'),  // Run (0)
        createCard(suits[1], '5'), createCard(suits[2], '5'), createCard(suits[3], '5'),  // Set (0)
        createCard(suits[1], '4'),  // 4
        createCard(suits[2], '3'),  // 3
        createCard(suits[3], '2'),  // 2
        createCard(suits[1], 'A')   // 1 = total 10
      ],
      canKnock: true,
      deadwood: 10,
      explanation: 'Yes! Two melds and only 10 deadwood (4+3+2+1). Exactly at the knock threshold.'
    },
    {
      id: 4,
      hand: [
        createCard(suits[0], 'K'), createCard(suits[1], 'K'), createCard(suits[2], 'K'),  // Set (0)
        createCard(suits[0], '2'), createCard(suits[0], '3'), createCard(suits[0], '4'),  // Run (0)
        createCard(suits[3], 'Q'),  // 10
        createCard(suits[1], 'A'),  // 1 = total 11
        createCard(suits[2], '6'),  // NO this makes 17
        createCard(suits[3], '7')
      ],
      canKnock: false,
      deadwood: 24,
      explanation: 'No! Even with two melds, deadwood is Q(10)+A(1)+6+7 = 24. Need 10 or less.'
    },
    {
      id: 5,
      hand: [
        createCard(suits[0], '8'), createCard(suits[0], '9'), createCard(suits[0], '10'),  // Run
        createCard(suits[1], '8'), createCard(suits[2], '8'),  // Pair only, not meld
        createCard(suits[3], '6'),
        createCard(suits[1], '5'),
        createCard(suits[2], '4'),
        createCard(suits[3], '3'),
        createCard(suits[1], '2')
      ],
      canKnock: false,
      deadwood: 36,
      explanation: 'No! Only 8-9-10 is a meld. The pair of 8s isn\'t a set (need 3). Deadwood is 36.'
    },
    {
      id: 6,
      hand: [
        createCard(suits[0], '6'), createCard(suits[0], '7'), createCard(suits[0], '8'), createCard(suits[0], '9'),  // Run 4
        createCard(suits[1], '3'), createCard(suits[2], '3'), createCard(suits[3], '3'),  // Set (0)
        createCard(suits[1], '2'),  // 2
        createCard(suits[2], 'A'),  // 1
        createCard(suits[3], 'A')   // 1 = 4 total
      ],
      canKnock: true,
      deadwood: 4,
      explanation: 'Yes! Great hand. Only 4 deadwood (2+1+1). Well under the 10 threshold.'
    }
  ];
}

export class Level08 extends Level {
  constructor() {
    super({
      number: 8,
      title: 'Knock Knock',
      subtitle: 'Can you knock?',
      instructions: 'Determine if each hand can knock (deadwood \u2264 10)',
      passingScore: 6,
      starThresholds: { threeStarMax: 0, twoStarMax: 0 }
    });

    this.hands = [];
    this.currentHand = 0;
    this.correctCount = 0;
    this.totalHands = 6;
  }

  init(gameArea) {
    this.hands = generateHands();
    this.showHand(gameArea);
  }

  showHand(gameArea) {
    gameArea.innerHTML = '';
    const hand = this.hands[this.currentHand];
    const { melds, deadwood } = findOptimalMelds(hand.hand);

    // Progress
    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `Hand ${this.currentHand + 1}/${this.totalHands}`;
    gameArea.appendChild(progress);

    // Rule reminder
    const reminder = document.createElement('p');
    reminder.style.cssText = `
      color: var(--text-muted);
      font-size: clamp(11px, 2.5vw, 13px);
      text-align: center;
      margin-bottom: 12px;
    `;
    reminder.textContent = 'You can knock when deadwood is 10 or less';
    gameArea.appendChild(reminder);

    // Hand display
    const handContainer = document.createElement('div');
    handContainer.className = 'hand spread';
    handContainer.style.marginBottom = '20px';

    for (const card of hand.hand) {
      const cardEl = renderCard(card, { draggable: false });
      cardEl.style.setProperty('--card-width', 'clamp(35px, 8vw, 50px)');
      handContainer.appendChild(cardEl);
    }
    gameArea.appendChild(handContainer);

    // Question
    const question = document.createElement('div');
    question.style.cssText = `
      font-size: clamp(16px, 4vw, 20px);
      font-weight: 600;
      text-align: center;
      margin-bottom: 16px;
    `;
    question.textContent = 'Can you knock with this hand?';
    gameArea.appendChild(question);

    // Yes/No buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'choice-buttons';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'choice-btn';
    yesBtn.textContent = 'Yes, I can knock';
    yesBtn.addEventListener('click', () => this.handleAnswer(true, hand));

    const noBtn = document.createElement('button');
    noBtn.className = 'choice-btn';
    noBtn.textContent = 'No, cannot knock';
    noBtn.addEventListener('click', () => this.handleAnswer(false, hand));

    buttonsContainer.appendChild(yesBtn);
    buttonsContainer.appendChild(noBtn);
    gameArea.appendChild(buttonsContainer);

    // Result area
    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = `
      margin-top: 20px;
      text-align: center;
    `;
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.correctCount}/${this.totalHands} correct`);
  }

  handleAnswer(userSaysCanKnock, hand) {
    const isCorrect = userSaysCanKnock === hand.canKnock;
    const resultArea = document.getElementById('result-area');

    // Disable buttons
    const buttons = this.gameAreaEl.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent.includes('Yes') && hand.canKnock) {
        btn.classList.add('correct');
      } else if (btn.textContent.includes('No') && !hand.canKnock) {
        btn.classList.add('correct');
      } else if (btn.textContent.includes('Yes') && userSaysCanKnock && !hand.canKnock) {
        btn.classList.add('incorrect');
      } else if (btn.textContent.includes('No') && !userSaysCanKnock && hand.canKnock) {
        btn.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      this.correctCount++;
      resultArea.innerHTML = `
        <div style="color: var(--success); font-weight: 600; margin-bottom: 8px;">Correct!</div>
        <div style="color: var(--accent); font-size: 18px; margin-bottom: 8px;">
          Deadwood: ${hand.deadwood} points
        </div>
        <div style="color: var(--text-light); font-size: 14px; max-width: 350px; margin: 0 auto;">
          ${hand.explanation}
        </div>
      `;
    } else {
      resultArea.innerHTML = `
        <div style="color: var(--error); font-weight: 600; margin-bottom: 8px;">Not quite</div>
        <div style="color: var(--accent); font-size: 18px; margin-bottom: 8px;">
          Deadwood: ${hand.deadwood} points
        </div>
        <div style="color: var(--text-light); font-size: 14px; max-width: 350px; margin: 0 auto;">
          ${hand.explanation}
        </div>
      `;
    }

    this.updateProgress(`${this.correctCount}/${this.totalHands} correct`);

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
        nextBtn.textContent = 'See Results';
        nextBtn.addEventListener('click', () => {
          this.score = this.correctCount;
          this.complete(this.correctCount >= this.passingScore);
        });
      }

      resultArea.appendChild(nextBtn);
    }, 300);
  }

  reset() {
    this.hands = [];
    this.currentHand = 0;
    this.correctCount = 0;
    super.reset();
  }
}

export default Level08;
