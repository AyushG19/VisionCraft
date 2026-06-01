import { HandlerContext } from "../types";
import { CHAT } from "./chat";
import { CURSOR } from "./cursor";
import {
  ADD_SHAPE,
  DEL_SHAPE,
  DESELECT,
  DRAG,
  RESIZE,
  UPD_SHAPE,
} from "./element";
import { JOIN_ROOM, LEAVE_ROOM } from "./room";

export const handlers: Partial<
  Record<string, (ctx: HandlerContext) => Promise<void>>
> = {
  JOIN_ROOM,
  LEAVE_ROOM,
  CHAT,
  ADD_SHAPE,
  UPD_SHAPE,
  DEL_SHAPE,
  CURSOR,
  RESIZE,
  DRAG,
  DESELECT,
};
