import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  selectGameExe: () => ipcRenderer.invoke("select-game-exe"),
  runGame: (exePath) => ipcRenderer.invoke("run-game", exePath),
  closeApp: () => ipcRenderer.send("close-app")
});
