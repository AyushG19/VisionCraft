import { removeUserFromRoom } from "@repo/db";
import { sendInfo } from "../helpers/ws.helper";
import {
  ensureRoomSubscription,
  removeUserFromRoomRegistry,
  touchRoom,
} from "../room/room.lifecycle";
import { roomRegistry } from "../room/room.state";
import { HandlerContext, RedisData } from "../types";
import { redisPub } from "@repo/redis";

export async function JOIN_ROOM({ ws, roomId, userId }: HandlerContext) {
  await ensureRoomSubscription(roomId);

  if (!roomRegistry.has(roomId)) {
    roomRegistry.set(roomId, new Map());
  }
  roomRegistry.get(roomId)!.set(userId, { socket: ws, joinedAt: Date.now() });
  touchRoom(roomId);

  const pubData: RedisData = { type: "JOIN", userId, time: Date.now() };
  redisPub.publish(`room:${roomId}:events`, JSON.stringify(pubData)),
    sendInfo(ws, "Room joined successfully");
}

export async function LEAVE_ROOM({ ws, roomId, userId }: HandlerContext) {
  ws.close(1000, "User left room");
}
