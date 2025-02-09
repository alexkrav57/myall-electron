interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  closeWindow: () => void;
  getCurrentWindowId: () => Promise<number>;
  invoke: (channel: string, data?: any) => Promise<any>;
  on: (channel: string, callback: Function) => void;
  removeListener: (channel: string, callback: Function) => void;
}

interface NavigationState {
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  url: string;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
