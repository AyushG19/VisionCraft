import { deleteRoom } from "@repo/db";
import {
  EMPTY_ROOM_TTL_MS,
  roomMeta,
  roomRegistry,
  subscribedRooms,
} from "./room.state";
import { convertToSocketData } from "../util/convertToSocketData";
import { CustomWs, RedisData } from "../types";
import { redisPub, redisSub } from "@repo/redis";
import { broadcastToRoom } from "../helpers/ws.helper";
import { WebSocketServer } from "ws";

/** Record activity so the idle sweeper resets the clock. */
export function touchRoom(roomId: string): void {
  const meta = roomMeta.get(roomId);
  if (meta) meta.lastActivity = Date.now();
}

/** Delete every Redis key that belongs to a room. */
async function purgeRoomFromRedis(roomId: string): Promise<void> {
  const keys = [
    `room:${roomId}:events`,
    `room:${roomId}:users`,
    `room:${roomId}:shapes`,
    `room:${roomId}:chats`,
  ];
  // DEL accepts multiple keys in one round-trip
  await redisPub.del(keys);
  console.log(`[Cleanup] Purged Redis keys for room ${roomId}`);
}

/** Unsubscribe from a room's event channel and remove it from local state. */
async function teardownRoomSubscription(roomId: string): Promise<void> {
  if (!subscribedRooms.has(roomId)) return;
  await redisSub.unsubscribe(`room:${roomId}:events`);
  subscribedRooms.delete(roomId);
}

/**
 * Full eviction: remove from memory, unsubscribe, purge Redis.
 * Safe to call multiple times.
 */
export async function evictRoom(roomId: string, reason: string): Promise<void> {
  const meta = roomMeta.get(roomId);
  if (meta?.emptyTimer) {
    clearTimeout(meta.emptyTimer);
  }

  roomMeta.delete(roomId);
  roomRegistry.delete(roomId);

  await teardownRoomSubscription(roomId);
  await purgeRoomFromRedis(roomId);
  await deleteRoom(roomId);

  console.log(`[Cleanup] Room ${roomId} evicted — reason: ${reason}`);
}

/**
 * Called when the last user leaves.  Starts a grace-period timer
 */
function scheduleEmptyRoomEviction(roomId: string): void {
  const meta = roomMeta.get(roomId);
  if (!meta || meta.emptyTimer) return;

  meta.emptyTimer = setTimeout(async () => {
    const room = roomRegistry.get(roomId);
    if (room && room.size > 0) {
      if (meta) meta.emptyTimer = null;
      return;
    }
    await evictRoom(roomId, `empty for ${EMPTY_ROOM_TTL_MS / 1000}s`);
  }, EMPTY_ROOM_TTL_MS);
}

/**
 * Remove one user from the in-memory registry.
 * Triggers the empty-room grace timer when the room becomes empty.
 */
export async function removeUserFromRoomRegistry(
  roomId: string,
  userId: string,
): Promise<void> {
  const room = roomRegistry.get(roomId);
  if (!room) return;

  room.delete(userId);
  touchRoom(roomId);

  if (room.size === 0) {
    scheduleEmptyRoomEviction(roomId);
  }
}

/**
 * Subscribe to a room's Redis channel
 */
export async function ensureRoomSubscription(roomId: string): Promise<void> {
  // Cancel grace-period eviction if someone is joining
  const meta = roomMeta.get(roomId);
  if (meta?.emptyTimer) {
    clearTimeout(meta.emptyTimer);
    meta.emptyTimer = null;
  }

  if (!roomMeta.has(roomId)) {
    roomMeta.set(roomId, { lastActivity: Date.now(), emptyTimer: null });
  }

  if (subscribedRooms.has(roomId)) return;

  await redisSub.subscribe(`room:${roomId}:events`, (message) => {
    let parsedMessage: RedisData;
    try {
      parsedMessage = JSON.parse(message) as RedisData;
    } catch {
      console.error(`[Redis] Malformed message on room:${roomId}:events`);
      return;
    }

    const socketMessage = convertToSocketData(parsedMessage);
    if (!socketMessage) return;

    broadcastToRoom(roomId, parsedMessage.userId, socketMessage);
  });

  subscribedRooms.add(roomId);
}
