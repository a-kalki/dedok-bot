import { runMode } from "./constants";
import { runMembersBot, stopMembersBot } from "./bot/members";

function main(): void {
  runMembersBot(runMode);
}

async function stop(): Promise<void> {
  stopMembersBot(runMode);
}

main();

// Обработчик завершения работы
process.once("SIGINT", async () => {
  await stop();
});
process.once("SIGTERM", async () => {
  await stop();
});
