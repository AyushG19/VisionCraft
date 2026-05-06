import { wsEnv } from "@repo/common";

function shutdown(code: number): never {
  console.log("[WS] Error in env");
  process.exit(code);
}
const envSchema = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT),
  JWT_SECRET: process.env.JWT_SECRET,
  BCRYPT_SALT: process.env.BCRYPT_SALT,
  FRONTEND_URL: process.env.FRONTEND_URL,
  RS_HOST: process.env.RS_HOST,
  RS_PORT: Number(process.env.RS_PORT),
  RS_USERNAME: process.env.RS_USERNAME,
  RS_PASSWORD: process.env.RS_PASSWORD,
  EMPTY_ROOM_TTL_MS: Number(process.env.EMPTY_ROOM_TTL_MS),
  ROOM_IDLE_TTL_MS: Number(process.env.ROOM_IDLE_TTL_MS),
  SWEEP_INTERVAL_MS: Number(process.env.SWEEP_INTERVAL_MS),
};
const parsedEnv = wsEnv.safeParse(envSchema);
if (!parsedEnv.success) {
  console.error("[WS] ENViRONMENT VALIDATION FAILED!");
  for (const issue of parsedEnv.error.issues) {
    console.log(`->${issue.path.join(".")} : ${issue.message}`);
  }
  shutdown(1);
}

export default parsedEnv.data;
