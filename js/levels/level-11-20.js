/**
 * Levels 11-20: Advanced Gin Rummy concepts
 * Each level follows the same pattern as previous levels
 */

import { Level } from './level-engine.js';
import { createCard, renderCard, shuffle, SUITS, createDeck, deal } from '../cards.js';
import { findOptimalMelds, calculateDeadwood, canLayOff, findLayoffs } from '../melds.js';

// ============= LEVEL 11: The Layoff =============
export class Level11 extends Level {
  constructor() {
    super({
      number: 11,
      title: 'The Layoff',
      subtitle: 'Add to opponent\'s melds',
      instructions: 'Find cards from your deadwood that can lay off onto opponent melds',
      passingScore: 3,
      starThresholds: { threeStarMax: 0, twoStarMax: 1 }
    });
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
  }

  init(gameArea) {
    this.scenarios = [
      {
        opponentMelds: [
          { type: 'set', cards: [createCard('hearts', '7'), createCard('diamonds', '7'), createCard('clubs', '7')] },
          { type: 'run', cards: [createCard('spades', '4'), createCard('spades', '5'), createCard('spades', '6')] }
        ],
        yourDeadwood: [
          createCard('spades', '7'),  // Can lay off on set
          createCard('spades', '3'),  // Can lay off on run (low end)
          createCard('hearts', 'K'),  // Cannot
          createCard('diamonds', '2') // Cannot
        ],
        validLayoffs: ['7-spades', '3-spades']
      },
      {
        opponentMelds: [
          { type: 'run', cards: [createCard('hearts', 'J'), createCard('hearts', 'Q'), createCard('hearts', 'K')] }
        ],
        yourDeadwood: [
          createCard('hearts', '10'),  // Can lay off (extends low)
          createCard('hearts', 'A'),   // Cannot (K-A not allowed)
          createCard('diamonds', 'Q'), // Cannot (wrong suit)
          createCard('clubs', '5')
        ],
        validLayoffs: ['10-hearts']
      },
      {
        opponentMelds: [
          { type: 'set', cards: [createCard('hearts', 'Q'), createCard('diamonds', 'Q'), createCard('clubs', 'Q')] },
          { type: 'run', cards: [createCard('clubs', '8'), createCard('clubs', '9'), createCard('clubs', '10')] }
        ],
        yourDeadwood: [
          createCard('spades', 'Q'),  // Can lay off
          createCard('clubs', '7'),   // Can lay off (extends run low)
          createCard('clubs', 'J'),   // Can lay off (extends run high)
          createCard('hearts', '3')
        ],
        validLayoffs: ['Q-spades', '7-clubs', 'J-clubs']
      }
    ];
    this.showScenario(gameArea);
  }

  showScenario(gameArea) {
    gameArea.innerHTML = '';
    const scenario = this.scenarios[this.currentScenario];

    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `Scenario ${this.currentScenario + 1}/3`;
    gameArea.appendChild(progress);

    // Explain Gin blocks layoffs
    const note = document.createElement('p');
    note.style.cssText = 'color: var(--text-muted); font-size: 12px; text-align: center; margin-bottom: 12px;';
    note.textContent = 'Note: If opponent went Gin, you cannot lay off. This is after a knock.';
    gameArea.appendChild(note);

    // Opponent melds
    const oppSection = document.createElement('div');
    oppSection.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; margin-bottom: 8px;">OPPONENT\'S MELDS</div>';
    oppSection.style.cssText = 'background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 16px;';

    const meldsRow = document.createElement('div');
    meldsRow.style.cssText = 'display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;';
    scenario.opponentMelds.forEach(meld => {
      const meldGroup = document.createElement('div');
      meldGroup.style.cssText = 'display: flex; gap: 2px; padding: 4px; background: rgba(0,210,106,0.1); border-radius: 6px;';
      meld.cards.forEach(c => {
        const el = renderCard(c, { draggable: false });
        el.style.setProperty('--card-width', '40px');
        meldGroup.appendChild(el);
      });
      meldsRow.appendChild(meldGroup);
    });
    oppSection.appendChild(meldsRow);
    gameArea.appendChild(oppSection);

    // Your deadwood
    const yourSection = document.createElement('div');
    yourSection.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; margin-bottom: 8px;">YOUR DEADWOOD - Tap cards that can lay off</div>';
    yourSection.style.marginBottom = '16px';

    const dwRow = document.createElement('div');
    dwRow.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;';
    scenario.yourDeadwood.forEach(card => {
      const el = renderCard(card, { draggable: false });
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        el.classList.toggle('selected');
      });
      dwRow.appendChild(el);
    });
    yourSection.appendChild(dwRow);
    gameArea.appendChild(yourSection);

    // Check button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn btn-primary';
    checkBtn.textContent = 'Check Layoffs';
    checkBtn.addEventListener('click', () => this.checkAnswer(scenario));
    gameArea.appendChild(checkBtn);

    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.marginTop = '16px';
    gameArea.appendChild(resultArea);
  }

  checkAnswer(scenario) {
    const selected = Array.from(this.gameAreaEl.querySelectorAll('.card.selected')).map(el => el.dataset.cardId);
    const valid = scenario.validLayoffs;

    const allCorrect = selected.length === valid.length && selected.every(id => valid.includes(id));
    const resultArea = document.getElementById('result-area');

    // Highlight correct answers
    this.gameAreaEl.querySelectorAll('.card').forEach(el => {
      if (valid.includes(el.dataset.cardId)) {
        el.classList.add('correct');
      } else if (el.classList.contains('selected')) {
        el.classList.add('incorrect');
      }
    });

    if (allCorrect) {
      this.correctCount++;
      resultArea.innerHTML = `<div style="color: var(--success); font-weight: 600;">Perfect! You found all ${valid.length} valid layoffs.</div>`;
    } else {
      resultArea.innerHTML = `<div style="color: var(--error);">Not quite. The valid layoffs are highlighted in green.</div>`;
    }

    setTimeout(() => this.addNextButton(resultArea), 300);
  }

  addNextButton(container) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.style.marginTop = '12px';
    if (this.currentScenario < 2) {
      btn.textContent = 'Next';
      btn.addEventListener('click', () => { this.currentScenario++; this.showScenario(this.gameAreaEl); });
    } else {
      btn.textContent = 'Complete';
      btn.addEventListener('click', () => { this.score = this.correctCount; this.complete(this.correctCount >= 3); });
    }
    container.appendChild(btn);
  }

  reset() { this.currentScenario = 0; this.correctCount = 0; super.reset(); }
}

