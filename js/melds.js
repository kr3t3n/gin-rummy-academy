/**
 * Gin Rummy Academy - Meld Detection System
 * Detects sets, runs, and calculates optimal meld arrangements
 */

import { RANKS, RANK_VALUES } from './cards.js';

/**
 * Rank order for runs (Ace is always low)
 */
const RANK_ORDER = {
  'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6,
  '8': 7, '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12
};

/**
 * Checks if cards form a valid set (3-4 of same rank)
 * @param {Array} cards - Array of card objects
 * @returns {boolean}
 */
export function isValidSet(cards) {
  if (cards.length < 3 || cards.length > 4) return false;

  const rank = cards[0].rank;
  const suits = new Set();

  for (const card of cards) {
    if (card.rank !== rank) return false;
    if (suits.has(card.suit)) return false; // Duplicate suit
    suits.add(card.suit);
  }

  return true;
}

/**
 * Checks if cards form a valid run (3+ consecutive same suit)
 * @param {Array} cards - Array of card objects
 * @returns {boolean}
 */
export function isValidRun(cards) {
  if (cards.length < 3) return false;

  const suit = cards[0].suit;

  // All must be same suit
  for (const card of cards) {
    if (card.suit !== suit) return false;
  }

  // Sort by rank order
  const sorted = [...cards].sort((a, b) =>
    RANK_ORDER[a.rank] - RANK_ORDER[b.rank]
  );

  // Check consecutive
  for (let i = 1; i < sorted.length; i++) {
    const prevOrder = RANK_ORDER[sorted[i - 1].rank];
    const currOrder = RANK_ORDER[sorted[i].rank];

    // Must be exactly 1 apart (no wrapping K-A allowed)
    if (currOrder - prevOrder !== 1) return false;
  }

  return true;
}

/**
 * Checks if cards form a valid meld (set or run)
 * @param {Array} cards - Array of card objects
 * @returns {Object} { valid: boolean, type: 'set'|'run'|null }
 */
export function isValidMeld(cards) {
  if (isValidSet(cards)) return { valid: true, type: 'set' };
  if (isValidRun(cards)) return { valid: true, type: 'run' };
  return { valid: false, type: null };
}

/**
 * Finds all possible sets in a hand
 * @param {Array} hand - Array of card objects
 * @returns {Array} Array of possible sets (each is array of cards)
 */
export function findAllSets(hand) {
  // Group cards by rank
  const byRank = {};
  for (const card of hand) {
    if (!byRank[card.rank]) byRank[card.rank] = [];
    byRank[card.rank].push(card);
  }

  const sets = [];
  for (const rank in byRank) {
    const cards = byRank[rank];
    if (cards.length >= 3) {
      // Add 3-card sets
      if (cards.length === 3) {
        sets.push([...cards]);
      } else if (cards.length === 4) {
        // Add 4-card set and all 3-card subsets
        sets.push([...cards]);
        for (let i = 0; i < 4; i++) {
          sets.push(cards.filter((_, j) => j !== i));
        }
      }
    }
  }

  return sets;
}

/**
 * Finds all possible runs in a hand
 * @param {Array} hand - Array of card objects
 * @returns {Array} Array of possible runs (each is array of cards)
 */
export function findAllRuns(hand) {
  // Group cards by suit
  const bySuit = {};
  for (const card of hand) {
    if (!bySuit[card.suit]) bySuit[card.suit] = [];
    bySuit[card.suit].push(card);
  }

  const runs = [];

  for (const suit in bySuit) {
    const cards = bySuit[suit];
    if (cards.length < 3) continue;

    // Sort by rank
    const sorted = [...cards].sort((a, b) =>
      RANK_ORDER[a.rank] - RANK_ORDER[b.rank]
    );

    // Find all consecutive sequences of 3+
    for (let start = 0; start < sorted.length - 2; start++) {
      let run = [sorted[start]];

      for (let i = start + 1; i < sorted.length; i++) {
        const prevOrder = RANK_ORDER[run[run.length - 1].rank];
        const currOrder = RANK_ORDER[sorted[i].rank];

        if (currOrder - prevOrder === 1) {
          run.push(sorted[i]);
          if (run.length >= 3) {
            runs.push([...run]);
          }
        } else if (currOrder - prevOrder > 1) {
          break;
        }
        // If equal (duplicate rank), skip but don't break
      }
    }
  }

  return runs;
}

/**
 * Finds all possible melds in a hand
 * @param {Array} hand - Array of card objects
 * @returns {Array} Array of { type, cards }
 */
export function findAllMelds(hand) {
  const melds = [];

  for (const cards of findAllSets(hand)) {
    melds.push({ type: 'set', cards });
  }

  for (const cards of findAllRuns(hand)) {
    melds.push({ type: 'run', cards });
  }

  return melds;
}

