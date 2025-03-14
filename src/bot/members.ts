import { Context } from "telegraf";
import { BOT, MODE_IS_PROD } from "../constants";
import type { UserData } from "../types";
import { decodeUserId, generateReferralLink } from "./helper";
import { userRepo } from "../repo/user-repo";

export function membersBotHandlers(): void {
  // Обработка команды /start
  BOT.start(async (ctx: Context) => {
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

      await userRepo.updateOrSave(userData);

      // Отправляем пользователю сообщение с кнопкой для присоединения к группе
      const referrerUser = await userRepo.get(referrerId);
      let msg = 'Добро пожаловать в коворкинг мастерскую "Дедок"!\n\n';
      msg += `Зарегистрировавшись в нашем сообществе вы увеличите шансы пригласившего вас пользователя "${referrerUser?.firstName}" на выигрыш в розыгрыше.\n`;
      msg += 'А также тоже можете сами поучаствовать в нем.\n\n'
      msg += 'Участие в сообществе "Дедок" в первую очередь направлено на то, чтобы предоставить вам возможности своими руками сделать проекты, более подробно можете узнать в топике "О нас".\n\n'
      msg += `Ссылка на розыгрыш (и сообщество): https://t.me/ws_dedok/17/18`

      await ctx.reply(msg);
    } else {
      // Если команда /start вызвана без реферальной ссылки
      await ctx.reply("Наберите команду /referral для того чтобы приглашать знакомых в группу.");
    }
  });

  // Команда для получения реферальной ссылки
  BOT.command("referral", async (ctx: Context) => {
    if (ctx.chat?.type !== "private") {
      return ctx.reply("Эту команду можно использовать только в личных сообщениях с ботом.");
    }

    const userId = String(ctx.from?.id);

    // Генерируем новую реферальную ссылку
    const link = await generateReferralLink(userId);
    ctx.reply(`Ваша реферальная ссылка: ${link}`);
  });

  // Отслеживание новых участников
  BOT.on("new_chat_members", async (ctx: Context) => {
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

      await userRepo.updateOrSave(user);
    }
  });
}
