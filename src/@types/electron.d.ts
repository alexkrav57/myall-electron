declare namespace Electron {
  interface NewWindowEvent {
    url: string;
    preventDefault: () => void;
  }

  interface WillNavigateEvent {
    url: string;
  }

  interface DidNavigateEvent {
    url: string;
  }

  interface WebviewEventMap {
    "will-navigate": WillNavigateEvent;
    "did-navigate": DidNavigateEvent;
    "did-navigate-in-page": DidNavigateEvent;
    "new-window": NewWindowEvent;
    "did-start-loading": Event;
    "did-stop-loading": Event;
    "dom-ready": Event;
  }

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
    addEventListener<K extends keyof WebviewEventMap>(
      type: K,
      listener: (event: WebviewEventMap[K]) => void
    ): void;
    removeEventListener<K extends keyof WebviewEventMap>(
      type: K,
      listener: (event: WebviewEventMap[K]) => void
    ): void;
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
