import { CANVAS_HEIGHT, CANVAS_WIDTH, PLAYER_CONFIG } from "./config.js";
import { drawCustomPlayer, getAppearance } from "./character.js";
import { getBounds } from "./collision.js";

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

let player = createInitialPlayer();
let shakeUntil = 0;
let moodExpression = null;
let hopStart = 0;
let hopUntil = 0;

function createInitialPlayer() {
  return {
    x: CANVAS_WIDTH / 2 - PLAYER_CONFIG.width / 2,
    y: CANVAS_HEIGHT - PLAYER_CONFIG.height - 16,
    width: PLAYER_CONFIG.width,
    height: PLAYER_CONFIG.height,
  };
}

export function bindPlayerInput() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(event) {
  if (event.code === "ArrowUp" || event.code === "KeyW") keys.up = true;
  if (event.code === "ArrowDown" || event.code === "KeyS") keys.down = true;
  if (event.code === "ArrowLeft" || event.code === "KeyA") keys.left = true;
  if (event.code === "ArrowRight" || event.code === "KeyD") keys.right = true;
}

function handleKeyUp(event) {
  if (event.code === "ArrowUp" || event.code === "KeyW") keys.up = false;
  if (event.code === "ArrowDown" || event.code === "KeyS") keys.down = false;
  if (event.code === "ArrowLeft" || event.code === "KeyA") keys.left = false;
  if (event.code === "ArrowRight" || event.code === "KeyD") keys.right = false;
}

export function resetPlayer() {
  player = createInitialPlayer();
  shakeUntil = 0;
  moodExpression = null;
  hopStart = 0;
  hopUntil = 0;
}

export function triggerPlayerShake(durationMs) {
  shakeUntil = performance.now() + durationMs;
}

export function setPlayerMood(expression) {
  moodExpression = expression;
}

export function triggerPlayerHop(durationMs) {
  const now = performance.now();
  hopStart = now;
  hopUntil = now + durationMs;
}

export function isPlayerHopActive() {
  return performance.now() < hopUntil;
}

export function updatePlayer(deltaSeconds) {
  let dx = 0;
  let dy = 0;

  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy) || 1;
    dx = (dx / length) * PLAYER_CONFIG.speed * deltaSeconds;
    dy = (dy / length) * PLAYER_CONFIG.speed * deltaSeconds;
  }

  player.x = clamp(player.x + dx, 0, CANVAS_WIDTH - player.width);
  player.y = clamp(player.y + dy, 0, CANVAS_HEIGHT - player.height);
}

export function getPlayerBounds() {
  return getBounds(player);
}

export function drawPlayer(ctx) {
  const now = performance.now();
  const shakeOffset =
    now < shakeUntil
      ? Math.sin(now / 20) * 4
      : 0;
  const hopOffset = getHopOffset(now);
  const appearance = getAppearance();

  drawCustomPlayer(
    ctx,
    player.x + shakeOffset,
    player.y + hopOffset,
    player.width,
    player.height,
    moodExpression ? { ...appearance, expression: moodExpression } : appearance
  );
}

function getHopOffset(now) {
  if (now >= hopUntil || hopUntil <= hopStart) {
    return 0;
  }

  const progress = (now - hopStart) / (hopUntil - hopStart);
  return -Math.sin(progress * Math.PI) * 58;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
