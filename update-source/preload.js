import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  /* ===============================
        GAME LAUNCHER IPC
  ================================ */
  selectGameExe: () => ipcRenderer.invoke("select-game-exe"),
  runGame: (exePath) => ipcRenderer.invoke("run-game", exePath),

  /* ===============================
        WINDOW CONTROL
  ================================ */
  minimize: () => ipcRenderer.send("window-minimize"),
  close: () => ipcRenderer.send("window-close"),
  hide: () => ipcRenderer.send("window-hide"),

  /* ===============================
        AUTO UPDATE
  ================================ */
  downloadUpdate: (url) => ipcRenderer.invoke("download-update", url),
  restartApp: () => ipcRenderer.send("restart-app")
});
