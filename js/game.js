import { CANVAS_HEIGHT, CANVAS_WIDTH, FEEDBACK, SNACK_VARIANTS } from "./config.js";
import { findCollisions } from "./collision.js";
import {
  drawItems,
  getItems,
  loadItemSprites,
  removeItem,
  resetItems,
  trySlashBadItem,
  updateItems,
} from "./items.js";
import {
  drawPlayer,
  getPlayerBounds,
  isPlayerHopActive,
  resetPlayer,
  setPlayerMood,
  triggerPlayerHop,
  triggerPlayerShake,
  updatePlayer,
} from "./player.js";
import {
  changeScore,
  decreaseTime,
  getState,
  resetRoundState,
  resetToIdle,
  setGameOver,
  setPaused,
  useSlash,
} from "./state.js";
import { persistUsername, hasUsername } from "./ranking.js";
import {
  hideGameOverPanel,
  renderHud,
  showGameOverPanel,
  showHalfItemFeedback,
  showItemFeedback,
  showPausedMessage,
  showPlayingMessage,
  showResetMessage,
  showSlashFeedback,
  showUsernameRequired,
  syncBestScoreDisplay,
  updateControlButtons,
} from "./ui.js";

let canvas = null;
let ctx = null;
let animationId = null;
let lastTimestamp = 0;
let slashEffectUntil = 0;
let slashEffectY = 0;
let gameOverAnimationId = null;

export function initGame(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext("2d");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
}

export async function loadAssets() {
  const [poopResult, bugResult, goldbarResult, ...snackResults] =
    await Promise.allSettled([
    loadImage("./images/poop.svg"),
    loadImage("./images/bug.svg"),
    loadImage("./images/goldbar.svg"),
    ...SNACK_VARIANTS.map((variant) =>
      loadImage(variant.file).then((image) => ({ id: variant.id, image }))
    ),
  ]);

  const snacks = {};
  for (const result of snackResults) {
    if (result.status === "fulfilled") {
      snacks[result.value.id] = result.value.image;
    }
  }

  loadItemSprites({
    snacks,
    poop: poopResult.status === "fulfilled" ? poopResult.value : null,
    bug: bugResult.status === "fulfilled" ? bugResult.value : null,
    goldbar: goldbarResult.status === "fulfilled" ? goldbarResult.value : null,
  });
}

export function startGame() {
  if (getState().isPlaying) {
    return;
  }

  if (!hasUsername()) {
    showUsernameRequired();
    return;
  }

  persistUsername();
  hideGameOverPanel();
  resetRoundState();
  resetPlayer();
  resetItems();
  showPlayingMessage();
  renderHud();
  updateControlButtons();

  lastTimestamp = performance.now();
  cancelAnimationFrame(animationId);
  cancelAnimationFrame(gameOverAnimationId);
  gameOverAnimationId = null;
  animationId = requestAnimationFrame(gameLoop);
}

export function pauseGame() {
  const state = getState();
  if (!state.isPlaying || state.isGameOver || state.isPaused) {
    return;
  }

  setPaused(true);
  showPausedMessage();
  updateControlButtons();
}

export function resumeGame() {
  const state = getState();
  if (!state.isPlaying || !state.isPaused) {
    return;
  }

  setPaused(false);
  lastTimestamp = performance.now();
  showPlayingMessage();
  updateControlButtons();
}

export function togglePause() {
  if (getState().isPaused) {
    resumeGame();
    return;
  }

  pauseGame();
}

export function resetGame() {
  cancelAnimationFrame(animationId);
  cancelAnimationFrame(gameOverAnimationId);
  animationId = null;
  gameOverAnimationId = null;
  resetToIdle();
  resetPlayer();
  resetItems();
  slashEffectUntil = 0;
  hideGameOverPanel();
  renderHud();
  showResetMessage();
  updateControlButtons();
  drawFrame();
}

export function trySlash() {
  const state = getState();

  if (!state.isPlaying || state.isPaused || state.isGameOver || state.slashUsed) {
    return false;
  }

  const playerBounds = getPlayerBounds();
  const didSlash = trySlashBadItem(playerBounds);

  if (!didSlash) {
    return false;
  }

  useSlash();
  slashEffectY = playerBounds.y + playerBounds.height / 2;
  slashEffectUntil = performance.now() + FEEDBACK.slashEffectDuration;
  showSlashFeedback();
  renderHud();
  return true;
}

function gameLoop(timestamp) {
  const state = getState();

  if (!state.isPlaying && !state.isPaused) {
    if (state.isGameOver) {
      drawFrame();
    }
    return;
  }

  if (state.isPaused) {
    drawFrame();
    drawPauseOverlay();
    animationId = requestAnimationFrame(gameLoop);
    return;
  }

  const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  updatePlayer(deltaSeconds);
  updateItems(deltaSeconds);
  handleCollisions();
  decreaseTime(deltaSeconds);
  renderHud();
  drawFrame();

  if (getState().isPlaying) {
    animationId = requestAnimationFrame(gameLoop);
    return;
  }

  endGame();
}

function handleCollisions() {
  const hits = findCollisions(getPlayerBounds(), getItems());

  for (const item of hits) {
    if (item.isHalf) {
      showHalfItemFeedback(item);
      removeItem(item);
      continue;
    }

    changeScore(item.score);
    showItemFeedback(item);

    if (item.score < 0) {
      triggerPlayerShake(FEEDBACK.shakeDuration);
    }

    removeItem(item);
  }
}

function drawFrame() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawBackground();
  drawItems(ctx);
  drawPlayer(ctx);
  drawSlashEffect();
}

function drawSlashEffect() {
  if (performance.now() >= slashEffectUntil) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
  ctx.lineWidth = 4;
  ctx.shadowColor = "rgba(231, 76, 60, 0.8)";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, slashEffectY);
  ctx.lineTo(CANVAS_WIDTH, slashEffectY);
  ctx.stroke();
  ctx.restore();
}

function drawPauseOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(47, 38, 31, 0.45)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("일시정지", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 8);
  ctx.font = "16px Trebuchet MS, sans-serif";
  ctx.fillText("계속하기 버튼을 눌러주세요", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);
  ctx.restore();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#fff8ef");
  gradient.addColorStop(1, "#f3e4cf");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function endGame() {
  if (getState().isGameOver) {
    return;
  }

  const gameResult = setGameOver();
  if (gameResult.isNewPersonalBest) {
    setPlayerMood(null);
  } else {
    setPlayerMood("surprised");
    triggerPlayerHop(FEEDBACK.gameOverHopDuration);
  }

  renderHud();
  showGameOverPanel(gameResult);
  syncBestScoreDisplay();
  updateControlButtons();
  drawFrame();

  if (!gameResult.isNewPersonalBest) {
    animateGameOverHop();
  }
}

function animateGameOverHop() {
  if (!getState().isGameOver) {
    return;
  }

  drawFrame();

  if (isPlayerHopActive()) {
    gameOverAnimationId = requestAnimationFrame(animateGameOverHop);
    return;
  }

  setPlayerMood("frustrated");
  drawFrame();
  gameOverAnimationId = null;
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`이미지를 불러오지 못했습니다: ${source}`));
    image.src = source;
  });
}
