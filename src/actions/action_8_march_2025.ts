import { BOT, DEDOK_GROUP_ID, DEDOK_ACTIONS_TOPIC_ID } from "../constants";
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

async function actionsBotResult(): Promise<void> {
  const allUsers = await userRepo.getAll();
  const prizes = ['Кухонная доска', 'Недельный абонемент'];

  // Фильтруем пользователей, исключая игнорируемых
  const eligibleUsers = Object.values(allUsers).filter(user => !IGNORE_USERS_LIST.includes(user.id));

  // Считаем вес для каждого пользователя
  const usersWithWeight = calculateWeights(eligibleUsers);

  // Назначаем номера (лотерейные билеты) для каждого пользователя
  const usersWithTickets = assignTicketNumbers(usersWithWeight);

  // Выводим информацию об участниках
  let membersMsg = "Участники розыгрыша:\n";
  usersWithTickets.forEach(user => {
    membersMsg += `- ${user.firstName}, приглашенных: ${user.weight - 1}, вес: ${user.weight}, номера: ${user.ticketRange[0]}-${user.ticketRange[1]}\n`;
  });
  await sendTelegramMessage(membersMsg);

  // Проводим розыгрыш для каждого приза
  for (let prize of prizes) {
    let prizeMsg = `\nНачало розыгрыша приза: ${prize}`;
    const { winner, winningNumber } = pickPrizeWinner(usersWithTickets);
    prizeMsg += `\nВыпавший номер: ${winningNumber}\n`;
    prizeMsg += `Поздравляем, ${winner.firstName} выиграл(а) "${prize}"!`;
    await sendTelegramMessage(prizeMsg);
  };
}

// Функция для расчета веса пользователей
function calculateWeights(users: UserData[]): UserWithWeight[] {
  const userMap: Record<string, UserWithWeight> = {};

  // Инициализация пользователей с базовым весом 1
  users.forEach(user => {
    userMap[user.id] = { ...user, weight: 1, ticketRange: [0, 0] };
  });

  // Увеличение веса на основе приглашенных пользователей
  users.forEach(user => {
    if (user.invitedBy && userMap[user.invitedBy]) {
      userMap[user.invitedBy].weight += 1;
    }
  });

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

// Пример функции для отправки сообщения в Telegram (заглушка)
async function sendTelegramMessage(message: string): Promise<void> {
  await BOT.telegram.sendMessage(DEDOK_GROUP_ID, message, {
    message_thread_id: DEDOK_ACTIONS_TOPIC_ID,
  })
}

actionsBotResult();
