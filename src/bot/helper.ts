import { MEMBERS_BOT_NAME } from "../constants";

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
  const refLink = `https://t.me/${MEMBERS_BOT_NAME}?start=ref_${encodeUserId(userId)}`;
  return refLink;
}
