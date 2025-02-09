export interface IElectronAPI {
  minimize: () => void;
  maximize: () => void;
  closeWindow: () => void;
  invoke: (channel: string, data?: any) => Promise<any>;
  on: (channel: string, callback: Function) => void;
  removeListener: (channel: string, callback: Function) => void;
  getWindowId: () => Promise<number>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

export {};
