import { WorkerEnvSchema } from "@repo/common";

const envSchema = {
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  PORT: Number(process.env.PORT),
  REDIS_URL: process.env.REDIS_URL,
};

function shutdown(code: number): never {
  process.exit(code);
}
const parsedEnv = WorkerEnvSchema.safeParse(envSchema);
if (!parsedEnv.success) {
  console.error("!ENVIRONMENT VALIDATION FAILED!");
  for (const issue of parsedEnv.error.issues) {
    console.error(`-> ${issue.path.join(".")} : ${issue.message}`);
  }
  shutdown(1);
}

export default parsedEnv.data;
