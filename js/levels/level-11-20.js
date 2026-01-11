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
    super({
      number: 14,
      title: 'Triangle Theory',
      subtitle: 'Flexible combinations',
      instructions: 'Find the "triangle" card that could complete multiple melds',
      passingScore: 3,
      starThresholds: { threeStarMax: 0, twoStarMax: 1 }
    });
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
  }

  init(gameArea) {
    // Each scenario shows cards where ONE card is a "triangle" - can complete both a set AND a run
    this.scenarios = [
      {
        hand: [
          createCard('hearts', '7'),   // TRIANGLE: could complete 7s set OR 6-7-8 hearts run
          createCard('spades', '7'),   // Part of potential set
          createCard('hearts', '6'),   // Part of potential run
          createCard('hearts', '8'),   // Part of potential run
          createCard('diamonds', 'K')  // Unrelated
        ],
        triangleId: '7-hearts',
        explanation: 'The 7♥ is the triangle! It could complete a set (7♥ 7♠ + one more 7) OR a run (6♥ 7♥ 8♥).'
      },
      {
        hand: [
          createCard('clubs', '9'),    // TRIANGLE: could complete 9s set OR 8-9-10 clubs run
          createCard('hearts', '9'),   // Part of potential set
          createCard('clubs', '8'),    // Part of potential run
          createCard('clubs', '10'),   // Part of potential run
          createCard('spades', '2')    // Unrelated
        ],
        triangleId: '9-clubs',
        explanation: 'The 9♣ is the triangle! It could join the 9♥ for a set, OR complete 8♣ 9♣ 10♣ run.'
      },
      {
        hand: [
          createCard('diamonds', 'Q'), // TRIANGLE: could complete Qs set OR J-Q-K diamonds run
          createCard('clubs', 'Q'),    // Part of potential set
          createCard('diamonds', 'J'), // Part of potential run
          createCard('diamonds', 'K'), // Part of potential run
          createCard('hearts', '4')    // Unrelated
        ],
        triangleId: 'Q-diamonds',
        explanation: 'The Q♦ is the triangle! It works for a Queens set OR the J♦ Q♦ K♦ run.'
      },
      {
        hand: [
          createCard('spades', '5'),   // TRIANGLE: could complete 5s set OR 4-5-6 spades run
          createCard('diamonds', '5'), // Part of potential set
          createCard('hearts', '5'),   // Part of potential set (already 3!)
          createCard('spades', '4'),   // Part of potential run
          createCard('spades', '6')    // Part of potential run
        ],
        triangleId: '5-spades',
        explanation: 'The 5♠ is the triangle! It could be the 4th five in the set OR complete 4♠ 5♠ 6♠.'
      }
    ];
    this.showScenario(gameArea);
  }

  showScenario(gameArea) {
    gameArea.innerHTML = '';
    const scenario = this.scenarios[this.currentScenario];

    // Progress
    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `${this.currentScenario + 1}/${this.scenarios.length}`;
    gameArea.appendChild(progress);

    // Explanation
    const intro = document.createElement('div');
    intro.style.cssText = 'background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin: 12px 0; text-align: center;';
    intro.innerHTML = `
      <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 4px;">
        A <span style="color: var(--success); font-weight: 600;">triangle</span> card can complete EITHER a set OR a run.
      </p>
      <p style="color: var(--text-muted); font-size: 12px;">Tap the triangle card below:</p>
    `;
    gameArea.appendChild(intro);

    // Cards
    const cardsContainer = document.createElement('div');
    cardsContainer.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin: 20px 0;';

    scenario.hand.forEach(card => {
      const el = renderCard(card, { draggable: false });
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => this.handleSelection(card.id, scenario, gameArea));
      cardsContainer.appendChild(el);
    });
    gameArea.appendChild(cardsContainer);

    // Result area
    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = 'margin-top: 16px; text-align: center;';
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);
  }

  handleSelection(cardId, scenario, gameArea) {
    const isCorrect = cardId === scenario.triangleId;
    const resultArea = document.getElementById('result-area');

    // Disable further clicks
    gameArea.querySelectorAll('.card').forEach(el => {
      el.style.pointerEvents = 'none';
      if (el.dataset.cardId === scenario.triangleId) {
        el.classList.add('correct');
      } else if (el.dataset.cardId === cardId && !isCorrect) {
        el.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      this.correctCount++;
      resultArea.innerHTML = `
        <div style="color: var(--success); font-weight: 600; margin-bottom: 8px;">Correct!</div>
        <div style="color: var(--text-light); font-size: 13px;">${scenario.explanation}</div>
      `;
    } else {
      resultArea.innerHTML = `
        <div style="color: var(--error); font-weight: 600; margin-bottom: 8px;">Not quite</div>
        <div style="color: var(--text-light); font-size: 13px;">${scenario.explanation}</div>
      `;
    }

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);

    // Add next button
    setTimeout(() => {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.style.marginTop = '12px';

      if (this.currentScenario < this.scenarios.length - 1) {
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
          this.currentScenario++;
          this.showScenario(gameArea);
        });
      } else {
        nextBtn.textContent = 'Complete';
        nextBtn.addEventListener('click', () => {
          this.score = this.correctCount;
          this.complete(this.correctCount >= this.passingScore);
        });
      }
      resultArea.appendChild(nextBtn);
    }, 300);
  }

  reset() {
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
    super.reset();
  }
}

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

    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `${this.currentScenario + 1}/${this.scenarios.length}`;
    gameArea.appendChild(progress);

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

    setTimeout(() => {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.style.marginTop = '12px';

      if (this.currentScenario < this.scenarios.length - 1) {
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
          this.currentScenario++;
          this.showScenario(gameArea);
        });
      } else {
        nextBtn.textContent = 'Complete';
        nextBtn.addEventListener('click', () => {
          this.score = this.correctCount;
          this.complete(this.correctCount >= this.passingScore);
        });
      }
      resultArea.appendChild(nextBtn);
    }, 300);
  }

  reset() {
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
    super.reset();
  }
}