/**
 * Calculates deadwood value
 * @param {Array} cards - Array of unmelded card objects
 * @returns {number} Total deadwood points
 */
export function calculateDeadwood(cards) {
  return cards.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0);
}

/**
 * Finds the optimal meld arrangement that minimizes deadwood
 * Uses recursive backtracking to try all combinations
 * @param {Array} hand - Array of card objects
 * @returns {Object} { melds: Array, deadwood: Array, deadwoodValue: number }
 */
export function findOptimalMelds(hand) {
  const allMelds = findAllMelds(hand);

  // Early exit if no melds possible
  if (allMelds.length === 0) {
    return {
      melds: [],
      deadwood: [...hand],
      deadwoodValue: calculateDeadwood(hand)
    };
  }

  let bestResult = {
    melds: [],
    deadwood: [...hand],
    deadwoodValue: calculateDeadwood(hand)
  };

  /**
   * Recursive function to find best meld combination
   * @param {Array} remainingCards - Cards not yet assigned
   * @param {Array} usedMelds - Melds already selected
   * @param {Set} usedCardIds - IDs of cards in melds
   */
  function findBest(remainingCards, usedMelds, usedCardIds) {
    const deadwoodValue = calculateDeadwood(remainingCards);

    // Update best if this is better
    if (deadwoodValue < bestResult.deadwoodValue) {
      bestResult = {
        melds: usedMelds.map(m => ({ ...m, cards: [...m.cards] })),
        deadwood: [...remainingCards],
        deadwoodValue
      };
    }

    // Early pruning: if current deadwood is 0, we're done
    if (deadwoodValue === 0) return;

    // Try adding each possible meld that uses only remaining cards
    for (const meld of allMelds) {
      // Check if all cards in this meld are available
      const meldCardIds = meld.cards.map(c => c.id);
      const canUse = meldCardIds.every(id => !usedCardIds.has(id));

      if (canUse) {
        // Add meld and recurse
        const newUsedIds = new Set(usedCardIds);
        meldCardIds.forEach(id => newUsedIds.add(id));

        const newRemaining = remainingCards.filter(c => !meldCardIds.includes(c.id));

        findBest(newRemaining, [...usedMelds, meld], newUsedIds);
      }
    }
  }

  findBest(hand, [], new Set());

  return bestResult;
}

/**
 * Checks if a card can be laid off onto a meld
 * @param {Object} card - Card to potentially lay off
 * @param {Object} meld - Meld to extend { type, cards }
 * @returns {boolean}
 */
export function canLayOff(card, meld) {
  if (meld.type === 'set') {
    // Can add 4th card to 3-card set
    if (meld.cards.length !== 3) return false;
    if (card.rank !== meld.cards[0].rank) return false;
    if (meld.cards.some(c => c.suit === card.suit)) return false;
    return true;
  }

  if (meld.type === 'run') {
    // Can extend run at either end
    if (card.suit !== meld.cards[0].suit) return false;

    const sorted = [...meld.cards].sort((a, b) =>
      RANK_ORDER[a.rank] - RANK_ORDER[b.rank]
    );

    const lowRank = RANK_ORDER[sorted[0].rank];
    const highRank = RANK_ORDER[sorted[sorted.length - 1].rank];
    const cardRank = RANK_ORDER[card.rank];

    // Can add to low end (but not below Ace)
    if (cardRank === lowRank - 1 && cardRank >= 0) return true;
    // Can add to high end (but not above King)
    if (cardRank === highRank + 1 && cardRank <= 12) return true;

    return false;
  }

  return false;
}

/**
 * Finds all cards that can be laid off from deadwood onto melds
 * @param {Array} deadwood - Deadwood cards to try laying off
 * @param {Array} melds - Melds to lay off onto
 * @returns {Array} Array of { card, meldIndex }
 */
export function findLayoffs(deadwood, melds) {
  const layoffs = [];

  for (const card of deadwood) {
    for (let i = 0; i < melds.length; i++) {
      if (canLayOff(card, melds[i])) {
        layoffs.push({ card, meldIndex: i });
      }
    }
  }

  return layoffs;
}

/**
 * Checks if hand can knock (deadwood <= 10)
 * @param {Array} hand - Hand of cards
 * @returns {Object} { canKnock: boolean, deadwoodValue: number, melds, deadwood }
 */
export function canKnock(hand) {
  const { melds, deadwood, deadwoodValue } = findOptimalMelds(hand);
  return {
    canKnock: deadwoodValue <= 10,
    deadwoodValue,
    melds,
    deadwood
  };
}

/**
 * Checks if hand is Gin (zero deadwood)
 * @param {Array} hand - Hand of cards
 * @returns {Object} { isGin: boolean, melds }
 */
export function isGin(hand) {
  const { melds, deadwoodValue } = findOptimalMelds(hand);
  return {
    isGin: deadwoodValue === 0,
    melds
  };
}
