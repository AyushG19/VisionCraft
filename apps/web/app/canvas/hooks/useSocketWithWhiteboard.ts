"use client";

import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import useCanvasInteraction from "./useCanvasInteraction";
import canvasReducer, { initialCanvasState } from "../utils/canvasReducer";
import {
  Action,
  ActiveElementMapType,
  CanvasState,
  FontTypes,
  SendPropsType,
  SideToolKitState,
  TextEditState,
} from "../types";
import {
  AllowedFonts,
  AllToolTypes,
  AppError,
  ClientShapeManipulation,
  ColorType,
  DrawElement,
  LinearType,
  PencilType,
  PointType,
  ServerMessageType,
  ServerSocketDataType,
  ShapeType,
  TextStateType,
  TextType,
} from "@repo/common";
import { useCanvasSocket } from "./useCanvasSocket";
import {
  createRoomService,
  joinRoomService,
} from "../../services/canvas.service";
import { RoomInfo, useSocketContext } from "@repo/hooks";
import {
  generateUserObject,
  incomingSocketHandlers,
} from "../../canvas/helper/socketMessage.helper";
import { Camera } from "./useCamera";

export const useSocketWithWhiteboard = (): {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
  sideToolkitRef: React.RefObject<HTMLDivElement | null>;
  canvasState: CanvasState;
  // selectedElement: DrawElement | undefined;
  // setSelectedElement: (shape: DrawElement | undefined) => void;
  selectedElementRef: React.RefObject<DrawElement | undefined>;
  canvasDispatch: React.Dispatch<Action>;
  dispatchWithSocket: (action: Action) => void;
  handleToolSelect: (toolName: AllToolTypes) => void;
  handleColorSelect: (color: { l: number; c: number; h: number }) => void;
  handleStrokeSelect: (size: number) => void;
  handleRedo: () => void;
  handleUndo: () => void;
  messages: ServerMessageType[];
  setMessages: React.Dispatch<React.SetStateAction<ServerMessageType[]>>;
  send: (
    type: SendPropsType["type"],
    payload: SendPropsType["payload"],
  ) => void;
  textEdit: TextEditState;
  setTextEdit: React.Dispatch<React.SetStateAction<TextEditState>>;
  // finalizeText: () => void;
  finishText: () => void;
  cancelText: () => void;
  inRoom: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLeaveRoom: () => void;
  handleJoinRoom: (code: string) => Promise<void>;
  handleCreateRoom: () => Promise<void>;
  slug: string;
  handleElementDelete: (element: DrawElement) => void;
  handleStrokeStyle: (
    style: "dash" | "dotted" | "normal",
    element?: ShapeType | LinearType | PencilType,
  ) => void;
  handleFillSelect: (color?: ColorType, shape?: ShapeType) => void;
  setEditorState: (partial: Partial<SideToolKitState>) => void;
  setTextState: (partial: Partial<TextStateType>) => void;
  handleFontSelect: (font: FontTypes, shape: ShapeType | TextType) => void;
  handleFontSize: (size: number, shape?: TextType) => void;
  handleFontFamily: (font: AllowedFonts, shape?: TextType) => void;
  clearCanvas: () => void;
  users: RoomInfo["users"];
  cameraRef: React.RefObject<Camera>;
} => {
  const [canvasState, canvasDispatch] = useReducer(
    canvasReducer,
    initialCanvasState,
  );
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [messages, setMessages] = useState<ServerMessageType[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sideToolkitRef = useRef<HTMLDivElement | null>(null);
  const activeElementMap = useRef<ActiveElementMapType>(new Map());

  const {
    inRoom,
    setToken,
    isOpen,
    setIsOpen,
    setRoomInfo,
    roomInfo,
    memberCursor,
  } = useSocketContext();

  // const { camera } = useCamera(canvasRef, canvasState.toolState.currentTool);
  // Add these two refs near your other refs
  const drawnShapesRef = useRef(canvasState.drawnShapes);
  // const cameraRef = useRef(camera);

  const setTextState = (partial: Partial<TextStateType>) => {
    canvasDispatch({ type: "UPD_TEXT_STATE", payload: partial });
  };
  const setEditorState = (partial: Partial<SideToolKitState>) => {
    canvasDispatch({ type: "UPD_EDITOR", payload: partial });
  };

  const onMessage = (event: ServerSocketDataType) => {
    try {
      // if (event.type !== "CURSOR") {
      //   console.log(event);
      // }
      const handler = incomingSocketHandlers[event.type];
      handler({
        canvasDispatch,
        event,
        memberCursorMap: memberCursor.current,
        setMessages,
        setRoomInfo,
        activeElementMap: activeElementMap.current,
      });
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  };

  const { send, connect, disconnect } = useCanvasSocket(onMessage);

  const sendCursorState = (pos: PointType) => {
    send("CURSOR", pos);
  };

  const clearCanvas = () => {
    dispatchWithSocket({ type: "CLEAR_CANVAS" });
  };

  const handleJoinRoom = async (code: string) => {
    try {
      const data = await joinRoomService(code);
      const roomUsers = data.users.map((user) => generateUserObject(user));
      setRoomInfo({
        ...roomInfo,
        roomId: data.roomId,
        slug: code,
        users: roomUsers,
      });

      canvasDispatch({ type: "INITIALIZE_BOARD", payload: data.canvasState });

      setToken(data.token);
      connect(data.roomId, code, data.token);

      console.log("From page handleJoinRoom: ", data);
    } catch (error) {
      //@ts-ignore
      console.error("error in join room : ", error.message);
      throw new AppError("Error joining a ROOM,Try agian!", "SERVER_ERROR");
    }
  };

  const handleCreateRoom = async () => {
    try {
      const res = await createRoomService();
      if (!res) throw new Error("Error in ROOM creation.");
      console.log("joinig room now ");
      return await handleJoinRoom(res.slug);
    } catch (error) {
      throw new Error("Error in handle Room create");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      disconnect();
      setRoomInfo({ ...roomInfo, roomId: "", slug: "" });
      setToken("");

      console.log("From page handleLeaveRoom: ");
    } catch (error) {
      console.error("error in join room");
    }
  };

  const dispatchWithSocket = useCallback(
    (action: Action) => {
      canvasDispatch(action);

      if (!send) return;

      switch (action.type) {
        case "ADD_SHAPE":
          send("ADD_SHAPE", action.payload);
          break;

        case "UPD_SHAPE":
          // const updFn = send;
          // const dbUpdate = debounce(updFn, 1000);
          send("UPD_SHAPE", action.payload);
          break;

        case "DEL_SHAPE":
          send("DEL_SHAPE", action.payload);
          break;
      }
    },
    [send],
  );

  const sendActiveElementUpdate = useCallback(
    (event: ClientShapeManipulation) => {
      if (!inRoom) return;
      switch (event.type) {
        case "RESIZE":
          send("RESIZE", event.payload);
          break;
        case "DRAG":
          send("DRAG", event.payload);
          break;
        case "DESELECT":
          send("DESELECT", {});
      }
    },
    [send],
  );

  const {
    cameraRef,
    cancelText,
    finishText,
    selectedElementRef,
    setTextEdit,
    textEdit,
  } = useCanvasInteraction(
    canvasRef,
    inputRef,
    textAreaRef,
    canvasState,
    canvasDispatch,
    dispatchWithSocket,
    sendCursorState,
    inRoom,
    sideToolkitRef.current,
    sendActiveElementUpdate,
    memberCursor,
    activeElementMap,
  );

  // useEffect(() => {
  //   if (!selectedShape)
  //     sendActiveElementUpdate({ type: "DESELECT", payload: {} });
  // }, [selectedShape]);
  // Keep them in sync on every render
  useEffect(() => {
    drawnShapesRef.current = canvasState.drawnShapes;
  }, [canvasState.drawnShapes]);

  // Now redrawForActiveElement always reads fresh values
  // const redrawForActiveElement = (element: DrawElement, color: string) => {
  //   const ctx = canvasRef.current?.getContext("2d");
  //   if (!ctx) return;

  //   redrawPreviousShapes(
  //     ctx,
  //     drawnShapesRef.current,
  //     camera,
  //     element,
  //     element.id,
  //     color,
  //   );
  // };
  // useRafLoop({
  //   cursorMap: memberCursor.current,
  //   activeElementMap: activeElementMap.current,
  //   redrawForActiveElement,
  //   camera: camera,
  // });

  const handleToolSelect = (toolName: AllToolTypes) => {
    if (toolName === "color") return;
    canvasDispatch({ type: "CHANGE_TOOL", payload: toolName });

    // if (toolName !== "select" && selectedElement) {
    //   setSelectedElement(undefined);
    // }
  };

  /**Handling color of stroke */
  const handleColorSelect = (
    color: { l: number; c: number; h: number },
    shape?: ShapeType | LinearType | PencilType,
  ) => {
    console.log("handle color selct stroke");
    if (shape) {
      console.log("shape hai ", shape);
      const newShape: ShapeType | LinearType | PencilType = {
        ...shape,
        strokeColor: color,
      };
      dispatchWithSocket({ type: "UPD_SHAPE", payload: newShape });
      selectedElementRef.current = newShape;
      // setSelectedElement(newShape);
      return;
    }
    canvasDispatch({ type: "CHANGE_COLOR", payload: color });
  };

  /**For size handling of stroke */
  const handleStrokeSelect = (
    size: number,
    shape?: ShapeType | LinearType | PencilType,
  ) => {
    console.log("handle stroke select size");
    if (shape) {
      const newShape: ShapeType | LinearType | PencilType = {
        ...shape,
        strokeWidth: size,
      };
      dispatchWithSocket({ type: "UPD_SHAPE", payload: newShape });
      selectedElementRef.current = newShape;
      // setSelectedElement(newShape);
      return;
    }
    canvasDispatch({ type: "CHANGE_BRUSHSIZE", payload: size });
  };

  /**Handling background color of shapes */
  const handleFillSelect = (color?: ColorType, shape?: ShapeType) => {
    console.log("handle fill select");
    if (shape) {
      console.log("shape", shape);
      const newShape: ShapeType = { ...shape, fillColor: color };
      dispatchWithSocket({ type: "UPD_SHAPE", payload: newShape });
      selectedElementRef.current = newShape;
      // setSelectedElement(newShape);
      return;
    }
  };

  const handleStrokeStyle = (
    style: "dash" | "dotted" | "normal",
    element?: ShapeType | LinearType | PencilType,
  ) => {
    if (element) {
      const newShape: ShapeType | LinearType | PencilType = {
        ...element,
        strokeType: style,
      };
      dispatchWithSocket({ type: "UPD_SHAPE", payload: newShape });
      selectedElementRef.current = newShape;
      // setSelectedElement(newShape);
      return;
    }
  };
  const handleElementDelete = (element: DrawElement) => {
    if (element) {
      const newElement: DrawElement = { ...element, isDeleted: true };
      dispatchWithSocket({ type: "UPD_SHAPE", payload: newElement });
      selectedElementRef.current = newElement;
      // setSelectedElement(newElement);
      return;
    }
  };

  const handleFontSelect = (font: FontTypes, shape?: ShapeType | TextType) => {
    if (shape) {
      let newShape: ShapeType | TextType;
      if (shape.type === "text") {
        newShape = { ...shape, fontFamily: font };
      } else {
        if (!shape.label) return;
        newShape = { ...shape, label: { ...shape.label, fontFamily: font } };
      }
      dispatchWithSocket({ type: "UPD_SHAPE", payload: newShape });
      selectedElementRef.current = newShape;
      // setSelectedElement(newShape);
      return;
    }
  };

  const handleFontSize = (size: number, shape?: TextType) => {
    if (shape) {
      const newText: TextType = { ...shape, fontSize: size };
      dispatchWithSocket({ type: "UPD_SHAPE", payload: newText });
      selectedElementRef.current = newText;
      // setSelectedElement(newText);
      return;
    }
  };

  const handleFontFamily = (font: AllowedFonts, shape?: TextType) => {
    if (shape) {
      const newText: TextType = { ...shape, fontFamily: font };
      canvasDispatch({ type: "UPD_SHAPE", payload: newText });
      selectedElementRef.current = newText;
      // setSelectedElement(newText);
      return;
    }
  };

  const handleRedo = () => {
    canvasDispatch({ type: "REDO" });
  };

  const handleUndo = () => {
    canvasDispatch({ type: "UNDO" });
  };

  return {
    canvasRef,
    inputRef,
    textAreaRef,
    canvasState,
    // selectedElement,
    // setSelectedElement,
    selectedElementRef,
    canvasDispatch,
    dispatchWithSocket,
    handleToolSelect,
    handleColorSelect,
    handleStrokeSelect,
    handleRedo,
    handleUndo,
    messages,
    setMessages,
    send,
    cameraRef,
    textEdit,
    setTextEdit,
    finishText,
    cancelText,
    inRoom,
    isOpen,
    setIsOpen,
    handleLeaveRoom,
    handleJoinRoom,
    handleCreateRoom,
    sideToolkitRef,
    handleElementDelete,
    handleStrokeStyle,
    handleFillSelect,
    setEditorState,
    handleFontSelect,
    setTextState,
    handleFontSize,
    handleFontFamily,
    slug: roomInfo.slug,
    users: roomInfo.users,
    clearCanvas,
  };
};