export class Level16 extends Level {
  constructor() {
    super({
      number: 16,
      title: 'Safe Discards',
      subtitle: 'Defensive play',
      instructions: 'Pick the safest card to discard',
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
        oppDiscards: [createCard('hearts', '7'), createCard('hearts', '9')],
        oppPickedUp: null,
        yourDeadwood: [
          createCard('hearts', '5'),   // SAFE - they're dumping hearts
          createCard('spades', '8'),
          createCard('clubs', 'K'),
          createCard('diamonds', '6')
        ],
        safestId: '5-hearts',
        explanation: 'Hearts are safe - opponent has been discarding them!'
      },
      {
        oppDiscards: [createCard('clubs', '3')],
        oppPickedUp: createCard('diamonds', '7'),
        yourDeadwood: [
          createCard('diamonds', '6'),  // DANGEROUS - near their pickup
          createCard('diamonds', '8'),  // DANGEROUS - near their pickup
          createCard('spades', 'K'),
          createCard('clubs', '4')      // SAFE - same rank/suit as their discard
        ],
        safestId: '4-clubs',
        explanation: 'The 4♣ is safest - similar to what they discarded. Avoid diamonds near their 7♦ pickup!'
      },
      {
        oppDiscards: [createCard('spades', 'Q'), createCard('diamonds', 'K')],
        oppPickedUp: null,
        yourDeadwood: [
          createCard('hearts', 'J'),   // SAFE-ish - they\'re dumping face cards
          createCard('clubs', '5'),
          createCard('spades', '3'),
          createCard('diamonds', '9')
        ],
        safestId: 'J-hearts',
        explanation: 'Face cards seem safe - they discarded Q and K. The J♥ is your best bet.'
      },
      {
        oppDiscards: [createCard('hearts', '4')],
        oppPickedUp: createCard('hearts', '6'),
        yourDeadwood: [
          createCard('hearts', '5'),   // VERY DANGEROUS - exactly what they need!
          createCard('clubs', 'Q'),
          createCard('spades', '2'),
          createCard('diamonds', '8')
        ],
        safestId: '2-spades',
        explanation: 'NEVER give them the 5♥! They picked up 6♥ after discarding 4♥ - they\'re building 5-6-7 hearts! Low spades are safest.'
      },
      {
        oppDiscards: [createCard('clubs', '8'), createCard('spades', '8')],
        oppPickedUp: null,
        yourDeadwood: [
          createCard('hearts', '8'),   // VERY SAFE - they clearly don\'t want 8s
          createCard('diamonds', '4'),
          createCard('clubs', 'J'),
          createCard('spades', '6')
        ],
        safestId: '8-hearts',
        explanation: 'They dumped two 8s - they definitely don\'t need the third! Your 8♥ is very safe.'
      }
    ];
    this.showScenario(gameArea);
  }

