export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 480;
export const GAME_DURATION = 30;
export const STORAGE_KEY = "snack-catcher-best-score";
export const USERNAME_STORAGE_KEY = "snack-catcher-username";
export const CHARACTER_STORAGE_KEY = "snack-catcher-character";
export const RANKING_STORAGE_KEY = "snack-catcher-rankings";
export const MAX_RANKING_ENTRIES = 5;
export const MAX_USERNAME_LENGTH = 12;

export const PLAYER_CONFIG = {
  width: 48,
  height: 56,
  speed: 280,
};

export const ITEM_CONFIG = {
  size: 40,
  fallSpeed: 140,
  spawnInterval: 0.85,
};

export const SCORES = {
  snack: 10,
  poop: -15,
  bug: -10,
  goldbar: 40,
};

export const SPAWN_WEIGHTS = [
  { type: "snack", weight: 63 },
  { type: "poop", weight: 20 },
  { type: "bug", weight: 15 },
  { type: "goldbar", weight: 1 },
];

export const FEEDBACK = {
  messageDuration: 1200,
  shakeDuration: 350,
  slashEffectDuration: 200,
};

export const SLASH_CONFIG = {
  range: 140,
};

export const SNACK_VARIANTS = [
  { id: "cookie", label: "쿠키", file: "./images/snacks/cookie.svg", color: "#c68642" },
  { id: "chip", label: "감자칩", file: "./images/snacks/chip.svg", color: "#f4d03f" },
  { id: "candy", label: "사탕", file: "./images/snacks/candy.svg", color: "#e74c3c" },
  { id: "chocolate", label: "초콜릿", file: "./images/snacks/chocolate.svg", color: "#5d4037" },
  { id: "pretzel", label: "프레첼", file: "./images/snacks/pretzel.svg", color: "#a1887f" },
  { id: "donut", label: "도넛", file: "./images/snacks/donut.svg", color: "#f48fb1" },
];

export const ITEM_LABELS = {
  snack: "과자 +10",
  poop: "똥 -15",
  bug: "벌레 -10",
  goldbar: "골드바 +40",
};
