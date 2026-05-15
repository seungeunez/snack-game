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
}

export function triggerPlayerShake(durationMs) {
  shakeUntil = performance.now() + durationMs;
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
  const shakeOffset =
    performance.now() < shakeUntil
      ? Math.sin(performance.now() / 20) * 4
      : 0;

  drawCustomPlayer(
    ctx,
    player.x + shakeOffset,
    player.y,
    player.width,
    player.height,
    getAppearance()
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
