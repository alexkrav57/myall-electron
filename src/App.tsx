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

function App() {
  const handleUrlOpen = useCallback((url: string) => {
    console.log("Opening URL:", url);
    window.electron.invoke("browser-window:load-url", { url });
  }, []);

  return (
    <AppContainer>
      <TitleBar title="MyAll app" />
      <MainContent>
        <LeftPanel
          onUrlOpen={handleUrlOpen}
          getCurrentWebViewData={() => ({})}
          generateThumbnail={() => Promise.resolve("")}
        />
        <BrowserViewContent />
      </MainContent>
    </AppContainer>
  );
}

export default App;
