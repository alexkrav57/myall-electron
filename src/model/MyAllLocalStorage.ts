import { initialCategories, initialItems } from "./initialData";
import { Category, Item } from "./model";
import { MyAllStorage } from "./storage";

export class MyAllLocalStorage implements MyAllStorage {
  private readonly ITEMS_KEY = "myall-items";
  private readonly CATEGORIES_KEY = "myall-categories";

  async getItems(): Promise<Item[]> {
    try {
      const itemsJson = localStorage.getItem(this.ITEMS_KEY);
      return itemsJson ? JSON.parse(itemsJson) : initialItems;
    } catch (error) {
      console.error("Error loading items:", error);
      return [];
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const categoriesJson = localStorage.getItem(this.CATEGORIES_KEY);
      return categoriesJson ? JSON.parse(categoriesJson) : initialCategories;
    } catch (error) {
      console.error("Error loading categories:", error);
      return [];
    }
  }

  async saveItems(items: Item[]): Promise<void> {
    try {
      localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving items:", error);
      throw error;
    }
  }

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error("Error saving categories:", error);
      throw error;
    }
  }

  async getThumbDataForUrl(url: string): Promise<string | null> {
    return localStorage.getItem(url);
  }

  async setThumbDataForUrl(url: string, thumbData: string): Promise<void> {
    localStorage.setItem(url, thumbData);
  }

  async removeThumbDataForUrl(url: string): Promise<void> {
    localStorage.removeItem(url);
  }
}
