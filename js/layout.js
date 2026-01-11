/**
 * Gin Rummy Academy - Responsive Layout System
 * Handles screen size detection, orientation changes, and adaptive layout
 */

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  xs: 320,   // Small phones
  sm: 480,   // Large phones
  md: 768,   // Tablets
  lg: 1024,  // Small desktops
  xl: 1920   // Large desktops
};

/**
 * Current layout state
 */
const layoutState = {
  width: window.innerWidth,
  height: window.innerHeight,
  orientation: getOrientation(),
  breakpoint: getBreakpoint(window.innerWidth),
  listeners: []
};

/**
 * Gets current orientation
 * @returns {string} 'portrait' or 'landscape'
 */
function getOrientation() {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Gets current breakpoint name
 * @param {number} width - Screen width
 * @returns {string} Breakpoint name
 */
function getBreakpoint(width) {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  return 'xl';
}

/**
 * Updates layout state on resize
 */
function updateLayout() {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  const newOrientation = getOrientation();
  const newBreakpoint = getBreakpoint(newWidth);

  const changed =
    newWidth !== layoutState.width ||
    newHeight !== layoutState.height ||
    newOrientation !== layoutState.orientation ||
    newBreakpoint !== layoutState.breakpoint;

  if (changed) {
    layoutState.width = newWidth;
    layoutState.height = newHeight;
    layoutState.orientation = newOrientation;
    layoutState.breakpoint = newBreakpoint;

    // Update CSS custom properties
    document.documentElement.style.setProperty('--vw', `${newWidth * 0.01}px`);
    document.documentElement.style.setProperty('--vh', `${newHeight * 0.01}px`);

    // Notify listeners
    layoutState.listeners.forEach(fn => fn(layoutState));
  }
}

/**
 * Initializes layout system
 */
export function initLayout() {
  // Set initial CSS variables
  document.documentElement.style.setProperty('--vw', `${window.innerWidth * 0.01}px`);
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);

  // Listen for resize with debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateLayout, 100);
  });

  // Also update on orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(updateLayout, 100);
  });

  // Initial update
  updateLayout();
}

/**
 * Registers a layout change listener
 * @param {Function} callback - Called with layout state on changes
 * @returns {Function} Unsubscribe function
 */
export function onLayoutChange(callback) {
  layoutState.listeners.push(callback);
  // Call immediately with current state
  callback(layoutState);

  return () => {
    const idx = layoutState.listeners.indexOf(callback);
    if (idx > -1) layoutState.listeners.splice(idx, 1);
  };
}

/**
 * Gets current layout state
 * @returns {Object} Layout state
 */
export function getLayout() {
  return { ...layoutState, listeners: undefined };
}

/**
 * Checks if current width matches a media query style condition
 * @param {string} condition - 'mobile', 'tablet', 'desktop'
 * @returns {boolean}
 */
export function isBreakpoint(condition) {
  switch (condition) {
    case 'mobile':
      return layoutState.breakpoint === 'xs' || layoutState.breakpoint === 'sm';
    case 'tablet':
      return layoutState.breakpoint === 'md';
    case 'desktop':
      return layoutState.breakpoint === 'lg' || layoutState.breakpoint === 'xl';
    default:
      return layoutState.breakpoint === condition;
  }
}

/**
 * Calculates optimal card size based on container and card count
 * @param {HTMLElement} container - Container element
 * @param {number} cardCount - Number of cards to fit
 * @param {Object} options - Sizing options
 * @returns {Object} { width, height, gap }
 */
export function calculateCardSize(container, cardCount, options = {}) {
  const {
    minWidth = 44,
    maxWidth = 100,
    aspectRatio = 1.4,
    minGap = 4,
    maxGap = 12,
    overlap = false
  } = options;

  const containerRect = container.getBoundingClientRect();
  const availableWidth = containerRect.width - 32; // padding
  const availableHeight = containerRect.height - 32;

  let cardWidth, cardHeight, gap;

  if (overlap) {
    // Cards overlap (like a hand)
    const overlapFactor = 0.3; // Show 30% of each overlapped card
    const minVisibleWidth = minWidth * overlapFactor;
    const totalVisibleWidth = minVisibleWidth * (cardCount - 1) + minWidth;

    if (totalVisibleWidth <= availableWidth) {
      // Cards fit with room to spare
      cardWidth = Math.min(maxWidth, availableWidth / (1 + overlapFactor * (cardCount - 1)));
    } else {
      // Need to shrink
      cardWidth = Math.max(minWidth, availableWidth / (1 + overlapFactor * (cardCount - 1)));
    }
    gap = -(cardWidth * (1 - overlapFactor));
  } else {
    // Cards laid out with gaps
    const idealGap = Math.max(minGap, Math.min(maxGap, availableWidth * 0.02));
    const totalGaps = (cardCount - 1) * idealGap;
    const cardSpace = availableWidth - totalGaps;
    cardWidth = Math.max(minWidth, Math.min(maxWidth, cardSpace / cardCount));
    gap = idealGap;
  }

  cardHeight = cardWidth * aspectRatio;

  // Check height constraint
  if (cardHeight > availableHeight * 0.4) {
    cardHeight = availableHeight * 0.4;
    cardWidth = cardHeight / aspectRatio;
  }

  return {
    width: Math.round(cardWidth),
    height: Math.round(cardHeight),
    gap: Math.round(gap)
  };
}

/**
 * Creates a responsive game container
 * @param {Object} options - Container options
 * @returns {HTMLElement} Container element
 */
export function createGameContainer(options = {}) {
  const {
    maxWidth = 800,
    className = ''
  } = options;

  const container = document.createElement('div');
  container.className = `level-container ${className}`.trim();
  container.style.maxWidth = `min(100%, ${maxWidth}px)`;

  return container;
}

/**
 * Creates a responsive hand container
 * @param {number} cardCount - Expected number of cards
 * @returns {HTMLElement} Hand container
 */
export function createHandContainer(cardCount = 10) {
  const hand = document.createElement('div');
  hand.className = 'hand';
  hand.dataset.cardCount = cardCount;

  // Update hand layout on resize
  onLayoutChange(() => {
    const { gap } = calculateCardSize(hand.parentElement || document.body, cardCount, { overlap: true });
    hand.style.gap = `${gap}px`;
  });

  return hand;
}
