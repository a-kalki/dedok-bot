import type { Context } from "telegraf";
import { BOT, MODE_IS_PROD } from "../constants";

export function generalBotHandlers(): void {
  BOT.on('text', async (ctx: Context, next) => {
    if (!MODE_IS_PROD) console.log('on text: ', JSON.stringify(ctx.message, null, 2));
    await next();
  })
}
