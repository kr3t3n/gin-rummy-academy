/**
 * Level 2: Spot the Set
 * Teaches sets (groups of same rank)
 */

import { Level } from './level-engine.js';
import { createCard, renderCard, shuffle, SUITS } from '../cards.js';
import { isValidSet } from '../melds.js';

/**
 * Generates card groups for the level
 * Returns mix of valid sets and invalid groups
 */
function generateGroups() {
  const groups = [];
  const usedRanks = new Set();

  // Generate 5 valid sets
  const ranks = shuffle(['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']);

  for (let i = 0; i < 5; i++) {
    const rank = ranks[i];
    usedRanks.add(rank);
    const suits = shuffle([...SUITS]);

    // Randomly 3 or 4 cards
    const count = Math.random() > 0.5 ? 4 : 3;
    const cards = suits.slice(0, count).map(suit => createCard(suit, rank));

    groups.push({
      cards,
      isSet: true,
      id: `set-${i}`
    });
  }

  // Generate 5 invalid groups (decoys)
  const invalidTypes = [
    'mixed-ranks',      // Different ranks
    'two-cards',        // Only 2 cards
    'run-not-set',      // Consecutive but not same rank
    'duplicate-suit',   // Same rank but duplicate suit
    'mixed-ranks-2'
  ];

  for (let i = 0; i < 5; i++) {
    const type = invalidTypes[i];
    let cards;

    switch (type) {
      case 'mixed-ranks':
      case 'mixed-ranks-2': {
        // 3 cards of different ranks
        const availRanks = ranks.filter(r => !usedRanks.has(r)).slice(0, 3);
        if (availRanks.length < 3) {
          // Fallback: use some used ranks but still invalid
          cards = [
            createCard('hearts', '5'),
            createCard('diamonds', '6'),
            createCard('clubs', '7')
          ];
        } else {
          const suits = shuffle([...SUITS]);
          cards = availRanks.map((r, idx) => createCard(suits[idx], r));
        }
        break;
      }

      case 'two-cards': {
        // Only 2 cards of same rank
        const rank = ranks.find(r => !usedRanks.has(r)) || '9';
        cards = [
          createCard('hearts', rank),
          createCard('diamonds', rank)
        ];
        break;
      }

      case 'run-not-set': {
        // 3 consecutive cards (run, not set)
        const suit = SUITS[Math.floor(Math.random() * 4)];
        cards = [
          createCard(suit, '4'),
          createCard(suit, '5'),
          createCard(suit, '6')
        ];
        break;
      }

      case 'duplicate-suit': {
        // Same rank but only 2 different suits (3 cards, one suit repeated)
        const rank = ranks.find(r => !usedRanks.has(r)) || '8';
        // This is actually still valid if 3 different suits...
        // Let's make it 3 cards with only 2 suits (one repeated - invalid)
        cards = [
          createCard('hearts', rank),
          createCard('hearts', rank), // duplicate suit
          createCard('diamonds', rank)
        ];
        // Give unique IDs to handle duplicates
        cards[0].id = `${rank}-hearts-1`;
        cards[1].id = `${rank}-hearts-2`;
        break;
      }

      default:
        cards = [
          createCard('spades', '2'),
          createCard('hearts', '3'),
          createCard('diamonds', '4')
        ];
    }

    groups.push({
      cards,
      isSet: false,
      id: `decoy-${i}`
    });
  }

  return shuffle(groups);
}

export class Level02 extends Level {
  constructor() {
    super({
      number: 2,
      title: 'Spot the Set',
      subtitle: 'Find groups of same rank',
      instructions: 'Tap all card groups that form valid sets (3-4 cards of the same rank)',
      passingScore: 5,
      starThresholds: { threeStarMax: 0, twoStarMax: 1 }
    });

    this.groups = [];
    this.setsFound = 0;
    this.falsePositives = 0;
    this.totalSets = 5;
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

    // Groups container
    const groupsContainer = document.createElement('div');
    groupsContainer.className = 'card-groups';

    for (const group of this.groups) {
      const groupEl = this.createGroupElement(group);
      groupsContainer.appendChild(groupEl);
    }

    gameArea.appendChild(groupsContainer);

    this.updateProgress(`Find all ${this.totalSets} sets`);
  }

  createGroupElement(group) {
    const el = document.createElement('div');
    el.className = 'card-group';
    el.dataset.groupId = group.id;
    el.dataset.isSet = group.isSet;

    // Render cards in group (smaller, non-draggable)
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

    for (const groupEl of groups) {
      const isSet = groupEl.dataset.isSet === 'true';
      const isSelected = groupEl.classList.contains('selected');

      if (isSet && isSelected) {
        // Correct: found a set
        groupEl.classList.add('correct');
        groupEl.classList.remove('selected');
        correct++;
      } else if (!isSet && isSelected) {
        // False positive: selected non-set
        groupEl.classList.add('incorrect');
        groupEl.classList.remove('selected');
        falsePos++;
      } else if (isSet && !isSelected) {
        // Missed set
        missed++;
      }
      // Non-set not selected: correct ignore (no visual change)
    }

    this.setsFound = correct;
    this.falsePositives = falsePos;

    // Provide feedback
    if (falsePos > 0) {
      this.showExplanation(
        `${falsePos} selection(s) were not valid sets. A set needs 3-4 cards of the same rank with different suits.`,
        'error'
      );
      this.score = 0;
      this.complete(false);
    } else if (missed > 0) {
      this.showExplanation(
        `Good selections! But you missed ${missed} set(s). Look for groups where all cards have the same number/letter.`,
        'error'
      );
      this.score = correct;
      this.complete(false);
    } else {
      this.showExplanation(
        `Perfect! You found all ${this.totalSets} sets with no false positives!`,
        'success'
      );
      this.score = this.totalSets;
      this.complete(true);
    }
  }

  reset() {
    this.groups = [];
    this.setsFound = 0;
    this.falsePositives = 0;
    super.reset();
  }
}

export default Level02;
