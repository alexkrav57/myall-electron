import { initialCategories, initialItems } from "./initialData";
import { Category, Item } from "./model";
import { MyAllStorage } from "./storage";

declare global {
  interface Window {
    electronAPI: {
      getStoragePath: () => Promise<string>;
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, data: string) => Promise<void>;
      fileExists: (path: string) => Promise<boolean>;
      createDirectory: (path: string) => Promise<void>;
      deleteFile: (path: string) => Promise<void>;
    };
  }
}

export class MyAllDirectFileStorage implements MyAllStorage {
  private dataPath: string | null = null;
  private initPromise: Promise<void>;
  private readonly ITEMS_FILE = "myall-items.json";
  private readonly CATEGORIES_FILE = "myall-categories.json";
  private readonly THUMBS_DIR = "thumbnails";

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize() {
    this.dataPath = await window.electronAPI.getStoragePath();
    await this.ensureDirectories();
  }

  private async ensureDirectories() {
    if (!this.dataPath) throw new Error("Storage not initialized");
    await window.electronAPI.createDirectory(this.dataPath);
    await window.electronAPI.createDirectory(
      `${this.dataPath}/${this.THUMBS_DIR}`
    );
  }

  private async ensureInitialized() {
    if (!this.dataPath) {
      await this.initPromise;
    }
    if (!this.dataPath) throw new Error("Storage not initialized");
  }

  async getItems(): Promise<Item[]> {
    try {
      await this.ensureInitialized();
      const filePath = `${this.dataPath}/${this.ITEMS_FILE}`;
      const exists = await window.electronAPI.fileExists(filePath);
      if (!exists) {
        return initialItems;
      }
      const data = await window.electronAPI.readFile(filePath);
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading items:", error);
      return [];
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const filePath = `${this.dataPath}/${this.CATEGORIES_FILE}`;
      const exists = await window.electronAPI.fileExists(filePath);
      if (!exists) {
        return initialCategories;
      }
      const data = await window.electronAPI.readFile(filePath);
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      return [];
    }
  }

  async saveItems(items: Item[]): Promise<void> {
    try {
      const filePath = `${this.dataPath}/${this.ITEMS_FILE}`;
      await window.electronAPI.writeFile(
        filePath,
        JSON.stringify(items, null, 2)
      );
    } catch (error) {
      console.error("Error saving items:", error);
      throw error;
    }
  }

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      const filePath = `${this.dataPath}/${this.CATEGORIES_FILE}`;
      await window.electronAPI.writeFile(
        filePath,
        JSON.stringify(categories, null, 2)
      );
    } catch (error) {
      console.error("Error saving categories:", error);
      throw error;
    }
  }

  async getThumbDataForUrl(url: string): Promise<string | null> {
    try {
      const thumbPath = `${this.dataPath}/${
        this.THUMBS_DIR
      }/${this.urlToFilename(url)}`;
      const exists = await window.electronAPI.fileExists(thumbPath);
      if (!exists) {
        return null;
      }
      return await window.electronAPI.readFile(thumbPath);
    } catch (error) {
      console.error("Error loading thumbnail:", error);
      return null;
    }
  }

  async setThumbDataForUrl(url: string, thumbData: string): Promise<void> {
    try {
      const thumbPath = `${this.dataPath}/${
        this.THUMBS_DIR
      }/${this.urlToFilename(url)}`;
      await window.electronAPI.writeFile(thumbPath, thumbData);
    } catch (error) {
      console.error("Error saving thumbnail:", error);
    }
  }

  async removeThumbDataForUrl(url: string): Promise<void> {
    try {
      const thumbPath = `${this.dataPath}/${
        this.THUMBS_DIR
      }/${this.urlToFilename(url)}`;
      const exists = await window.electronAPI.fileExists(thumbPath);
      if (exists) {
        await window.electronAPI.deleteFile(thumbPath);
      }
    } catch (error) {
      console.error("Error removing thumbnail:", error);
    }
  }

  private urlToFilename(url: string): string {
    return btoa(encodeURIComponent(url)) + ".txt";
  }
}
