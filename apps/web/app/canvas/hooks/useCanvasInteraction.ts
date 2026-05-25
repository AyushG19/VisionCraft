"use client";

import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ClientShapeManipulation, DrawElement, PointType } from "@repo/common";
import {
  Action,
  ActiveElementMapType,
  CanvasState,
  TextEditState,
} from "../types";
import resizeCanvas from "../utils/canvasResizeHelper";
import { imageCache } from "../utils/redrawPreviousShapes";
import useInteractionState from "./useInteractionState";
import { getMousePos, getMousePosOnWorld } from "../helper/coordinate.helper";
import { Camera, useCamera } from "./useCamera";
import { screenToWorld } from "../../lib/math";
import { storeImg } from "../../services/canvas.service";
import { set } from "idb-keyval";
import { createNewImage, createNewText } from "../utils/createNewShape";
import { measureText } from "../helper/canvas.helper";
import { isClickOnShape } from "../utils/isPointInShape";
import { updateCursor } from "../helper/cursorUpdate.helper";
import { createSelectInteraction } from "../helper/selectInteraction.helper";
import createDrawInteraction from "../helper/drawingInteraction.helper";

const useCanvasInteraction = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  inputRef: React.RefObject<HTMLInputElement | null>,
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>,
  canvasState: CanvasState,
  canvasDispatch: (action: Action) => void,
  dispatchWithSocket: (action: Action) => void,
  sendCursorState: (pos: PointType) => void,
  inRoom: boolean,
  sideToolkit: HTMLDivElement | null,
  sendActiveElementUpdate: (event: ClientShapeManipulation) => void,
  scheduleRender: () => void,
  activeElementMapRef: React.RefObject<ActiveElementMapType>,
  staticDirtyRef: React.MutableRefObject<boolean>,
): {
  selectedElementRef: React.RefObject<DrawElement | undefined>;
  cameraRef: React.RefObject<Camera>;
  cancelText: () => void;
  finishText: () => void;
  textEdit: TextEditState;
  setTextEdit: Dispatch<SetStateAction<TextEditState>>;
} => {
  const [textEdit, setTextEdit] = useState<TextEditState>(null);
  const interactionState = useInteractionState();
  const selectedElementRef = interactionState.tempShapeRef;

  const markStaticDirty = useCallback(() => {
    staticDirtyRef.current = true;
    scheduleRender();
  }, [scheduleRender, staticDirtyRef]);

  const { cameraRef, onPanStart, onPanMove, onPanEnd, isPanning, onWheel } =
    useCamera(canvasRef, canvasState.toolState.currentTool, markStaticDirty);

  const canvasStateRef = useRef(canvasState);
  useEffect(() => {
    canvasStateRef.current = canvasState;
  }); // runs every render to prevent stale closures

  const finishText = useCallback(() => {
    if (!textEdit || !canvasRef.current) return;
    const textState = canvasState.textState;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { width, height } = measureText(
      ctx,
      textEdit.text,
      textState.fontSize,
      textState.fontFamily,
    );
    const worldPos = screenToWorld(textEdit.x, textEdit.y, cameraRef.current);
    const element = createNewText(
      canvasState.toolState,
      textState,
      worldPos,
      textEdit.text,
      width / cameraRef.current.z,
      height / cameraRef.current.z,
    );

    dispatchWithSocket({ type: "ADD_SHAPE", payload: element });
    dispatchWithSocket({ type: "CHANGE_TOOL", payload: "select" });
    setTextEdit(null);
  }, [textEdit, canvasState.textState, cameraRef, dispatchWithSocket]);

  const cancelText = useCallback(() => {
    setTextEdit(null);
  }, []);

  const selectInteraction = createSelectInteraction(interactionState);
  const drawInteraction = createDrawInteraction(interactionState);

  useEffect(() => {
    const tool = canvasState.toolState.currentTool;
    const canvas = canvasRef.current;
    if (!canvas) return;

    updateCursor(
      canvas,
      tool,
      screenToWorld(0, 0, cameraRef.current),
      selectedElementRef,
      canvasState.drawnShapes,
      isPanning.current,
      false,
      interactionState.interaction.current.isDragging,
      interactionState.interaction.current.isResizing,
    );
  }, [
    canvasState.toolState.currentTool,
    cameraRef,
    selectedElementRef,
    canvasState.drawnShapes,
    isPanning,
    interactionState.interaction,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const fileInput = inputRef.current;
    if (!canvas || !fileInput) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      resizeCanvas(
        canvas,
        ctx,
        () => {
          staticDirtyRef.current = true;
          scheduleRender();
        },
        canvasStateRef.current.toolState,
      );
    };

    // Initial resize
    handleResize();

    const onKeyDown = (e: KeyboardEvent) => {
      if (textAreaRef.current) return;
      const currentTool = canvasStateRef.current.toolState.currentTool;

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElementRef.current
      ) {
        e.preventDefault();
        dispatchWithSocket({
          type: "DEL_SHAPE",
          payload: selectedElementRef.current.id,
        });
        // Unlock the shape for other users when deleted
        sendActiveElementUpdate({ type: "DESELECT", payload: {} });
        selectedElementRef.current = undefined;
        markStaticDirty();
      }

      if (currentTool === "text") return null;

      if (e.key === "q")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "select" });
      if (e.key === "w")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "hand" });
      if (e.key === "e")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "ellipse" });
      if (e.key === "r")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "rectangle" });
      if (e.key === "a")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "diamond" });
      if (e.key === "s")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "line" });
      if (e.key === "d")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "arrow" });
      if (e.key === "f")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "pencil" });
      if (e.key === "z")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "eraser" });
      if (e.key === "x")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "text" });
      if (e.key === "c") inputRef.current?.click();
      if (e.key === "v")
        canvasDispatch({ type: "CHANGE_TOOL", payload: "color" });

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        canvasDispatch({ type: "UNDO" });
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        canvasDispatch({ type: "REDO" });
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const pos = getMousePosOnWorld(
        canvas,
        { x: e.clientX, y: e.clientY },
        cameraRef.current,
      );
      const currentState = canvasStateRef.current;
      const tool = currentState.toolState.currentTool;
      const current = selectedElementRef.current;

      if (tool === "select") {
        const clickedEle = selectInteraction.handleSelectMouseDown(
          pos,
          currentState,
          selectedElementRef,
          activeElementMapRef,
        );
        // if currently selected shape,and no new shape,make if shape selected flase remove active element from socket for others too
        if (current?.id === clickedEle?.id) {
          return;
        }

        if (current) {
          sendActiveElementUpdate({ type: "DESELECT", payload: {} });
          selectedElementRef.current = undefined;
        }

        if (clickedEle) {
          sendActiveElementUpdate({ type: "DRAG", payload: clickedEle });
          selectedElementRef.current = clickedEle;
        }
        // scheduleRender();
        markStaticDirty();
      } else if (tool === "text") {
        e.preventDefault();
        textAreaRef.current?.blur();
        const screenPos = { x: e.clientX, y: e.clientY };
        const canvasPos = getMousePos(canvasRef, screenPos);

        setTextEdit(() => ({
          elementId: "1",
          text: "",
          x: canvasPos.x,
          y: canvasPos.y,
        }));
      } else if (tool === "hand") {
        onPanStart(e);
      } else if (tool === "eraser") {
        interactionState.eraseStateRef.current.isErasing = true;
      } else {
        if (selectedElementRef.current) {
          selectedElementRef.current = undefined;
          markStaticDirty();
        }
        const preview = drawInteraction.handleDrawMouseDown(
          pos,
          currentState.toolState,
          currentState.sideToolKitState,
        );
        if (preview) selectedElementRef.current = preview;
        scheduleRender();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const pos = getMousePosOnWorld(
        canvas,
        { x: e.clientX, y: e.clientY },
        cameraRef.current,
      );
      const currentState = canvasStateRef.current;
      const tool = currentState.toolState.currentTool;

      sendCursorState(pos);

      switch (tool) {
        case "select": {
          const preview = selectInteraction.handleSelectMouseMove(
            pos,
            selectedElementRef.current,
          );
          if (preview) {
            selectedElementRef.current = preview;
            sendActiveElementUpdate({ type: "DRAG", payload: preview });
            scheduleRender();
          }
          break;
        }
        case "hand": {
          onPanMove(e);
          break;
        }
        case "eraser": {
          if (!interactionState.eraseStateRef.current.isErasing) return;
          const clickedShape = [...currentState.drawnShapes].find(
            (shape: DrawElement) => isClickOnShape(pos, shape),
          );
          if (!clickedShape) return;

          const isLockedByOther = [
            ...activeElementMapRef.current.values(),
          ].some((entry) => entry.element.id === clickedShape.id);
          if (
            isLockedByOther ||
            clickedShape.id === selectedElementRef.current?.id
          )
            return;

          canvasDispatch({
            type: "UPD_SHAPE",
            payload: { ...clickedShape, opacity: 0.2 },
          });
          interactionState.eraseStateRef.current.elementsToDelete.push(
            clickedShape.id,
          );
          break;
        }
        default: {
          if (!selectedElementRef.current) break;
          const preview = drawInteraction.handleDrawMouseMove(
            pos,
            currentState.toolState,
            currentState.sideToolKitState,
            selectedElementRef.current,
          );
          if (preview) {
            selectedElementRef.current = {
              ...preview,
              id: selectedElementRef.current.id,
            };
            sendActiveElementUpdate({
              type: "DRAG",
              payload: selectedElementRef.current,
            });
            scheduleRender();
          }
        }
      }

      updateCursor(
        canvas,
        tool,
        pos,
        selectedElementRef,
        currentState.drawnShapes,
        isPanning.current,
        false,
        interactionState.interaction.current.isDragging,
        interactionState.interaction.current.isResizing,
      );
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.target === sideToolkit) return;
      const pos = getMousePosOnWorld(
        canvas,
        { x: e.clientX, y: e.clientY },
        cameraRef.current,
      );
      const currentState = canvasStateRef.current;
      const tool = currentState.toolState.currentTool;

      switch (tool) {
        case "select": {
          const preview = selectInteraction.handleSelectMouseUp(
            pos,
            selectedElementRef.current,
          );
          if (preview) {
            selectedElementRef.current = preview;
            dispatchWithSocket({ type: "UPD_SHAPE", payload: preview });
            markStaticDirty();
            scheduleRender();
          }
          break;
        }
        case "hand": {
          onPanEnd();
          break;
        }
        case "eraser": {
          dispatchWithSocket({
            type: "BULK_DEL_SHAPE",
            payload: interactionState.eraseStateRef.current.elementsToDelete,
          });
          interactionState.eraseStateRef.current = {
            isErasing: false,
            elementsToDelete: [],
          };
          scheduleRender();
          break;
        }
        default: {
          if (!selectedElementRef.current) break;
          const preview = drawInteraction.handleDrawMouseUp(
            pos,
            currentState.toolState,
            currentState.sideToolKitState,
            selectedElementRef.current,
          );
          sendActiveElementUpdate({ type: "DESELECT", payload: {} });
          if (preview) {
            dispatchWithSocket({
              type: "ADD_SHAPE",
              payload: { ...preview, id: selectedElementRef.current.id },
            });
            markStaticDirty();
          }
          selectedElementRef.current = undefined;
        }
      }

      if (canvasStateRef.current.toolState.currentTool !== "select") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "select" });
      }
    };

    const handleWheel = (e: WheelEvent) => onWheel(e);

    const handleFileInput = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const fileList = target.files;
      if (!fileList || fileList.length === 0) return;

      const lastImg = fileList[fileList.length - 1]!;

      // Reset input so the same file can be uploaded again if deleted
      target.value = "";

      const worker = new Worker(
        new URL("../../worker/worker.ts", import.meta.url),
      );
      const imgBitmap = await createImageBitmap(lastImg);

      worker.postMessage({ imgBitmap });
      worker.onmessage = async (message) => {
        const compressedBlob = message.data;
        const compressedBitmap = await createImageBitmap(compressedBlob);
        const newImage = createNewImage(
          compressedBitmap.width / cameraRef.current.z,
          compressedBitmap.height / cameraRef.current.z,
          cameraRef.current,
          canvasState.toolState.currentColor,
          canvasState.toolState.strokeSize,
        );

        await set(newImage.id, compressedBlob);
        imageCache.set(newImage.id, compressedBitmap);
        dispatchWithSocket({ type: "ADD_SHAPE", payload: newImage });

        if (inRoom) {
          storeImg(compressedBlob).then((res: any) => {
            const updatedShape = { ...newImage, link: res };
            dispatchWithSocket({ type: "UPD_SHAPE", payload: updatedShape });
          });
        }
      };
    };

    canvas.addEventListener("pointerdown", onMouseDown);
    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("pointermove", onMouseMove);
    window.addEventListener("pointerup", onMouseUp);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", onKeyDown);
    fileInput.addEventListener("change", handleFileInput);

    return () => {
      canvas.removeEventListener("pointerdown", onMouseDown);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointermove", onMouseMove);
      window.removeEventListener("pointerup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", onKeyDown);
      fileInput.removeEventListener("change", handleFileInput);
    };
  }, [
    inRoom,
    cameraRef,
    dispatchWithSocket,
    sendActiveElementUpdate,
    markStaticDirty,
    onPanEnd,
    onPanMove,
    onPanStart,
    onWheel,
    scheduleRender,
    selectInteraction,
    drawInteraction,
    interactionState,
  ]);

  return {
    selectedElementRef,
    cameraRef,
    cancelText,
    finishText,
    textEdit,
    setTextEdit,
  };
};

export default useCanvasInteraction;
