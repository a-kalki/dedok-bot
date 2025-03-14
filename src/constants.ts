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

function throwErr(): never {
  throw Error('При загрузке переменных окружения произошла ошибка');
}

export const RUN_MODE = getRunMode();

export const MODE_IS_PROD = RUN_MODE === 'production';

export const BOT_TOKEN = getEnvVar(MODE_IS_PROD ? 'MEMBERS_BOT_TOKEN' : 'DEDOK_TEST_BOT_TOKEN');

export const BOT_NAME = getEnvVar(MODE_IS_PROD ? 'MEMBERS_BOT_NAME' : 'DEDOK_TEST_BOT_NAME');

export const DEDOK_GROUP_ID = getEnvVar(MODE_IS_PROD ? 'DEDOK_GROUP_ID': 'DEDOK_TEST_GROUP_ID');

export const DEDOK_GROUP_NAME = getEnvVar(MODE_IS_PROD ? 'DEDOK_GROUP_NAME' : 'DEDOK_TEST_GROUP_NAME');

export const DEDOK_ACTIONS_TOPIC_ID = Number(getEnvVar(
  MODE_IS_PROD ? 'DEDOK_ACTIONS_TOPIC_ID' : 'DEDOK_TEST_ACTIONS_TOPIC_ID'
));

export const USERS_FILE = "json/users.json";

export const BOT = new Telegraf(BOT_TOKEN);

export const BOT_URL_SUFFIX = getEnvVar('FULL_DOMAIN') + '/bot';