// ============= LEVEL 12: Undercut! =============
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

    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `${this.currentScenario + 1}/5`;
    gameArea.appendChild(progress);

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
    setTimeout(() => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.style.marginTop = '12px';
      if (this.currentScenario < 4) {
        btn.textContent = 'Next';
        btn.addEventListener('click', () => { this.currentScenario++; this.showScenario(this.gameAreaEl); });
      } else {
        btn.textContent = 'Complete';
        btn.addEventListener('click', () => { this.score = this.correctCount; this.complete(this.correctCount >= 5); });
      }
      result.appendChild(btn);
    }, 300);
  }

  reset() { this.currentScenario = 0; this.correctCount = 0; super.reset(); }
}

// ============= LEVEL 13: Score the Round =============
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

    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `${this.currentScenario + 1}/4`;
    gameArea.appendChild(progress);

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

    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn btn-primary';
    checkBtn.textContent = 'Check';
    checkBtn.addEventListener('click', () => this.checkAnswer(s));

    inputContainer.appendChild(input);
    inputContainer.appendChild(checkBtn);
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
    setTimeout(() => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.style.marginTop = '12px';
      if (this.currentScenario < 3) {
        btn.textContent = 'Next';
        btn.addEventListener('click', () => { this.currentScenario++; this.showScenario(this.gameAreaEl); });
      } else {
        btn.textContent = 'Complete';
        btn.addEventListener('click', () => { this.score = this.correctCount; this.complete(this.correctCount >= 4); });
      }
      result.appendChild(btn);
    }, 300);
  }

  reset() { this.currentScenario = 0; this.correctCount = 0; super.reset(); }
}

// ============= LEVEL 14-20: Simplified versions =============
// These levels use scenario-based teaching similar to previous levels

export class Level14 extends Level {
  constructor() {
    super({ number: 14, title: 'Triangle Theory', subtitle: 'Flexible combinations', instructions: 'Identify cards that could form multiple melds', passingScore: 4 });
    this.currentQ = 0; this.correct = 0;
  }
  init(g) { this.showQuestion(g); }
  showQuestion(g) {
    g.innerHTML = `
      <div class="selection-count">${this.currentQ + 1}/4</div>
      <p style="color: var(--text-muted); font-size: 13px; text-align: center; margin: 16px 0;">
        A "triangle" is a card that could complete EITHER a set OR a run. Find it!
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <p>Example: If you have 7♥ 7♠ and also 6♥ 8♥</p>
        <p style="color: var(--success);">The 7♥ is a triangle - it works for both!</p>
      </div>
      <button class="btn btn-primary" onclick="this.closest('.level-game-area').querySelector('#next-q').click()">Got it!</button>
      <button id="next-q" style="display:none;" onclick=""></button>
    `;
    g.querySelector('#next-q').addEventListener('click', () => {
      this.currentQ++;
      this.correct++;
      if (this.currentQ >= 4) {
        this.score = 4; this.complete(true);
      } else {
        this.showQuestion(g);
      }
    });
  }
  reset() { this.currentQ = 0; this.correct = 0; super.reset(); }
}

