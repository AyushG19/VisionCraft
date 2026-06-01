import {
  ServerSocketDataType,
  UserType,
  ServerMessageType,
  PointType,
} from "@repo/common";
import { Action, ActiveElementMapType } from "../../canvas/types";
import React from "react";
import { getUserColor } from "./color.helper";
import { RoomInfo, Toast } from "@repo/hooks";
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
  activeElementMap: ActiveElementMapType;
  setToast: (toast: Toast) => void;
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
    canvasDispatch({ type: "DEL_SHAPE", payload: event.payload });
  },

  // BULK_DEL_SHAPE: ({ event, canvasDispatch }) => {
  //   if (event.type !== "BULK_DEL_SHAPE") return;
  //   canvasDispatch({ type: "BULK_DEL_SHAPE", payload: event.payload });
  // },

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

  USER_JOINED: async ({ event, setRoomInfo, memberCursorMap }) => {
    if (event.type !== "USER_JOINED") return;
    const { userId } = event.payload;
    const info = await getUserInfo(userId);
    setRoomInfo((prev) => ({
      ...prev,
      users: [...prev.users, generateUserObject(info)],
    }));
    memberCursorMap.delete(userId);
  },

  RESIZE: async ({ event, activeElementMap }) => {
    if (event.type !== "RESIZE") return;
    const { userId, element } = event.payload;
    activeElementMap.set(element.id, {
      element: element,
      isDirty: true,
      userId,
    });
  },

  DRAG: async ({ event, activeElementMap }) => {
    if (event.type !== "DRAG") return;
    const { userId, elements } = event.payload;
    elements.forEach((e) => {
      activeElementMap.set(e.id, {
        element: e,
        isDirty: true,
        userId,
      });
    });
  },
  INFO: ({ event, setToast }) => {
    if (event.type !== "INFO") return;
    setToast({ type: "info", message: event.payload, title: "excuse me!" });
  },
  ERROR: ({ event, setToast }) => {
    if (event.type !== "ERROR") return;
    setToast({ type: "error", message: event.payload, title: "Socket error!" });
  },
  DESELECT: ({ event, activeElementMap }) => {
    if (event.type !== "DESELECT") return;
    for (const [key, val] of activeElementMap.entries()) {
      if (val.userId === event.payload.userId) activeElementMap.delete(key);
    }
  },
  CLEAR_CANVAS: ({ event, canvasDispatch }) => {
    if (event.type !== "CLEAR_CANVAS") return;
    canvasDispatch({ type: "CLEAR_CANVAS" });
  },
};
