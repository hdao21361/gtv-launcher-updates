import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // game launcher API
  selectGameExe: () => ipcRenderer.invoke("select-game-exe"),
  runGame: (exePath) => ipcRenderer.invoke("run-game", exePath),

  // window control
  closeApp: () => ipcRenderer.send("close-app"),

  // --- AUTO UPDATE API ---
  downloadUpdate: (url) => ipcRenderer.invoke("download-update", url),
  restartApp: () => ipcRenderer.send("restart-app")   // 🔥 FIX QUAN TRỌNG
});
