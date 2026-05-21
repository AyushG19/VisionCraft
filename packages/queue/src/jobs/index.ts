// packages/queue/src/jobs/index.ts
import type {
  ElementUpsertPayloadSchemaType,
  ElementDeletePayloadSchemaType,
  ChatUpsertPayloadSchemaType,
  ElementDeleteAllPayload,
} from "@repo/common";
import { ELEMENT_JOBS } from "./element.job";
import { CHAT_JOBS } from "./chat.job";
import { ROOM_JOBS } from "./room-user.job";

export { ELEMENT_JOBS, CHAT_JOBS, ROOM_JOBS };

// Every possible job as a discriminated union
// name narrows data automatically
export type AppJob =
  | { name: typeof ELEMENT_JOBS.UPSERT; data: ElementUpsertPayloadSchemaType }
  | { name: typeof ELEMENT_JOBS.DELETE; data: ElementDeletePayloadSchemaType }
  | { name: typeof ELEMENT_JOBS.DELETE_ALL; data: ElementDeleteAllPayload }
  | { name: typeof CHAT_JOBS.UPSERT; data: ChatUpsertPayloadSchemaType }
  | { name: typeof ROOM_JOBS.DELETE; data: { roomId: string } };

// Extract payload type by job name — used to type queue.add()
export type JobPayload<T extends AppJob["name"]> = Extract<
  AppJob,
  { name: T }
>["data"];
