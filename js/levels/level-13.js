/**
 * Level 13: Score the Round
 * Calculate exact scores for different scenarios
 */

import { Level } from './level-engine.js';

export class Level13 extends Level {
  constructor() {
    super({
      number: 13,
      title: 'Score the Round',
      subtitle: 'Full scoring',
      instructions: 'Calculate the exact score for each round',
      passingScore: 4,
      starThresholds: { threeStarMax: 0, twoStarMax: 0 }
    });
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
  }

  init(gameArea) {
    this.scenarios = [
      { type: 'knock', knockerDW: 6, defenderDW: 15, answer: 9, explanation: 'Knock win: 15 - 6 = 9 points' },
      { type: 'gin', defenderDW: 22, answer: 47, explanation: 'Gin: 25 bonus + 22 = 47 points' },
      { type: 'undercut', knockerDW: 8, defenderDW: 5, answer: 28, explanation: 'Undercut: 25 bonus + (8-5) = 28 points for defender' },
      { type: 'knock', knockerDW: 3, defenderDW: 18, answer: 15, explanation: 'Knock: 18 - 3 = 15 points' }
    ];
    this.showScenario(gameArea);
  }

  showScenario(gameArea) {
    gameArea.innerHTML = '';
    const s = this.scenarios[this.currentScenario];

    // Check button in header (top-right)
    this.createHeaderButton({
      buttonText: 'Check ✓',
      onButtonClick: () => this.checkAnswer(s)
    });

    // Progress counter in game area
    const progressCount = document.createElement('div');
    progressCount.className = 'selection-count top-bar-progress';
    progressCount.textContent = `${this.currentScenario + 1}/4`;
    progressCount.style.cssText = 'margin-bottom: 12px;';
    gameArea.appendChild(progressCount);

    const card = document.createElement('div');
    card.style.cssText = 'background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin: 16px 0;';

    let html = `<div style="font-weight: 600; color: var(--accent); margin-bottom: 12px; text-transform: uppercase;">${s.type}</div>`;
    if (s.type === 'gin') {
      html += `<div>Opponent deadwood: ${s.defenderDW}</div>`;
    } else {
      html += `<div>Knocker deadwood: ${s.knockerDW}</div>`;
      html += `<div>Defender deadwood: ${s.defenderDW}</div>`;
    }
    card.innerHTML = html;
    gameArea.appendChild(card);

    const q = document.createElement('div');
    q.style.cssText = 'text-align: center; margin-bottom: 12px;';
    q.textContent = 'What is the winner\'s score?';
    gameArea.appendChild(q);

    const inputContainer = document.createElement('div');
    inputContainer.className = 'deadwood-input-container';
    inputContainer.style.justifyContent = 'center';

    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.pattern = '[0-9]*';
    input.className = 'deadwood-input';
    input.id = 'score-input';
    input.placeholder = '?';
    input.autocomplete = 'off';

    // Submit on Enter
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.checkAnswer(s);
    });

    inputContainer.appendChild(input);
    gameArea.appendChild(inputContainer);

    const result = document.createElement('div');
    result.id = 'result-area';
    result.style.marginTop = '16px';
    gameArea.appendChild(result);
  }

  checkAnswer(s) {
    const input = document.getElementById('score-input');
    const userAnswer = parseInt(input.value, 10);
    const isCorrect = userAnswer === s.answer;
    if (isCorrect) this.correctCount++;

    const result = document.getElementById('result-area');
    result.innerHTML = `
      <div style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 600;">${isCorrect ? 'Correct!' : `The answer was ${s.answer}`}</div>
      <div style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">${s.explanation}</div>
    `;

    input.disabled = true;

    // Update header button
    if (this.currentScenario < 3) {
      this.updateHeaderButton('Next →', () => { this.currentScenario++; this.showScenario(this.gameAreaEl); });
    } else {
      this.updateHeaderButton('Finish', () => { this.score = this.correctCount; this.complete(this.correctCount >= 4); });
    }
  }

  reset() { this.currentScenario = 0; this.correctCount = 0; super.reset(); }
}
