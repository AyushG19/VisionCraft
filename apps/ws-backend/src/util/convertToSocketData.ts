import { ServerSocketDataType } from "@repo/common";
import { RedisData } from "../types";

export function convertToSocketData(data: RedisData): ServerSocketDataType {
  switch (data.type) {
    case "ADD":
      return {
        type: "ADD_SHAPE",
        payload: data.element,
      };
    case "DEL":
      return {
        type: "DEL_SHAPE",
        payload: data.elementIds,
      };
    case "UPD":
      return {
        type: "UPD_SHAPE",
        payload: data.elements,
      };
    case "CHAT":
      return {
        type: "CHAT",
        payload: data.message,
      };
    case "CURSOR": {
      return {
        type: "CURSOR",
        payload: { userId: data.userId, coordinates: data.coordinates },
      };
    }
    case "JOIN": {
      return { type: "USER_JOINED", payload: { userId: data.userId } };
    }
    case "LEAVE": {
      return { type: "USER_LEFT", payload: { userId: data.userId } };
    }
    case "RESIZE": {
      return {
        type: "RESIZE",
        payload: { userId: data.userId, element: data.element },
      };
    }
    case "DRAG": {
      return {
        type: "DRAG",
        payload: { userId: data.userId, elements: data.elements },
      };
    }
    case "DESELECT": {
      return {
        type: "DESELECT",
        payload: { userId: data.userId },
      };
    }
    case "CLEAR_CANVAS": {
      return {
        type: "CLEAR_CANVAS",
        payload: { userId: data.userId },
      };
    }
    case "BULK_DEL": {
      return {
        type: "BULK_DEL_SHAPE",
        payload: data.elementIds,
      };
    }
  }
}
