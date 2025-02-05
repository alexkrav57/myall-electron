import { contextBridge, ipcRenderer } from "electron";

console.log("Preload script is running");

contextBridge.exposeInMainWorld("electron", {
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  closeWindow: () => ipcRenderer.send("close"),
});

contextBridge.exposeInMainWorld("electronAPI", {
  getStoragePath: () => ipcRenderer.invoke("get-storage-path"),
  readFile: (path: string) => ipcRenderer.invoke("read-file", path),
  writeFile: (path: string, data: string) =>
    ipcRenderer.invoke("write-file", path, data),
  fileExists: (path: string) => ipcRenderer.invoke("file-exists", path),
  createDirectory: (path: string) =>
    ipcRenderer.invoke("create-directory", path),
  deleteFile: (path: string) => ipcRenderer.invoke("delete-file", path),
});

// Add TypeScript declarations
declare global {
  interface Window {
    electron: {
      minimize: () => void;
      maximize: () => void;
      closeWindow: () => void;
    };
  }
}
