// ==================== DỮ LIỆU GAME ====================

let games = [];

// Load danh sách game từ games.json
async function loadGames() {
  const res = await fetch("games.json");
  games = await res.json();
  renderGames();
  applyTiltToCards();
}

loadGames();


// ==================== ELEMENTS ====================

const gridList = document.getElementById("grid-list");
const titleBox = document.getElementById("game-title");
const descBox = document.getElementById("game-desc");
const searchBox = document.getElementById("search-box");

const tabButtons = document.querySelectorAll(".tab");
const tabs = document.querySelectorAll(".tab-content");

const gamePathInput = document.getElementById("game-path");
const pickBtn = document.getElementById("btn-pick");
const playBtn = document.getElementById("btn-play");

let currentGame = null;


// ==================== VIDEO POPUP ====================

const videoBox = document.querySelector(".video-box");
const videoPopup = document.getElementById("video-popup");
const videoFrame = document.getElementById("video-frame");
const popupClose = document.getElementById("popup-close");

let currentVideo = "";


// ==================== RENDER CARD GAME ====================

function renderGames(filter = "") {
  gridList.innerHTML = "";

  const filteredGames = games.filter(g =>
    g.title.toLowerCase().includes(filter.toLowerCase())
  );

  filteredGames.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";

    card.innerHTML = `
      <img src="${game.cover}">
      <div class="game-title">${game.title}</div>
    `;

    card.addEventListener("click", () => selectGame(game));

    gridList.appendChild(card);
  });
}


// ==================== CHỌN GAME ====================

function selectGame(game) {
  currentGame = game;

  titleBox.textContent = game.title;
  descBox.textContent = game.desc;

  currentVideo = game.video;

  const thumbList = document.querySelector(".thumb-list");
  thumbList.innerHTML = "";

  game.thumbs.forEach(t => {
    const img = document.createElement("img");
    img.src = t;
    thumbList.appendChild(img);
  });

  const savedPath = localStorage.getItem("game_exe_" + game.id);
  if (savedPath) {
    game.exe = savedPath;
    gamePathInput.value = savedPath;
  }
}


// ==================== TAB SWITCH ====================

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    btn.classList.add("active");

    tabs.forEach(t => t.classList.add("hidden"));
    document.getElementById("tab-" + btn.dataset.tab).classList.remove("hidden");
  });
});


// ==================== CHỌN FILE EXE ====================

pickBtn.addEventListener("click", async () => {
  const exePath = await window.electronAPI.selectGameExe();
  if (!exePath) return;

  gamePathInput.value = exePath;

  if (currentGame) {
    currentGame.exe = exePath;
    localStorage.setItem("game_exe_" + currentGame.id, exePath);
  }
});


// ==================== CHẠY GAME ====================

playBtn.addEventListener("click", async () => {
  if (!currentGame || !currentGame.exe) {
    alert("Chưa chọn đường dẫn file game!");
    return;
  }

  const result = await window.electronAPI.runGame(currentGame.exe);

  if (!result.ok) {
    alert("Không thể chạy game: " + result.msg);
  }
});


// ==================== LỌC GAME ====================

searchBox.addEventListener("input", () => {
  renderGames(searchBox.value);
  applyTiltToCards();
});


// ==================== VIDEO POPUP ====================

videoBox.addEventListener("click", () => {
  if (!currentVideo) return;

  videoPopup.classList.remove("hidden");
  videoFrame.src = currentVideo + "?autoplay=1";
});

popupClose.addEventListener("click", () => {
  videoPopup.classList.add("hidden");
  videoFrame.src = "";
});


// ==================== 3D TILT EFFECT ====================

function addTiltEffect(card) {
  const rect = card.getBoundingClientRect();

  function handleMove(e) {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 18;
    const rotateX = ((y / rect.height) - 0.5) * -18;

    card.classList.add("tilt");
    card.style.transform = `
      perspective(600px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.05)
    `;
  }

  function resetTilt() {
    card.classList.remove("tilt");
    card.style.transform = "";
  }

  card.addEventListener("mousemove", handleMove);
  card.addEventListener("mouseleave", resetTilt);
}

function applyTiltToCards() {
  const cards = document.querySelectorAll(".game-card");
  cards.forEach(card => addTiltEffect(card));
}


// ================= SPLASH LOGO CONTROL =================

const splash = document.getElementById("splash-logo");
const splashSound = document.getElementById("splash-sound");

// Splash logo animation
window.addEventListener("DOMContentLoaded", () => {
  splashSound.volume = 0.9;
  splashSound.play();

  setTimeout(() => {
    splash.style.opacity = 0;
    splash.classList.add("fade-out");

    setTimeout(() => splash.remove(), 900);
  }, 2300);
});

// ================= KIỂM TRA UPDATE =================

async function checkForUpdate() {
  try {
    const url = "https://raw.githubusercontent.com/hdao21361/gtv-launcher-updates/main/update-source/version.json";

    const res = await fetch(url);
    const info = await res.json();

    // Phiên bản hiện tại của app
    const currentVersion = "1.0.0";

    if (info.latest !== currentVersion) {
      const ok = confirm(
        `Có bản cập nhật mới!\n\n` +
        `Phiên bản hiện tại: ${currentVersion}\n` +
        `Phiên bản mới: ${info.latest}\n\n` +
        `Bạn có muốn cập nhật ngay không?`
      );

      if (ok) {
        downloadUpdate(info.updateUrl);
      }
    }

  } catch (err) {
    console.log("Không thể kiểm tra cập nhật:", err);
  }
}

// ================= TẢI & CÀI UPDATE =================

async function downloadUpdate(url) {
  try {
    const result = await window.electronAPI.downloadUpdate(url);

    if (!result.ok) {
      alert("Lỗi khi tải cập nhật: " + result.msg);
      return;
    }

    alert("Cập nhật hoàn tất! Ứng dụng sẽ khởi động lại.");

    // Restart app
    window.electronAPI.restartApp();

  } catch (err) {
    alert("Không thể tải cập nhật: " + err.message);
  }
}

// Khi app mở → kiểm tra update
window.addEventListener("DOMContentLoaded", () => {
  checkForUpdate();
});

document.getElementById("min-btn").onclick = () => {
  window.electronAPI.minimize();
};

document.getElementById("close-btn").onclick = () => {
  window.electronAPI.close();
};

// Nếu sau này bạn muốn thêm nút ẩn:
document.getElementById("hide-btn")?.onclick = () => {
  window.electronAPI.hide();
};




