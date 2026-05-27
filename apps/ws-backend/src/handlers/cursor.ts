import { HandlerContext, RedisData } from "../types";
import { sendJson } from "../helpers/ws.helper";
import { ServerCursorSchemaType } from "@repo/common";
import { redisPub } from "@repo/redis";

export async function CURSOR({
  ws,
  roomId,
  cleanData,
  userId,
}: HandlerContext) {
  if (cleanData.type !== "CURSOR") return;
  const pubSubData: RedisData = {
    userId: userId,
    type: "CURSOR",
    coordinates: cleanData.payload,
  };
  redisPub.publish(`room:${roomId}:events`, JSON.stringify(pubSubData));
}
