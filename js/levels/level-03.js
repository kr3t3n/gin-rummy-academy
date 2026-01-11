/**
 * Level 3: Run for It
 * Teaches runs (consecutive sequences of same suit)
 */

import { Level } from './level-engine.js';
import { createCard, renderCard, shuffle, SUITS } from '../cards.js';
import { isValidRun } from '../melds.js';

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/**
 * Generates card groups for the level
 * Includes valid runs and various invalid sequences
 */
function generateGroups() {
  const groups = [];
  const suits = shuffle([...SUITS]);

  // Valid run 1: A-2-3 (must include this per criteria)
  groups.push({
    cards: [
      createCard(suits[0], 'A'),
      createCard(suits[0], '2'),
      createCard(suits[0], '3')
    ],
    isRun: true,
    id: 'run-a23',
    note: 'A-2-3 is valid (Ace is low)'
  });

  // Valid run 2: 4-5-6-7
  groups.push({
    cards: [
      createCard(suits[1], '4'),
      createCard(suits[1], '5'),
      createCard(suits[1], '6'),
      createCard(suits[1], '7')
    ],
    isRun: true,
    id: 'run-4567'
  });

  // Valid run 3: 8-9-10
  groups.push({
    cards: [
      createCard(suits[2], '8'),
      createCard(suits[2], '9'),
      createCard(suits[2], '10')
    ],
    isRun: true,
    id: 'run-8910'
  });

  // Valid run 4: J-Q-K
  groups.push({
    cards: [
      createCard(suits[3], 'J'),
      createCard(suits[3], 'Q'),
      createCard(suits[3], 'K')
    ],
    isRun: true,
    id: 'run-jqk'
  });

  // Valid run 5: 5-6-7
  groups.push({
    cards: [
      createCard(suits[0], '5'),
      createCard(suits[0], '6'),
      createCard(suits[0], '7')
    ],
    isRun: true,
    id: 'run-567'
  });

  // INVALID: Q-K-A (gotcha - must include per criteria)
  groups.push({
    cards: [
      createCard(suits[1], 'Q'),
      createCard(suits[1], 'K'),
      createCard(suits[1], 'A')
    ],
    isRun: false,
    id: 'invalid-qka',
    note: 'Q-K-A is invalid (Ace cannot be high)'
  });

  // INVALID: Mixed suits
  groups.push({
    cards: [
      createCard('hearts', '3'),
      createCard('diamonds', '4'),
      createCard('hearts', '5')
    ],
    isRun: false,
    id: 'invalid-mixed-suits',
    note: 'Must be all same suit'
  });

  // INVALID: Gap in sequence
  groups.push({
    cards: [
      createCard(suits[2], '2'),
      createCard(suits[2], '3'),
      createCard(suits[2], '5')  // Skipped 4
    ],
    isRun: false,
    id: 'invalid-gap'
  });

  // INVALID: Only 2 cards
  groups.push({
    cards: [
      createCard(suits[3], '6'),
      createCard(suits[3], '7')
    ],
    isRun: false,
    id: 'invalid-two-cards'
  });

  // INVALID: Set not run (same rank)
  groups.push({
    cards: [
      createCard('hearts', '9'),
      createCard('diamonds', '9'),
      createCard('clubs', '9')
    ],
    isRun: false,
    id: 'invalid-set-not-run',
    note: 'This is a set, not a run'
  });

  return shuffle(groups);
}

export class Level03 extends Level {
  constructor() {
    super({
      number: 3,
      title: 'Run for It',
      subtitle: 'Find consecutive sequences',
      instructions: 'Tap all card groups that form valid runs (3+ consecutive cards of the same suit)',
      passingScore: 5,
      starThresholds: { threeStarMax: 0, twoStarMax: 1 }
    });

    this.groups = [];
    this.runsFound = 0;
    this.falsePositives = 0;
    this.totalRuns = 5;
  }

