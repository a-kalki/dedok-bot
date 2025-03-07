import { Telegraf } from "telegraf";
import type { RunMode } from "./types";

export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Переменная окружения ${name} не задана`);
  }
  return value;
}

function getRunMode(): RunMode {
  const envMode = getEnvVar('NODE_ENV') as RunMode;
  const runModes: RunMode[] = ['test', 'production', 'development'];
  if (runModes.includes(envMode)) return envMode;
  throw Error(`NODE_ENV=${envMode} is not valid`);
}

export const MEMBERS_BOT_TOKEN = getEnvVar('MEMBERS_BOT_TOKEN');
export const MEMBERS_BOT_NAME = getEnvVar('MEMBERS_BOT_NAME');

export const DEDOK_GROUP_ID = getEnvVar('DEDOK_GROUP_ID');

export const DEDOK_GROUP_NAME = getEnvVar('DEDOK_GROUP_NAME');

export const USERS_FILE = "json/users.json";

export const membersBot = new Telegraf(MEMBERS_BOT_TOKEN);

export const botUrlSuffix = getEnvVar('FULL_DOMAIN') + '/bot';

export const runMode = getRunMode();
