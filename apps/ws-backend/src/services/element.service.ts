import type { RedisClient } from "@repo/redis";
import { ELEMENT_JOBS, type AppQueueType } from "@repo/queue";
import { RedisData } from "../types";

export type ElementRedisData = Extract<
  RedisData,
  { type: "ADD" | "DEL" | "UPD" | "BULK_DEL" }
>;
export class ElementService {
  constructor(
    private readonly pub: RedisClient,
    private readonly queue: AppQueueType,
  ) {}

  async add(roomId: string, event: ElementRedisData): Promise<void> {
    if (event.type !== "ADD") return;

    await Promise.all([
      this.queue.add(
        ELEMENT_JOBS.CREATE,
        { roomId, element: event.element },
        { jobId: `element-${Date.now()}` },
      ),
      this.pub.publish(`room:${roomId}:events`, JSON.stringify(event)),
    ]);
  }

  async update(roomId: string, event: ElementRedisData): Promise<void> {
    if (event.type !== "UPD") return;

    await Promise.all([
      this.queue.add(
        ELEMENT_JOBS.UPSERT,
        { roomId, elements: event.elements },
        { jobId: `element-${Date.now()}`, delay: 300 },
      ),
      this.pub.publish(`room:${roomId}:events`, JSON.stringify(event)),
    ]);
  }
  async delete(roomId: string, event: ElementRedisData): Promise<void> {
    if (event.type !== "DEL") return;
    await Promise.all([
      this.queue.add(
        ELEMENT_JOBS.DELETE,
        {
          roomId,
          elementId: event.elementIds,
        },
        { jobId: `element-${Date.now()}` },
      ),
      this.pub.publish(`room:${roomId}:events`, JSON.stringify(event)),
    ]);
  }

  async deleteAll(roomId: string, event: ElementRedisData): Promise<void> {
    if (event.type !== "BULK_DEL") return;
    await Promise.all([
      this.queue.add(
        ELEMENT_JOBS.DELETE_ALL,
        {
          roomId,
          elementIds: event.elementIds,
        },
        { jobId: `element-${Date.now()}` },
      ),
      this.pub.publish(`room:${roomId}:events`, JSON.stringify(event)),
    ]);
  }
}

export type ElementServiceType = typeof ElementService;
