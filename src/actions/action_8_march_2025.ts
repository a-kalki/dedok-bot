import { Telegraf } from "telegraf";
import { BOT, DEDOK_GROUP_ID, DEDOK_ACTIONS_TOPIC_ID, getEnvVar, MODE_IS_PROD } from "../constants";
import { userRepo } from "../repo/user-repo";
import type { UserData } from "../types";

const IGNORE_USERS_LIST: string[] = [
  '773084180', // Нурболат
  '470044301', // Асылбек
  '5101364386', // Султан (ученик программирования)
];

type UserWithWeight = UserData & {
  weight: number;
  ticketRange: [number, number]; // Диапазон номеров (лотерейных билетов)
};

// Функция для проверки, находится ли пользователь в группе
async function isUserInGroup(userId: string): Promise<boolean> {
  try {
    // и в dev и в prod режимах необходимо получить из реальной группы сообщества
    const bot = MODE_IS_PROD ? BOT : new Telegraf(getEnvVar('MEMBERS_BOT_TOKEN'));
    const groupId = MODE_IS_PROD ? DEDOK_GROUP_ID : getEnvVar('DEDOK_GROUP_ID');

    const member = await bot.telegram.getChatMember(groupId, +userId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch (error) {
    console.error(`Ошибка при проверке пользователя ${userId}:`, error);
    return false;
  }
}

async function actionsBotResult(prizes: string[]): Promise<void> {
  const allUsers = await userRepo.getAll();

  // Фильтруем пользователей, исключая игнорируемых и тех, кто не в группе
  const eligibleUsers = (await Promise.all(
    Object.values(allUsers).map(async (user) => {
      if (IGNORE_USERS_LIST.includes(user.id)) return null;
      const isInGroup = await isUserInGroup(user.id);
      return isInGroup ? user : null;
    })
  )).filter(user => user !== null) as UserData[];

  // Считаем вес для каждого пользователя
  const usersWithWeight = await calculateWeights(eligibleUsers);

  // Назначаем номера (лотерейные билеты) для каждого пользователя
  const usersWithTickets = assignTicketNumbers(usersWithWeight);

  // Выводим информацию об участниках
  let membersMsg = "Участники розыгрыша:\n";
  usersWithTickets.forEach(user => {
    const ticketRange = user.weight === 1 
      ? `номер: ${user.ticketRange[0]}` 
      : `номера: ${user.ticketRange[0]}-${user.ticketRange[1]}`;
    membersMsg += `  - ${user.firstName}, привел(а): ${user.weight - 1}, вес: ${user.weight}, ${ticketRange}\n`;
  });
  await sendTelegramMessage(membersMsg);

  // Проводим розыгрыш для каждого приза
  let remainingUsers = [...usersWithTickets]; // Копируем массив участников
  for (let prize of prizes) {
    if (remainingUsers.length === 0) {
      await sendTelegramMessage(`\nНет участников для розыгрыша приза: ${prize}`);
      continue;
    }

    let prizeMsg = `\nНачало розыгрыша приза: ${prize}`;
    const { winner, winningNumber } = pickPrizeWinner(remainingUsers);
    prizeMsg += `\nВыпавший номер: ${winningNumber}\n`;
    prizeMsg += `Поздравляем, ${winner.firstName} выиграл(а) "${prize}"!`;
    await sendTelegramMessage(prizeMsg);

    // Удаляем победителя из списка участников
    remainingUsers = remainingUsers.filter(user => user.id !== winner.id);
  }
}

// Функция для расчета веса пользователей
async function calculateWeights(users: UserData[]): Promise<UserWithWeight[]> {
  const userMap: Record<string, UserWithWeight> = {};

  // Инициализация пользователей с базовым весом 1
  for (const user of users) {
    userMap[user.id] = { ...user, weight: 1, ticketRange: [0, 0] };
  }

  // Увеличение веса на основе приглашенных пользователей
  for (const user of users) {
    if (user.invitedBy && userMap[user.invitedBy]) {
      // Проверяем, находится ли приглашенный в группе
      const isInvitedInGroup = await isUserInGroup(user.id);
      if (isInvitedInGroup) {
        userMap[user.invitedBy].weight += 1;
      }
    }
  }

  return Object.values(userMap);
}

// Функция для назначения номеров (лотерейных билетов)
function assignTicketNumbers(users: UserWithWeight[]): UserWithWeight[] {
  let currentTicketNumber = 1;

  return users.map(user => {
    const start = currentTicketNumber;
    const end = currentTicketNumber + user.weight - 1;
    currentTicketNumber = end + 1;
    return { ...user, ticketRange: [start, end] };
  });
}

// Функция для выбора победителя с учетом веса и номеров
function pickPrizeWinner(users: UserWithWeight[]): { winner: UserWithWeight; winningNumber: number } {
  if (users.length === 0) {
    throw new Error("Массив пользователей не должен быть пустым");
  }

  // Считаем общий вес (количество всех номеров)
  const totalWeight = users.reduce((sum, user) => sum + user.weight, 0);

  // Генерируем случайный номер в диапазоне от 1 до общего веса
  const winningNumber = Math.floor(Math.random() * totalWeight) + 1;

  // Определяем, какому пользователю принадлежит выпавший номер
  for (const user of users) {
    const [start, end] = user.ticketRange;
    if (winningNumber >= start && winningNumber <= end) {
      return { winner: user, winningNumber };
    }
  }

  console.log('Не удалось выбрать победителя! Проверить логику функции pickPrizeWinner. Возвращаем первого пользователя.');
  return { winner: users[0], winningNumber: 1 };
}

// Функция для отправки сообщения в Telegram
async function sendTelegramMessage(message: string): Promise<void> {
  await BOT.telegram.sendMessage(DEDOK_GROUP_ID, message, {
    message_thread_id: DEDOK_ACTIONS_TOPIC_ID,
  });
}

actionsBotResult(['Кухонная доска', 'Недельный абонемент']);
