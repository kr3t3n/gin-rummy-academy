/**
 * Gin Rummy Academy - Main Application
 * A passionate journey through the world's most elegant card game
 */

import { initLayout } from './layout.js';
import { loadProgress, getAllLevelsStatus } from './progress.js';
import { Level01 } from './levels/level-01.js';
import { Level02 } from './levels/level-02.js';
import { Level03 } from './levels/level-03.js';
import { Level04 } from './levels/level-04.js';
import { Level05 } from './levels/level-05.js';
import { Level06 } from './levels/level-06.js';
import { Level07 } from './levels/level-07.js';
import { Level08 } from './levels/level-08.js';
import { Level09 } from './levels/level-09.js';
import { Level10 } from './levels/level-10.js';
import {
  Level11, Level12, Level13, Level14, Level15,
  Level16, Level17, Level18, Level19, Level20
} from './levels/level-11-20.js';

// Initialize responsive layout system
initLayout();

const container = document.getElementById('game-container');

// Level registry - all 20 levels
const LEVELS = {
  1: Level01, 2: Level02, 3: Level03, 4: Level04, 5: Level05,
  6: Level06, 7: Level07, 8: Level08, 9: Level09, 10: Level10,
  11: Level11, 12: Level12, 13: Level13, 14: Level14, 15: Level15,
  16: Level16, 17: Level17, 18: Level18, 19: Level19, 20: Level20
};

