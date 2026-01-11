/**
 * Level 20: Graduation
 * Celebration and completion screen
 */

import { Level } from './level-engine.js';

export class Level20 extends Level {
  constructor() {
    super({
      number: 20,
      title: 'Graduation',
      subtitle: 'You did it!',
      instructions: 'Summary and celebration',
      passingScore: 1
    });
  }

  init(gameArea) {
    gameArea.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🎓</div>
        <h2 style="margin-bottom: 16px; color: var(--success);">Congratulations!</h2>
        <p style="margin-bottom: 20px;">You've completed Gin Rummy Academy!</p>
        <div style="background: rgba(0, 210, 106, 0.1); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
          <p style="font-weight: 600; margin-bottom: 8px;">You learned:</p>
          <p style="font-size: 13px; color: var(--text-muted);">
            Card values • Sets & Runs • Deadwood • Drawing • Discarding •
            Knocking • Gin • Layoffs • Undercuts • Scoring • Strategy
          </p>
        </div>
        <p style="color: var(--accent); font-size: 14px; margin-bottom: 20px;">
          Now go play with Adelina! 🎴
        </p>
        <button class="btn btn-success" id="graduate-btn">Graduate!</button>
      </div>
    `;

    document.getElementById('graduate-btn').addEventListener('click', () => {
      this.score = 1;
      this.complete(true);
    });
  }
}
