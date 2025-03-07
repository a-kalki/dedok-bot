import { runMode } from "./constants";
import { runMembersBot, stopMembersBot } from "./bot/members";

function main(): void {
  runMembersBot(runMode);
  // runActionsBot();
}

async function stop(): Promise<void> {
  stopMembersBot(runMode);
  // stopActionsBot();
}

main();

// Обработчик завершения работы
process.once("SIGINT", async () => {
  await stop();
});
process.once("SIGTERM", async () => {
  await stop();
});
