import { CHARACTER_STORAGE_KEY } from "./config.js";

export const HAIR_OPTIONS = [
  { id: "short", label: "짧은 머리" },
  { id: "long", label: "긴 머리" },
  { id: "spiky", label: "스파이크" },
  { id: "curly", label: "곱슬머리" },
];

export const EXPRESSION_OPTIONS = [
  { id: "smile", label: "미소" },
  { id: "happy", label: "활짝" },
  { id: "surprised", label: "놀람" },
  { id: "cool", label: "쿨" },
];

export const CLOTHES_OPTIONS = [
  { id: "blue", label: "파란 티셔츠" },
  { id: "red", label: "빨간 후드" },
  { id: "green", label: "초록 원피스" },
  { id: "purple", label: "보라 조끼" },
];

const DEFAULT_APPEARANCE = {
  hair: "short",
  expression: "smile",
  clothes: "blue",
};

let appearance = { ...DEFAULT_APPEARANCE };

const clothesColors = {
  blue: { main: "#5b8def", accent: "#3d6fc7" },
  red: { main: "#e74c3c", accent: "#c0392b" },
  green: { main: "#2ecc71", accent: "#27ae60" },
  purple: { main: "#9b59b6", accent: "#8e44ad" },
};

export function getAppearance() {
  return { ...appearance };
}

export function setAppearance(next) {
  appearance = {
    hair: next.hair || DEFAULT_APPEARANCE.hair,
    expression: next.expression || DEFAULT_APPEARANCE.expression,
    clothes: next.clothes || DEFAULT_APPEARANCE.clothes,
  };
  saveAppearance();
}

export function loadAppearance() {
  try {
    const raw = localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const saved = JSON.parse(raw);
    appearance = {
      hair: HAIR_OPTIONS.some((o) => o.id === saved.hair) ? saved.hair : DEFAULT_APPEARANCE.hair,
      expression: EXPRESSION_OPTIONS.some((o) => o.id === saved.expression)
        ? saved.expression
        : DEFAULT_APPEARANCE.expression,
      clothes: CLOTHES_OPTIONS.some((o) => o.id === saved.clothes)
        ? saved.clothes
        : DEFAULT_APPEARANCE.clothes,
    };
  } catch {
    appearance = { ...DEFAULT_APPEARANCE };
  }
}

export function saveAppearance() {
  localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(appearance));
}

export function bindCharacterControls({ hairSelect, expressionSelect, clothesSelect, onChange }) {
  fillSelect(hairSelect, HAIR_OPTIONS, appearance.hair);
  fillSelect(expressionSelect, EXPRESSION_OPTIONS, appearance.expression);
  fillSelect(clothesSelect, CLOTHES_OPTIONS, appearance.clothes);

  const handleChange = () => {
    setAppearance({
      hair: hairSelect.value,
      expression: expressionSelect.value,
      clothes: clothesSelect.value,
    });
    onChange?.();
  };

  hairSelect.addEventListener("change", handleChange);
  expressionSelect.addEventListener("change", handleChange);
  clothesSelect.addEventListener("change", handleChange);
}

function fillSelect(select, options, value) {
  select.replaceChildren();
  for (const option of options) {
    const element = document.createElement("option");
    element.value = option.id;
    element.textContent = option.label;
    select.appendChild(element);
  }
  select.value = value;
}

export function drawCharacterPreview(canvas) {
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff8ef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCustomPlayer(ctx, 28, 10, 48, 56, getAppearance());
}

export function drawCustomPlayer(ctx, x, y, width, height, look = appearance) {
  const centerX = x + width / 2;
  const skin = "#f4c27a";
  const clothes = clothesColors[look.clothes] || clothesColors.blue;

  drawLegs(ctx, x, y, width);
  drawClothes(ctx, x, y, width, look.clothes, clothes);
  drawHead(ctx, centerX, y + 14, skin);
  drawExpression(ctx, centerX, y + 14, look.expression);
  drawHair(ctx, centerX, y + 14, look.hair);
}

function drawLegs(ctx, x, y, width) {
  ctx.fillStyle = "#3f4f66";
  ctx.fillRect(x + 12, y + 48, 10, 10);
  ctx.fillRect(x + width - 22, y + 48, 10, 10);
}

function drawClothes(ctx, x, y, width, style, colors) {
  const bodyY = y + 26;
  const bodyW = width - 20;
  const bodyX = x + 10;

  ctx.fillStyle = colors.main;
  ctx.fillRect(bodyX, bodyY, bodyW, 22);

  ctx.fillStyle = colors.accent;
  if (style === "red") {
    ctx.beginPath();
    ctx.arc(x + 8, bodyY + 6, 6, 0, Math.PI * 2);
    ctx.arc(x + width - 8, bodyY + 6, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === "green") {
    ctx.fillRect(bodyX + 4, bodyY + 18, bodyW - 8, 8);
  } else if (style === "purple") {
    ctx.fillRect(bodyX + 6, bodyY + 4, bodyW - 12, 6);
  }
}

function drawHead(ctx, centerX, centerY, skin) {
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawExpression(ctx, centerX, centerY, expression) {
  ctx.strokeStyle = "#2f261f";
  ctx.fillStyle = "#2f261f";
  ctx.lineWidth = 1.5;

  if (expression === "smile") {
    ctx.beginPath();
    ctx.arc(centerX, centerY + 2, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 2, 1.2, 0, Math.PI * 2);
    ctx.arc(centerX + 4, centerY - 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (expression === "happy") {
    ctx.beginPath();
    ctx.arc(centerX, centerY + 3, 6, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.fillRect(centerX - 5, centerY - 3, 2, 2);
    ctx.fillRect(centerX + 3, centerY - 3, 2, 2);
    return;
  }

  if (expression === "surprised") {
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 4, 3, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 3, 2, 0, Math.PI * 2);
    ctx.arc(centerX + 4, centerY - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.fillRect(centerX - 4, centerY - 1, 3, 1.5);
  ctx.fillRect(centerX + 1, centerY - 1, 3, 1.5);
  ctx.beginPath();
  ctx.moveTo(centerX - 2, centerY + 4);
  ctx.lineTo(centerX + 2, centerY + 4);
  ctx.stroke();
}

function drawHair(ctx, centerX, centerY, hair) {
  ctx.fillStyle = "#4a3728";

  if (hair === "short") {
    ctx.beginPath();
    ctx.arc(centerX, centerY - 2, 13, Math.PI, 0);
    ctx.fill();
    return;
  }

  if (hair === "long") {
    ctx.beginPath();
    ctx.arc(centerX, centerY - 2, 13, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(centerX - 13, centerY - 2, 8, 18);
    ctx.fillRect(centerX + 5, centerY - 2, 8, 18);
    return;
  }

  if (hair === "spiky") {
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * 5, centerY - 8);
      ctx.lineTo(centerX + i * 5 - 3, centerY - 18);
      ctx.lineTo(centerX + i * 5 + 3, centerY - 8);
      ctx.fill();
    }
    return;
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY - 2, 14, Math.PI, 0);
  ctx.fill();
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.arc(centerX - 10 + i * 5, centerY - 10, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
