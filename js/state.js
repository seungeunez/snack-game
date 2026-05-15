import { GAME_DURATION, STORAGE_KEY } from "./config.js";

const state = {
  score: 0,
  bestScore: 0,
  timeLeft: GAME_DURATION,
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  slashUsed: false,
};

export function getState() {
  return state;
}

export function loadBestScore() {
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  state.bestScore = Number.isFinite(saved) ? Math.max(0, saved) : 0;
}

export function resetRoundState() {
  state.score = 0;
  state.timeLeft = GAME_DURATION;
  state.isPlaying = true;
  state.isPaused = false;
  state.isGameOver = false;
  state.slashUsed = false;
}

export function resetToIdle() {
  state.score = 0;
  state.timeLeft = GAME_DURATION;
  state.isPlaying = false;
  state.isPaused = false;
  state.isGameOver = false;
  state.slashUsed = false;
}

export function setPaused(value) {
  state.isPaused = value;
}

export function useSlash() {
  state.slashUsed = true;
}

export function setGameOver() {
  const isNewPersonalBest = state.score > 0 && state.score > state.bestScore;

  state.isPlaying = false;
  state.isPaused = false;
  state.isGameOver = true;

  if (isNewPersonalBest) {
    state.bestScore = state.score;
    localStorage.setItem(STORAGE_KEY, String(state.bestScore));
  }

  return { isNewPersonalBest, finalScore: state.score };
}

export function changeScore(delta) {
  state.score = Math.max(0, state.score + delta);
}

export function decreaseTime(deltaSeconds) {
  state.timeLeft = Math.max(0, state.timeLeft - deltaSeconds);
  if (state.timeLeft <= 0) {
    state.isPlaying = false;
  }
}
