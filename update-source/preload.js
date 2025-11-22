import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  
  // GAME
  selectGameExe: () => ipcRenderer.invoke("select-game-exe"),
  runGame: (exePath) => ipcRenderer.invoke("run-game", exePath),

  // WINDOW
  minimize: () => ipcRenderer.send("window-minimize"),
  close: () => ipcRenderer.send("window-close"),
  hide: () => ipcRenderer.send("window-hide"),

  // UPDATE
  downloadUpdate: (url) => ipcRenderer.invoke("download-update", url),
  restartApp: () => ipcRenderer.send("restart-app"),
});
