import { FEEDBACK, ITEM_LABELS, MAX_USERNAME_LENGTH, SCORES, SNACK_VARIANTS } from "./config.js";
import { bindCharacterControls, drawCharacterPreview } from "./character.js";
import { getRankings, getTopRankingScore, getUsername, saveRankingEntry } from "./ranking.js";
import { getState } from "./state.js";

const elements = {
  score: null,
  bestScore: null,
  timeLeft: null,
  slashStatus: null,
  usernameInput: null,
  hairSelect: null,
  expressionSelect: null,
  clothesSelect: null,
  characterPreview: null,
  characterModal: null,
  characterOpenButton: null,
  characterCloseButton: null,
  characterConfirmButton: null,
  rankingList: null,
  message: null,
  startButton: null,
  pauseButton: null,
  resetButton: null,
  restartButton: null,
  gameOverPanel: null,
  finalScore: null,
  gameOverMessage: null,
  canvasShell: null,
};

let messageTimer = null;

export function bindUiElements() {
  elements.score = document.getElementById("score");
  elements.bestScore = document.getElementById("best-score");
  elements.timeLeft = document.getElementById("time-left");
  elements.slashStatus = document.getElementById("slash-status");
  elements.usernameInput = document.getElementById("username-input");
  elements.hairSelect = document.getElementById("hair-select");
  elements.expressionSelect = document.getElementById("expression-select");
  elements.clothesSelect = document.getElementById("clothes-select");
  elements.characterPreview = document.getElementById("character-preview");
  elements.characterModal = document.getElementById("character-modal");
  elements.characterOpenButton = document.getElementById("character-open-button");
  elements.characterCloseButton = document.getElementById("character-close-button");
  elements.characterConfirmButton = document.getElementById("character-confirm-button");
  elements.rankingList = document.getElementById("ranking-list");
  elements.message = document.getElementById("message");

  if (elements.usernameInput) {
    elements.usernameInput.maxLength = MAX_USERNAME_LENGTH;
  }
  elements.startButton = document.getElementById("start-button");
  elements.pauseButton = document.getElementById("pause-button");
  elements.resetButton = document.getElementById("reset-button");
  elements.restartButton = document.getElementById("restart-button");
  elements.gameOverPanel = document.getElementById("game-over-panel");
  elements.finalScore = document.getElementById("final-score");
  elements.gameOverMessage = document.getElementById("game-over-message");
  elements.canvasShell = document.getElementById("canvas-shell");
}

export function bindUiEvents({ onStart, onRestart, onPause, onReset }) {
  elements.startButton.addEventListener("click", onStart);
  elements.restartButton.addEventListener("click", onRestart);
  elements.pauseButton.addEventListener("click", onPause);
  elements.resetButton.addEventListener("click", onReset);
}

export function bindCharacterUi() {
  bindCharacterControls({
    hairSelect: elements.hairSelect,
    expressionSelect: elements.expressionSelect,
    clothesSelect: elements.clothesSelect,
    onChange: renderCharacterPreview,
  });

  if (elements.characterOpenButton) {
    elements.characterOpenButton.addEventListener("click", openCharacterModal);
  }
  if (elements.characterCloseButton) {
    elements.characterCloseButton.addEventListener("click", closeCharacterModal);
  }
  if (elements.characterConfirmButton) {
    elements.characterConfirmButton.addEventListener("click", closeCharacterModal);
  }
  if (elements.characterModal) {

    elements.characterModal.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeCharacterModal();
    });
  }
}

export function openCharacterModal() {
  if (getState().isPlaying || !elements.characterModal) {
    return;
  }

  renderCharacterPreview();
  elements.characterModal.showModal();
}

export function closeCharacterModal() {
  if (elements.characterModal?.open) {
    elements.characterModal.close();
  }
}

export function renderCharacterPreview() {
  drawCharacterPreview(elements.characterPreview);
}

export function renderHud() {
  const { score, bestScore, timeLeft, slashUsed, isPlaying } = getState();

  elements.score.textContent = String(score);
  elements.bestScore.textContent = String(bestScore);
  elements.timeLeft.textContent = `${Math.ceil(timeLeft)}초`;

  if (elements.slashStatus) {
    if (!isPlaying) {
      elements.slashStatus.textContent = "1회";
    } else if (slashUsed) {
      elements.slashStatus.textContent = "사용함";
    } else {
      elements.slashStatus.textContent = "가능";
    }
  }
}

export function updateControlButtons() {
  const { isPlaying, isPaused, isGameOver } = getState();

  elements.startButton.hidden = isPlaying;
  elements.pauseButton.hidden = !isPlaying || isGameOver;
  elements.pauseButton.disabled = isGameOver;
  elements.pauseButton.textContent = isPaused ? "계속하기" : "게임 중지";

  if (elements.usernameInput) {
    elements.usernameInput.disabled = isPlaying;
  }

  if (elements.characterOpenButton) {
    elements.characterOpenButton.disabled = isPlaying;
  }

  if (isPlaying && elements.characterModal?.open) {
    closeCharacterModal();
  }
}

export function showIdleMessage() {
  setMessage("이름을 입력한 뒤 시작 버튼을 누르거나 스페이스 키를 눌러주세요.");
  updateControlButtons();
}

export function showUsernameRequired() {
  setMessage("게임을 시작하려면 플레이어 이름을 입력해주세요.");
  elements.usernameInput?.focus();
}

