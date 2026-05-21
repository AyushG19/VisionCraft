import z from "zod";
import { DrawSchema } from "./canvas";
import { ServerMessage } from "./message";

export const ElementUpsertPayloadSchema = z.object({
  roomId: z.string(),
  element: DrawSchema,
});

export type ElementUpsertPayloadSchemaType = z.infer<
  typeof ElementUpsertPayloadSchema
>;

export const ElementDeletePayloadSchema = z.object({
  roomId: z.string(),
  elementId: z.string(),
});

export type ElementDeletePayloadSchemaType = z.infer<
  typeof ElementDeletePayloadSchema
>;

export const ElementDeleteAllPayloadSchema = z.object({
  roomId: z.string(),
  elementIds: z.array(z.string()),
});

export type ElementDeleteAllPayload = z.infer<
  typeof ElementDeleteAllPayloadSchema
>;

export const ChatUpsertPayloadSchema = z.object({
  roomId: z.string(),
  Message: ServerMessage,
});

export type ChatUpsertPayloadSchemaType = z.infer<
  typeof ChatUpsertPayloadSchema
>;

export const RoomDeletePayloadSchema = z.object({
  roomId: z.string(),
});

export type RoomDeletePayloadSchemaType = z.infer<
  typeof RoomDeletePayloadSchema
>;
