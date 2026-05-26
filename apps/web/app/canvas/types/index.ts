import { RefObject } from "react";
import {
  ToolKitType,
  ColorType,
  AllToolTypes,
  DrawElement,
  ShapeType,
  PencilType,
  ImageType,
  LinearType,
  TextStateType,
  WebSocketShapeType,
  ClientCursorSchemaType,
  ServerChatSchemaType,
  ClientChatSchemaType,
  ClientShapeManipulation,
} from "@repo/common";
import { HandleName } from "../../lib/getHandles";

export type CanvasState = {
  drawnShapes: DrawElement[];
  history: DrawElement[][];
  historyIndex: number;
  toolState: ToolKitType;
  sideToolKitState: SideToolKitState;
  textState: TextStateType;
};

export type SideToolKitState = {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roundness: number;
  opacity: number;
  strokeType: "dash" | "dotted" | "normal";
};
export type Action =
  | { type: "INITIALIZE_BOARD"; payload: DrawElement[] }
  | { type: "ADD_SHAPE"; payload: DrawElement }
  | { type: "DEL_SHAPE"; payload: string[] }
  | { type: "UPD_SHAPE"; payload: DrawElement[] }
  | { type: "FINISH_SHAPE"; payload: DrawElement }
  | { type: "REDO" }
  | { type: "UNDO" }
  | { type: "CHANGE_TOOL"; payload: AllToolTypes }
  | { type: "CHANGE_COLOR"; payload: ColorType }
  | { type: "CHANGE_BRUSHSIZE"; payload: number }
  | { type: "UPD_EDITOR"; payload: Partial<SideToolKitState> }
  | { type: "UPD_TEXT_STATE"; payload: Partial<TextStateType> }
  | { type: "CLEAR_CANVAS" }
  | { type: "BULK_DEL_SHAPE"; payload: string[] };

export interface ChatModalProps {
  wsRef: RefObject<WebSocket | null>;
  messages: ServerChatSchemaType[];
  setMessages: React.Dispatch<React.SetStateAction<ServerChatSchemaType[]>>;
}
export type GroupDragOffset = {
  id: string;
  dx: number;
  dy: number;
};

export type InteractionState = {
  isDrawing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  resizeDirection: HandleName | null;
  startPos: { x: number; y: number };
  originalShape: DrawElement | null;
  groupDragOffsets: GroupDragOffset[];
};

export type DragStateType = {
  isDragging: boolean;
  groupDragOffsets: GroupDragOffset[];
};

export type ResizeStateType = {
  isResizing: boolean;
  resizeDirection: HandleName | null;
  originalShape: DrawElement;
};

export type EventType = {
  type: "ADD" | "DEL" | "UPD";
  shape: DrawElement;
};

type DrawableTool =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "arrow"
  | "line"
  | "pencil";

export const DrawableTool: DrawableTool[] = [
  "rectangle",
  "ellipse",
  "diamond",
  "arrow",
  "line",
  "pencil",
];

export type BoundedDrawElement = ShapeType | PencilType;
export type UnboundedDrawElement = ImageType | LinearType;
export type TextEditState = {
  elementId: string;
  x: number;
  y: number;
  text: string;
} | null;

//join and leaves are handled automatically
export type SendPropsType =
  | ClientChatSchemaType
  | WebSocketShapeType
  | ClientCursorSchemaType
  | ClientShapeManipulation;

export type eventHandlerContext = {};

export type FontTypes = "google sans code" | "times new roman" | "sans serif";

export type ActiveElementMapType = Map<
  string,
  { isDirty: boolean; userId: string; element: DrawElement }
>;
