/**
 * Level 19: Quick Fire Quiz
 * Rapid-fire knowledge test
 */

import { Level } from './level-engine.js';
import { shuffle } from '../cards.js';

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
