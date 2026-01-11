/**
 * Level 18: End Game
 * Make critical late-game decisions
 */

import { Level } from './level-engine.js';

export class Level18 extends Level {
  constructor() {
    super({
      number: 18,
      title: 'End Game',
      subtitle: 'Final decisions',
      instructions: 'Make the right call in these late-game situations',
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
        situation: 'Stock is running low (5 cards left). You have 8 deadwood. Opponent seems close.',
        question: 'What should you do?',
        options: [
          { text: 'Knock now with 8', correct: true },
          { text: 'Wait for Gin', correct: false },
          { text: 'Keep drawing', correct: false }
        ],
        explanation: 'Knock! With only 5 cards left, waiting is risky. 8 deadwood is good enough - take the win!'
      },
      {
        situation: 'You have 4 deadwood. Opponent just knocked with 9.',
        question: 'What happens?',
        options: [
          { text: 'You score 5 points', correct: false },
          { text: 'Undercut! You score 25 + 5 = 30', correct: true },
          { text: 'It\'s a tie', correct: false }
        ],
        explanation: 'Undercut! Your 4 < their 9. You get 25 bonus + 5 point difference = 30 points!'
      },
      {
        situation: 'You have Gin (0 deadwood). You\'re about to knock.',
        question: 'How many bonus points do you get?',
        options: [
          { text: '10 points', correct: false },
          { text: '20 points', correct: false },
          { text: '25 points', correct: true }
        ],
        explanation: 'Gin bonus is 25 points, plus whatever deadwood your opponent has!'
      },
      {
        situation: 'Last card of stock. Neither player knocked. What happens?',
        question: 'Who wins this round?',
        options: [
          { text: 'Player with lower deadwood', correct: false },
          { text: 'Nobody - it\'s a draw', correct: true },
          { text: 'The player who dealt', correct: false }
        ],
        explanation: 'Draw! If the stock runs out without a knock, no one scores. Shuffle and re-deal.'
      },
      {
        situation: 'Score is 95-90 (game to 100). You have 3 deadwood. Opponent likely has ~15.',
        question: 'Should you knock?',
        options: [
          { text: 'Yes - win the game now!', correct: true },
          { text: 'No - go for Gin for more points', correct: false },
          { text: 'Wait to see what they discard', correct: false }
        ],
        explanation: 'Knock and win! You\'d score ~12 points, reaching 107. Going for Gin risks letting them catch up.'
      }
    ];
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
    progressCount.textContent = `${this.currentScenario + 1}/${this.scenarios.length}`;
    progressCount.style.cssText = 'margin-bottom: 12px;';
    gameArea.appendChild(progressCount);

    // Late game badge
    const badge = document.createElement('div');
    badge.style.cssText = 'display: inline-block; background: var(--accent); color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; margin-bottom: 12px;';
    badge.textContent = '⏰ LATE GAME';
    gameArea.appendChild(badge);

    // Situation
    const situationEl = document.createElement('div');
    situationEl.style.cssText = 'background: rgba(255,255,255,0.05); padding: 14px; border-radius: 8px; margin: 8px 0; font-size: 14px; line-height: 1.5;';
    situationEl.textContent = scenario.situation;
    gameArea.appendChild(situationEl);

    // Question
    const questionEl = document.createElement('div');
    questionEl.style.cssText = 'text-align: center; margin: 16px 0; font-weight: 600;';
    questionEl.textContent = scenario.question;
    gameArea.appendChild(questionEl);

    // Options
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px; max-width: 350px; margin: 0 auto;';

    scenario.options.forEach((option, idx) => {
      const optBtn = document.createElement('button');
      optBtn.className = 'choice-btn';
      optBtn.dataset.idx = idx;
      optBtn.textContent = option.text;
      optBtn.style.cssText = 'padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: var(--text-light); cursor: pointer; text-align: left;';
      optBtn.addEventListener('click', () => this.handleAnswer(option, scenario, gameArea));
      optionsContainer.appendChild(optBtn);
    });
    gameArea.appendChild(optionsContainer);

    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = 'margin-top: 16px; text-align: center;';
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);
  }

  handleAnswer(selectedOption, scenario, gameArea) {
    const isCorrect = selectedOption.correct;
    if (isCorrect) this.correctCount++;

    const resultArea = document.getElementById('result-area');

    gameArea.querySelectorAll('.choice-btn').forEach(choiceBtn => {
      choiceBtn.style.pointerEvents = 'none';
      const idx = parseInt(choiceBtn.dataset.idx);
      if (scenario.options[idx].correct) {
        choiceBtn.style.borderColor = 'var(--success)';
        choiceBtn.style.background = 'rgba(0, 210, 106, 0.2)';
      } else if (choiceBtn.textContent === selectedOption.text && !isCorrect) {
        choiceBtn.style.borderColor = 'var(--error)';
        choiceBtn.style.background = 'rgba(255, 107, 107, 0.2)';
      }
    });

    resultArea.innerHTML = `
      <div style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 600; margin-bottom: 8px;">
        ${isCorrect ? 'Correct!' : 'Not quite'}
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
