import fs from "fs-extra";

// Кеш для хранения данных в памяти
let cache: { [key: string]: any } = {};

// Функция для загрузки данных из файла в кеш
export async function loadCache(filePath: string): Promise<void> {
  if (await fs.pathExists(filePath)) {
    cache = await fs.readJson(filePath);
  } else {
    cache = {};
  }
}

// Функция для сохранения данных из кеша в файл
export async function saveCache(filePath: string): Promise<void> {
  await fs.writeJson(filePath, cache, { spaces: 2 });
}

// Функция для добавления или обновления данных в кеше
export async function updateInCache<T>(filePath: string, key: string, data: T): Promise<void> {
  cache[key] = data;
  await saveCache(filePath);
}

// Функция для чтения данных из кеша
export function readFromCache<T>(key: string): T | undefined {
  return cache[key];
}

// Функция для получения всех данных из кеша
export function getAllFromCache<T>(): { [key: string]: T } {
  return cache;
}
