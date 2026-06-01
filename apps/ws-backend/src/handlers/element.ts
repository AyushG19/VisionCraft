import { redisPub } from "@repo/redis";
import { sendError, sendInfo } from "../helpers/ws.helper";
import { touchRoom } from "../room/room.lifecycle";
import { ElementRedisData } from "../services/element.service";
import { HandlerContext, RedisData } from "../types";

export async function ADD_SHAPE({
  ws,
  roomId,
  userId,
  cleanData,
  services,
}: HandlerContext) {
  if (cleanData.type !== "ADD_SHAPE") return;

  const { payload } = cleanData;
  const { element } = services;
  if (!payload) {
    sendError(ws, "MALFORMED_PAYLOAD");
    return;
  }
  touchRoom(roomId);

  const event: ElementRedisData = { type: "ADD", userId, element: payload };
  element.add(roomId, event);

  // sendInfo(ws, "Element added");
}

export async function UPD_SHAPE({
  ws,
  roomId,
  userId,
  cleanData,
  services,
}: HandlerContext) {
  if (cleanData.type !== "UPD_SHAPE") return;

  const { payload } = cleanData;
  const { element } = services;
  if (!payload) {
    sendError(ws, "MALFORMED_PAYLOAD");
    return;
  }
  touchRoom(roomId);

  const event: ElementRedisData = { type: "UPD", userId, elements: payload };
  element.update(roomId, event); //publist occurs here

  // sendInfo(ws, "Shape updated");
}

export async function DEL_SHAPE({
  ws,
  roomId,
  userId,
  cleanData,
  services,
}: HandlerContext) {
  if (cleanData.type !== "DEL_SHAPE") return;

  const { payload } = cleanData;
  const { element } = services;
  if (!payload) {
    sendError(ws, "MALFORMED_PAYLOAD");
    return;
  }
  touchRoom(roomId);

  const event: ElementRedisData = { type: "DEL", userId, elementIds: payload };
  element.delete(roomId, event);

  // sendInfo(ws, "Shape deleted");
}

// export async function BULK_DEL_SHAPE({
//   ws,
//   roomId,
//   userId,
//   cleanData,
//   services,
// }: HandlerContext) {
//   if (cleanData.type !== "BULK_DEL_SHAPE") return;

//   const { payload } = cleanData;
//   const { element } = services;
//   if (!payload) {
//     sendError(ws, "MALFORMED_PAYLOAD");
//     return;
//   }
//   touchRoom(roomId);

//   const event: ElementRedisData = {
//     type: "BULK_DEL",
//     userId,
//     elementIds: payload,
//   };
//   element.deleteAll(roomId, event);

//   sendInfo(ws, "Shape deleted");
// }

export async function RESIZE({
  ws,
  roomId,
  userId,
  cleanData,
  services,
}: HandlerContext) {
  if (cleanData.type !== "RESIZE") return;
  const pubSubData: RedisData = {
    userId: userId,
    type: "RESIZE",
    element: cleanData.payload,
  };
  redisPub.publish(`room:${roomId}:events`, JSON.stringify(pubSubData));
  // sendInfo(ws, "resize update sent");
}

export async function DRAG({
  ws,
  roomId,
  userId,
  cleanData,
  services,
}: HandlerContext) {
  if (cleanData.type !== "DRAG") return;
  const pubSubData: RedisData = {
    userId: userId,
    type: "DRAG",
    elements: cleanData.payload,
  };
  redisPub.publish(`room:${roomId}:events`, JSON.stringify(pubSubData));
  // sendInfo(ws, "Drag update sent");
}

export async function DESELECT({
  ws,
  roomId,
  userId,
  cleanData,
}: HandlerContext) {
  if (cleanData.type !== "DESELECT") return;
  const pubSubData: RedisData = { type: "DESELECT", userId };
  redisPub.publish(`room:${roomId}:events`, JSON.stringify(pubSubData));
}

export async function CLEAR_CANVAS({
  ws,
  roomId,
  userId,
  cleanData,
}: HandlerContext) {
  if (cleanData.type !== "CLEAR_CANVAS") return;
  const pubSubData: RedisData = { type: "CLEAR_CANVAS", userId };
  redisPub.publish(`room:${roomId}:events`, JSON.stringify(pubSubData));
}
