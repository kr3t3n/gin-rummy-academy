/**
 * Level 15: Reading Discards
 * Analyze opponent patterns from their discards
 */

import { Level } from './level-engine.js';
import { createCard, renderCard } from '../cards.js';

export class Level15 extends Level {
  constructor() {
    super({
      number: 15,
      title: 'Reading Discards',
      subtitle: 'Opponent analysis',
      instructions: 'Predict what opponent is collecting based on discards',
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
        discards: [
          createCard('hearts', '3'),
          createCard('hearts', '7'),
          createCard('hearts', 'J')
        ],
        question: 'Based on these discards, what is opponent probably NOT collecting?',
        options: ['Hearts', 'Spades', 'High cards'],
        correctAnswer: 'Hearts',
        explanation: 'They discarded three hearts - they clearly don\'t need that suit!'
      },
      {
        discards: [
          createCard('spades', 'K'),
          createCard('diamonds', 'Q'),
          createCard('hearts', 'J')
        ],
        question: 'What does this pattern suggest?',
        options: ['They want face cards', 'They DON\'T want face cards', 'They want spades'],
        correctAnswer: 'They DON\'T want face cards',
        explanation: 'Three face cards discarded = they\'re likely building with low/mid cards.'
      },
      {
        discards: [
          createCard('clubs', '4'),
          createCard('clubs', '6'),
          createCard('diamonds', '5')
        ],
        question: 'What suit appears safe to discard to them?',
        options: ['Clubs', 'Diamonds', 'Hearts'],
        correctAnswer: 'Clubs',
        explanation: 'They threw two clubs - that suit is likely safe to give them.'
      },
      {
        discards: [
          createCard('spades', '8'),
          createCard('hearts', '8'),
          createCard('clubs', '8')
        ],
        question: 'What can you infer from these discards?',
        options: ['They don\'t need 8s', 'They want 8s', 'They want runs'],
        correctAnswer: 'They don\'t need 8s',
        explanation: 'Three 8s discarded! They definitely don\'t want that rank. Your 8s are safe.'
      },
      {
        discards: [
          createCard('diamonds', '2'),
          createCard('diamonds', '3'),
          createCard('diamonds', '5')
        ],
        question: 'Opponent picked up 4♦ from discard earlier. Now they discard these. What happened?',
        options: ['They completed a diamonds run', 'They gave up on diamonds', 'They want high diamonds'],
        correctAnswer: 'They completed a diamonds run',
        explanation: 'They grabbed the 4♦ then discarded 2,3,5 - they likely made a run around the 4!'
      }
    ];
    this.showScenario(gameArea);
  }

  showScenario(gameArea) {
    gameArea.innerHTML = '';
    const scenario = this.scenarios[this.currentScenario];

    // Top bar
    const topBar = this.createTopBar({
      progress: `${this.currentScenario + 1}/${this.scenarios.length}`,
      buttonText: 'Choose ↓',
      onButtonClick: () => {}
    });
    const btn = topBar.querySelector('.top-bar-btn');
    if (btn) btn.style.opacity = '0.3';
    gameArea.appendChild(topBar);

    // Opponent's discards
    const discardSection = document.createElement('div');
    discardSection.style.cssText = 'background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin: 12px 0;';
    discardSection.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; margin-bottom: 8px;">OPPONENT\'S RECENT DISCARDS</div>';

    const discardRow = document.createElement('div');
    discardRow.style.cssText = 'display: flex; gap: 8px; justify-content: center;';
    scenario.discards.forEach(card => {
      const el = renderCard(card, { draggable: false });
      el.style.setProperty('--card-width', '50px');
      discardRow.appendChild(el);
    });
    discardSection.appendChild(discardRow);
    gameArea.appendChild(discardSection);

    // Question
    const questionEl = document.createElement('div');
    questionEl.style.cssText = 'text-align: center; margin: 16px 0; font-weight: 500;';
    questionEl.textContent = scenario.question;
    gameArea.appendChild(questionEl);

    // Options
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'choice-buttons';
    optionsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px; max-width: 300px; margin: 0 auto;';

    scenario.options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = option;
      btn.style.cssText = 'padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: var(--text-light); cursor: pointer;';
      btn.addEventListener('click', () => this.handleAnswer(option, scenario, gameArea));
      optionsContainer.appendChild(btn);
    });
    gameArea.appendChild(optionsContainer);

    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = 'margin-top: 16px; text-align: center;';
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);
  }

  handleAnswer(answer, scenario, gameArea) {
    const isCorrect = answer === scenario.correctAnswer;
    if (isCorrect) this.correctCount++;

    const resultArea = document.getElementById('result-area');

    // Disable buttons and highlight
    gameArea.querySelectorAll('.choice-btn').forEach(btn => {
      btn.style.pointerEvents = 'none';
      if (btn.textContent === scenario.correctAnswer) {
        btn.style.borderColor = 'var(--success)';
        btn.style.background = 'rgba(0, 210, 106, 0.2)';
      } else if (btn.textContent === answer && !isCorrect) {
        btn.style.borderColor = 'var(--error)';
        btn.style.background = 'rgba(255, 107, 107, 0.2)';
      }
    });

    resultArea.innerHTML = `
      <div style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 600; margin-bottom: 8px;">
        ${isCorrect ? 'Correct!' : 'Not quite'}
      </div>
      <div style="color: var(--text-light); font-size: 13px;">${scenario.explanation}</div>
    `;

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);

    // Update top bar button
    if (this.currentScenario < this.scenarios.length - 1) {
      this.updateTopBarButton('Next →', () => {
        this.currentScenario++;
        this.showScenario(gameArea);
      });
    } else {
      this.updateTopBarButton('Finish', () => {
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
