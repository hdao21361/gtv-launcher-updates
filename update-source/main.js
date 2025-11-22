const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { execFile } = require("child_process");
const AdmZip = require("adm-zip");
const fs = require("fs");
const https = require("https");

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
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ================== DOWNLOAD UPDATE ==================

ipcMain.handle("download-update", async (_, url) => {
  return new Promise((resolve) => {

    // Đường dẫn EXE thực sự khi chạy bản build
    const appPath = path.dirname(process.execPath);

    const updateZipPath = path.join(appPath, "update.zip");

    const file = fs.createWriteStream(updateZipPath);

    https.get(url, (response) => {
      response.pipe(file);

      file.on("finish", () => {
        file.close(() => {
          try {
            const zip = new AdmZip(updateZipPath);

            // Giải nén đè vào thư mục app
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

// ================== RESTART APP ==================
ipcMain.on("restart-app", () => {
  app.relaunch();
  app.exit();
});