  init(gameArea) {
    // Generate groups
    this.groups = generateGroups();

    // Check button in header (top-right)
    this.createHeaderButton({
      buttonText: 'Check ✓',
      onButtonClick: () => this.checkAnswers()
    });

    // Selection counter in game area
    const selectionCount = document.createElement('div');
    selectionCount.className = 'selection-count top-bar-progress';
    selectionCount.textContent = '0 selected';
    selectionCount.style.cssText = 'margin-bottom: 12px;';
    gameArea.appendChild(selectionCount);

    // Hint about Ace
    const hint = document.createElement('p');
    hint.className = 'level-hint';
    hint.style.cssText = `
      color: var(--text-muted);
      font-size: clamp(11px, 2.5vw, 13px);
      text-align: center;
      margin-bottom: 12px;
    `;
    hint.textContent = 'Remember: Ace is always low (A-2-3 works, Q-K-A does not)';
    gameArea.appendChild(hint);

    // Groups container
    const groupsContainer = document.createElement('div');
    groupsContainer.className = 'card-groups';

    for (const group of this.groups) {
      const groupEl = this.createGroupElement(group);
      groupsContainer.appendChild(groupEl);
    }

    gameArea.appendChild(groupsContainer);

    this.updateProgress(`Find all ${this.totalRuns} runs`);
  }

  createGroupElement(group) {
    const el = document.createElement('div');
    el.className = 'card-group';
    el.dataset.groupId = group.id;
    el.dataset.isRun = group.isRun;
    if (group.note) el.dataset.note = group.note;

    // Render cards in group
    for (const card of group.cards) {
      const cardEl = renderCard(card, { draggable: false });
      el.appendChild(cardEl);
    }

    // Tap to select
    el.addEventListener('click', () => this.toggleGroup(el, group));

    return el;
  }

  toggleGroup(el, group) {
    const wasSelected = el.classList.contains('selected');

    if (wasSelected) {
      el.classList.remove('selected');
    } else {
      el.classList.add('selected');
    }

    // Count selected and update top bar
    const selected = this.gameAreaEl.querySelectorAll('.card-group.selected').length;
    this.updateTopBarProgress(`${selected} selected`);
  }

  checkAnswers() {
    const groups = this.gameAreaEl.querySelectorAll('.card-group');
    let correct = 0;
    let falsePos = 0;
    let missed = 0;
    let falseNote = '';

    for (const groupEl of groups) {
      const isRun = groupEl.dataset.isRun === 'true';
      const isSelected = groupEl.classList.contains('selected');
      const note = groupEl.dataset.note;

      if (isRun && isSelected) {
        groupEl.classList.add('correct');
        groupEl.classList.remove('selected');
        correct++;
      } else if (!isRun && isSelected) {
        groupEl.classList.add('incorrect');
        groupEl.classList.remove('selected');
        falsePos++;
        if (note) falseNote = note;
      } else if (isRun && !isSelected) {
        missed++;
      }
    }

    this.runsFound = correct;
    this.falsePositives = falsePos;

    // Provide feedback
    if (falsePos > 0) {
      let msg = `${falsePos} selection(s) were not valid runs.`;
      if (falseNote) msg += ` ${falseNote}.`;
      else msg += ' A run needs 3+ consecutive cards all in the same suit.';

      this.showExplanation(msg, 'error');
      this.score = 0;
      this.complete(false);
    } else if (missed > 0) {
      this.showExplanation(
        `Good work! But you missed ${missed} run(s). Look for consecutive cards in the same suit.`,
        'error'
      );
      this.score = correct;
      this.complete(false);
    } else {
      this.showExplanation(
        `Excellent! You found all ${this.totalRuns} runs correctly!`,
        'success'
      );
      this.score = this.totalRuns;
      this.complete(true);
    }
  }

  reset() {
    this.groups = [];
    this.runsFound = 0;
    this.falsePositives = 0;
    super.reset();
  }
}

export default Level03;