// Level metadata with descriptions for intro modals
const LEVEL_INFO = {
  1: {
    title: 'Card Values',
    emoji: '🃏',
    chapter: 'The Basics',
    intro: `Every great card player knows their deck like an old friend. In Gin Rummy, each card carries a secret weight—its point value.

Aces whisper "one," humble yet powerful. Number cards speak their face value plainly. But the royalty—Jacks, Queens, Kings—they're heavy, each worth 10 points.

Why does this matter? Because in Gin Rummy, you're trying to MINIMIZE the points left in your hand. Those face cards? They're dangerous friends to hold onto.`,
    lesson: 'Learn the point value of each card—the foundation of every decision you\'ll make.'
  },
  2: {
    title: 'Spot the Set',
    emoji: '🎯',
    chapter: 'The Basics',
    intro: `Now for the magic of "melding." A SET is three or four cards of the same rank—like a secret club of matching numbers.

Three 7s from different suits? That's a set. Four Kings gathering from all corners of the deck? An even better set!

Sets are your shields. Cards in sets don't count against you. The more sets you form, the closer you are to victory.`,
    lesson: 'Identify valid sets—3 or 4 cards of the same rank, different suits.'
  },
  3: {
    title: 'Run for It',
    emoji: '🏃',
    chapter: 'The Basics',
    intro: `If sets are clubs of equals, RUNS are adventures in sequence. Three or more cards of the SAME suit, marching in order.

5♥ 6♥ 7♥ — a run of hearts climbing the ladder.
10♠ J♠ Q♠ K♠ — a majestic parade of spades!

But beware: Aces are humble in Gin Rummy. A-2-3 works beautifully, but Q-K-A does NOT. The Ace refuses to wrap around.`,
    lesson: 'Master runs—consecutive cards of the same suit. Remember: Ace is always low!'
  },
  4: {
    title: 'Meld or Not',
    emoji: '🤔',
    chapter: 'The Basics',
    intro: `Your hand is dealt. Ten cards stare back at you. Some belong together in beautiful melds. Others... are "deadwood"—lonely cards waiting for partners.

The art of Gin Rummy begins here: seeing which cards can combine, and which are weighing you down.

Train your eyes to spot the patterns. With practice, melds will leap out at you like old friends in a crowd.`,
    lesson: 'Sort your hand into melds (sets & runs) versus deadwood (unmatched cards).'
  },
  5: {
    title: 'Count Deadwood',
    emoji: '🔢',
    chapter: 'The Basics',
    intro: `Deadwood. The cards left behind when the music stops. Counting them is crucial—it determines if you can end the round, and how much you might lose.

Add up those lonely cards: their face values for number cards, 10 for face cards, 1 for Aces.

This number is your vulnerability. Keep it low, and you hold the power.`,
    lesson: 'Calculate deadwood points—the sum of all your unmatched cards.'
  },
  6: {
    title: 'The Draw',
    emoji: '📥',
    chapter: 'The Rhythm',
    intro: `Every turn begins with a choice. The draw pile sits face-down, mysterious and full of possibility. The discard pile lies exposed—one card, known to all.

Do you gamble on the unknown? Or take the certain card your opponent just threw away?

This choice shapes everything. Taking from discards reveals your strategy. Drawing blindly keeps them guessing. Choose wisely.`,
    lesson: 'Learn when to draw from the deck versus taking the discard.'
  },
  7: {
    title: 'The Discard',
    emoji: '📤',
    chapter: 'The Rhythm',
    intro: `You've drawn. Now you must give something back. But what?

The perfect discard is useless to your opponent and weighs you down. High cards you'll never meld. Orphans far from any combination.

But be careful—your discards tell a story. A skilled opponent reads them like tea leaves, divining what you're collecting.`,
    lesson: 'Choose the best card to discard—minimize deadwood without helping your opponent.'
  },
  8: {
    title: 'Knock Knock',
    emoji: '🚪',
    chapter: 'The Rhythm',
    intro: `When your deadwood drops to 10 or less, a new power awakens: you can KNOCK.

Knocking ends the round. You lay down your melds, reveal your deadwood, and challenge your opponent to do the same.

But 10 points is the threshold, not the goal. The lower your deadwood when you knock, the safer your victory.`,
    lesson: 'Understand when you CAN knock—deadwood must be 10 points or less.'
  },
  9: {
    title: 'Should You Knock?',
    emoji: '🎲',
    chapter: 'The Rhythm',
    intro: `Just because you CAN knock doesn't mean you SHOULD. This is where strategy deepens.

Early game with 8 points? Maybe wait—you might hit Gin! Late game with 10? Knock before they do!

Read the game. How many cards has your opponent drawn? Are they close to Gin? Sometimes a risky knock saves you from disaster.`,
    lesson: 'Develop strategic intuition—when knocking is smart vs. when to keep playing.'
  },
  10: {
    title: 'Going Gin',
    emoji: '🏆',
    chapter: 'The Rhythm',
    intro: `GIN. The word every player dreams of saying. Zero deadwood. Every card in perfect melds.

Going Gin isn't just victory—it's art. It's bonus points. It's your opponent unable to "lay off" their cards onto your melds.

The hunt for Gin is thrilling. But don't chase it blindly—sometimes knocking wins the war while you're dreaming of perfection.`,
    lesson: 'Arrange all 10 cards into melds—the ultimate achievement in Gin Rummy.'
  },
  11: {
    title: 'The Layoff',
    emoji: '🎁',
    chapter: 'Advanced Tactics',
    intro: `When someone knocks (but doesn't Gin), a small mercy exists: the LAYOFF.

Your deadwood can join THEIR melds. They laid down three 8s? If you're holding the fourth 8, it's no longer deadwood! Their run of 5-6-7♦? Your 4♦ or 8♦ can extend it.

Layoffs are your last defense against a knock. Count them carefully—they might save the round.`,
    lesson: 'Reduce your deadwood by adding cards to your opponent\'s melds after they knock.'
  },
  12: {
    title: 'Undercut!',
    emoji: '⚔️',
    chapter: 'Advanced Tactics',
    intro: `The UNDERCUT. A knockout punch that reverses fortune.

When your opponent knocks, if your deadwood (after layoffs) equals or beats theirs—you UNDERCUT. You win the round PLUS bonus points!

This is why reckless knocking is dangerous. That "safe" 10-point knock? If your opponent has 10 or less, they steal victory from your hands.`,
    lesson: 'Turn the tables—win by having equal or lower deadwood than the knocker.'
  },
  13: {
    title: 'Score It Right',
    emoji: '📊',
    chapter: 'Advanced Tactics',
    intro: `Gin Rummy is played across multiple rounds. Understanding scoring is understanding the war, not just battles.

When you knock and win: you score the DIFFERENCE in deadwood.
When you Gin: difference PLUS 25 bonus points, and no layoffs allowed!
When you undercut: difference PLUS 25 bonus points for you!

Games typically play to 100 points. Every decision echoes through the score sheet.`,
    lesson: 'Master the scoring system—points for knocking, Gin bonuses, and undercut rewards.'
  },
  14: {
    title: 'Triangle Theory',
    emoji: '🔺',
    chapter: 'Advanced Tactics',
    intro: `Some cards are more valuable than others—not because of their face value, but because of their flexibility.

A "triangle" card can complete EITHER a set OR a run. The 7♥ with 7♠ 7♦ nearby AND 6♥ 8♥ waiting? That's a triangle. It gives you options.

Hunt for triangles. They're your insurance policy against bad draws.`,
    lesson: 'Identify flexible cards that can complete multiple meld combinations.'
  },
  15: {
    title: 'Reading Discards',
    emoji: '🔮',
    chapter: 'Advanced Tactics',
    intro: `Beyond remembering—interpret. Your opponent's discards whisper secrets.

They threw away three hearts in a row? They're not collecting hearts—safe to discard yours! They're grabbing every middle card from the discard pile? They're building runs, not sets.

Learn to read these signals. The cards speak to those who listen.`,
    lesson: 'Deduce what your opponent is collecting based on their discard patterns.'
  },
  16: {
    title: 'Safe Discards',
    emoji: '🛡️',
    chapter: 'Mastery',
    intro: `Defense wins championships. A "safe" discard is one your opponent likely CAN'T use.

Cards matching what they've discarded are safest. Cards close to ones you hold in sets are protected. Late in the round, cards that would complete obvious runs are dangerous.

Balance offense (building your hand) with defense (starving theirs). This is the way.`,
    lesson: 'Identify which cards are safe to discard without helping your opponent.'
  },
  17: {
    title: 'Defensive Play',
    emoji: '🏰',
    chapter: 'Mastery',
    intro: `Sometimes you're behind. Your hand is a mess, your opponent is close to knocking. What now?

Play defense. Discard only safe cards, even if it slows your own melds. Force them to knock with high deadwood. Aim for the undercut.

Defensive play isn't glamorous, but it's how underdogs become champions.`,
    lesson: 'Learn defensive strategies when your hand is weak or opponent is close to winning.'
  },
  18: {
    title: 'Solo Practice',
    emoji: '🤖',
    chapter: 'Mastery',
    intro: `Theory becomes instinct through practice. Now you'll face a computer opponent with no hints—just your skills against the algorithm.

Don't worry about winning every hand. Focus on making good decisions. Review why you won or lost. This is where book knowledge transforms into table wisdom.`,
    lesson: 'Apply everything you\'ve learned against an AI opponent—no hints, pure skill.'
  },
  19: {
    title: 'Challenge Mode',
    emoji: '🎯',
    chapter: 'Mastery',
    intro: `Ready to test your mettle? Challenge Mode throws difficult scenarios at you—hands where the "right" play isn't obvious.

These puzzles are extracted from real games, moments where masters made brilliant moves. Study them. Solve them. Think like a champion.`,
    lesson: 'Solve difficult hand puzzles that test advanced decision-making.'
  },
  20: {
    title: 'Graduation',
    emoji: '🎓',
    chapter: 'Mastery',
    intro: `You've done it. From card values to strategic defense, you've walked the entire path.

Gin Rummy is a game of simple rules and infinite depth. You now have the foundation—but mastery comes from playing real games against real opponents.

Shuffle up and deal. Your journey continues at the table.`,
    lesson: 'Celebrate your achievement and prepare for real games!'
  }
};

