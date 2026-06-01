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
  InteractionState,
  TextEditState,
} from "../types";
import resizeCanvas from "../utils/canvasResizeHelper";
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
import {
  createSelectInteraction,
  MarqueeState,
} from "../helper/selectInteraction.helper";
import createDrawInteraction from "../helper/drawingInteraction.helper";
import { setImage } from "../utils/imageCache";

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
  setSelectedElelmentsForUI: React.Dispatch<
    React.SetStateAction<DrawElement | undefined>
  >,
): {
  selectedElementsRef: React.RefObject<DrawElement[]>;
  marqueeStateRef: React.RefObject<MarqueeState | null>;
  cameraRef: React.RefObject<Camera>;
  cancelText: () => void;
  finishText: () => void;
  textEdit: TextEditState;
  setTextEdit: Dispatch<SetStateAction<TextEditState>>;
  interactionState: ReturnType<typeof useInteractionState>;
} => {
  const [textEdit, setTextEdit] = useState<TextEditState>(null);
  const interactionState = useInteractionState();
  const selectedElementsRef = interactionState.tempShapesRef; // DrawElement[]
  const marqueeStateRef = useRef<MarqueeState | null>(null);
  const textEditRef = useRef<TextEditState>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../worker/worker.ts", import.meta.url),
    );
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    textEditRef.current = textEdit;
  }, [textEdit]);

  const markStaticDirty = useCallback(() => {
    staticDirtyRef.current = true;
    scheduleRender();
  }, [scheduleRender, staticDirtyRef]);

  const { cameraRef, onPanStart, onPanMove, onPanEnd, isPanning, onWheel } =
    useCamera(canvasRef, canvasState.toolState.currentTool, markStaticDirty);

  const canvasStateRef = useRef(canvasState);
  useEffect(() => {
    canvasStateRef.current = canvasState;
  });

  const finishText = useCallback(() => {
    const currentText = textEditRef.current;
    if (!currentText || !canvasRef.current) return;
    const textState = canvasState.textState;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { width, height } = measureText(
      ctx,
      currentText.text,
      textState.fontSize,
      textState.fontFamily,
    );
    const worldPos = screenToWorld(
      currentText.x,
      currentText.y,
      cameraRef.current,
    );
    const element = createNewText(
      canvasState.toolState,
      textState,
      worldPos,
      currentText.text,
      width / cameraRef.current.z,
      height / cameraRef.current.z,
    );

    dispatchWithSocket({ type: "ADD_SHAPE", payload: element });
    dispatchWithSocket({ type: "CHANGE_TOOL", payload: "select" });
    setTextEdit(null);
  }, [canvasState.textState, cameraRef, dispatchWithSocket]);

  const cancelText = useCallback(() => setTextEdit(null), []);

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
      selectedElementsRef,
      canvasState.drawnShapes,
      isPanning.current,
      false,
      interactionState.interaction.current.isDragging,
      interactionState.interaction.current.isResizing,
    );
  }, [canvasState.toolState.currentTool]);

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
    handleResize();

    const onKeyDown = (e: KeyboardEvent) => {
      if (textAreaRef.current) return;
      const currentTool = canvasStateRef.current.toolState.currentTool;

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElementsRef.current.length > 0
      ) {
        e.preventDefault();
        const ids = selectedElementsRef.current.map((s) => s.id);
        dispatchWithSocket({ type: "BULK_DEL_SHAPE", payload: ids });
        sendActiveElementUpdate({ type: "DESELECT", payload: {} });
        selectedElementsRef.current = [];
        markStaticDirty();
        return;
      }

      if (currentTool === "text") return;

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
      e.stopPropagation();
      if (textAreaRef.current) finishText();

      const pos = getMousePosOnWorld(
        canvas,
        { x: e.clientX, y: e.clientY },
        cameraRef.current,
      );
      const currentState = canvasStateRef.current;
      const tool = currentState.toolState.currentTool;
      const prev = selectedElementsRef.current;

      if (tool === "select") {
        const next = selectInteraction.handleSelectMouseDown(
          pos,
          currentState,
          prev,
          activeElementMapRef,
          e.shiftKey,
        );

        // same selection and same interaction mode — nothing to update
        if (
          next.length === prev.length &&
          next.every((s, i) => s.id === prev[i]?.id)
        )
          return;

        selectedElementsRef.current = next;

        if (next.length === 0 && prev.length > 0) {
          sendActiveElementUpdate({ type: "DESELECT", payload: {} });
          prev.forEach((e) => {
            dispatchWithSocket({ type: "ADD_SHAPE", payload: e });
          });
          setSelectedElelmentsForUI(undefined);
        } else if (next.length > 0) {
          // if (!e.shiftKey)
          //   sendActiveElementUpdate({ type: "DRAG", payload: next });
          sendActiveElementUpdate({ type: "DRAG", payload: next });
          dispatchWithSocket({ type: "UPD_SHAPE", payload: next });
          setSelectedElelmentsForUI(next[0]);
        }

        markStaticDirty();
        return;
      }

      if (tool === "text") {
        console.log(textEdit, textAreaRef.current);
        const canvasPos = getMousePos(canvasRef, {
          x: e.clientX,
          y: e.clientY,
        });
        setTextEdit({
          elementId: "1",
          text: "",
          x: canvasPos.x,
          y: canvasPos.y,
        });
        return;
      }

      if (tool === "hand") {
        onPanStart(e);
        return;
      }

      if (tool === "eraser") {
        interactionState.eraseStateRef.current.isErasing = true;
        return;
      }

      // drawing tool — clear any existing selection first
      if (prev.length > 0) {
        selectedElementsRef.current = [];
        markStaticDirty();
      }

      const preview = drawInteraction.handleDrawMouseDown(
        pos,
        currentState.toolState,
        currentState.sideToolKitState,
      );
      if (preview) selectedElementsRef.current = [preview];
      scheduleRender();
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
          const result = selectInteraction.handleSelectMouseMove(
            pos,
            selectedElementsRef.current,
            activeElementMapRef,
            currentState,
            e.shiftKey,
          );

          // null = nothing changed, skip render
          if (!result) break;

          selectedElementsRef.current = result.shapes;
          marqueeStateRef.current = result.marquee;

          // only send drag signal when actually dragging, not during marquee
          if (
            result.marquee === null &&
            result.shapes[0] &&
            (interactionState.interaction.current.isDragging ||
              interactionState.interaction.current.isResizing)
          ) {
            sendActiveElementUpdate({
              type: "DRAG",
              payload: result.shapes,
            });
          }

          scheduleRender();
          break;
        }

        case "hand": {
          onPanMove(e);
          break;
        }
        case "text": {
          break;
        }

        case "eraser": {
          console.log(
            "Eraser start",
            interactionState.eraseStateRef.current.isErasing,
          );
          if (!interactionState.eraseStateRef.current.isErasing) return;
          const clicked = [...currentState.drawnShapes].find((s) =>
            isClickOnShape(pos, s),
          );
          if (!clicked) return;

          const isLockedByOther = [
            ...activeElementMapRef.current.values(),
          ].some((e) => e.element.id === clicked.id);
          const isLocalSelected = selectedElementsRef.current.some(
            (s) => s.id === clicked.id,
          );
          console.log("Eraser prev");
          if (isLockedByOther || isLocalSelected) return;
          console.log("Eraser next");
          canvasDispatch({
            type: "UPD_SHAPE",
            payload: [{ ...clicked, opacity: 0.2 }],
          });
          markStaticDirty();
          scheduleRender();
          interactionState.eraseStateRef.current.elementsToDelete.push(
            clicked.id,
          );
          break;
        }

        default: {
          // drawing — tempShapesRef[0] is the in-progress shape
          const current = selectedElementsRef.current[0];
          if (!current) break;

          const preview = drawInteraction.handleDrawMouseMove(
            pos,
            currentState.toolState,
            currentState.sideToolKitState,
            current,
          );
          if (preview) {
            // preserve original id through the preview
            selectedElementsRef.current = [{ ...preview, id: current.id }];
            sendActiveElementUpdate({
              type: "DRAG",
              payload: selectedElementsRef.current,
            });
            scheduleRender();
          }
          break;
        }
      }

      updateCursor(
        canvas,
        tool,
        pos,
        selectedElementsRef,
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
          const result = selectInteraction.handleSelectMouseUp(
            pos,
            selectedElementsRef.current,
            currentState,
            e.shiftKey,
          );

          selectedElementsRef.current = result.shapes;
          marqueeStateRef.current = null; // always clear marquee on mouseup

          if (result.didCommit) {
            dispatchWithSocket({ type: "UPD_SHAPE", payload: result.shapes });
            // sendActiveElementUpdate({ type: "DESELECT", payload: {} });
          }

          markStaticDirty();
          scheduleRender();
          break;
        }

        case "hand": {
          onPanEnd();
          break;
        }
        case "text": {
          e.preventDefault();
          e.stopPropagation();
          textAreaRef.current?.focus();
          break;
        }

        case "eraser": {
          const ids = interactionState.eraseStateRef.current.elementsToDelete;
          if (ids.length > 0) {
            dispatchWithSocket({ type: "DEL_SHAPE", payload: ids });
          }
          interactionState.eraseStateRef.current = {
            isErasing: false,
            elementsToDelete: [],
          };
          scheduleRender();
          break;
        }

        default: {
          const current = selectedElementsRef.current[0];
          const committed = drawInteraction.handleDrawMouseUp(
            pos,
            currentState.toolState,
            currentState.sideToolKitState,
            current,
          );
          sendActiveElementUpdate({ type: "DESELECT", payload: {} });
          if (committed && current) {
            dispatchWithSocket({
              type: "ADD_SHAPE",
              payload: { ...committed, id: current.id },
            });
          }
          selectedElementsRef.current = [];
          markStaticDirty();
          break;
        }
      }
      console.log(textEdit, textAreaRef.current);

      if (canvasStateRef.current.toolState.currentTool !== "select") {
        console.log(tool);
        canvasDispatch({ type: "CHANGE_TOOL", payload: "select" });
      }
    };

    const handleWheel = (e: WheelEvent) => onWheel(e);

    const handleFileInput = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const fileList = target.files;
      if (!fileList || fileList.length === 0) return;

      const lastImg = fileList[fileList.length - 1]!;
      target.value = "";

      if (!workerRef.current) return;

      workerRef.current.postMessage({ file: lastImg });
      workerRef.current.onmessage = async (message) => {
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
        setImage(newImage.id, compressedBitmap);
        dispatchWithSocket({ type: "ADD_SHAPE", payload: newImage });
        if (inRoom) {
          storeImg(compressedBlob).then((res: any) => {
            dispatchWithSocket({
              type: "UPD_SHAPE",
              payload: [{ ...newImage, link: res }],
            });
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
  }, [inRoom, cameraRef]);

  return {
    selectedElementsRef,
    marqueeStateRef,
    cameraRef,
    cancelText,
    finishText,
    textEdit,
    setTextEdit,
    interactionState,
  };
};

export default useCanvasInteraction;
