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
import useCanvasRenderer from "./useCanvasRenderer";

export const useSocketWithWhiteboard = () => {
  const [canvasState, canvasDispatch] = useReducer(
    canvasReducer,
    initialCanvasState,
  );
  const [messages, setMessages] = useState<ServerMessageType[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const sideToolkitRef = useRef<HTMLDivElement | null>(null);
  const activeElementMap = useRef<ActiveElementMapType>(new Map());
  const staticDirtyRef = useRef(true);
  const scheduleRenderRef = useRef<() => void>(() => {});
  const onMessageRef = useRef<((event: ServerSocketDataType) => void) | null>(
    null,
  );

  const {
    inRoom,
    setToken,
    isOpen,
    setIsOpen,
    setRoomInfo,
    roomInfo,
    memberCursor,
  } = useSocketContext();

  const stableOnMessage = useCallback((event: ServerSocketDataType) => {
    onMessageRef.current?.(event);
  }, []);

  const { send, connect, disconnect } = useCanvasSocket(stableOnMessage);

  const sendCursorState = useCallback(
    (pos: PointType) => {
      if (!inRoom) return;
      send("CURSOR", pos);
    },
    [send, inRoom],
  );

  const dispatchWithSocket = useCallback(
    (action: Action) => {
      canvasDispatch(action);
      if (!send) return;
      switch (action.type) {
        case "ADD_SHAPE":
          send("ADD_SHAPE", action.payload);
          break;
        case "UPD_SHAPE":
          send("UPD_SHAPE", action.payload);
          break;
        case "DEL_SHAPE":
          send("DEL_SHAPE", action.payload);
          break;
        case "CLEAR_CANVAS":
          send("CLEAR_CANVAS", {});
          break;
        case "BULK_DEL_SHAPE":
          send("BULK_DEL_SHAPE", action.payload);
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
          break;
      }
    },
    [send, inRoom],
  );

  // ── 1. interaction — produces selectedElementsRef, marqueeStateRef, cameraRef
  const {
    selectedElementsRef,
    marqueeStateRef,
    cameraRef,
    cancelText,
    finishText,
    textEdit,
    setTextEdit,
    interactionState,
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
    () => scheduleRenderRef.current(), // stable bridge
    activeElementMap,
    staticDirtyRef,
  );

  // ── 2. renderer — needs refs from interaction above
  const { scheduleRender } = useCanvasRenderer(
    canvasRef,
    canvasState,
    selectedElementsRef,
    marqueeStateRef, // ← was missing
    cameraRef,
    memberCursor,
    activeElementMap,
    staticDirtyRef,
    interactionState,
  );

  // ── 3. wire actual scheduleRender into bridge ref
  scheduleRenderRef.current = scheduleRender;

  // ── 4. socket message handler — always reads latest state via closure
  onMessageRef.current = (event: ServerSocketDataType) => {
    try {
      const handler = incomingSocketHandlers[event.type];
      if (!handler) return;

      const staticMutatingEvents = [
        "ADD_SHAPE",
        "UPD_SHAPE",
        "DEL_SHAPE",
        "BULK_DEL_SHAPE",
        "DESELECT",
      ];
      if (staticMutatingEvents.includes(event.type)) {
        staticDirtyRef.current = true;
        console.log(scheduleRenderRef.current);
        scheduleRenderRef.current();
      }

      handler({
        canvasDispatch,
        event,
        memberCursorMap: memberCursor.current,
        setMessages,
        setRoomInfo,
        activeElementMap: activeElementMap.current,
        scheduleRender,
      });
    } catch (err) {
      console.error("Failed to handle socket message:", err);
    }
  };

  // ── 5. shape property handlers
  // all follow: update shape → dispatch → update ref → render
  const updateSelectedShape = useCallback(
    (updater: (shape: DrawElement) => DrawElement) => {
      // applies to first selected shape (single select context)
      const shape = selectedElementsRef.current[0];
      if (!shape) return;
      const updated = updater(shape);
      dispatchWithSocket({ type: "UPD_SHAPE", payload: [updated] });
      // replace first element in array, keep rest
      selectedElementsRef.current = [
        updated,
        ...selectedElementsRef.current.slice(1),
      ];
      staticDirtyRef.current = true;
      scheduleRenderRef.current();
    },
    [dispatchWithSocket],
  );

  const handleColorSelect = (
    color: { l: number; c: number; h: number },
    shape?: ShapeType | LinearType | PencilType,
  ) => {
    if (shape) {
      updateSelectedShape((s) => ({ ...s, strokeColor: color }));
      return;
    }
    canvasDispatch({ type: "CHANGE_COLOR", payload: color });
  };

  const handleStrokeSelect = (
    size: number,
    shape?: ShapeType | LinearType | PencilType,
  ) => {
    if (shape) {
      updateSelectedShape((s) => ({ ...s, strokeWidth: size }));
      return;
    }
    canvasDispatch({ type: "CHANGE_BRUSHSIZE", payload: size });
  };

  const handleFillSelect = (color?: ColorType, shape?: ShapeType) => {
    if (shape) updateSelectedShape((s) => ({ ...s, fillColor: color }));
  };

  const handleStrokeStyle = (
    style: "dash" | "dotted" | "normal",
    element?: ShapeType | LinearType | PencilType,
  ) => {
    if (element) updateSelectedShape((s) => ({ ...s, strokeType: style }));
  };

  const handleElementDelete = (element: DrawElement) => {
    dispatchWithSocket({ type: "BULK_DEL_SHAPE", payload: [element.id] });
    selectedElementsRef.current = selectedElementsRef.current.filter(
      (s) => s.id !== element.id,
    );
    staticDirtyRef.current = true;
    scheduleRenderRef.current();
  };

  const handleFontSelect = (font: FontTypes, shape: ShapeType | TextType) => {
    const updated =
      shape.type === "text"
        ? { ...shape, fontFamily: font }
        : shape.label
          ? { ...shape, label: { ...shape.label, fontFamily: font } }
          : shape;
    dispatchWithSocket({ type: "UPD_SHAPE", payload: [updated] });
    selectedElementsRef.current = [
      updated,
      ...selectedElementsRef.current.slice(1),
    ];
    staticDirtyRef.current = true;
    scheduleRenderRef.current();
  };

  const handleFontSize = (size: number, shape?: TextType) => {
    if (shape) updateSelectedShape((s) => ({ ...s, fontSize: size }));
  };

  const handleFontFamily = (font: AllowedFonts, shape?: TextType) => {
    if (shape) updateSelectedShape((s) => ({ ...s, fontFamily: font }));
  };

  const handleToolSelect = (toolName: AllToolTypes) => {
    if (toolName === "color") return;
    canvasDispatch({ type: "CHANGE_TOOL", payload: toolName });
  };

  const clearCanvas = () => dispatchWithSocket({ type: "CLEAR_CANVAS" });

  const handleJoinRoom = async (code: string) => {
    try {
      const data = await joinRoomService(code);
      setRoomInfo({
        ...roomInfo,
        roomId: data.roomId,
        slug: code,
        users: data.users.map(generateUserObject),
      });
      canvasDispatch({ type: "INITIALIZE_BOARD", payload: data.canvasState });
      setToken(data.token);
      connect(data.roomId, code, data.token);
      sessionStorage.setItem("activeRoom", code);
    } catch (err) {
      console.error("error in join room:", err);
      throw new AppError("Error joining a ROOM, try again!", "SERVER_ERROR");
    }
  };

  const handleCreateRoom = async () => {
    const res = await createRoomService();
    if (!res) throw new Error("Error in ROOM creation.");
    return handleJoinRoom(res.slug);
  };

  const handleLeaveRoom = async () => {
    disconnect();
    setRoomInfo({ ...roomInfo, roomId: "", slug: "" });
    setToken("");
    sessionStorage.removeItem("activeRoom");
  };

  // rejoin on refresh
  useEffect(() => {
    const lastRoom = sessionStorage.getItem("activeRoom");
    if (lastRoom) handleJoinRoom(lastRoom);
  }, []);

  useEffect(() => {
    staticDirtyRef.current = true;
    scheduleRenderRef.current();
  }, [canvasState]);

  const setTextState = (p: Partial<TextStateType>) =>
    canvasDispatch({ type: "UPD_TEXT_STATE", payload: p });
  const setEditorState = (p: Partial<SideToolKitState>) =>
    canvasDispatch({ type: "UPD_EDITOR", payload: p });

  return {
    canvasRef,
    inputRef,
    textAreaRef,
    sideToolkitRef,
    canvasState,
    canvasDispatch,
    dispatchWithSocket,
    selectedElementsRef,
    cameraRef,
    textEdit,
    setTextEdit,
    finishText,
    cancelText,
    messages,
    setMessages,
    send,
    inRoom,
    isOpen,
    setIsOpen,
    handleJoinRoom,
    handleCreateRoom,
    handleLeaveRoom,
    handleToolSelect,
    handleColorSelect,
    handleStrokeSelect,
    handleFillSelect,
    handleStrokeStyle,
    handleElementDelete,
    handleFontSelect,
    handleFontSize,
    handleFontFamily,
    handleRedo: () => canvasDispatch({ type: "REDO" }),
    handleUndo: () => canvasDispatch({ type: "UNDO" }),
    clearCanvas,
    setEditorState,
    setTextState,
    slug: roomInfo.slug,
    users: roomInfo.users,
  };
};
