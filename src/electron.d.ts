interface Window {
  electron: {
    minimize: () => void;
    maximize: () => void;
    closeWindow: () => void;
  };
}

declare namespace Electron {
  interface WebviewTag extends HTMLElement {
    getTitle(): string;
    getURL(): string;
    loadURL(url: string): void;
    executeJavaScript(code: string): Promise<any>;
    canGoBack(): boolean;
    canGoForward(): boolean;
    goBack(): void;
    goForward(): void;
    reload(): void;
    stop(): void;
    capturePage(): Promise<Electron.NativeImage>;
  }

  interface NativeImage {
    resize(options: {
      width: number;
      height: number;
      quality: string;
    }): NativeImage;
    toDataURL(): string;
  }
}

interface CSSProperties {
  WebkitAppRegion?: string;
}
