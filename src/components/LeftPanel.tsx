import styled from "styled-components";
import CategoryGroup from "./CategoryGroup";
import ListItem from "./ListItem";
import { usePanelData } from "../hooks/usePanelData";
import { model } from "../model/model";
import myallIcon from "../../assets/myall64.svg";
import React, { useEffect, useRef } from "react";

const PanelContainer = styled.div`
  width: 250px;
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid #ddd;
  overflow-y: auto;
`;

const LeftPanelDiv = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ddd;
`;

const Logo = styled.img`
  width: 48px;
  height: 24px;
  padding-right: 8px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
`;

const GrabButtonArea = styled.div`
  margin-left: auto;
`;

const GrabUrlButton = styled.button`
  padding: 6px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const CategoriesContainer = styled.div`
  padding: 16px;
  height: calc(100% - 64px); // Adjust based on header height
  overflow-y: auto;
`;

interface Item {
  id: number;
  categoryId: number;
  title: string;
  description: string;
  url: string;
  icon: string;
}

interface Category {
  id: number;
  name: string;
}

interface LeftPanelProps {
  onUrlOpen: (url: string) => void;
  getCurrentWebViewData: () => Promise<{ url: string; title: string } | null>;
  generateThumbnail: () => Promise<string>;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  onUrlOpen,
  getCurrentWebViewData,
  generateThumbnail,
}) => {
  const {
    categories,
    items,
    selectedItem,
    expandedCategories,
    toggleCategory,
    selectItem,
    handleDragEnd,
    addItem,
    removeItem,
    refreshThumbnails,
  } = usePanelData();

  // Add these debug logs
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSiteName = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace("www.", "").split(".")[0];
    } catch (error) {
      return url;
    }
  };

  const handleGrabUrl = async (): Promise<void> => {
    const data = await getCurrentWebViewData();
    if (data) {
      const targetCategoryId = categories[categories.length - 1].id;

      if (!expandedCategories.includes(targetCategoryId)) {
        toggleCategory(targetCategoryId);
      }

      const newItem = await addItem({
        categoryId: targetCategoryId,
        title: data.title,
        description: getSiteName(data.url),
        url: data.url,
        icon: "🌐",
      });

      if (newItem?.id) {
        selectItem(newItem.id);
      }

      if (!(await model.hasThumbData(data.url))) {
        const thumbnail = await generateThumbnail();
        if (thumbnail) {
          await model.setThumbDataForUrl(data.url, thumbnail);
          refreshThumbnails();
        }
      }
    }
  };

  useEffect(() => {
    if (selectedItem) {
      const selectedItemData = items.find(
        (item: Item) => item.id === selectedItem
      );
      if (selectedItemData) {
        const categoryId = selectedItemData.categoryId;
        if (!expandedCategories.includes(categoryId)) {
          toggleCategory(categoryId);
          setTimeout(() => {
            if (selectedItemRef.current) {
              selectedItemRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
            }
          }, 300);
        } else {
          if (selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
      }
    }
  }, [selectedItem, items, expandedCategories, toggleCategory]);

  useEffect(() => {
    if (selectedItem) {
      const found = items.find((item: Item) => item.id === selectedItem);
      if (found) {
        onUrlOpen(found.url);
      } else {
        console.log("selectedItem not found");
      }
    }
  }, [selectedItem, items, onUrlOpen]);

  return (
    <PanelContainer>
      <LeftPanelDiv>
        <PanelHeader>
          <Logo src={myallIcon} alt="MyAll" />
          <Title>MyAll</Title>
          <GrabButtonArea>
            <GrabUrlButton onClick={handleGrabUrl}>Grab url</GrabUrlButton>
          </GrabButtonArea>
        </PanelHeader>

        <CategoriesContainer
          ref={containerRef}
          className="categories-container"
        >
          {categories.map((category: Category) => {
            const categoryItems = items
              .filter((item: Item) => item.categoryId === category.id)
              .map((item: Item, index: number) => (
                <ListItem
                  key={item.id}
                  ref={item.id === selectedItem ? selectedItemRef : null}
                  item={item}
                  index={index}
                  isSelected={selectedItem === item.id}
                  onClick={() => {
                    console.log("Clicking item:", item.id);
                    selectItem(item.id);
                  }}
                  onDelete={() => removeItem(item.id)}
                />
              ));

            return (
              <CategoryGroup
                key={category.id}
                category={category}
                items={categoryItems}
                isExpanded={expandedCategories.includes(category.id)}
                onToggle={toggleCategory}
              />
            );
          })}
        </CategoriesContainer>
      </LeftPanelDiv>
    </PanelContainer>
  );
};

export default LeftPanel;