// History/intro story pages
const INTRO_PAGES = [
  {
    title: 'A Game Born in Saloons',
    emoji: '🎰',
    text: `Picture New York, 1909. Smoke curls through a Brooklyn social club. Men hunch over card tables, seeking a game faster than Knock Rummy but deeper than simple matching.

Elwood T. Baker—a whist teacher with ink-stained fingers—shuffles a deck and deals a new invention. He calls it "Gin Rummy," a playful nod to its cousin Rum Rummy.

Within weeks, the game spreads like wildfire.`
  },
  {
    title: 'Hollywood\'s Favorite Secret',
    emoji: '🎬',
    text: `By the 1940s, Gin Rummy conquered Hollywood. Between takes, stars like Humphrey Bogart and Lauren Bacall battled over hands worth thousands.

Studio executives were known to lose (and win) small fortunes. The game appeared in films, became shorthand for sophistication, and cemented itself in American culture.

This wasn't just gambling—it was intellectual combat disguised as leisure.`
  },
  {
    title: 'Why Gin Rummy Endures',
    emoji: '💎',
    text: `Unlike games of pure chance, Gin Rummy rewards skill, memory, and psychology. Unlike chess, a hand takes minutes, not hours.

It's the perfect blend: accessible enough to learn in an evening, deep enough to study for a lifetime. Every hand is a story—of plans made, opportunities seized, and sometimes, spectacular reversals.

You're about to join over a century of players who discovered this magic.`
  },
  {
    title: 'Your Journey Begins',
    emoji: '🗺️',
    text: `In this academy, you'll progress from complete beginner to confident player through 20 carefully designed lessons.

Each level builds on the last. Master the fundamentals, then tactics, then strategy. By the end, you'll see patterns invisible to novices and make decisions that separate good players from great ones.

The cards are shuffled. The table is set.

Are you ready?`
  }
];

