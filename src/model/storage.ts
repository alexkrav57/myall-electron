import { Category, Item } from "./model";

export interface MyAllStorage {
  getItems(): Promise<Item[]>;
  getCategories(): Promise<Category[]>;
  saveItems(items: Item[]): Promise<void>;
  saveCategories(categories: Category[]): Promise<void>;
  getThumbDataForUrl(url: string): Promise<string | null>;
  setThumbDataForUrl(url: string, thumbData: string): Promise<void>;
  removeThumbDataForUrl(url: string): Promise<void>;
}
