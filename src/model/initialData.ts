import { Category, Item } from "./model";

const initialItems: Item[] = [
  {
    id: 1,
    categoryId: 1,
    title: "Гугл",
    description: "google.com",
    url: "https://google.com",
    icon: "👀",
  },
  {
    id: 2,
    categoryId: 1,
    title: "Яндекс",
    description: "yandex.ru",
    url: "https://yandex.ru",
    icon: "🔍",
  },
  {
    id: 3,
    categoryId: 2,
    title: "Иносми",
    description: "inoshmi.ru",
    url: "https://inosmi.ru",
    icon: "🌍",
  },
  {
    id: 4,
    categoryId: 2,
    title: "СтранаUA",
    description: "strana.ua",
    url: "https://strana.today",
    icon: "🇺🇦",
  },
  {
    id: 5,
    categoryId: 3,
    title: "MyAll Chat",
    description: "Misha, Sasha & Alex",
    url: "https://www.facebook.com/messages/t/8699950900038782/",
    icon: "✋",
  },
  {
    id: 6,
    categoryId: 1,
    title: "Chrome Extensions",
    description: "extensions.chrome.com",
    url: "chrome://extensions/",
    icon: "🖥️",
  },
  {
    id: 7,
    categoryId: 3,
    title: "Вопросы (Google Docs)",
    description: "docs.google.com",
    url: "https://docs.google.com/document/d/1PH2g2U36aE7-ddFed7iCIhMJuWVgkCg_NuDcsVU24Fg/edit?usp=sharing",
    icon: "💾",
  },
];

const initialCategories: Category[] = [
  { id: 1, name: "Избранное" },
  { id: 2, name: "Мировые новости" },
  { id: 3, name: "Обсуждения" },
  { id: 4, name: "New Items" },
];

export { initialItems, initialCategories };