/**
 * Shows the welcome/intro screen
 */
function showWelcome() {
  document.body.classList.remove('level-active');
  container.innerHTML = '';

  const welcome = document.createElement('div');
  welcome.className = 'welcome-screen';
  welcome.innerHTML = `
    <div class="welcome-content">
      <div class="welcome-cards">
        <span class="floating-card">🂡</span>
        <span class="floating-card delay-1">🂱</span>
        <span class="floating-card delay-2">🃁</span>
      </div>
      <h1 class="welcome-title">Gin Rummy Academy</h1>
      <p class="welcome-subtitle">Master the world's most elegant card game</p>
      <button class="btn btn-start" id="start-btn">
        <span>Begin Your Journey</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
      <p class="welcome-hint">New to Gin Rummy? We'll teach you everything.</p>
    </div>
  `;

  container.appendChild(welcome);

  document.getElementById('start-btn').addEventListener('click', () => {
    const progress = loadProgress();
    // Show intro story if first time, otherwise go to map
    if (!progress.hasSeenIntro) {
      showIntroStory(0);
    } else {
      showAdventureMap();
    }
  });
}

/**
 * Shows the intro story pages
 */
function showIntroStory(pageIndex) {
  if (pageIndex >= INTRO_PAGES.length) {
    // Mark intro as seen and go to map
    const progress = loadProgress();
    progress.hasSeenIntro = true;
    localStorage.setItem('gin-rummy-academy-progress', JSON.stringify(progress));
    showAdventureMap();
    return;
  }

  const page = INTRO_PAGES[pageIndex];
  container.innerHTML = '';

  const story = document.createElement('div');
  story.className = 'intro-story';
  story.innerHTML = `
    <div class="story-page">
      <div class="story-progress">
        ${INTRO_PAGES.map((_, i) => `<span class="dot ${i <= pageIndex ? 'active' : ''}"></span>`).join('')}
      </div>
      <div class="story-emoji">${page.emoji}</div>
      <h2 class="story-title">${page.title}</h2>
      <div class="story-text">${page.text.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
      <div class="story-nav">
        ${pageIndex > 0 ? '<button class="btn btn-secondary" id="prev-btn">Back</button>' : '<div></div>'}
        <button class="btn btn-primary" id="next-btn">
          ${pageIndex === INTRO_PAGES.length - 1 ? 'Enter the Academy' : 'Continue'}
        </button>
      </div>
      <button class="skip-intro" id="skip-btn">Skip intro</button>
    </div>
  `;

  container.appendChild(story);

  // Animate in
  setTimeout(() => story.querySelector('.story-page').classList.add('visible'), 50);

  document.getElementById('next-btn').addEventListener('click', () => showIntroStory(pageIndex + 1));
  if (pageIndex > 0) {
    document.getElementById('prev-btn').addEventListener('click', () => showIntroStory(pageIndex - 1));
  }
  document.getElementById('skip-btn').addEventListener('click', () => {
    const progress = loadProgress();
    progress.hasSeenIntro = true;
    localStorage.setItem('gin-rummy-academy-progress', JSON.stringify(progress));
    showAdventureMap();
  });
}

/**
 * Shows the adventure map (level select)
 */
