import { USERS_FILE } from "../constants";
import { loadCache, updateInCache, readFromCache, getAllFromCache } from "../repo/json";
import type { UserData } from "../types";

// Загрузка данных в кеш при запуске
loadCache(USERS_FILE);

// Функция для обновления данных пользователя
export async function updateOrSave(userData: UserData): Promise<void> {
  const existingUser = readFromCache<UserData>(userData.id);

  if (!existingUser) {
    userData.joinedAt = new Date().toISOString();
  } else {
    userData.joinedAt = existingUser.joinedAt;
    userData.updatedAt = new Date().toISOString();
  }

  await updateInCache(USERS_FILE, userData.id, userData);
}

export async function findUser(userId: string): Promise<UserData | undefined> {
  return readFromCache<UserData>(userId);
}

export async function getAllUsers(): Promise<{ [key: string]: UserData }> {
  return getAllFromCache<UserData>();
}
