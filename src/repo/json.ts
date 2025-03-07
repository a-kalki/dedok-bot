import fs from "fs-extra";

// Функция добавления новых данных в файл
export async function pushToFile<T>(filePath: string, data: T): Promise<void> {
  let existingData: T[] = [];
  if (await fs.pathExists(filePath)) {
    existingData = await fs.readJson(filePath);
  }
  existingData.push(data);
  await fs.writeJson(filePath, existingData, { spaces: 2 });
}

// Функция сохранения данных в файл
export async function saveToFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeJson(filePath, data, { spaces: 2 });
}

export async function readFromFile<T>(filePath: string): Promise<T[]> {
  if (!(await fs.pathExists(filePath))) {
    return [];
  }
  return await fs.readJson(filePath);
}
