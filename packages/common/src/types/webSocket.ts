import { z } from "zod";
import { ClientMessage, ServerMessage } from "./message";
import { DrawSchema, PointSchema } from "./canvas";

const ClientJoinRoomSchema = z.object({
  type: z.literal("JOIN_ROOM"),
});

const ClientLeaveRoomSchema = z.object({
  type: z.literal("LEAVE_ROOM"),
});

export type WebSocketRoomType =
  | z.infer<typeof ClientJoinRoomSchema>
  | z.infer<typeof ClientLeaveRoomSchema>;

const ServerUserJoinedSchema = z.object({
  type: z.literal("USER_JOINED"),
  payload: z.object({ userId: z.string() }),
});

const ServerUserLeftSchema = z.object({
  type: z.literal("USER_LEFT"),
  payload: z.object({ userId: z.string() }),
});

export type ServerRoomSchemaType =
  | z.infer<typeof ServerUserJoinedSchema>
  | z.infer<typeof ServerUserLeftSchema>;

const ServerChatSchema = z.object({
  type: z.literal("CHAT"),
  payload: ServerMessage,
});
export type ServerChatSchemaType = z.infer<typeof ServerChatSchema>;

const ClientChatSchema = z.object({
  type: z.literal("CHAT"),
  payload: ClientMessage,
});
export type ClientChatSchemaType = z.infer<typeof ClientChatSchema>;

const AddShapeSchema = z.object({
  type: z.literal("ADD_SHAPE"),
  payload: DrawSchema,
});

const UpdShapeSchema = z.object({
  type: z.literal("UPD_SHAPE"),
  payload: z.array(DrawSchema),
});

const DelShapeSchema = z.object({
  type: z.literal("DEL_SHAPE"),
  payload: z.array(z.string()),
});

export type WebSocketShapeType =
  | z.infer<typeof AddShapeSchema>
  | z.infer<typeof UpdShapeSchema>
  | z.infer<typeof DelShapeSchema>
  | z.infer<typeof ClientClearCanvasSchema>;

const ServerResizeSchema = z.object({
  type: z.literal("RESIZE"),
  payload: z.object({ userId: z.string(), element: DrawSchema }),
});

const ServerDragSchema = z.object({
  type: z.literal("DRAG"),
  payload: z.object({ userId: z.string(), elements: z.array(DrawSchema) }),
});

const ServerDeselectSchema = z.object({
  type: z.literal("DESELECT"),
  payload: z.object({ userId: z.string() }),
});

export const ServerShapeManipulationSchema = z.discriminatedUnion("type", [
  ServerResizeSchema,
  ServerDragSchema,
  ServerDeselectSchema,
]);
export type ServerShapeManipulation = z.infer<
  typeof ServerShapeManipulationSchema
>;

const ClientResizeSchema = z.object({
  type: z.literal("RESIZE"),
  payload: DrawSchema,
});

const ClientDragSchema = z.object({
  type: z.literal("DRAG"),
  payload: z.array(DrawSchema),
});

const ClientElementDeselectSchema = z.object({
  type: z.literal("DESELECT"),
  payload: z.object({}),
});

export const ClientShapeManipulationSchema = z.discriminatedUnion("type", [
  ClientResizeSchema,
  ClientDragSchema,
  ClientElementDeselectSchema,
]);
export type ClientShapeManipulation = z.infer<
  typeof ClientShapeManipulationSchema
>;

const ClientCursorSchema = z.object({
  type: z.literal("CURSOR"),
  payload: PointSchema,
});
export type ClientCursorSchemaType = z.infer<typeof ClientCursorSchema>;

const ServerCursorSchema = z.object({
  type: z.literal("CURSOR"),
  payload: z.object({ userId: z.string(), coordinates: PointSchema }),
});
export type ServerCursorSchemaType = z.infer<typeof ServerCursorSchema>;

export const ServerInfoSchema = z.object({
  type: z.literal("INFO"),
  payload: z.string(),
});
export const ServerErrorSchema = z.object({
  type: z.literal("ERROR"),
  payload: z.string(),
});
export const ClientClearCanvasSchema = z.object({
  type: z.literal("CLEAR_CANVAS"),
  payload: z.object({}),
});

export const ServerClearCanvasSchema = z.object({
  type: z.literal("CLEAR_CANVAS"),
  payload: z.object({ userId: z.string() }),
});

export const ServerSocketData = z.discriminatedUnion("type", [
  AddShapeSchema,
  UpdShapeSchema,
  DelShapeSchema,
  ServerChatSchema,
  ServerUserJoinedSchema,
  ServerUserLeftSchema,
  ServerCursorSchema,
  ServerResizeSchema,
  ServerDragSchema,
  ServerDeselectSchema,
  ServerInfoSchema,
  ServerErrorSchema,
  ServerClearCanvasSchema,
]);
export type ServerSocketDataType = z.infer<typeof ServerSocketData>;

export const ClientSocketData = z.discriminatedUnion("type", [
  AddShapeSchema,
  UpdShapeSchema,
  DelShapeSchema,
  ClientChatSchema,
  ClientJoinRoomSchema,
  ClientLeaveRoomSchema,
  ClientCursorSchema,
  ClientResizeSchema,
  ClientDragSchema,
  ClientElementDeselectSchema,
  ClientClearCanvasSchema,
]);
export type ClientSocketDataType = z.infer<typeof ClientSocketData>;
