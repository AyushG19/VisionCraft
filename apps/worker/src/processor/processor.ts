import {
  addChat,
  deleteAllElements,
  deleteElement,
  upsertElement,
} from "@repo/db";
import { CHAT_JOBS, ELEMENT_JOBS, Job, UnrecoverableError } from "@repo/queue";
import {
  ElementUpsertPayloadSchema,
  ElementDeletePayloadSchema,
  ZodError,
  ChatUpsertPayloadSchema,
  ElementDeleteAllPayloadSchema,
} from "@repo/common";

export async function processor(job: Job): Promise<void> {
  try {
    switch (job.name) {
      case ELEMENT_JOBS.UPSERT: {
        const { element, roomId } = ElementUpsertPayloadSchema.parse(job.data);
        await upsertElement(element, roomId);
        break;
      }

      case ELEMENT_JOBS.DELETE: {
        const { roomId, elementId } = ElementDeletePayloadSchema.parse(
          job.data,
        );
        await deleteElement(roomId, elementId);
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
        await deleteAllElements(roomId, elementIds);
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
