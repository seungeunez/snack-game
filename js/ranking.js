import {
  MAX_RANKING_ENTRIES,
  RANKING_STORAGE_KEY,
  USERNAME_STORAGE_KEY,
} from "./config.js";

let usernameInput = null;

export function bindUsernameInput(input) {
  usernameInput = input;
  input.addEventListener("change", persistUsername);
  input.addEventListener("blur", persistUsername);
}

export function loadUsername() {
  const saved = localStorage.getItem(USERNAME_STORAGE_KEY);
  if (saved && usernameInput) {
    usernameInput.value = saved;
  }
}

export function persistUsername() {
  const name = getUsername();
  if (name) {
    localStorage.setItem(USERNAME_STORAGE_KEY, name);
  }
}

export function getUsername() {
  return usernameInput?.value.trim() || "";
}

export function hasUsername() {
  return getUsername().length > 0;
}

export function getRankings() {
  try {
    const raw = localStorage.getItem(RANKING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRankingEntry(name, score) {
  if (score <= 0) {
    return { rank: null, updated: false, created: false };
  }

  const playerName = name.trim();
  const rankings = getRankings();
  const existingIndex = rankings.findIndex((item) => item.name === playerName);
  const existingEntry = existingIndex >= 0 ? rankings[existingIndex] : null;

  if (existingEntry && score <= existingEntry.score) {
    const sortedExisting = rankings
      .sort((a, b) => b.score - a.score || a.playedAt.localeCompare(b.playedAt))
      .slice(0, MAX_RANKING_ENTRIES);
    const rankIndex = sortedExisting.findIndex((item) => item.name === playerName);

    return {
      rank: rankIndex >= 0 ? rankIndex + 1 : null,
      updated: false,
      created: false,
    };
  }

  const entry = {
    name: playerName,
    score,
    playedAt: new Date().toISOString(),
  };
  const updated = Boolean(existingEntry);

  if (updated) {
    rankings[existingIndex] = entry;
  } else {
    rankings.push(entry);
  }

  const sorted = rankings
    .sort((a, b) => b.score - a.score || a.playedAt.localeCompare(b.playedAt))
    .slice(0, MAX_RANKING_ENTRIES);

  localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(sorted));

  const rankIndex = sorted.findIndex((item) => item.name === playerName);
  return {
    rank: rankIndex >= 0 ? rankIndex + 1 : null,
    updated,
    created: !updated,
  };
}

export function getTopRankingScore() {
  const rankings = getRankings();
  return rankings.length > 0 ? rankings[0].score : 0;
}
