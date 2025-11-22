const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { execFile } = require("child_process");
const AdmZip = require("adm-zip");
const fs = require("fs");
const https = require("https");

let win;

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
      preload: app.isPackaged
        ? path.join(process.resourcesPath, "preload.js")
        : path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


/* ======================================================
    WINDOW CONTROL (QUAN TRỌNG)
====================================================== */

ipcMain.on("window-minimize", () => {
  const w = BrowserWindow.getFocusedWindow();
  if (w) w.minimize();
});

ipcMain.on("window-hide", () => {
  const w = BrowserWindow.getFocusedWindow();
  if (w) w.hide();
});

ipcMain.on("window-close", () => {
  const w = BrowserWindow.getFocusedWindow();
  if (w) w.close();
});


/* ======================================================
    DOWNLOAD AUTO UPDATE
====================================================== */

ipcMain.handle("download-update", async (_, url) => {
  return new Promise((resolve) => {

    // Khi chạy bản build, đây là thư mục thật
    const appPath = path.dirname(process.execPath);
    const updateZipPath = path.join(appPath, "update.zip");

    const file = fs.createWriteStream(updateZipPath);

    https.get(url, (response) => {
      response.pipe(file);

      file.on("finish", () => {
        file.close(() => {
          try {
            const zip = new AdmZip(updateZipPath);

            // Giải nén đè toàn bộ file
            zip.extractAllTo(appPath, true);

            fs.unlinkSync(updateZipPath);

            resolve({ ok: true });

          } catch (err) {
            resolve({ ok: false, msg: err.message });
          }
        });
      });

    }).on("error", (err) => {
      resolve({ ok: false, msg: err.message });
    });
  });
});


/* ======================================================
    RESTART AFTER UPDATE
====================================================== */

ipcMain.on("restart-app", () => {
  app.relaunch();
  app.exit();
});


/* ======================================================
    GAME LAUNCHER IPC
====================================================== */

ipcMain.handle("select-game-exe", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Executables", extensions: ["exe"] }]
  });
  if (canceled) return null;
  return filePaths[0];
});

ipcMain.handle("run-game", async (_, exePath) => {
  if (!exePath) return { ok: false, msg: "Không có đường dẫn game" };

  return new Promise((resolve) => {
    execFile(exePath, (err) => {
      if (err) resolve({ ok: false, msg: err.message });
      else resolve({ ok: true });
    });
  });
});
