import { Context } from "telegraf";
import { membersBot, botUrlSuffix } from "../constants";
import type { RunMode, UserData } from "../types";
import { decodeUserId, generateReferralLink } from "./helper";
import { findUser, updateOrSave } from "../repo/user-repo";

// Обработка команды /start
membersBot.start(async (ctx: Context) => {
  const id = String(ctx.from?.id);
  const firstName = ctx.from?.first_name || "Нет имени";
  const username = ctx.from?.username;

  const userData: UserData = { id, firstName, username };

  // @ts-expect-error
  const startParams = ctx.startPayload; // Параметр из ссылки, например, ref_12345
  // Если есть параметр ref_*, сохраняем информацию о приглашающем
  if (startParams && startParams.startsWith("ref_")) {
    const referrerId = decodeUserId(startParams.split("_")[1]); // Извлекаем ID приглашающего
    userData.invitedBy = referrerId;

    await updateOrSave(userData);

    // Отправляем пользователю сообщение с кнопкой для присоединения к группе
    const referrerUser = await findUser(referrerId);
    let msg = 'Добро пожаловать в коворкинг мастерскую "Дедок"!\n\n';
    msg += `Зарегистрировавшись в нашем сообществе вы увеличите шансы "${referrerUser?.firstName}" на выигрыш в розыгрыше.\n`;
    msg += 'А также тоже можете участвовать в нашем розыгрыше. Подробности по ссылке ниже.\n\n'
    msg += `Ссылка на акцию: https://t.me/ws_dedok/17/18`

    await ctx.reply(msg);
  } else {
    // Если команда /start вызвана без реферальной ссылки
    await ctx.reply("Наберите команду /referral для того чтобы приглашать знакомых в группу.");
  }
});

// Команда для получения реферальной ссылки
membersBot.command("referral", async (ctx: Context) => {
  if (ctx.chat?.type !== "private") {
    return ctx.reply("Эту команду можно использовать только в личных сообщениях с ботом.");
  }

  const userId = String(ctx.from?.id);

  // Генерируем новую реферальную ссылку
  const link = await generateReferralLink(userId);
  ctx.reply(`Ваша реферальная ссылка: ${link}`);
});

// Отслеживание новых участников
membersBot.on("new_chat_members", async (ctx: Context) => {
  // @ts-expect-error
  const newMembers = ctx.message?.new_chat_members;
  if (!newMembers) return;

  for (const member of newMembers) {
    if (member.is_bot) continue; // Пропускаем ботов
    
    const user: UserData = {
        id: String(member.id),
        firstName: member.first_name || "Нет имени",
        username: member.username,
    }

    await updateOrSave(user);
  }
});

// Запуск бота
export function runMembersBot(runMode: RunMode): void {
  if (runMode === 'production')
    membersBot.telegram.setWebhook(botUrlSuffix + "/dedok_members_bot");
  membersBot.launch().then(() => console.log("🚀 Бот dedok_members_bot запущен!"));
}

export function stopMembersBot(runMode: RunMode): void {
  if (runMode === 'production')
    membersBot.telegram.deleteWebhook();

  membersBot.stop();
  console.log("🚀 Бот dedok_members_bot остановлен!");
}
