import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import TitleBar from "./components/TitleBar";
import LeftPanel from "./components/LeftPanel";
import WebViewContent, { WebViewContentRef } from "./components/WebViewContent";

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

function App() {
  const webviewRef = useRef<WebViewContentRef>(null);

  const handleUrlOpen = useCallback((url: string) => {
    console.log("handleUrlOpen", url);
    webviewRef.current?.loadURL(url);
  }, []);

  const getCurrentWebViewData = useCallback(async () => {
    return webviewRef.current?.getCurrentData() || null;
  }, []);

  const generateThumbnail = useCallback(async () => {
    return webviewRef.current?.generateThumbnail() || "";
  }, []);

  return (
    <AppContainer>
      <TitleBar title="MyAll app" />
      <MainContent>
        <LeftPanel
          onUrlOpen={handleUrlOpen}
          getCurrentWebViewData={getCurrentWebViewData}
          generateThumbnail={generateThumbnail}
        />
        <WebViewContent ref={webviewRef} />
      </MainContent>
    </AppContainer>
  );
}

export default App;
