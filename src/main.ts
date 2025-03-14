import { runBot, stopBot } from "./bot/helper";

function main(): void {
  runBot();
}

async function stop(): Promise<void> {
  await stopBot();
}

main();

// Обработчик завершения работы
process.once("SIGINT", async () => {
  await stop();
});
process.once("SIGTERM", async () => {
  await stop();
});
