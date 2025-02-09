import React from "react";
import styled from "styled-components";
import appIcon from "../../assets/app-icon.svg"; // You'll need to add this icon

const TitleBarContainer = styled.div`
  -webkit-app-region: drag;
  height: 32px;
  background: #8b9ae9;
  display: flex;
  align-items: center;
  color: #fff;
  font-family: system-ui;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;
  flex: 1;
`;

const AppIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const Title = styled.div`
  font-size: 12px;
`;

const ButtonContainer = styled.div`
  -webkit-app-region: no-drag;
  display: flex;
`;

interface TitleBarProps {
  title?: string;
}

const TitleBar: React.FC<TitleBarProps> = ({ title = "My Electron App" }) => {
  const minimize = () => {
    window.electron?.minimize();
  };

  const maximize = () => {
    window.electron?.maximize();
  };

  const close = () => {
    // console.log("Close button clicked"); // Debug log
    window.electron?.closeWindow();
  };

  return (
    <TitleBarContainer>
      <LeftSection>
        <AppIcon src={appIcon} alt="App Icon" />
        <Title>{title}</Title>
      </LeftSection>
      <ButtonContainer>
        <button type="button" onClick={minimize} style={buttonStyle}>
          ─
        </button>
        <button type="button" onClick={maximize} style={buttonStyle}>
          □
        </button>
        <CloseButton onClick={close}>✕</CloseButton>
      </ButtonContainer>
    </TitleBarContainer>
  );
};

const buttonStyle = {
  border: "none",
  background: "transparent",
  color: "white",
  fontSize: "16px",
  padding: "0 10px",
  height: "32px",
  cursor: "pointer",
  ":hover": {
    backgroundColor: "#404040",
  },
};

const CloseButton = styled.button`
  ${buttonStyle}
  &:hover {
    background-color: #ff0000;
  }
`;

export default TitleBar;
