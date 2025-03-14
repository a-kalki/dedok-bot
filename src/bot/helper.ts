import { BOT, BOT_NAME, BOT_URL_SUFFIX, MODE_IS_PROD } from "../constants";
import type { RunMode } from "../types";
import { generalBotHandlers } from "./general";
import { membersBotHandlers } from "./members";

// Функция для кодирования userId в Base64
export function encodeUserId(userId: string): string {
  return Buffer.from(userId).toString("base64url"); // Используем base64url для URL
}

// Функция для декодирования userId из Base64
export function decodeUserId(encodedUserId: string): string {
  return Buffer.from(encodedUserId, "base64url").toString("utf8");
}

// Функция для создания индивидуальной реферальной ссылки
export async function generateReferralLink(userId: string): Promise<string | null> {
  const refLink = `https://t.me/${BOT_NAME}?start=ref_${encodeUserId(userId)}`;
  return refLink;
}

// Запуск бота
export async function runBot(): Promise<void> {
  if (MODE_IS_PROD) {
    console.log('Установка webhook бота:', BOT_NAME);
    await BOT.telegram.setWebhook(BOT_URL_SUFFIX + "/" + BOT_NAME)
    console.log('webhook бота установлен:', BOT_NAME)
  }

  // устанавливаем обработчики
  membersBotHandlers();
  generalBotHandlers();

  BOT.launch();
  console.log(`🚀 Бот ${BOT_NAME} запущен!`);
}

export async function stopBot(): Promise<void> {
  if (MODE_IS_PROD) {
    console.log('Удаление webhook бота:', BOT_NAME);
    await BOT.telegram.deleteWebhook()
    console.log('webhook бота удален:', BOT_NAME)
  }

  BOT.stop();
  console.log(`🚀 Бот ${BOT_NAME} остановлен!`);
}
