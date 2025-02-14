import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import TitleBar from "./components/TitleBar";
import LeftPanel from "./components/LeftPanel";
import BrowserViewContent from "./components/BrowserViewContent";

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

const App = () => {
  const leftPanelRef = useRef<LeftPanel | null>(null);

  const handleUrlOpen = (url: string) => {
    console.log("Opening URL:", url);
    window.electron.invoke("browser-window:load-url", { url });
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

  const generateThumbnail = async () => {
    try {
      const response = await window.electron.invoke("browser-window:capture");
      return response as string;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return "";
    }
  };

  const handleGrabUrl = () => {
    leftPanelRef.current?.handleGrabUrl();
  };

  return (
    <AppContainer>
      <TitleBar title="MyAll app" />
      <MainContent>
        <LeftPanel
          ref={leftPanelRef}
          onUrlOpen={handleUrlOpen}
          getCurrentWebViewData={getCurrentWebViewData}
          generateThumbnail={generateThumbnail}
        />
        <BrowserViewContent onGrabUrl={handleGrabUrl} />
      </MainContent>
    </AppContainer>
  );
};

export default App;
