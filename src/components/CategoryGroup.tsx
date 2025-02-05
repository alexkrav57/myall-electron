import React from "react";
import styled from "styled-components";

const GroupContainer = styled.div`
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  background-color: #f5f5f5;

  &:hover {
    background-color: #e8e8e8;
  }
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  margin-right: 8px;
  transform: ${(props) => (props.$isExpanded ? "rotate(90deg)" : "rotate(0)")};
  transition: transform 0.2s ease;
`;

const Title = styled.h3`
  margin: 0;
  flex: 1;
  font-size: 14px;
`;

const ItemCount = styled.span`
  padding: 2px 6px;
  background-color: #e0e0e0;
  border-radius: 10px;
  font-size: 12px;
`;

const ItemsContainer = styled.div`
  padding: 8px;
`;

const EmptyMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: #666;
  font-style: italic;
`;

interface Category {
  id: number | string;
  name: string;
}

interface CategoryGroupProps {
  category: Category;
  items: React.ReactNode[];
  isExpanded: boolean;
  onToggle: (id: number) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  items,
  isExpanded,
  onToggle,
}) => {
  return (
    <GroupContainer>
      <Header onClick={() => onToggle(category.id as number)}>
        <ExpandIcon $isExpanded={isExpanded}>▶</ExpandIcon>
        <Title>{category.name}</Title>
        <ItemCount>{items.length}</ItemCount>
      </Header>
      {isExpanded && (
        <ItemsContainer>
          {items}
          {items.length === 0 && <EmptyMessage>Drop items here</EmptyMessage>}
        </ItemsContainer>
      )}
    </GroupContainer>
  );
};

export default CategoryGroup;
