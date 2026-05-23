import { WebSocketServer } from "ws";
import { evictRoom } from "./room.lifecycle";
import {
  ROOM_IDLE_TTL_MS,
  roomMeta,
  roomRegistry,
  SWEEP_INTERVAL_MS,
} from "./room.state";
import { CustomWs } from "../types";

/**
 * Periodically scans every tracked room.  Any room that has had no activity
 * for longer than ROOM_IDLE_TTL_MS is forcibly evicted — disconnecting
 * lingering sockets and purging Redis data.
 */
export function startIdleSweeper(): ReturnType<typeof setInterval> {
  const timer = setInterval(async () => {
    const now = Date.now();
    const evictions: Promise<void>[] = [];

    for (const [roomId, meta] of roomMeta) {
      if (now - meta.lastActivity < ROOM_IDLE_TTL_MS) continue;

      // Gracefully close all sockets still in the room
      const room = roomRegistry.get(roomId);
      if (room) {
        for (const { socket } of room.values()) {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close(1001, "Room evicted due to inactivity");
          }
        }
      }

      evictions.push(
        evictRoom(roomId, `idle for ${ROOM_IDLE_TTL_MS / 60_000} min`),
      );
    }

    if (evictions.length > 0) {
      await Promise.allSettled(evictions);
      console.log(`[Sweeper] Evicted ${evictions.length} idle room(s)`);
    }
  }, SWEEP_INTERVAL_MS);

  console.log(
    `[WS] Started — sweeper interval: ${SWEEP_INTERVAL_MS / 60_000} min, idle TTL: ${ROOM_IDLE_TTL_MS / 60_000} min`,
  );
  return timer;
}

/*handling pong */
export function startHeartbeat(
  wss: WebSocketServer,
): ReturnType<typeof setInterval> {
  const id = setInterval(() => {
    const clients = wss.clients as Set<CustomWs>;
    clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log("[WS] Terminating unresponsive zombie connection.");
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 50_000);

  console.log(`[WS] Started — heartbeat interval ${50_000}`);
  return id;
}
