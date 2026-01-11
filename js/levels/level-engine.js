/**
 * Gin Rummy Academy - Level Engine
 * Base framework for level implementation
 */

import { recordAttempt, calculateStars, getLevelProgress } from '../progress.js';

/**
 * Base level class
 */
export class Level {
  constructor(config) {
    this.number = config.number;
    this.title = config.title;
    this.subtitle = config.subtitle || '';
    this.instructions = config.instructions || '';
    this.passingScore = config.passingScore || 0;
    this.starThresholds = config.starThresholds || { threeStarMax: 1, twoStarMax: 3 };

    this.container = null;
    this.attempts = 0;
    this.score = 0;
    this.completed = false;
    this.onComplete = null;
    this.onExit = null;
  }

  /**
   * Renders the level into a container
   * @param {HTMLElement} container - Container element
   */
  render(container) {
    this.container = container;
    this.container.innerHTML = '';

    // Create level structure
    const levelContainer = document.createElement('div');
    levelContainer.className = 'level-container';

    // Header
    const header = document.createElement('header');
    header.className = 'level-header';
    header.innerHTML = `
      <div class="level-nav">
        <button class="btn-back" aria-label="Back to menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="level-number">Level ${this.number}</span>
      </div>
      <h2 class="level-title">${this.title}</h2>
      <p class="level-subtitle">${this.subtitle}</p>
    `;

    // Content area
    const content = document.createElement('main');
    content.className = 'level-content';

    // Instructions
    if (this.instructions) {
      const instr = document.createElement('p');
      instr.className = 'level-instructions';
      instr.textContent = this.instructions;
      content.appendChild(instr);
    }

    // Game area (for level-specific content)
    const gameArea = document.createElement('div');
    gameArea.className = 'level-game-area';
    content.appendChild(gameArea);

    // Footer with progress
    const footer = document.createElement('footer');
    footer.className = 'level-footer';
    footer.innerHTML = `
      <div class="level-progress">
        <span class="progress-text"></span>
      </div>
    `;

    levelContainer.appendChild(header);
    levelContainer.appendChild(content);
    levelContainer.appendChild(footer);
    this.container.appendChild(levelContainer);

    // Store references
    this.headerEl = header;
    this.contentEl = content;
    this.gameAreaEl = gameArea;
    this.footerEl = footer;
    this.progressTextEl = footer.querySelector('.progress-text');

    // Set up back button
    header.querySelector('.btn-back').addEventListener('click', () => {
      if (this.onExit) this.onExit();
    });

    // Initialize level-specific content
    this.init(gameArea);
  }

  /**
   * Override in subclass to initialize level content
   * @param {HTMLElement} gameArea - The game area element
   */
  init(gameArea) {
    // Override in subclass
  }

  /**
   * Updates progress display
   * @param {string} text - Progress text
   */
  updateProgress(text) {
    if (this.progressTextEl) {
      this.progressTextEl.textContent = text;
    }
  }