  showScenario(gameArea) {
    gameArea.innerHTML = '';
    const scenario = this.scenarios[this.currentScenario];

    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `${this.currentScenario + 1}/${this.scenarios.length}`;
    gameArea.appendChild(progress);

    // Opponent info section
    const oppSection = document.createElement('div');
    oppSection.style.cssText = 'background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin: 12px 0;';

    // Discards row
    let oppHtml = '<div style="color: var(--text-muted); font-size: 11px; margin-bottom: 6px;">OPPONENT DISCARDED:</div>';
    oppSection.innerHTML = oppHtml;

    const discardRow = document.createElement('div');
    discardRow.style.cssText = 'display: flex; gap: 6px; justify-content: center; margin-bottom: 8px;';
    scenario.oppDiscards.forEach(card => {
      const el = renderCard(card, { draggable: false });
      el.style.setProperty('--card-width', '40px');
      discardRow.appendChild(el);
    });
    oppSection.appendChild(discardRow);

    // Pickup info
    if (scenario.oppPickedUp) {
      const pickupInfo = document.createElement('div');
      pickupInfo.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);';
      pickupInfo.innerHTML = '<span style="color: var(--error); font-size: 11px;">⚠️ PICKED UP:</span>';
      const pickupCard = renderCard(scenario.oppPickedUp, { draggable: false });
      pickupCard.style.setProperty('--card-width', '40px');
      pickupInfo.appendChild(pickupCard);
      oppSection.appendChild(pickupInfo);
    }
    gameArea.appendChild(oppSection);

    // Question
    const questionEl = document.createElement('div');
    questionEl.style.cssText = 'text-align: center; margin: 12px 0; font-size: 14px;';
    questionEl.textContent = 'Which card is SAFEST to discard?';
    gameArea.appendChild(questionEl);

    // Your deadwood options
    const yourSection = document.createElement('div');
    yourSection.style.cssText = 'display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 16px 0;';

