import { contextBridge, ipcRenderer } from "electron";

console.log("Preload script is running");

contextBridge.exposeInMainWorld("electron", {
  minimize: () => ipcRenderer.invoke("minimize-window"),
  maximize: () => ipcRenderer.invoke("maximize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),
  getCurrentWindowId: () => ipcRenderer.invoke("get-current-window-id"),

  invoke: (channel: string, data?: any) => {
    const validChannels = [
      "browser-window:create",
      "browser-window:load-url",
      "browser-window:go-back",
      "browser-window:go-forward",
      "browser-window:reload",
      "browser-window:stop",
      "browser-window:destroy",
      "browser-window:set-bounds",
      "browser-view:loading",
      "browser-view:url-changed",
      "browser-window:get-data",
      "browser-window:capture",
    ];

    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },

  on: (channel: string, callback: Function) => {
    const validChannels = [
      "browser-window:navigation-update",
      "browser-view:loading",
      "browser-view:url-changed",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  removeListener: (channel: string, callback: Function) => {
    const validChannels = [
      "browser-window:navigation-update",
      "browser-view:loading",
      "browser-view:url-changed",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback as any);
    }
  },
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
      getCurrentWindowId: () => Promise<string>;
      invoke: (channel: string, data?: any) => Promise<any>;
      on: (channel: string, callback: Function) => void;
      removeListener: (channel: string, callback: Function) => void;
    };
  }
}
