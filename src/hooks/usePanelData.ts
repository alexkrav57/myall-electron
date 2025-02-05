import { useState, useCallback, useEffect } from "react";
import { model, Item, Category } from "../model/model";

export function usePanelData() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([1]);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnailUpdate, setThumbnailUpdate] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [loadedItems, loadedCategories] = await Promise.all([
          await model.getItems(),
          await model.getCategories(),
        ]);
        console.log("Loaded items in hook:", loadedItems);
        console.log("Loaded categories in hook:", loadedCategories);
        setItems(loadedItems);
        setCategories(loadedCategories);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadData();

    // Subscribe to updates
    const updateData = async () => {
      const [updatedItems, updatedCategories] = await Promise.all([
        model.getItems(),
        model.getCategories(),
      ]);
      setItems(updatedItems);
      setCategories(updatedCategories);
    };

    model.addListener(updateData);
    return () => model.removeListener(updateData);
  }, []);

  const addItem = async (item: Omit<Item, "id">) => {
    const newItem = await model.addItem(item);
    // Update local state with the new item
    setItems((prevItems) => [...prevItems, newItem]);
    return newItem; // Make sure to return the new item
  };

  const selectItem = useCallback((itemId: number) => {
    setSelectedItem(itemId);
  }, []);

  const removeItem = async (id: number) => {
    await model.removeItem(id);
  };

  const deleteItem = (itemId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    // If you're using chrome.storage, also update there
    // chrome.storage.local.get(["items"], (result) => {
    //   const storedItems = result.items || [];
    //   const updatedItems = storedItems.filter((item) => item.id !== itemId);
    //   chrome.storage.local.set({ items: updatedItems });
    // });
  };

  const toggleCategory = useCallback(
    (categoryId: number) => {
      setExpandedCategories((prev) => {
        const isExpanding = !prev.includes(categoryId);
        if (!isExpanding) {
          // If we're collapsing the category, check if selected item is in it
          const selectedItemData = items.find(
            (item) => item.id === selectedItem
          );
          if (selectedItemData && selectedItemData.categoryId === categoryId) {
            // Clear selection if the selected item is in this category
            setSelectedItem(null);
          }
        }
        return isExpanding
          ? [...prev, categoryId]
          : prev.filter((id) => id !== categoryId);
      });
    },
    [items, selectedItem]
  );

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const newCategoryId = parseInt(
      result.destination.droppableId.split("-")[1]
    );
    const itemId = parseInt(result.draggableId.split("item-")[1]);
    model.moveItem(itemId, newCategoryId);
  }, []);

  const refreshThumbnails = useCallback(() => {
    setThumbnailUpdate((prev) => prev + 1);
  }, []);

  return {
    categories,
    items,
    selectedItem,
    expandedCategories,
    addItem,
    selectItem,
    removeItem,
    toggleCategory,
    handleDragEnd,
    isLoading,
    refreshThumbnails,
  };
}

export default usePanelData;
