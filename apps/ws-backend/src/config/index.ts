import env from "../env";

export const corsMap = new Map<string, string>([
  ["Access-Control-Allow-Origin", env.FRONTEND_URL],
  ["Access-Control-Allow-Methods", "GET, POST, OPTIONS"],
  ["Access-Control-Allow-Headers", "Content-Type, Authorization"],
]);
export const refreshSecret = env.JWT_SECRET;
