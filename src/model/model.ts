import { log } from "console";
import { MyAllStorage } from "./storage";
import { MyAllLocalStorage } from "./MyAllLocalStorage";

import { MyAllDirectFileStorage } from "./MyAllDirectFileStorage";

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

export class Model {
  private items: Item[] = [];
  private categories: Category[] = [];
  public readonly storage: MyAllStorage;
  private listeners: (() => void)[] = [];
  private initialized: boolean = false;

  constructor(storage: MyAllStorage) {
    this.storage = storage;
    this.init();
  }

  private async init() {
    try {
      console.log("Initializing model..");
      this.items = await this.storage.getItems();
      this.categories = await this.storage.getCategories();
      this.initialized = true;
      this.notifyListeners();
    } catch (error) {
      console.error("Error initializing model:", error);
    }
  }

  async getItems(): Promise<Item[]> {
    if (!this.initialized) {
      this.items = await this.storage.getItems();
    }
    return this.items;
  }

  async getCategories(): Promise<Category[]> {
    if (!this.initialized) {
      this.categories = await this.storage.getCategories();
    }
    return this.categories;
  }

  async addItem(item: Omit<Item, "id">): Promise<Item> {
    const newItem = { ...item, id: Date.now() };
    this.items = [...this.items, newItem];
    await this.storage.saveItems(this.items);
    this.notifyListeners();
    return newItem;
  }

  async removeItem(id: number): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
    await this.storage.saveItems(this.items);
    this.notifyListeners();
  }

  moveItem(itemId: number, newCategoryId: number): void {
    const item = this.items.find((item) => item.id === itemId);
    if (item) {
      item.categoryId = newCategoryId;
      this.storage.saveItems(this.items);
      this.notifyListeners();
    }
  }

  async setThumbDataForUrl(url: string, thumbData: string): Promise<void> {
    await this.storage.setThumbDataForUrl(url, thumbData);
    this.notifyListeners();
  }

  async hasThumbData(url: string): Promise<boolean> {
    return (await this.storage.getThumbDataForUrl(url)) !== null;
  }

  async getThumbDataForUrl(url: string): Promise<string | null> {
    return await this.storage.getThumbDataForUrl(url);
  }

  addListener(listener: () => void) {
    this.listeners.push(listener);
    if (this.initialized) {
      listener(); // Call immediately if data is already loaded
    }
  }

  removeListener(listener: () => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

const USE_DIRECT_FILE_STORAGE = true;
let storage: MyAllStorage;
if (USE_DIRECT_FILE_STORAGE) {
  storage = new MyAllDirectFileStorage();
} else {
  storage = new MyAllLocalStorage();
}

export const model = new Model(storage);
export type { Item, Category };
