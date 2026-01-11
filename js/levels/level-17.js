/**
 * Level 17: Defensive Play
 * Make strategic defensive decisions
 */

import { Level } from './level-engine.js';

export class Level17 extends Level {
  constructor() {
    super({
      number: 17,
      title: 'Defensive Play',
      subtitle: 'Protect your hand',
      instructions: 'Make the safest choice in each defensive scenario',
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
        situation: 'Opponent knocked last round with a low deadwood (3). They seem aggressive.',
        question: 'How should you adjust your strategy?',
        options: [
          { text: 'Play more aggressively - knock early too', correct: false },
          { text: 'Focus on Gin - don\'t give them undercut chances', correct: true },
          { text: 'Keep high cards for flexibility', correct: false }
        ],
        explanation: 'Against aggressive knockers, aim for Gin. If you knock with 8-10 deadwood, they might undercut you!'
      },
      {
        situation: 'You have: 7♥ 8♥ 9♥ (run), K♠ K♦ (pair), and 5 deadwood cards. Opponent just picked up a King from discard.',
        question: 'What should you do with your King pair?',
        options: [
          { text: 'Break it up - discard a King', correct: false },
          { text: 'Keep building - they can\'t have all 4 Kings', correct: true },
          { text: 'Discard both Kings immediately', correct: false }
        ],
        explanation: 'Keep your Kings! They picked up ONE King, but there are still 2 others. Your pair is still valuable.'
      },
      {
        situation: 'Early game. You draw and your deadwood is 32. Opponent is drawing from deck (not taking discards).',
        question: 'What does their behavior suggest?',
        options: [
          { text: 'They have a bad hand - attack!', correct: false },
          { text: 'Nothing - it\'s too early to tell', correct: true },
          { text: 'They\'re close to Gin', correct: false }
        ],
        explanation: 'Early game deck draws are normal - not enough info yet. Keep playing your strategy.'
      },
      {
        situation: 'Opponent has been discarding only low cards (2s, 3s, 4s). They seem to grab mid-range cards.',
        question: 'What are they likely building?',
        options: [
          { text: 'Sets of low cards', correct: false },
          { text: 'Runs in the 5-10 range', correct: true },
          { text: 'Face card combinations', correct: false }
        ],
        explanation: 'They\'re throwing lows and keeping mids - likely building runs around 6-7-8-9 range. Be careful!'
      },
      {
        situation: 'You have 6 deadwood but your only meld-in-progress is waiting for a card opponent likely has.',
        question: 'Should you knock now?',
        options: [
          { text: 'Yes - 6 is a safe knock', correct: true },
          { text: 'No - wait for the meld', correct: false },
          { text: 'Discard from the meld attempt first', correct: false }
        ],
        explanation: 'Knock! 6 deadwood is excellent. Waiting for a card they probably have is risky - take your win.'
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

    // Situation
    const situationEl = document.createElement('div');
    situationEl.style.cssText = 'background: rgba(255,255,255,0.05); padding: 14px; border-radius: 8px; margin: 12px 0; font-size: 14px; line-height: 1.5;';
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

    // Highlight buttons
    gameArea.querySelectorAll('.choice-btn').forEach(btn => {
      btn.style.pointerEvents = 'none';
      const idx = parseInt(btn.dataset.idx);
      if (scenario.options[idx].correct) {
        btn.style.borderColor = 'var(--success)';
        btn.style.background = 'rgba(0, 210, 106, 0.2)';
      } else if (btn.textContent === selectedOption.text && !isCorrect) {
        btn.style.borderColor = 'var(--error)';
        btn.style.background = 'rgba(255, 107, 107, 0.2)';
      }
    });

    resultArea.innerHTML = `
      <div style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 600; margin-bottom: 8px;">
        ${isCorrect ? 'Smart play!' : 'Not ideal'}
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
