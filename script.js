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

const exerciseList = document.getElementById("exerciseList");
const timerDisplay = document.getElementById("timerDisplay");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");
const doneToday = document.getElementById("doneToday");
const weeklyCount = document.getElementById("weeklyCount");

let remainingSeconds = TIMER_SECONDS;
let timerId = null;

function renderExercises() {
  exerciseList.innerHTML = exercises.map((exercise, index) => {
    return "<article class="exercise-card reveal">" +
      "<div class="exercise-top">" +
        "<div>" +
          "<h3>" + exercise.name + "</h3>" +
          "<p class="purpose">目的：" + exercise.purpose + "</p>" +
        "</div>" +
        "<span class="exercise-number">" + (index + 1) + "</span>" +
      "</div>" +
      "<dl class="detail-list">" +
        "<div class="detail-row">" +
          "<dt>回数</dt>" +
          "<dd>" + exercise.reps + "</dd>" +
        "</div>" +
        "<div class="detail-row">" +
          "<dt>ポイント</dt>" +
          "<dd>" + exercise.point + "</dd>" +
        "</div>" +
        "<div class="detail-row">" +
          "<dt>注意点</dt>" +
          "<dd>" + exercise.caution + "</dd>" +
        "</div>" +
      "</dl>" +
    "</article>";
  }).join("");
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return minutes + ":" + seconds;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);
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

// 日付キーはブラウザの地域設定に合わせて保存します。
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function loadRecords() {
  const savedRecords = localStorage.getItem(STORAGE_KEY);
  return savedRecords ? JSON.parse(savedRecords) : {};
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
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

  weeklyCount.textContent = count;
}

function updateTodayCheck() {
  const records = loadRecords();
  doneToday.checked = Boolean(records[getLocalDateKey()]);
  updateWeeklyCount();
}

function toggleTodayRecord() {
  const records = loadRecords();
  records[getLocalDateKey()] = doneToday.checked;
  saveRecords(records);
  updateWeeklyCount();
}

function setupRevealAnimation() {
  const targets = document.querySelectorAll(".reveal");

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
  }, { threshold: 0.16 });

  targets.forEach((target) => observer.observe(target));
}

renderExercises();
updateTimerDisplay();
updateTodayCheck();
setupRevealAnimation();

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);
doneToday.addEventListener("change", toggleTodayRecord);
