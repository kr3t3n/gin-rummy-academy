/**
 * Gin Rummy Academy - Progress System
 * Handles saving/loading player progress to localStorage
 */

const STORAGE_KEY = 'gin-rummy-academy-progress';

/**
 * Default progress structure
 */
const DEFAULT_PROGRESS = {
  version: 1,
  currentLevel: 1,
  levels: {},
  totalStars: 0,
  lastPlayed: null
};

/**
 * Level completion data structure
 * @typedef {Object} LevelProgress
 * @property {boolean} completed - Whether level is completed
 * @property {number} stars - Stars earned (1-3)
 * @property {number} attempts - Total attempts
 * @property {number} bestScore - Best score achieved
 * @property {string} completedAt - ISO timestamp of first completion
 */

/**
 * Loads progress from localStorage
 * @returns {Object} Progress data
 */
export function loadProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_PROGRESS };

    const data = JSON.parse(stored);

    // Handle version migrations if needed
    if (!data.version || data.version < DEFAULT_PROGRESS.version) {
      return migrateProgress(data);
    }

    return data;
  } catch (e) {
    console.warn('Failed to load progress:', e);
    return { ...DEFAULT_PROGRESS };
  }
}

/**
 * Saves progress to localStorage
 * @param {Object} progress - Progress data
 */
export function saveProgress(progress) {
  try {
    progress.lastPlayed = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

/**
 * Migrates old progress format to new version
 * @param {Object} oldData - Old progress data
 * @returns {Object} Migrated progress
 */
function migrateProgress(oldData) {
  // For now, just merge with defaults
  return {
    ...DEFAULT_PROGRESS,
    ...oldData,
    version: DEFAULT_PROGRESS.version
  };
}

/**
 * Checks if a level is unlocked
 * @param {number} levelNum - Level number (1-based)
 * @param {Object} progress - Progress data
 * @returns {boolean}
 */
export function isLevelUnlocked(levelNum, progress = null) {
  if (levelNum === 1) return true;

  const p = progress || loadProgress();
  const prevLevel = p.levels[levelNum - 1];

  // Level is unlocked if previous level is completed
  return prevLevel?.completed === true;
}

/**
 * Gets progress for a specific level
 * @param {number} levelNum - Level number (1-based)
 * @param {Object} progress - Optional progress object
 * @returns {LevelProgress|null}
 */
export function getLevelProgress(levelNum, progress = null) {
  const p = progress || loadProgress();
  return p.levels[levelNum] || null;
}

/**
 * Records an attempt for a level
 * @param {number} levelNum - Level number
 * @param {Object} result - Attempt result
 * @param {boolean} result.passed - Whether level was passed
 * @param {number} result.score - Score achieved
 * @param {number} result.stars - Stars earned (1-3)
 * @returns {Object} Updated progress
 */
export function recordAttempt(levelNum, result) {
  const progress = loadProgress();

  // Initialize level progress if needed
  if (!progress.levels[levelNum]) {
    progress.levels[levelNum] = {
      completed: false,
      stars: 0,
      attempts: 0,
      bestScore: 0,
      completedAt: null
    };
  }

  const levelProgress = progress.levels[levelNum];
  levelProgress.attempts++;

  if (result.passed) {
    // Update completion status
    if (!levelProgress.completed) {
      levelProgress.completed = true;
      levelProgress.completedAt = new Date().toISOString();

      // Update current level if this was the highest unlocked
      if (levelNum >= progress.currentLevel) {
        progress.currentLevel = levelNum + 1;
      }
    }

    // Update best score
    if (result.score > levelProgress.bestScore) {
      levelProgress.bestScore = result.score;
    }

    // Update stars (only if better)
    if (result.stars > levelProgress.stars) {
      progress.totalStars -= levelProgress.stars;
      levelProgress.stars = result.stars;
      progress.totalStars += result.stars;
    }
  }

  saveProgress(progress);
  return progress;
}

/**
 * Calculates stars based on attempts
 * @param {number} attempts - Number of attempts to complete
 * @param {Object} config - Star thresholds
 * @returns {number} Stars (1-3)
 */
export function calculateStars(attempts, config = {}) {
  const {
    threeStarMax = 1,  // 3 stars if completed in 1 attempt
    twoStarMax = 3     // 2 stars if completed in 2-3 attempts
  } = config;

  if (attempts <= threeStarMax) return 3;
  if (attempts <= twoStarMax) return 2;
  return 1;
}

/**
 * Gets summary of all progress
 * @returns {Object} Progress summary
 */
export function getProgressSummary() {
  const progress = loadProgress();
  const completedCount = Object.values(progress.levels)
    .filter(l => l.completed).length;

  return {
    currentLevel: progress.currentLevel,
    completedLevels: completedCount,
    totalStars: progress.totalStars,
    lastPlayed: progress.lastPlayed
  };
}

/**
 * Gets all level data for level select screen
 * @param {number} totalLevels - Total number of levels
 * @returns {Array} Array of level data with unlock status
 */
export function getAllLevelsStatus(totalLevels = 20) {
  const progress = loadProgress();
  const levels = [];

  for (let i = 1; i <= totalLevels; i++) {
    const levelProgress = progress.levels[i];
    levels.push({
      number: i,
      unlocked: isLevelUnlocked(i, progress),
      completed: levelProgress?.completed || false,
      stars: levelProgress?.stars || 0,
      attempts: levelProgress?.attempts || 0,
      bestScore: levelProgress?.bestScore || 0
    });
  }

  return levels;
}

/**
 * Resets all progress
 * @returns {Object} Fresh progress
 */
export function resetProgress() {
  const fresh = { ...DEFAULT_PROGRESS };
  saveProgress(fresh);
  return fresh;
}

/**
 * Debug: Set progress for testing
 * @param {Object} overrides - Progress overrides
 */
export function debugSetProgress(overrides) {
  const progress = loadProgress();
  Object.assign(progress, overrides);
  saveProgress(progress);
  return progress;
}
