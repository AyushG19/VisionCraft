import {
  addChat,
  createElement,
  deleteManyElements,
  upsertManyElements,
} from "@repo/db";
import { CHAT_JOBS, ELEMENT_JOBS, Job, UnrecoverableError } from "@repo/queue";
import {
  ElementUpsertPayloadSchema,
  ElementDeletePayloadSchema,
  ZodError,
  ChatUpsertPayloadSchema,
  ElementDeleteAllPayloadSchema,
  ElementCreatePayloadSchema,
} from "@repo/common";

export async function processor(job: Job): Promise<void> {
  try {
    switch (job.name) {
      case ELEMENT_JOBS.CREATE: {
        const { element, roomId } = ElementCreatePayloadSchema.parse(job.data);
        await createElement(roomId, element, 0);
        break;
      }
      case ELEMENT_JOBS.UPSERT: {
        const { elements, roomId } = ElementUpsertPayloadSchema.parse(job.data);
        await upsertManyElements(elements, roomId);
        break;
      }

      case ELEMENT_JOBS.DELETE: {
        const { roomId, elementId } = ElementDeletePayloadSchema.parse(
          job.data,
        );
        await deleteManyElements(roomId, elementId);
        break;
      }

      case CHAT_JOBS.UPSERT: {
        const { Message, roomId } = ChatUpsertPayloadSchema.parse(job.data);
        await addChat(roomId, Message);
        break;
      }

      case ELEMENT_JOBS.DELETE_ALL: {
        const { roomId, elementIds } = ElementDeleteAllPayloadSchema.parse(
          job.data,
        );
        await deleteManyElements(roomId, elementIds);
        break;
      }

      default: {
        throw new Error(`Unknown job type: ${job.name}`);
      }
    }
  } catch (err) {
    if (err instanceof ZodError) {
      console.error(
        `[Element Worker] Invalid payload for job ${job.id} (${job.name}):`,
        err.flatten(),
      );

      throw new UnrecoverableError(`Invalid job payload: ${err.message}`);
    }

    throw err;
  }
}
