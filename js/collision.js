export function getBounds(entity) {
  return {
    x: entity.x,
    y: entity.y,
    width: entity.width,
    height: entity.height,
  };
}

export function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function findCollisions(playerBounds, items) {
  const hits = [];

  for (const item of items) {
    const itemBounds = getBounds(item);
    if (isColliding(playerBounds, itemBounds)) {
      hits.push(item);
    }
  }

  return hits;
}
