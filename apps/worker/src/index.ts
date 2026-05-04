import { createWorker, initQueue } from "@repo/queue";
import { processor } from "./processor/processor";
import { server } from "./server";
import env from "./env";

initQueue(env.REDIS_URL);
const worker = createWorker(processor);

worker.on("completed", (job) => {
  console.log(`[Worker] ${job.name} completed - id: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.log(`[Worker] ${job?.name} completed - id: ${job?.id}`, err);
});

async function shutdown() {
  console.log("[Worker] Shutting down...");
  await worker.close();

  process.exit(0);
}

server.listen(env.PORT, () => {
  console.log(`[Worker] server is running on port : ${env.PORT}`);
});

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
