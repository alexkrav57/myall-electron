import React, { useEffect, useRef, useState, forwardRef } from "react";
//import { Draggable } from "react-beautiful-dnd";
//import { motion } from "framer-motion";
import styled from "styled-components";
import { model } from "../model/model";

interface Item {
  id: number;
  title: string;
  description: string;
  url: string;
  icon: string;
}

export interface ListItemProps {
  item: Item;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

interface StyledItemProps {
  $isDragging?: boolean;
  $isSelected: boolean;
}

const StyledItem = styled.div<StyledItemProps>`
  display: flex;
  align-items: center;
  padding: 8px;
  padding-right: 32px;
  margin: 4px;
  background-color: ${({ $isDragging = false, $isSelected }) =>
    $isDragging ? "#e0e0e0" : $isSelected ? "#f0f040" : "white"};
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;

  &:hover {
    background-color: ${({ $isSelected }) =>
      $isSelected ? "#e0e000" : "#f0f0d0"};
  }
`;

//const MotionWrapper = styled(motion.div)``;

const Icon = styled.span`
  font-size: 24px;
  margin-right: 12px;
  margin-left: 20px;
`;

const Thumbnail = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
  margin-left: 20px;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.div`
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  width: 100%;
`;

const Description = styled.div`
  font-size: 0.9em;
  color: #666;
`;

const DeleteButton = styled.button`
  position: absolute;
  right: 12px;
  top: 12px;
  transform: translateY(-50%);
  opacity: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  padding: 4px 8px;
  transition: opacity 0.2s, color 0.2s;
  z-index: 1;

  &:hover {
    color: #ff0000;
    font-weight: 700;
  }
`;

const ItemContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;

  &:hover ${DeleteButton} {
    opacity: 1;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  width: 100%;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

const Button = styled.button<{ $isDelete?: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${(props) => (props.$isDelete ? "#ff4444" : "#e0e0e0")};
  color: ${(props) => (props.$isDelete ? "white" : "black")};

  &:hover {
    background-color: ${(props) => (props.$isDelete ? "#ff0000" : "#d0d0d0")};
  }
`;

const ListItem = forwardRef<HTMLDivElement, ListItemProps>((props, ref) => {
  const { item, index, isSelected, onClick, onDelete } = props;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [thumbnailData, setThumbnailData] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  model.hasThumbData(item.url).then((hasThumbnail) => {
    if (hasThumbnail) {
      model.getThumbDataForUrl(item.url).then((data) => {
        setThumbnailData(data);
      });
    }
  });

  return (
    <>
      {/* <Draggable draggableId={`item-${item.id}`} index={index}> */}
      <ItemContainer ref={ref}>
        <StyledItem onClick={onClick} $isSelected={isSelected}>
          {thumbnailData ? (
            <Thumbnail src={thumbnailData} alt={item.title} />
          ) : (
            <Icon>{item.icon}</Icon>
          )}
          <Content>
            <Title>{item.title}</Title>
            <Description>{item.description}</Description>
          </Content>
        </StyledItem>
        <DeleteButton onClick={handleDelete}>×</DeleteButton>
      </ItemContainer>
      {/* </Draggable> */}

      {showDeleteModal && (
        <ModalOverlay onClick={() => setShowDeleteModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Delete Item</h3>
            <p>Are you sure you want to delete "{item.title}"?</p>
            <ModalButtons>
              <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button $isDelete onClick={confirmDelete}>
                Delete
              </Button>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
});

export default ListItem;
