import { AppQueueType, CHAT_JOBS } from "@repo/queue";
import { RedisClient } from "@repo/redis";
import { RedisData } from "../types";

export type ChatRedisData = Extract<RedisData, { type: "CHAT" }>;

export class ChatService {
  constructor(
    private readonly pub: RedisClient,
    private readonly queue: AppQueueType,
  ) {}
  async add(roomId: string, event: ChatRedisData): Promise<void> {
    await Promise.all([
      this.queue.add(CHAT_JOBS.UPSERT, {
        roomId,
        Message: event.message,
      }),
      this.pub.publish(`room:${roomId}:events`, JSON.stringify(event)),
    ]);
  }
}

export type ChatServiceType = typeof ChatService;
