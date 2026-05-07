import {
  ServerSocketDataType,
  UserType,
  ServerMessageType,
  PointType,
  DrawElement,
} from "@repo/common";
import { Action } from "../../canvas/types";
import React from "react";
import { getUserColor } from "./color.helper";
import { RoomInfo } from "@repo/hooks";
import { getUserInfo } from "../../services/user.service";

export const generateUserObject = (user: UserType) => {
  return {
    ...user,
    color: getUserColor(user.userId),
    cursor: null,
  };
};

export type eventHandlerContext = {
  canvasDispatch: (action: Action) => void;
  setMessages: React.Dispatch<React.SetStateAction<ServerMessageType[]>>;
  setRoomInfo: React.Dispatch<React.SetStateAction<RoomInfo>>;
  memberCursorMap: Map<string, PointType>;
  event: ServerSocketDataType;
  activeElementMap: Map<
    string,
    {
      isDirty: boolean;
      element: DrawElement;
      operation: "resize" | "drag";
    }
  >;
};
export const incomingSocketHandlers: Record<
  ServerSocketDataType["type"],
  (ctx: eventHandlerContext) => void
> = {
  ADD_SHAPE: ({ event, canvasDispatch }) => {
    if (event.type !== "ADD_SHAPE") return;
    const shape = event.payload;
    if (shape) {
      canvasDispatch({ type: "ADD_SHAPE", payload: shape });
    }
  },

  UPD_SHAPE: ({ event, canvasDispatch }) => {
    if (event.type !== "UPD_SHAPE") return;
    const shape = event.payload;
    if (shape) {
      canvasDispatch({ type: "UPD_SHAPE", payload: shape });
    }
  },

  DEL_SHAPE: ({ event, canvasDispatch }) => {
    if (event.type !== "DEL_SHAPE") return;
    const shape = event.payload;
    if (shape) {
      canvasDispatch({ type: "DEL_SHAPE", payload: shape });
    }
  },

  CHAT: ({ event, setMessages }) => {
    if (event.type !== "CHAT") return;
    const message = event.payload;
    setMessages((prev) => [...prev, message]);
  },

  CURSOR: ({ event, memberCursorMap }) => {
    if (event.type !== "CURSOR") return;
    const { userId, coordinates } = event.payload;
    memberCursorMap.set(userId, coordinates);
  },

  USER_LEFT: ({ event, memberCursorMap, setRoomInfo }) => {
    if (event.type !== "USER_LEFT") return;
    const { userId } = event.payload;
    setRoomInfo((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.userId !== userId),
    }));
    memberCursorMap.delete(userId);
  },

  USER_JOINED: async ({ event, setRoomInfo }) => {
    if (event.type !== "USER_JOINED") return;
    const { userId } = event.payload;
    const info = await getUserInfo(userId);
    setRoomInfo((prev) => ({
      ...prev,
      users: [...prev.users, generateUserObject(info)],
    }));
  },

  RESIZE: async ({ event, activeElementMap }) => {
    if (event.type !== "RESIZE") return;
    const { userId, element } = event.payload;
    activeElementMap.set(userId, {
      element: element,
      isDirty: true,
      operation: "resize",
    });
  },

  DRAG: async ({ event, activeElementMap }) => {
    if (event.type !== "DRAG") return;
    const { userId, element } = event.payload;
    activeElementMap.set(userId, {
      element: element,
      isDirty: true,
      operation: "drag",
    });
  },
  INFO: () => null,
  DESELECT: ({ event, activeElementMap }) => {
    if (event.type !== "DESELECT") return;
    activeElementMap.delete(event.payload.userId);
  },
};