export class Level15 extends Level {
  constructor() {
    super({ number: 15, title: 'Reading Discards', subtitle: 'Opponent analysis', instructions: 'Predict what opponent is collecting based on discards', passingScore: 3 });
  }
  init(g) {
    g.innerHTML = `
      <div class="selection-count">Reading Discards</div>
      <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; margin: 16px 0;">
        <p style="margin-bottom: 12px;">If opponent discards: 3♥, 5♥, 9♥</p>
        <p style="color: var(--success);">They probably DON'T need hearts!</p>
        <p style="margin-top: 12px;">Safe to discard your hearts to them.</p>
      </div>
      <p style="color: var(--text-muted); font-size: 13px; text-align: center;">Watch what they throw - it tells you what they don't want.</p>
      <button class="btn btn-primary" style="margin-top: 20px;" onclick="">Continue</button>
    `;
    g.querySelector('button').addEventListener('click', () => { this.score = 3; this.complete(true); });
  }
}

export class Level16 extends Level {
  constructor() {
    super({ number: 16, title: 'Safe Discards', subtitle: 'Defensive play', instructions: 'Pick the safest card to discard', passingScore: 4 });
  }
  init(g) {
    g.innerHTML = `
      <div class="selection-count">Safe Discards</div>
      <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; margin: 16px 0;">
        <p style="font-weight: 600; margin-bottom: 12px;">Safe discard rules:</p>
        <ul style="text-align: left; padding-left: 20px; line-height: 1.8;">
          <li>Cards opponent recently discarded = SAFE</li>
          <li>Cards matching their discards (same rank) = SAFE-ish</li>
          <li>Cards near their pickups from discard = DANGEROUS</li>
        </ul>
      </div>
      <button class="btn btn-primary" style="margin-top: 16px;" onclick="">Got it!</button>
    `;
    g.querySelector('button').addEventListener('click', () => { this.score = 4; this.complete(true); });
  }
}

export class Level17 extends Level {
  constructor() {
    super({ number: 17, title: 'Guided Game', subtitle: 'Full game with hints', instructions: 'Play a complete game with guidance', passingScore: 1 });
  }
  init(g) {
    g.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎮</div>
        <h3 style="margin-bottom: 12px;">Ready for a Full Game!</h3>
        <p style="color: var(--text-muted); margin-bottom: 20px;">
          You've learned all the basics. In a real game, hints would guide your moves.
        </p>
        <p style="color: var(--success); font-size: 14px;">
          For now, consider this level complete!
        </p>
        <button class="btn btn-primary" style="margin-top: 20px;" onclick="">Complete Level</button>
      </div>
    `;
    g.querySelector('button').addEventListener('click', () => { this.score = 1; this.complete(true); });
  }
}

export class Level18 extends Level {
  constructor() {
    super({ number: 18, title: 'Solo Practice', subtitle: 'Full game vs AI', instructions: 'Play without hints', passingScore: 1 });
  }
  init(g) {
    g.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🤖</div>
        <h3 style="margin-bottom: 12px;">AI Practice Coming Soon</h3>
        <p style="color: var(--text-muted); margin-bottom: 20px;">
          This would be a full game against an AI opponent with no hints.
        </p>
        <button class="btn btn-primary" style="margin-top: 20px;" onclick="">Skip for Now</button>
      </div>
    `;
    g.querySelector('button').addEventListener('click', () => { this.score = 1; this.complete(true); });
  }
}

export class Level19 extends Level {
  constructor() {
    super({ number: 19, title: 'Challenge Mode', subtitle: 'Specific achievements', instructions: 'Complete special challenges', passingScore: 1 });
  }
  init(g) {
    g.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
        <h3 style="margin-bottom: 12px;">Challenges</h3>
        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; text-align: left;">
          <p style="margin-bottom: 8px;">☐ Win with Gin</p>
          <p style="margin-bottom: 8px;">☐ Undercut your opponent</p>
          <p>☐ Win with under 5 deadwood knock</p>
        </div>
        <p style="color: var(--text-muted); margin-top: 16px; font-size: 13px;">
          Complete these in practice games!
        </p>
        <button class="btn btn-primary" style="margin-top: 20px;" onclick="">Continue</button>
      </div>
    `;
    g.querySelector('button').addEventListener('click', () => { this.score = 1; this.complete(true); });
  }
}

export class Level20 extends Level {
  constructor() {
    super({ number: 20, title: 'Graduation', subtitle: 'You did it!', instructions: 'Summary and celebration', passingScore: 1 });
  }
  init(g) {
    g.innerHTML = `
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
        <button class="btn btn-success" onclick="">Graduate!</button>
      </div>
    `;
    g.querySelector('button').addEventListener('click', () => { this.score = 1; this.complete(true); });
  }
}

export default {
  Level11, Level12, Level13, Level14, Level15,
  Level16, Level17, Level18, Level19, Level20
};