    scenario.yourDeadwood.forEach(card => {
      const el = renderCard(card, { draggable: false });
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => this.handleSelection(card.id, scenario, gameArea));
      yourSection.appendChild(el);
    });
    gameArea.appendChild(yourSection);

    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = 'margin-top: 16px; text-align: center;';
    gameArea.appendChild(resultArea);

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);
  }

  handleSelection(cardId, scenario, gameArea) {
    const isCorrect = cardId === scenario.safestId;
    if (isCorrect) this.correctCount++;

    const resultArea = document.getElementById('result-area');

    // Disable and highlight cards
    gameArea.querySelectorAll('.card').forEach(el => {
      el.style.pointerEvents = 'none';
      if (el.dataset.cardId === scenario.safestId) {
        el.classList.add('correct');
      } else if (el.dataset.cardId === cardId && !isCorrect) {
        el.classList.add('incorrect');
      }
    });

    resultArea.innerHTML = `
      <div style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 600; margin-bottom: 8px;">
        ${isCorrect ? 'Good read!' : 'Risky choice!'}
      </div>
      <div style="color: var(--text-light); font-size: 13px;">${scenario.explanation}</div>
    `;

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);

    setTimeout(() => {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.style.marginTop = '12px';

      if (this.currentScenario < this.scenarios.length - 1) {
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
          this.currentScenario++;
          this.showScenario(gameArea);
        });
      } else {
        nextBtn.textContent = 'Complete';
        nextBtn.addEventListener('click', () => {
          this.score = this.correctCount;
          this.complete(this.correctCount >= this.passingScore);
        });
      }
      resultArea.appendChild(nextBtn);
    }, 300);
  }

  reset() {
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
    super.reset();
  }
}

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

    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `${this.currentScenario + 1}/${this.scenarios.length}`;
    gameArea.appendChild(progress);

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
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.idx = idx;
      btn.textContent = option.text;
      btn.style.cssText = 'padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: var(--text-light); cursor: pointer; text-align: left;';
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

    setTimeout(() => {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.style.marginTop = '12px';

      if (this.currentScenario < this.scenarios.length - 1) {
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
          this.currentScenario++;
          this.showScenario(gameArea);
        });
      } else {
        nextBtn.textContent = 'Complete';
        nextBtn.addEventListener('click', () => {
          this.score = this.correctCount;
          this.complete(this.correctCount >= this.passingScore);
        });
      }
      resultArea.appendChild(nextBtn);
    }, 300);
  }

  reset() {
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
    super.reset();
  }
}

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

    const progress = document.createElement('div');
    progress.className = 'selection-count';
    progress.textContent = `${this.currentScenario + 1}/${this.scenarios.length}`;
    gameArea.appendChild(progress);

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
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.idx = idx;
      btn.textContent = option.text;
      btn.style.cssText = 'padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: var(--text-light); cursor: pointer; text-align: left;';
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

  handleAnswer(selectedOption, scenario, gameArea) {
    const isCorrect = selectedOption.correct;
    if (isCorrect) this.correctCount++;

    const resultArea = document.getElementById('result-area');

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
        ${isCorrect ? 'Correct!' : 'Not quite'}
      </div>
      <div style="color: var(--text-light); font-size: 13px;">${scenario.explanation}</div>
    `;

    this.updateProgress(`${this.correctCount}/${this.scenarios.length} correct`);

    setTimeout(() => {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.style.marginTop = '12px';

      if (this.currentScenario < this.scenarios.length - 1) {
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
          this.currentScenario++;
          this.showScenario(gameArea);
        });
      } else {
        nextBtn.textContent = 'Complete';
        nextBtn.addEventListener('click', () => {
          this.score = this.correctCount;
          this.complete(this.correctCount >= this.passingScore);
        });
      }
      resultArea.appendChild(nextBtn);
    }, 300);
  }

  reset() {
    this.scenarios = [];
    this.currentScenario = 0;
    this.correctCount = 0;
    super.reset();
  }
}

export class Level19 extends Level {
  constructor() {
    super({
      number: 19,
      title: 'Quick Fire Quiz',
      subtitle: 'Test your knowledge',
      instructions: 'Answer these rapid-fire questions from everything you\'ve learned',
      passingScore: 7,
      starThresholds: { threeStarMax: 1, twoStarMax: 2 }
    });
    this.questions = [];
    this.currentQuestion = 0;
    this.correctCount = 0;
  }

  init(gameArea) {
    this.questions = shuffle([
      { q: 'What is the value of a King in deadwood?', a: '10', wrong: ['13', '1'] },
      { q: 'How many cards in a starting Gin Rummy hand?', a: '10', wrong: ['7', '13'] },
      { q: 'Minimum cards for a valid meld?', a: '3', wrong: ['2', '4'] },
      { q: 'Can Ace be high (after King) in a run?', a: 'No', wrong: ['Yes', 'Sometimes'] },
      { q: 'What\'s the Gin bonus?', a: '25 points', wrong: ['10 points', '50 points'] },
      { q: 'What\'s the undercut bonus?', a: '25 points', wrong: ['15 points', '10 points'] },
      { q: 'Maximum deadwood to knock?', a: '10', wrong: ['5', '15'] },
      { q: 'What happens if stock runs out?', a: 'Draw - no score', wrong: ['Low deadwood wins', 'Dealer wins'] },
      { q: 'Can you lay off cards after opponent goes Gin?', a: 'No', wrong: ['Yes', 'Only one card'] },
      { q: 'Value of an Ace?', a: '1 point', wrong: ['10 points', '11 points'] }
    ]).slice(0, 10);
    this.showQuestion(gameArea);
  }

  showQuestion(gameArea) {
    gameArea.innerHTML = '';
    const q = this.questions[this.currentQuestion];

    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.style.cssText = 'display: flex; gap: 4px; margin-bottom: 16px; justify-content: center;';
    for (let i = 0; i < this.questions.length; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `width: 20px; height: 4px; border-radius: 2px; background: ${i < this.currentQuestion ? 'var(--success)' : i === this.currentQuestion ? 'var(--accent)' : 'rgba(255,255,255,0.2)'};`;
      progressBar.appendChild(dot);
    }
    gameArea.appendChild(progressBar);

    // Question number
    const qNum = document.createElement('div');
    qNum.style.cssText = 'color: var(--text-muted); font-size: 12px; text-align: center; margin-bottom: 8px;';
    qNum.textContent = `Question ${this.currentQuestion + 1}/${this.questions.length}`;
    gameArea.appendChild(qNum);

    // Question
    const questionEl = document.createElement('div');
    questionEl.style.cssText = 'text-align: center; font-size: 18px; font-weight: 600; margin: 16px 0 24px 0;';
    questionEl.textContent = q.q;
    gameArea.appendChild(questionEl);

    // Shuffle answers
    const answers = shuffle([q.a, ...q.wrong]);

    // Answer buttons
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; max-width: 280px; margin: 0 auto;';

    answers.forEach(answer => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = answer;
      btn.style.cssText = 'padding: 14px; border-radius: 10px; border: 2px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: var(--text-light); cursor: pointer; font-size: 15px; transition: all 0.15s;';
      btn.addEventListener('click', () => this.handleAnswer(answer, q.a, gameArea));
      optionsContainer.appendChild(btn);
    });
    gameArea.appendChild(optionsContainer);

    // Score
    const scoreEl = document.createElement('div');
    scoreEl.style.cssText = 'text-align: center; margin-top: 20px; color: var(--text-muted); font-size: 13px;';
    scoreEl.textContent = `Score: ${this.correctCount}/${this.currentQuestion}`;
    gameArea.appendChild(scoreEl);
  }

  handleAnswer(selected, correct, gameArea) {
    const isCorrect = selected === correct;
    if (isCorrect) this.correctCount++;

    // Flash feedback
    gameArea.querySelectorAll('.choice-btn').forEach(btn => {
      btn.style.pointerEvents = 'none';
      if (btn.textContent === correct) {
        btn.style.borderColor = 'var(--success)';
        btn.style.background = 'rgba(0, 210, 106, 0.3)';
      } else if (btn.textContent === selected && !isCorrect) {
        btn.style.borderColor = 'var(--error)';
        btn.style.background = 'rgba(255, 107, 107, 0.3)';
      }
    });

    // Quick transition to next
    setTimeout(() => {
      if (this.currentQuestion < this.questions.length - 1) {
        this.currentQuestion++;
        this.showQuestion(gameArea);
      } else {
        this.showResults(gameArea);
      }
    }, 600);
  }

  showResults(gameArea) {
    const passed = this.correctCount >= this.passingScore;
    const percentage = Math.round((this.correctCount / this.questions.length) * 100);

    gameArea.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">${passed ? '🎯' : '📚'}</div>
        <h3 style="margin-bottom: 8px; color: ${passed ? 'var(--success)' : 'var(--error)'};">
          ${passed ? 'Well Done!' : 'Keep Studying!'}
        </h3>
        <div style="font-size: 32px; font-weight: 700; margin: 16px 0;">${this.correctCount}/${this.questions.length}</div>
        <div style="color: var(--text-muted); margin-bottom: 20px;">${percentage}% correct</div>
        <button class="btn btn-primary" id="complete-btn">${passed ? 'Complete' : 'Try Again'}</button>
      </div>
    `;

    document.getElementById('complete-btn').addEventListener('click', () => {
      if (passed) {
        this.score = this.correctCount;
        this.complete(true);
      } else {
        this.reset();
        this.init(gameArea);
      }
    });
  }

  reset() {
    this.questions = [];
    this.currentQuestion = 0;
    this.correctCount = 0;
    super.reset();
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