export function showPlayingMessage() {
  const { slashUsed } = getState();
  const slashHint = slashUsed
    ? "베기는 이미 사용했습니다."
    : "스페이스로 똥·벌레를 베면 반쪽은 점수가 안 깎여요!";
  setMessage(`과자를 먹고, 똥과 벌레는 피하세요! ${slashHint}`);
}

export function showPausedMessage() {
  setMessage("게임이 일시정지되었습니다. 계속하기 버튼을 눌러주세요.");
}

export function showResetMessage() {
  setMessage("게임이 초기화되었습니다. 시작 버튼을 눌러 다시 플레이하세요.");
}

export function showSlashFeedback() {
  setMessage("베었습니다! 반으로 나뉜 조각은 먹어도 점수가 깎이지 않습니다.");

  if (messageTimer) {
    clearTimeout(messageTimer);
  }

  messageTimer = setTimeout(() => {
    if (getState().isPlaying && !getState().isPaused) {
      showPlayingMessage();
    }
  }, FEEDBACK.messageDuration);
}

export function showHalfItemFeedback(item) {
  const name = item.type === "poop" ? "똥" : "벌레";
  setMessage(`${name} 반쪽을 치웠어요. 점수 변화 없음!`);

  if (messageTimer) {
    clearTimeout(messageTimer);
  }

  messageTimer = setTimeout(() => {
    if (getState().isPlaying && !getState().isPaused) {
      showPlayingMessage();
    }
  }, FEEDBACK.messageDuration);
}

export function showItemFeedback(item) {
  const isPositive = item.type === "snack" || item.type === "goldbar";
  const label = getFeedbackLabel(item);
  const prefix =
    item.type === "goldbar" ? "대박! " : isPositive ? "맛있어요! " : "아이고! ";
  setMessage(`${prefix}${label}`);
  setCanvasFeedback(isPositive ? "good" : "bad");

  if (messageTimer) {
    clearTimeout(messageTimer);
  }

  messageTimer = setTimeout(() => {
    if (getState().isPlaying && !getState().isPaused) {
      showPlayingMessage();
    }
    clearCanvasFeedback();
  }, FEEDBACK.messageDuration);
}

export function showGameOverPanel(gameResult = {}) {
  const { isNewPersonalBest = false, finalScore = 0 } = gameResult;
  const username = getUsername();

  elements.finalScore.textContent = String(finalScore);

  let message = "시간이 끝났습니다. 다시 도전해 보세요!";
  if (isNewPersonalBest) {
    message = "개인 최고 점수를 갱신했습니다!";
  }

  if (finalScore > 0 && username) {
    const { rank, updated, created } = saveRankingEntry(username, finalScore);
    renderRankingList();

    if (rank) {
      if (updated) {
        message = `${username}님의 랭킹 점수가 ${finalScore}점으로 갱신되었습니다! (${rank}위)`;
      } else if (created) {
        message = `${username}님, 랭킹 ${rank}위에 등록되었습니다!`;
      } else {
        message = `${username}님, 기존 최고 랭킹 점수 ${getRankings().find((entry) => entry.name === username)?.score ?? finalScore}점을 넘기지 못해 랭킹 점수는 유지됩니다.`;
      }
    }
  }

  elements.gameOverMessage.textContent = message;
  elements.gameOverPanel.hidden = false;
  elements.startButton.disabled = true;
  setMessage("게임이 끝났습니다. 재시작 버튼을 눌러주세요.");
  updateControlButtons();
}

export function renderRankingList() {
  if (!elements.rankingList) {
    return;
  }

  const rankings = getRankings();
  elements.rankingList.replaceChildren();

  if (rankings.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "ranking-empty";
    emptyItem.textContent = "아직 기록이 없습니다.";
    elements.rankingList.appendChild(emptyItem);
    return;
  }

  rankings.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "ranking-item";
    item.innerHTML = `
      <span class="ranking-rank">${index + 1}</span>
      <span class="ranking-name">${escapeHtml(entry.name)}</span>
      <span class="ranking-score">${entry.score}점</span>
    `;
    elements.rankingList.appendChild(item);
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function hideGameOverPanel() {
  elements.gameOverPanel.hidden = true;
  elements.startButton.disabled = false;
  updateControlButtons();
}

export function syncBestScoreDisplay() {
  const topScore = Math.max(getState().bestScore, getTopRankingScore());
  elements.bestScore.textContent = String(topScore);
}

export function setCanvasFeedback(kind) {
  elements.canvasShell.classList.remove("feedback-good", "feedback-bad", "shake");
  if (kind === "good") {
    elements.canvasShell.classList.add("feedback-good");
    return;
  }

  if (kind === "bad") {
    elements.canvasShell.classList.add("feedback-bad", "shake");
  }
}

function clearCanvasFeedback() {
  elements.canvasShell.classList.remove("feedback-good", "feedback-bad", "shake");
}

function setMessage(text) {
  elements.message.textContent = text;
}

function getFeedbackLabel(item) {
  if (item.type === "snack" && item.variant) {
    const variant = SNACK_VARIANTS.find((entry) => entry.id === item.variant);
    if (variant) {
      return `${variant.label} +${SCORES.snack}`;
    }
  }

  return ITEM_LABELS[item.type] || "";
}
