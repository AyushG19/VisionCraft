import {
  DrawElement,
  ServerMessageType,
  PointType,
  WebSocketShapeType,
  ClientChatSchemaType,
} from "@repo/common";
import { ChatService } from "../services/chat.service";
import { ElementService } from "../services/element.service";
import { validateSocketData } from "../util/validate";
import { WebSocket } from "ws";

/**
 * Required - To circulate in pub/sub so we can skip users if needed
 */
export type RedisData =
  | {
      userId: string;
      type: "ADD" | "UPD";
      element: DrawElement;
    }
  | {
      userId: string;
      type: "DEL";
      element: string;
    }
  | { type: "BULK_DEL"; userId: string; elementIds: string[] }
  | {
      userId: string;
      type: "CHAT";
      message: ServerMessageType;
    }
  | { userId: string; type: "CURSOR"; coordinates: PointType }
  | { type: "LEAVE"; userId: string; time: number }
  | { type: "JOIN"; userId: string; time: number }
  | { type: "RESIZE"; userId: string; element: DrawElement }
  | { type: "DRAG"; userId: string; element: DrawElement }
  | { type: "DESELECT"; userId: string }
  | { type: "CLEAR_CANVAS"; userId: string };

export type SendPropsType = ClientChatSchemaType | WebSocketShapeType;

export type AddElementPayload = Extract<
  WebSocketShapeType,
  { type: "ADD_SHAPE" }
>;
export type updateElementPayload = Extract<
  WebSocketShapeType,
  { type: "UPD_SHAPE" }
>;
export type DeleteElementPayload = Extract<
  WebSocketShapeType,
  { type: "DEL_SHAPE" }
>;

export type Services = {
  chat: ChatService;
  element: ElementService;
};
export type HandlerContext = {
  ws: WebSocket;
  roomId: string;
  userId: string;
  cleanData: ReturnType<typeof validateSocketData>;
  services: Services;
};
