import { initGame, loadAssets, resetGame, startGame, togglePause, trySlash } from "./game.js";
import { bindPlayerInput } from "./player.js";
import { loadAppearance } from "./character.js";
import { bindUsernameInput, loadUsername } from "./ranking.js";
import { getState, loadBestScore } from "./state.js";
import {
  bindCharacterUi,
  bindUiElements,
  bindUiEvents,
  hideGameOverPanel,
  renderHud,
  renderRankingList,
  showIdleMessage,
  syncBestScoreDisplay,
} from "./ui.js";

async function init() {
  const canvas = document.getElementById("game-canvas");

  bindUiElements();
  bindPlayerInput();
  bindUsernameInput(document.getElementById("username-input"));
  loadBestScore();
  loadUsername();
  loadAppearance();
  bindCharacterUi();
  initGame(canvas);

  bindUiEvents({
    onStart: startGame,
    onRestart: startGame,
    onPause: togglePause,
    onReset: resetGame,
  });

  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space") {
      return;
    }

    event.preventDefault();
    const state = getState();

    if (!state.isPlaying && !state.isGameOver) {
      startGame();
      return;
    }

    if (state.isPlaying && !state.isPaused && !state.slashUsed) {
      trySlash();
    }
  });

  try {
    await loadAssets();
  } catch (error) {
    console.warn(error.message);
  }

  hideGameOverPanel();
  renderHud();
  renderRankingList();
  syncBestScoreDisplay();
  showIdleMessage();
}

init();
