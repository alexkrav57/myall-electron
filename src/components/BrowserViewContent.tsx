import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import WebViewToolbar from "./WebViewToolbar";

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const BrowserContainer = styled.div`
  flex: 1;
  position: relative;
`;

const BrowserViewContent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentUrl, setCurrentUrl] = useState("https://www.google.com");
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateBounds = () => {
      const domBounds = container.getBoundingClientRect();
      const bounds = {
        x: domBounds.x,
        y: domBounds.y,
        width: domBounds.width,
        height: domBounds.height,
      };
      window.electron
        .invoke("browser-window:set-bounds", { bounds })
        .catch((err) => console.error("Error invoking set-bounds:", err));
    };

    // Create ResizeObserver
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(container);

    // Create BrowserView
    window.electron.invoke("browser-window:create", {
      url: "https://www.google.com",
      bounds: container.getBoundingClientRect(),
    });

    // Add navigation event listeners
    const handleLoading = (isLoading: boolean) => {
      setIsLoading(isLoading);
    };

    const handleUrlChange = (data: {
      url: string;
      canGoBack: boolean;
      canGoForward: boolean;
    }) => {
      setCurrentUrl(data.url);
      setCanGoBack(data.canGoBack);
      setCanGoForward(data.canGoForward);
    };

    window.electron.on("browser-view:loading", handleLoading);
    window.electron.on("browser-view:url-changed", handleUrlChange);

    return () => {
      resizeObserver.disconnect();
      window.electron.invoke("browser-window:destroy");
      window.electron.removeListener("browser-view:loading", handleLoading);
      window.electron.removeListener(
        "browser-view:url-changed",
        handleUrlChange
      );
    };
  }, []);

  const handleUrlChange = async (newUrl: string) => {
    const processedUrl = /^https?:\/\//i.test(newUrl)
      ? newUrl
      : `https://${newUrl}`;
    setCurrentUrl(processedUrl);
    try {
      await window.electron.invoke("browser-window:load-url", {
        url: processedUrl,
      });
    } catch (error) {
      console.error("Error loading URL:", error);
    }
  };

  const getCurrentWebViewData = async () => {
    try {
      const response = await window.electron.invoke("browser-window:get-data");
      return response as { url: string; title: string } | null;
    } catch (error) {
      console.error("Error getting web view data:", error);
      return null;
    }
  };

  return (
    <Container>
      <WebViewToolbar
        url={currentUrl}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        isLoading={isLoading}
        onUrlChange={handleUrlChange}
        onGoBack={() => window.electron.invoke("browser-window:go-back")}
        onGoForward={() => window.electron.invoke("browser-window:go-forward")}
        onReload={() => window.electron.invoke("browser-window:reload")}
        onStopLoading={() => window.electron.invoke("browser-window:stop")}
      />
      <BrowserContainer ref={containerRef} />
    </Container>
  );
};

export default BrowserViewContent;
