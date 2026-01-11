/**
 * Gin Rummy Academy - Card System
 * Core card, deck, and interaction logic
 */

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const SUIT_SYMBOLS = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660'
};
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const RANK_VALUES = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10
};

/**
 * Creates a card object
 * @param {string} suit - hearts, diamonds, clubs, spades
 * @param {string} rank - A, 2-10, J, Q, K
 * @returns {Object} Card object
 */
export function createCard(suit, rank) {
  return {
    suit,
    rank,
    value: RANK_VALUES[rank],
    id: `${rank}-${suit}`,
    faceUp: true
  };
}

/**
 * Creates a standard 52-card deck
 * @returns {Array} Array of card objects
 */
export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle
 * @param {Array} deck - Array of cards
 * @returns {Array} Shuffled array (new array, doesn't mutate)
 */
export function shuffle(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deal cards from deck to hands
 * @param {Array} deck - The deck to deal from
 * @param {number} numHands - Number of hands to deal
 * @param {number} cardsPerHand - Cards per hand
 * @returns {Object} { hands: Array[], remaining: Array }
 */
export function deal(deck, numHands, cardsPerHand) {
  const hands = Array.from({ length: numHands }, () => []);
  let cardIndex = 0;

  // Deal one card at a time to each hand (like real dealing)
  for (let i = 0; i < cardsPerHand; i++) {
    for (let h = 0; h < numHands; h++) {
      if (cardIndex < deck.length) {
        hands[h].push(deck[cardIndex++]);
      }
    }
  }

  return {
    hands,
    remaining: deck.slice(cardIndex)
  };
}

/**
 * Renders a card element
 * @param {Object} card - Card object
 * @param {Object} options - Render options
 * @returns {HTMLElement} Card DOM element
 */
export function renderCard(card, options = {}) {
  const {
    faceUp = card.faceUp ?? true,
    draggable = true,
    onClick = null,
    className = ''
  } = options;

  const el = document.createElement('div');
  el.className = `card ${card.suit} ${className}`.trim();
  el.dataset.cardId = card.id;
  el.dataset.suit = card.suit;
  el.dataset.rank = card.rank;
  el.dataset.value = card.value;

  if (!faceUp) {
    el.classList.add('flipped');
  }

  // Front face
  const front = document.createElement('div');
  front.className = 'card-face card-front';
  front.innerHTML = `
    <div class="card-corner top-left">
      <span class="card-rank">${card.rank}</span>
      <span class="card-suit-small">${SUIT_SYMBOLS[card.suit]}</span>
    </div>
    <span class="card-suit-center">${SUIT_SYMBOLS[card.suit]}</span>
    <div class="card-corner bottom-right">
      <span class="card-rank">${card.rank}</span>
      <span class="card-suit-small">${SUIT_SYMBOLS[card.suit]}</span>
    </div>
  `;

  // Back face
  const back = document.createElement('div');
  back.className = 'card-face card-back';

  el.appendChild(front);
  el.appendChild(back);

  // Set up interactions
  if (draggable) {
    setupDragInteraction(el, card);
  }

  if (onClick) {
    el.addEventListener('click', (e) => {
      if (!el.dataset.wasDragged) {
        onClick(card, el, e);
      }
      delete el.dataset.wasDragged;
    });
  }

  return el;
}

/**
 * Sets up pointer-based drag interaction
 * @param {HTMLElement} el - Card element
 * @param {Object} card - Card data
 */
function setupDragInteraction(el, card) {
  let isDragging = false;
  let startX, startY;
  let offsetX, offsetY;
  let originalParent, originalNextSibling;
  let moveThreshold = 5; // pixels before considered a drag

  function onPointerDown(e) {
    if (e.button !== 0) return; // Only left click / primary touch

    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;

    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    originalParent = el.parentElement;
    originalNextSibling = el.nextElementSibling;

    el.setPointerCapture(e.pointerId);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    e.preventDefault();
  }

  function onPointerMove(e) {
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);

    if (!isDragging && (dx > moveThreshold || dy > moveThreshold)) {
      isDragging = true;
      el.classList.add('dragging');
      el.dataset.wasDragged = 'true';

      // Move to body for free positioning
      const rect = el.getBoundingClientRect();
      el.style.position = 'fixed';
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      document.body.appendChild(el);

      // Dispatch drag start
      el.dispatchEvent(new CustomEvent('carddragstart', {
        bubbles: true,
        detail: { card, element: el }
      }));
    }

    if (isDragging) {
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;

      // Dispatch drag move for drop zone detection
      el.dispatchEvent(new CustomEvent('carddragmove', {
        bubbles: true,
        detail: { card, element: el, x: e.clientX, y: e.clientY }
      }));
    }
  }

  function onPointerUp(e) {
    el.releasePointerCapture(e.pointerId);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', onPointerUp);
    el.removeEventListener('pointercancel', onPointerUp);

    if (isDragging) {
      el.classList.remove('dragging');

      // Find drop target
      el.style.pointerEvents = 'none';
      const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
      el.style.pointerEvents = '';

      const dropZone = dropTarget?.closest('[data-drop-zone]');

      // Reset styles
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.width = '';
      el.style.height = '';

      if (dropZone) {
        // Dispatch to drop zone
        dropZone.dispatchEvent(new CustomEvent('carddrop', {
          bubbles: true,
          detail: { card, element: el, dropZone }
        }));
      } else {
        // Return to original position
        if (originalNextSibling) {
          originalParent.insertBefore(el, originalNextSibling);
        } else {
          originalParent.appendChild(el);
        }
      }

      // Dispatch drag end
      el.dispatchEvent(new CustomEvent('carddragend', {
        bubbles: true,
        detail: { card, element: el, dropped: !!dropZone }
      }));
    }

    isDragging = false;
  }

  el.addEventListener('pointerdown', onPointerDown);
}

/**
 * Flips a card with animation
 * @param {HTMLElement} el - Card element
 * @param {boolean} faceUp - Whether to flip face up
 * @returns {Promise} Resolves when animation completes
 */
export function flipCard(el, faceUp) {
  return new Promise((resolve) => {
    el.classList.add('flip-animate');

    if (faceUp) {
      el.classList.remove('flipped');
    } else {
      el.classList.add('flipped');
    }

    setTimeout(() => {
      el.classList.remove('flip-animate');
      resolve();
    }, 400);
  });
}

/**
 * Deals cards with staggered animation
 * @param {Array} cards - Card objects to deal
 * @param {HTMLElement} container - Container to deal into
 * @param {Object} options - Deal options
 * @returns {Promise} Resolves when all cards dealt
 */
export function dealWithAnimation(cards, container, options = {}) {
  const { delay = 100, renderOptions = {} } = options;

  return new Promise((resolve) => {
    const elements = [];

    cards.forEach((card, i) => {
      setTimeout(() => {
        const el = renderCard(card, renderOptions);
        el.classList.add('dealing');
        el.style.animationDelay = '0ms';
        container.appendChild(el);
        elements.push(el);

        if (i === cards.length - 1) {
          setTimeout(() => resolve(elements), 300);
        }
      }, i * delay);
    });

    if (cards.length === 0) {
      resolve([]);
    }
  });
}

/**
 * Creates a drop zone element
 * @param {Object} options - Zone options
 * @returns {HTMLElement} Drop zone element
 */
export function createDropZone(options = {}) {
  const {
    id = '',
    label = '',
    className = '',
    onDrop = null
  } = options;

  const zone = document.createElement('div');
  zone.className = `card-zone ${className}`.trim();
  zone.dataset.dropZone = id;

  if (label) {
    const labelEl = document.createElement('span');
    labelEl.className = 'zone-label';
    labelEl.textContent = label;
    zone.appendChild(labelEl);
  }

  // Handle drag over styling
  document.addEventListener('carddragmove', (e) => {
    const { x, y } = e.detail;
    const rect = zone.getBoundingClientRect();
    const isOver = x >= rect.left && x <= rect.right &&
                   y >= rect.top && y <= rect.bottom;

    zone.classList.toggle('drag-over', isOver);
  });

  document.addEventListener('carddragend', () => {
    zone.classList.remove('drag-over');
  });

  // Handle drops
  if (onDrop) {
    zone.addEventListener('carddrop', (e) => {
      const { card, element } = e.detail;
      zone.classList.remove('drag-over');
      onDrop(card, element, zone);
    });
  }

  return zone;
}

/**
 * Gets card data from a card element
 * @param {HTMLElement} el - Card element
 * @returns {Object} Card data
 */
export function getCardFromElement(el) {
  return {
    id: el.dataset.cardId,
    suit: el.dataset.suit,
    rank: el.dataset.rank,
    value: parseInt(el.dataset.value, 10)
  };
}

/**
 * Sorts cards by suit then rank
 * @param {Array} cards - Array of cards
 * @returns {Array} Sorted cards (new array)
 */
export function sortBySuitThenRank(cards) {
  const suitOrder = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };
  const rankOrder = RANKS.reduce((acc, r, i) => ({ ...acc, [r]: i }), {});

  return [...cards].sort((a, b) => {
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) return suitDiff;
    return rankOrder[a.rank] - rankOrder[b.rank];
  });
}

/**
 * Sorts cards by rank then suit
 * @param {Array} cards - Array of cards
 * @returns {Array} Sorted cards (new array)
 */
export function sortByRankThenSuit(cards) {
  const suitOrder = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };
  const rankOrder = RANKS.reduce((acc, r, i) => ({ ...acc, [r]: i }), {});

  return [...cards].sort((a, b) => {
    const rankDiff = rankOrder[a.rank] - rankOrder[b.rank];
    if (rankDiff !== 0) return rankDiff;
    return suitOrder[a.suit] - suitOrder[b.suit];
  });
}
