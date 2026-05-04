import { WebEnv } from "@repo/common";

function shutdown(message: string, error?: unknown): never {
  console.error(message);
  if (error) console.error(error);
  process.exit(1);
}

console.log("running this in : ", process.env.NODE_ENV, " mode.");
const envInput = {
  NODE_ENV: process.env.NODE_ENV,

  HTTP_BACKEND_URL: process.env.NEXT_PUBLIC_HTTP_BACKEND_URL,

  WS_BACKEND_URL: process.env.NEXT_PUBLIC_WS_BACKEND_URL,

  WORKER_BACKEND_URL: process.env.NEXT_PUBLIC_WORKER_BACKEND_URL,

  CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUD_NAME,
};

const parsed = WebEnv.safeParse(envInput);

if (!parsed.success) {
  console.error("WEB ENVIRONMENT VALIDATION FAILED");
  for (const issue of parsed.error.issues) {
    console.error(`• ${issue.path.join(".")} → ${issue.message}`);
  }
  shutdown("Invalid environment variables");
}

export default parsed.data;
