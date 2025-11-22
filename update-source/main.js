const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const AdmZip = require("adm-zip");
const { execFile } = require("child_process");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 1000,
    minHeight: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("index.html");
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


// =========================================
// IPC: CHỌN FILE .EXE GAME
// =========================================
ipcMain.handle("select-game-exe", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Executables", extensions: ["exe"] }]
  });
  if (canceled) return null;
  return filePaths[0];
});


// =========================================
// IPC: CHẠY GAME
// =========================================
ipcMain.handle("run-game", async (event, exePath) => {
  if (!exePath) return { ok: false, msg: "Không có đường dẫn game" };

  return new Promise((resolve) => {
    execFile(exePath, (err) => {
      if (err) resolve({ ok: false, msg: err.message });
      else resolve({ ok: true, msg: "Đã chạy game" });
    });
  });
});


// =========================================
// IPC: DOWNLOAD UPDATE ZIP
// =========================================
ipcMain.handle("download-update", async (event, updateUrl) => {
  try {
    const tempZip = path.join(app.getPath("temp"), "update.zip");

    // Tải file từ updateUrl
    const res = await fetch(updateUrl);
    const buffer = await res.buffer();
    fs.writeFileSync(tempZip, buffer);

    // Giải nén
    const zip = new AdmZip(tempZip);
    const appPath = process.cwd(); // thư mục launcher hiện tại

    zip.extractAllTo(appPath, true); // ghi đè file

    fs.unlinkSync(tempZip); // Xóa file zip tạm

    return { ok: true };
  } catch (err) {
    return { ok: false, msg: err.message };
  }
});


// =========================================
// IPC: RESTART ỨNG DỤNG
// =========================================
ipcMain.handle("restart-app", () => {
  app.relaunch();
  app.exit();
});


// =========================================
// IPC: ĐÓNG APP (NÚT X)
// =========================================
ipcMain.on("close-app", () => {
  app.quit();
});