  /**
   * Creates a sticky top bar with progress and action button
   * @param {Object} config - Configuration
   * @param {string} config.progress - Progress text (e.g., "1/5")
   * @param {string} config.buttonText - Button text
   * @param {Function} config.onButtonClick - Button click handler
   * @returns {HTMLElement} The top bar element
   */
  createTopBar({ progress, buttonText, onButtonClick }) {
    const topBar = document.createElement('div');
    topBar.className = 'level-top-bar';
    topBar.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      position: sticky;
      top: 0;
      background: var(--bg-dark);
      padding: 8px 0;
      z-index: 10;
    `;

    const progressEl = document.createElement('div');
    progressEl.className = 'selection-count top-bar-progress';
    progressEl.textContent = progress;
    topBar.appendChild(progressEl);

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary top-bar-btn';
    btn.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 8px 16px;';
    btn.innerHTML = buttonText;
    btn.addEventListener('click', onButtonClick);
    topBar.appendChild(btn);

    return topBar;
  }

  /**
   * Updates the top bar button text and handler
   * @param {string} text - New button text
   * @param {Function} onClick - New click handler
   */
  updateTopBarButton(text, onClick) {
    const btn = this.gameAreaEl?.querySelector('.top-bar-btn');
    if (btn) {
      btn.innerHTML = text;
      const newBtn = btn.cloneNode(true);
      newBtn.addEventListener('click', onClick);
      btn.parentNode.replaceChild(newBtn, btn);
    }
  }

  /**
   * Updates the top bar progress text
   * @param {string} text - New progress text
   */
  updateTopBarProgress(text) {
    const progressEl = this.gameAreaEl?.querySelector('.top-bar-progress');
    if (progressEl) {
      progressEl.textContent = text;
    }
  }

  /**
   * Shows feedback for correct answer
   * @param {HTMLElement} element - Element to animate
   */
  showCorrect(element) {
    element.classList.add('correct', 'pulse-success');
    setTimeout(() => {
      element.classList.remove('pulse-success');
    }, 600);
  }

  /**
   * Shows feedback for incorrect answer
   * @param {HTMLElement} element - Element to animate
   */
  showIncorrect(element) {
    element.classList.add('incorrect', 'shake');
    setTimeout(() => {
      element.classList.remove('shake', 'incorrect');
    }, 400);
  }

  /**
   * Shows explanation text
   * @param {string} text - Explanation
   * @param {string} type - 'success' or 'error'
   */
  showExplanation(text, type = 'info') {
    let explEl = this.contentEl.querySelector('.level-explanation');
    if (!explEl) {
      explEl = document.createElement('div');
      explEl.className = 'level-explanation';
      this.gameAreaEl.after(explEl);
    }

    explEl.textContent = text;
    explEl.className = `level-explanation ${type}`;
    explEl.style.opacity = '1';
  }

  /**
   * Clears explanation
   */
  clearExplanation() {
    const explEl = this.contentEl.querySelector('.level-explanation');
    if (explEl) {
      explEl.style.opacity = '0';
    }
  }

  /**
   * Completes the level
   * @param {boolean} passed - Whether player passed
   */
  complete(passed) {
    this.completed = true;
    this.attempts++;

    const stars = passed ? calculateStars(this.attempts, this.starThresholds) : 0;

    // Record progress
    recordAttempt(this.number, {
      passed,
      score: this.score,
      stars
    });

    // Show completion UI
    if (passed) {
      this.showCompletionScreen(stars);
    } else {
      this.showRetryPrompt();
    }
  }

  /**
   * Shows completion screen with stars
   * @param {number} stars - Stars earned
   */
  showCompletionScreen(stars) {
    const overlay = document.createElement('div');
    overlay.className = 'level-complete-overlay';

    const starsHtml = Array(3).fill(0).map((_, i) =>
      `<span class="star ${i < stars ? 'earned' : ''}">\u2605</span>`
    ).join('');

    overlay.innerHTML = `
      <div class="level-complete-modal">
        <h2>Level Complete!</h2>
        <div class="stars-display">${starsHtml}</div>
        <p class="score-text">Score: ${this.score}</p>
        <div class="complete-buttons">
          <button class="btn btn-primary" data-action="next">Next Level</button>
          <button class="btn" data-action="retry">Replay</button>
          <button class="btn" data-action="menu">Menu</button>
        </div>
      </div>
    `;

    this.container.appendChild(overlay);

    // Button handlers
    overlay.querySelector('[data-action="next"]').addEventListener('click', () => {
      overlay.remove();
      if (this.onComplete) this.onComplete('next');
    });

    overlay.querySelector('[data-action="retry"]').addEventListener('click', () => {
      overlay.remove();
      this.reset();
    });

    overlay.querySelector('[data-action="menu"]').addEventListener('click', () => {
      overlay.remove();
      if (this.onComplete) this.onComplete('menu');
    });
  }

  /**
   * Shows retry prompt when level failed
   */
  showRetryPrompt() {
    this.showExplanation('Not quite! Try again.', 'error');

    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn btn-primary';
    retryBtn.textContent = 'Try Again';
    retryBtn.style.marginTop = '16px';
    retryBtn.addEventListener('click', () => {
      retryBtn.remove();
      this.reset();
    });

    this.gameAreaEl.after(retryBtn);
  }

  /**
   * Resets level for retry
   */
  reset() {
    this.score = 0;
    this.completed = false;
    this.clearExplanation();

    // Re-render
    if (this.container) {
      this.render(this.container);
    }
  }

  /**
   * Cleans up level
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
