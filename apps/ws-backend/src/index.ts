import { WebSocketServer } from "ws";
import type { JwtPayloadType } from "@repo/common";
import { redisPub } from "@repo/redis/dist";
import {
  validateConnection,
  validateSocketData,
  validateToken,
} from "./util/validate";
import env from "./env";
import { ChatService } from "./services/chat.service";
import { appQueue, initQueue } from "@repo/queue";
import { ElementService } from "./services/element.service";
import { removeUserFromRoomRegistry } from "./room/room.lifecycle";
import { startIdleSweeper, startHeartbeat } from "./room/room.sweeper";
import { sendError, sendInfo } from "./helpers/ws.helper";
import { handlers } from "./handlers";
import http from "http";
import { corsMap } from "./config";
import { CustomWs, RedisData } from "./types";
import { removeUserFromRoom } from "@repo/db";

const server = http.createServer((req, res) => {
  res.setHeaders(corsMap);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/ping" || req.url === "/")) {
    console.log("pinging back!");
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("Ws server is running");
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

initQueue(
  `redis://${env.RS_USERNAME}:${env.RS_PASSWORD}@${env.RS_HOST}:${env.RS_PORT}`,
);

const sweeperId = startIdleSweeper();
const intervalId = startHeartbeat(wss);

const chatService = new ChatService(redisPub, appQueue);
const elementService = new ElementService(redisPub, appQueue);

wss.on("close", () => {
  clearInterval(intervalId);
  clearInterval(sweeperId);
});

wss.on("connection", (rawWs, req) => {
  const ws = rawWs as CustomWs;

  if (!req.url || !req.headers.host) {
    ws.close(1008, "Missing URL or host header");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  let jwtPayload: JwtPayloadType;
  let roomId: string;
  let userId: string;

  try {
    const { token, roomId: rid } = validateConnection(url);
    roomId = rid;
    jwtPayload = validateToken(token);
    userId = jwtPayload.userId;
    ws.isAlive = true;
    sendInfo(ws, "Connected to server");
    console.log(`[WS] User ${userId} connected (room: ${roomId})`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    sendError(ws, message);
    ws.close(1008, message);
    return;
  }

  ws.on("pong", async () => {
    ws.isAlive = true;
  });

  ws.on("message", async (raw) => {
    try {
      const cleanData = validateSocketData(raw);
      const handler = handlers[cleanData.type];

      if (!handler) {
        sendError(ws, `Unknown message type: ${cleanData.type}`);
        return;
      }
      const services = { chat: chatService, element: elementService };
      await handler({ ws, roomId, userId, cleanData, services });
    } catch (err) {
      const message = err instanceof Error ? err.message : "INTERNAL_ERROR";
      console.error(`[WS] Handler error (user: ${userId}):`, err);
      sendError(ws, message);
    }
  });

  ws.on("close", async (code) => {
    console.log(
      `[WS] User ${userId} disconnected (room: ${roomId}) — code: ${code}`,
    );
    const pubData: RedisData = { type: "LEAVE", userId, time: Date.now() };
    await Promise.all([
      redisPub.publish(`room:${roomId}:events`, JSON.stringify(pubData)),
      await removeUserFromRoom(userId, roomId),
      await removeUserFromRoomRegistry(roomId, userId),
    ]);
  });

  ws.on("error", (err) => {
    console.error(`[WS] Socket error (user: ${userId}):`, err);
  });
});

server.listen(env.PORT, "0.0.0.0", () => {
  console.log(`[WS] server running on port : ${env.PORT}`);
});
