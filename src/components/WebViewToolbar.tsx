import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import styled from "styled-components";

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  gap: 8px;
`;

const NavigationButton = styled.button`
  padding: 4px 8px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #e8e8e8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const URLInput = styled.input`
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0066cc;
  }
`;

interface WebViewToolbarProps {
  url: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  onUrlChange: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onStopLoading: () => void;
}

const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const WebViewToolbar: React.FC<WebViewToolbarProps> = ({
  url,
  canGoBack,
  canGoForward,
  isLoading,
  onUrlChange,
  onGoBack,
  onGoForward,
  onReload,
  onStopLoading,
}) => {
  const [inputUrl, setInputUrl] = useState(url);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setInputUrl(url);
    }
  }, [url, isEditing]);

  const handleSearch = (searchTerm: string) => {
    // Use Google search if the input isn't a valid URL
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      searchTerm
    )}`;
    onUrlChange(searchUrl);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedInput = inputUrl.trim();

      // Check if it's a valid URL with protocol
      if (isValidUrl(trimmedInput)) {
        onUrlChange(trimmedInput);
      }
      // Check if it might be a valid URL without protocol
      else if (trimmedInput.includes(".") && !trimmedInput.includes(" ")) {
        onUrlChange(`http://${trimmedInput}`);
      }
      // Treat as search term
      else {
        handleSearch(trimmedInput);
      }

      setIsEditing(false);
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setInputUrl(url);
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    inputRef.current?.select(); // Select all text when focused
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    setInputUrl(url);
  };

  return (
    <ToolbarContainer>
      <NavigationButton
        onClick={onGoBack}
        disabled={!canGoBack}
        title="Go back"
      >
        ◀
      </NavigationButton>

      <NavigationButton
        onClick={onGoForward}
        disabled={!canGoForward}
        title="Go forward"
      >
        ▶
      </NavigationButton>

      <NavigationButton
        onClick={isLoading ? onStopLoading : onReload}
        title={isLoading ? "Stop" : "Reload"}
      >
        {isLoading ? "✕" : "↻"}
      </NavigationButton>

      <URLInput
        ref={inputRef}
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        type="text"
        spellCheck={false}
        placeholder="Search Google or type a URL"
      />
    </ToolbarContainer>
  );
};

export default WebViewToolbar;
