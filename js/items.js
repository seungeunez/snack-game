import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  ITEM_CONFIG,
  SCORES,
  SLASH_CONFIG,
  SNACK_VARIANTS,
  SPAWN_WEIGHTS,
} from "./config.js";

const items = [];
const sprites = {
  snacks: {},
  poop: null,
  bug: null,
  goldbar: null,
};
let spawnTimer = 0;

export function loadItemSprites(imageMap) {
  sprites.snacks = imageMap.snacks || {};
  sprites.poop = imageMap.poop || null;
  sprites.bug = imageMap.bug || null;
  sprites.goldbar = imageMap.goldbar || null;
}

export function resetItems() {
  items.length = 0;
  spawnTimer = 0;
}

export function getItems() {
  return items;
}

export function removeItem(item) {
  const index = items.indexOf(item);
  if (index >= 0) {
    items.splice(index, 1);
  }
}

export function updateItems(deltaSeconds) {
  spawnTimer += deltaSeconds;

  if (spawnTimer >= ITEM_CONFIG.spawnInterval) {
    spawnTimer = 0;
    items.push(createItem());
  }

  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    item.y += ITEM_CONFIG.fallSpeed * deltaSeconds;

    if (item.y > CANVAS_HEIGHT + item.height) {
      items.splice(index, 1);
    }
  }
}

export function trySlashBadItem(playerBounds) {
  const target = findSlashTarget(playerBounds);
  if (!target) {
    return false;
  }

  splitItem(target);
  return true;
}

export function drawItems(ctx) {
  for (const item of items) {
    const sprite = getItemSprite(item);

    if (sprite && item.isHalf) {
      drawHalfSprite(ctx, sprite, item);
      continue;
    }

    if (sprite) {
      ctx.drawImage(sprite, item.x, item.y, item.width, item.height);
      continue;
    }

    drawFallbackItem(ctx, item);
  }
}

function findSlashTarget(playerBounds) {
  const playerCenterX = playerBounds.x + playerBounds.width / 2;
  const playerCenterY = playerBounds.y + playerBounds.height / 2;
  let closestItem = null;
  let closestDistance = SLASH_CONFIG.range;

  for (const item of items) {
    if (item.isHalf || (item.type !== "poop" && item.type !== "bug")) {
      continue;
    }

    const itemCenterX = item.x + item.width / 2;
    const itemCenterY = item.y + item.height / 2;
    const distance = Math.hypot(itemCenterX - playerCenterX, itemCenterY - playerCenterY);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item;
    }
  }

  return closestItem;
}

function splitItem(item) {
  removeItem(item);

  const halfWidth = item.width / 2;

  items.push(createHalfItem(item, halfWidth, item.x, "left"));
  items.push(createHalfItem(item, halfWidth, item.x + halfWidth, "right"));
}

function createHalfItem(source, halfWidth, x, halfSide) {
  return {
    id: `${source.type}-half-${Date.now()}-${Math.random()}`,
    type: source.type,
    score: 0,
    x,
    y: source.y,
    width: halfWidth,
    height: source.height,
    isHalf: true,
    halfSide,
  };
}

function drawHalfSprite(ctx, sprite, item) {
  const sourceWidth = sprite.naturalWidth / 2;
  const sourceX = item.halfSide === "left" ? 0 : sourceWidth;

  ctx.drawImage(
    sprite,
    sourceX,
    0,
    sourceWidth,
    sprite.naturalHeight,
    item.x,
    item.y,
    item.width,
    item.height
  );
}

function getItemSprite(item) {
  if (item.type === "snack" && item.variant) {
    return sprites.snacks[item.variant] || null;
  }

  return sprites[item.type] || null;
}

function createItem() {
  const type = pickWeightedType();
  const size = ITEM_CONFIG.size;
  const item = {
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    score: SCORES[type],
    x: Math.random() * (CANVAS_WIDTH - size),
    y: -size,
    width: size,
    height: size,
  };

  if (type === "snack") {
    item.variant = pickSnackVariant();
  }

  return item;
}

function pickSnackVariant() {
  const variant = SNACK_VARIANTS[Math.floor(Math.random() * SNACK_VARIANTS.length)];
  return variant.id;
}

function pickWeightedType() {
  const totalWeight = SPAWN_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of SPAWN_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.type;
    }
  }

  return SPAWN_WEIGHTS[0].type;
}

function drawFallbackItem(ctx, item) {
  let fillColor = "#999";

  if (item.type === "snack" && item.variant) {
    const variant = SNACK_VARIANTS.find((entry) => entry.id === item.variant);
    fillColor = variant?.color || "#f5a623";
  } else {
    const colors = {
      snack: "#f5a623",
      poop: "#8b5a2b",
      bug: "#4caf50",
      goldbar: "#ffd700",
    };
    fillColor = colors[item.type] || "#999";
  }

  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(
    item.x + item.width / 2,
    item.y + item.height / 2,
    item.width / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}
