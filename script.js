// メニューを変更したい場合は、この配列の内容を編集してください。
const exercises = [
  {
    name: "スクワット",
    purpose: "お尻・脚",
    reps: "15回 × 2セット",
    point: "お尻を後ろに引く、膝を内側に入れない",
    caution: "膝や腰に痛みがある日は浅めに行いましょう。"
  },
  {
    name: "ヒップリフト",
    purpose: "ヒップアップ",
    reps: "15回 × 2セット",
    point: "上で2秒キープ、お尻を締める",
    caution: "腰で反らず、お腹を軽く締めて動きましょう。"
  },
  {
    name: "膝つき腕立て伏せ",
    purpose: "胸の土台作り",
    reps: "8〜10回 × 2セット",
    point: "胸を意識、腰を反らない",
    caution: "肩がすくむ場合は回数を減らして大丈夫です。"
  },
  {
    name: "ドンキーキック",
    purpose: "お尻の上部",
    reps: "左右10回 × 2セット",
    point: "反動を使わずゆっくり",
    caution: "腰が反りすぎないよう、床を見る姿勢で行いましょう。"
  },
  {
    name: "ケーゲル体操",
    purpose: "骨盤底筋",
    reps: "5秒締める → 5秒ゆるめる × 10回",
    point: "呼吸を止めない、お腹やお尻に力を入れすぎない",
    caution: "違和感があるときは中止し、専門家に相談しましょう。"
  },
  {
    name: "合掌プレス",
    purpose: "胸のたれ防止サポート",
    reps: "30秒 × 2セット",
    point: "胸の前で手を押し合う",
    caution: "首や肩に力が入りすぎないようにしましょう。"
  },
  {
    name: "その場足踏み or 軽いステップ",
    purpose: "軽い有酸素",
    reps: "1〜2分",
    point: "息が上がりすぎない程度",
    caution: "息切れやめまいが出たらすぐ休みましょう。"
  }
];

const STORAGE_KEY = "bodymakeRecords";
const TIMER_SECONDS = 10 * 60;

let remainingSeconds = TIMER_SECONDS;
let timerId = null;
let elements = {};

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderExercises() {
  elements.exerciseList.innerHTML = "";

  // HTML文字列ではなくDOM APIで作ることで、クォート崩れによる構文エラーを防ぎます。
  exercises.forEach((exercise, index) => {
    const card = createElement("article", "exercise-card");
    const top = createElement("div", "exercise-top");
    const titleArea = createElement("div");
    const title = createElement("h3", "", exercise.name);
    const purpose = createElement("p", "purpose", "目的：" + exercise.purpose);
    const number = createElement("span", "exercise-number", String(index + 1));
    const detailList = createElement("dl", "detail-list");

    titleArea.append(title, purpose);
    top.append(titleArea, number);

    addDetailRow(detailList, "回数", exercise.reps);
    addDetailRow(detailList, "ポイント", exercise.point);
    addDetailRow(detailList, "注意点", exercise.caution);

    card.append(top, detailList);
    elements.exerciseList.appendChild(card);
  });
}

function addDetailRow(parent, label, value) {
  const row = createElement("div", "detail-row");
  row.append(createElement("dt", "", label), createElement("dd", "", value));
  parent.appendChild(row);
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return minutes + ":" + seconds;
}

function updateTimerDisplay() {
  elements.timerDisplay.textContent = formatTime(remainingSeconds);
}

function startTimer() {
  if (timerId !== null || remainingSeconds <= 0) return;

  timerId = setInterval(() => {
    remainingSeconds -= 1;
    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      pauseTimer();
      remainingSeconds = 0;
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = TIMER_SECONDS;
  updateTimerDisplay();
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function loadRecords() {
  try {
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    return savedRecords ? JSON.parse(savedRecords) : {};
  } catch (error) {
    console.warn("記録の読み込みに失敗しました。", error);
    return {};
  }
}

function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn("記録の保存に失敗しました。", error);
  }
}

function getStartOfWeek(date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function updateWeeklyCount() {
  const records = loadRecords();
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  let count = 0;

  Object.keys(records).forEach((dateKey) => {
    const recordDate = new Date(dateKey + "T00:00:00");
    if (records[dateKey] && recordDate >= startOfWeek && recordDate <= today) {
      count += 1;
    }
  });

  elements.weeklyCount.textContent = count;
}

function updateTodayCheck() {
  const records = loadRecords();
  elements.doneToday.checked = Boolean(records[getLocalDateKey()]);
  updateWeeklyCount();
}

function toggleTodayRecord() {
  const records = loadRecords();
  records[getLocalDateKey()] = elements.doneToday.checked;
  saveRecords(records);
  updateWeeklyCount();
}

function setupRevealAnimation() {
  const targets = document.querySelectorAll(".reveal");
  document.body.classList.add("animations-ready");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach((target) => observer.observe(target));
}

function showContentIfError() {
  document.body.classList.remove("animations-ready");
  document.querySelectorAll(".reveal").forEach((target) => {
    target.classList.add("is-visible");
  });
}

function initApp() {
  elements = {
    exerciseList: document.getElementById("exerciseList"),
    timerDisplay: document.getElementById("timerDisplay"),
    startButton: document.getElementById("startButton"),
    pauseButton: document.getElementById("pauseButton"),
    resetButton: document.getElementById("resetButton"),
    doneToday: document.getElementById("doneToday"),
    weeklyCount: document.getElementById("weeklyCount")
  };

  if (Object.values(elements).some((element) => !element)) {
    throw new Error("必要な画面要素が見つかりません。");
  }

  renderExercises();
  updateTimerDisplay();
  updateTodayCheck();
  setupRevealAnimation();

  elements.startButton.addEventListener("click", startTimer);
  elements.pauseButton.addEventListener("click", pauseTimer);
  elements.resetButton.addEventListener("click", resetTimer);
  elements.doneToday.addEventListener("change", toggleTodayRecord);
}

function boot() {
  try {
    initApp();
  } catch (error) {
    console.error("アプリの初期化に失敗しました。", error);
    showContentIfError();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