function showAdventureMap() {
  document.body.classList.remove('level-active');
  container.innerHTML = '';

  const map = document.createElement('div');
  map.className = 'adventure-map';

  // Header with progress
  const levels = getAllLevelsStatus(20);
  const completed = levels.filter(l => l.completed).length;
  const totalStars = levels.reduce((sum, l) => sum + (l.stars || 0), 0);

  map.innerHTML = `
    <header class="map-header">
      <h2 class="map-title">Your Gin Rummy Adventure</h2>
      <div class="map-stats">
        <span class="stat"><span class="stat-icon">🏆</span> ${completed}/20</span>
        <span class="stat"><span class="stat-icon">⭐</span> ${totalStars}/60</span>
      </div>
    </header>
    <div class="map-chapters"></div>
  `;

  const chaptersContainer = map.querySelector('.map-chapters');

  // Group levels by chapter
  const chapters = [
    { name: 'The Basics', emoji: '📚', levels: [1, 2, 3, 4, 5] },
    { name: 'The Rhythm', emoji: '🎵', levels: [6, 7, 8, 9, 10] },
    { name: 'Advanced Tactics', emoji: '⚔️', levels: [11, 12, 13, 14, 15] },
    { name: 'Mastery', emoji: '👑', levels: [16, 17, 18, 19, 20] }
  ];

  for (const chapter of chapters) {
    const chapterEl = document.createElement('div');
    chapterEl.className = 'map-chapter';

    const chapterLevels = chapter.levels.map(num => levels.find(l => l.number === num));
    const chapterCompleted = chapterLevels.filter(l => l.completed).length;

    chapterEl.innerHTML = `
      <div class="chapter-header">
        <span class="chapter-emoji">${chapter.emoji}</span>
        <span class="chapter-name">${chapter.name}</span>
        <span class="chapter-progress">${chapterCompleted}/${chapter.levels.length}</span>
      </div>
      <div class="chapter-levels"></div>
    `;

    const levelsContainer = chapterEl.querySelector('.chapter-levels');

    for (const levelNum of chapter.levels) {
      const level = levels.find(l => l.number === levelNum);
      const info = LEVEL_INFO[levelNum];
      const levelEl = createLevelNode(level, info);
      levelsContainer.appendChild(levelEl);
    }

    chaptersContainer.appendChild(chapterEl);
  }

  // Re-read intro button
  const footer = document.createElement('div');
  footer.className = 'map-footer';
  footer.innerHTML = `<button class="btn-link" id="reread-intro">📖 Re-read the story of Gin Rummy</button>`;
  map.appendChild(footer);

  container.appendChild(map);

  document.getElementById('reread-intro').addEventListener('click', () => showIntroStory(0));
}

/**
 * Creates a level node for the adventure map
 */
function createLevelNode(level, info) {
  const node = document.createElement('button');
  node.className = `level-node ${level.completed ? 'completed' : ''} ${level.unlocked ? 'unlocked' : 'locked'}`;
  node.disabled = !level.unlocked;

  const starsHtml = level.completed
    ? `<span class="node-stars">${'★'.repeat(level.stars)}${'☆'.repeat(3 - level.stars)}</span>`
    : '';

  node.innerHTML = `
    <span class="node-emoji">${level.unlocked ? info.emoji : '🔒'}</span>
    <span class="node-number">${level.number}</span>
    <span class="node-title">${info.title}</span>
    ${starsHtml}
  `;

  if (level.unlocked) {
    node.addEventListener('click', () => showLevelIntro(level.number));
  }

  return node;
}

/**
 * Shows the level intro modal
 */
function showLevelIntro(levelNum) {
  const info = LEVEL_INFO[levelNum];

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal level-intro-modal">
      <button class="modal-close" id="modal-close">&times;</button>
      <div class="modal-header">
        <span class="modal-emoji">${info.emoji}</span>
        <div class="modal-titles">
          <span class="modal-chapter">${info.chapter}</span>
          <h2 class="modal-title">Level ${levelNum}: ${info.title}</h2>
        </div>
      </div>
      <div class="modal-body">
        <div class="intro-text">${info.intro.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
        <div class="lesson-box">
          <span class="lesson-label">This Lesson:</span>
          <span class="lesson-text">${info.lesson}</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-back">Back to Map</button>
        <button class="btn btn-primary" id="modal-start">Start Level</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Animate in
  setTimeout(() => overlay.classList.add('visible'), 10);

  // Close handlers
  const closeModal = () => {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 300);
  };

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-back').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Start level
  document.getElementById('modal-start').addEventListener('click', () => {
    closeModal();
    setTimeout(() => startLevel(levelNum), 300);
  });
}

/**
 * Starts a specific level
 */
function startLevel(levelNum) {
  document.body.classList.add('level-active');
  const LevelClass = LEVELS[levelNum];

  if (!LevelClass) {
    container.innerHTML = `
      <div class="level-container" style="text-align: center; padding: 40px;">
        <h2>Level ${levelNum}</h2>
        <p style="color: var(--text-muted); margin: 20px 0;">Coming soon!</p>
        <button class="btn btn-primary" id="back-btn">Back to Map</button>
      </div>
    `;
    document.getElementById('back-btn').addEventListener('click', showAdventureMap);
    return;
  }

  const level = new LevelClass();

  level.onComplete = (action) => {
    if (action === 'next' && levelNum < 20) {
      showLevelIntro(levelNum + 1);
    } else {
      showAdventureMap();
    }
  };

  level.onExit = () => {
    showAdventureMap();
  };

  level.render(container);
}

// Start the app
showWelcome();
