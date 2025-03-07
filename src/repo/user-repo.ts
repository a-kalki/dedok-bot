import { USERS_FILE } from "../constants";
import { readFromFile, pushToFile, saveToFile } from "../repo/json";
import type { UserData } from "../types";

// Функция для обновления данных пользователя
export async function updateOrSave(userData: UserData): Promise<void> {
  const allUsers = await getAllUsers();
  const existingUserIndex = allUsers.findIndex((user) => user.id === userData.id);

  if (existingUserIndex === -1) {
    userData.joinedAt = new Date().toISOString();
    await pushToFile(USERS_FILE, userData);
    return;
  }

  const findedUser = allUsers[existingUserIndex];
  allUsers[existingUserIndex] = {
    ...findedUser,
    ...userData,
  };
  await saveToFile(USERS_FILE, allUsers);
}

export async function findUser(userId: string): Promise<UserData | undefined> {
  return (await getAllUsers()).find((user) => user.id === userId);
}

export async function getAllUsers(): Promise<UserData[]> {
  return await readFromFile<UserData>(USERS_FILE) || [];
}
