import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import styled from "styled-components";
import WebViewToolbar from "./WebViewToolbar";
import { generateThumbnail } from "../utils/generateThumbnail";

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const WebViewContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

export interface WebViewContentRef {
  loadURL: (url: string) => void;
  getCurrentData: () => Promise<{
    url: string;
    title: string;
    thumbnail: string;
  }>;
  generateThumbnail: () => Promise<string>;
}

interface WebViewContentProps {
  url?: string;
}

const WebViewContent = forwardRef<WebViewContentRef, WebViewContentProps>(
  (props, ref) => {
    const webviewRef = useRef<Electron.WebviewTag>(null);
    const [currentUrl, setCurrentUrl] = useState(
      props.url || "https://www.google.com"
    );
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      loadURL: (url: string) => {
        if (webviewRef.current) {
          setCurrentUrl(url);
          webviewRef.current.loadURL(url);
        }
      },
      getCurrentData: async () => {
        if (webviewRef.current) {
          const title = await webviewRef.current.getTitle();
          const url = webviewRef.current.getURL();
          const thumbnail = await generateThumbnail(webviewRef.current);
          return { url, title, thumbnail };
        }
        throw new Error("Webview not available");
      },
      generateThumbnail: async () => {
        if (webviewRef.current) {
          return generateThumbnail(webviewRef.current);
        }
        throw new Error("Webview not available");
      },
    }));

    useEffect(() => {
      const webview = webviewRef.current;
      if (!webview) return;

      // Script to override window.open
      const script = `
      window.open = function(url, target, features) {
        if (url) {
          window.location.href = url;
        }
        return null;
      };
      
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.target === '_blank') {
          e.preventDefault();
          window.location.href = link.href;
        }
      }, true);
    `;

      const injectScript = () => {
        try {
          webview.executeJavaScript(script);
        } catch (error) {
          console.error("Failed to inject script:", error);
        }
      };

      const handleStartLoading = () => {
        setIsLoading(true);
      };

      const handleStopLoading = () => {
        setIsLoading(false);
      };

      const handleNavigate = () => {
        const newUrl = webview.getURL();
        console.log("Navigation occurred:", newUrl);
        setCurrentUrl(newUrl);
        setCanGoBack(webview.canGoBack());
        setCanGoForward(webview.canGoForward());
      };

      const handleWillNavigate = (event: Electron.WillNavigateEvent) => {
        console.log("Will navigate to:", event.url);
        setCurrentUrl(event.url);
      };

      const handleDidNavigate = (event: Electron.DidNavigateEvent) => {
        console.log("Did navigate to:", event.url);
        setCurrentUrl(event.url);
        setCanGoBack(webview.canGoBack());
        setCanGoForward(webview.canGoForward());
      };

      const handleNewWindow = (event: Electron.NewWindowEvent) => {
        console.log("New window requested:", event.url);
        event.preventDefault();
        webview.loadURL(event.url);
      };

      const handleDomReady = () => {
        console.log("DOM ready, injecting script");
        injectScript();
      };

      webview.addEventListener("did-start-loading", handleStartLoading);
      webview.addEventListener("did-stop-loading", handleStopLoading);
      webview.addEventListener("will-navigate", handleWillNavigate);
      webview.addEventListener("did-navigate", handleDidNavigate);
      webview.addEventListener("did-navigate-in-page", handleDidNavigate);
      webview.addEventListener("new-window", handleNewWindow);
      webview.addEventListener("dom-ready", handleDomReady);

      return () => {
        webview.removeEventListener("did-start-loading", handleStartLoading);
        webview.removeEventListener("did-stop-loading", handleStopLoading);
        webview.removeEventListener("will-navigate", handleWillNavigate);
        webview.removeEventListener("did-navigate", handleDidNavigate);
        webview.removeEventListener("did-navigate-in-page", handleDidNavigate);
        webview.removeEventListener("new-window", handleNewWindow);
        webview.removeEventListener("dom-ready", handleDomReady);
      };
    }, []);

    const handleUrlChange = (newUrl: string) => {
      // Add http:// if no protocol is specified
      const processedUrl = /^https?:\/\//i.test(newUrl)
        ? newUrl
        : `http://${newUrl}`;
      console.log("Loading URL:", processedUrl);
      webviewRef.current?.loadURL(processedUrl);
    };

    const handleGoBack = () => {
      webviewRef.current?.goBack();
    };

    const handleGoForward = () => {
      webviewRef.current?.goForward();
    };

    const handleReload = () => {
      webviewRef.current?.reload();
    };

    const handleStopLoading = () => {
      webviewRef.current?.stop();
    };

    return (
      <Container>
        <WebViewToolbar
          url={currentUrl}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          isLoading={isLoading}
          onUrlChange={handleUrlChange}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
          onReload={handleReload}
          onStopLoading={handleStopLoading}
        />
        <WebViewContainer>
          <webview
            ref={webviewRef}
            src={currentUrl}
            style={{ width: "100%", height: "100%" }}
            webpreferences="nativeWindowOpen=false"
            partition="persist:myall"
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          />
        </WebViewContainer>
      </Container>
    );
  }
);

export default WebViewContent;
