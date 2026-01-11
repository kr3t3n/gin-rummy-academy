/**
 * Level 12: Undercut!
 * Beat the knocker with equal or lower deadwood
 */

import { Level } from './level-engine.js';

export class Level12 extends Level {
  constructor() {
    super({
      number: 12,
      title: 'Undercut!',
      subtitle: 'Beat the knocker',
      instructions: 'Determine if an undercut is possible and who wins',
      passingScore: 5,
      starThresholds: { threeStarMax: 0, twoStarMax: 0 }
    });
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
  }

  init(gameArea) {
    this.scenarios = [
      { knockerDW: 8, defenderDW: 6, canUndercut: true, winner: 'defender', bonus: 25, explanation: 'Undercut! Defender has less deadwood (6<8). Gets 25 bonus + difference.' },
      { knockerDW: 10, defenderDW: 10, canUndercut: true, winner: 'defender', bonus: 25, explanation: 'Tie goes to defender! That\'s an undercut with 25 bonus.' },
      { knockerDW: 5, defenderDW: 12, canUndercut: false, winner: 'knocker', bonus: 0, explanation: 'Knocker wins. Defender has more deadwood (12>5). Knocker scores 7.' },
      { knockerDW: 9, defenderDW: 4, canUndercut: true, winner: 'defender', bonus: 25, explanation: 'Big undercut! Defender scores 25 + 5 = 30 points.' },
      { knockerDW: 3, defenderDW: 8, canUndercut: false, winner: 'knocker', bonus: 0, explanation: 'Knocker wins with just 3 deadwood. Scores 5 points.' }
    ];
    this.showScenario(gameArea);
  }

  showScenario(gameArea) {
    gameArea.innerHTML = '';
    const s = this.scenarios[this.currentScenario];

    // Button in header (top-right, initially faded)
    const headerBtn = this.createHeaderButton({
      buttonText: 'Choose ↓',
      onButtonClick: () => {}
    });
    if (headerBtn) headerBtn.style.opacity = '0.3';

    // Progress counter in game area
    const progressCount = document.createElement('div');
    progressCount.className = 'selection-count top-bar-progress';
    progressCount.textContent = `${this.currentScenario + 1}/5`;
    progressCount.style.cssText = 'margin-bottom: 12px;';
    gameArea.appendChild(progressCount);

    const card = document.createElement('div');
    card.style.cssText = 'background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; text-align: center; margin: 16px 0;';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-around; margin-bottom: 16px;">
        <div><div style="color: var(--accent); font-size: 24px; font-weight: 700;">${s.knockerDW}</div><div style="color: var(--text-muted); font-size: 12px;">Knocker</div></div>
        <div style="color: var(--text-muted);">vs</div>
        <div><div style="color: var(--success); font-size: 24px; font-weight: 700;">${s.defenderDW}</div><div style="color: var(--text-muted); font-size: 12px;">Defender</div></div>
      </div>
    `;
    gameArea.appendChild(card);

    const q = document.createElement('div');
    q.style.cssText = 'font-weight: 600; margin-bottom: 16px; text-align: center;';
    q.textContent = 'Can the defender undercut?';
    gameArea.appendChild(q);

    const btns = document.createElement('div');
    btns.className = 'choice-buttons';
    ['Yes, Undercut!', 'No, Knocker wins'].forEach((txt, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = txt;
      btn.addEventListener('click', () => this.handleAnswer(i === 0, s));
      btns.appendChild(btn);
    });
    gameArea.appendChild(btns);

    const result = document.createElement('div');
    result.id = 'result-area';
    result.style.marginTop = '16px';
    gameArea.appendChild(result);
  }

  handleAnswer(userSaysUndercut, s) {
    const isCorrect = userSaysUndercut === s.canUndercut;
    if (isCorrect) this.correctCount++;

    const result = document.getElementById('result-area');
    result.innerHTML = `
      <div style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 600; margin-bottom: 8px;">${isCorrect ? 'Correct!' : 'Not quite'}</div>
      <div style="color: var(--text-light); font-size: 14px;">${s.explanation}</div>
    `;

    this.gameAreaEl.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);

    // Update header button
    if (this.currentScenario < 4) {
      this.updateHeaderButton('Next →', () => { this.currentScenario++; this.showScenario(this.gameAreaEl); });
    } else {
      this.updateHeaderButton('Finish', () => { this.score = this.correctCount; this.complete(this.correctCount >= 5); });
    }
  }

  reset() { this.currentScenario = 0; this.correctCount = 0; super.reset(); }
}
