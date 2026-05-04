"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ClientShapeManipulation,
  DrawElement,
  PointType,
  ShapeType,
} from "@repo/common";
import { Action, CanvasState, TextEditState } from "../types";
import resizeCanvas from "../utils/canvasResizeHelper";
import redrawPreviousShapes, {
  imageCache,
} from "../utils/redrawPreviousShapes";

import useInteractionState from "./useInteractionState";
import useCanvasCursor from "./useCanvasCursor";
import useSelectInteraction from "./useSelectInteraction";
import useDrawInteraction from "./useDrawingInteraction";
import useCanvasRenderer from "./useCanvasRenderer";
import { getMousePos } from "../helper/coordinate.helper";
import { useCamera } from "./useCamera";
import { screenToWorld } from "app/lib/math";
import { storeImg } from "app/services/canvas.service";
import { set } from "idb-keyval";
import { createNewImage, createNewText } from "../utils/createNewShape";
import { measureText } from "../helper/canvas.helper";

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
  activeElementMap: Map<
    string,
    {
      isDirty: boolean;
      element: DrawElement;
      operation: "resize" | "drag";
    }
  >,
) => {
  const [selectedShape, setSelectedShape] = useState<DrawElement | undefined>(
    undefined,
  );
  const [textEdit, setTextEdit] = useState<TextEditState>(null);
  const interactionState = useInteractionState();
  const cursor = useCanvasCursor(canvasRef);
  const { camera, onPanStart, onPanMove, onPanEnd, isPanning, onWheel } =
    useCamera(canvasRef, canvasState.toolState.currentTool);

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

    const element = createNewText(
      canvasState.toolState,
      textState,
      screenToWorld(textEdit.x, textEdit.y, camera),
      textEdit.text,
      width / camera.z,
      height / camera.z,
    );

    dispatchWithSocket({ type: "ADD_SHAPE", payload: element });
    dispatchWithSocket({ type: "CHANGE_TOOL", payload: "select" });
    setTextEdit(null);

    console.log("cameraera;", camera);
  }, [textEdit, canvasState.textState]);

  const cancelText = useCallback(() => {
    setTextEdit(null);
  }, []);

  const selectInteraction = useSelectInteraction(
    interactionState,
    setSelectedShape,
    dispatchWithSocket,
  );

  const drawInteraction = useDrawInteraction(
    interactionState,
    dispatchWithSocket,
  );

  const selectedShapeRef = useRef(selectedShape);
  const canvasStateRef = useRef(canvasState);

  useCanvasRenderer(
    canvasRef,
    canvasState,
    selectedShape,
    canvasStateRef,
    selectedShapeRef,
    inRoom,
    camera,
  );

  useEffect(() => {
    const tool = canvasState.toolState.currentTool;

    // if (tool === "image") {
    //   inputRef.current?.click();
    //   inputRef.current?.blur();
    // }
    cursor.updateCursor(
      tool,
      screenToWorld(0, 0, camera),
      selectedShape as ShapeType,
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
    if (!canvas || !fileInput) {
      console.log("somethng missing:");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas(
      canvas,
      ctx,
      () =>
        redrawPreviousShapes(ctx, canvasStateRef.current.drawnShapes, camera),
      canvasStateRef.current.toolState,
    );

    const handleResize = () => {
      resizeCanvas(
        canvas,
        ctx,
        () =>
          redrawPreviousShapes(ctx, canvasStateRef.current.drawnShapes, camera),
        canvasStateRef.current.toolState,
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (textAreaRef.current) return;
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedShapeRef.current
      ) {
        e.preventDefault();
        dispatchWithSocket({
          type: "DEL_SHAPE",
          payload: selectedShapeRef.current,
        });
        setSelectedShape(undefined);
      }

      if (canvasState.toolState.currentTool === "text") return null;
      if (e.key === "q") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "select" });
      }

      if (e.key === "w") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "hand" });
      }

      if (e.key === "e") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "ellipse" });
      }

      if (e.key === "r") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "rectangle" });
      }

      if (e.key === "a") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "diamond" });
      }

      if (e.key === "s") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "line" });
      }

      if (e.key === "d") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "arrow" });
      }

      if (e.key === "f") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "pencil" });
      }

      if (e.key === "z") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "eraser" });
      }

      if (e.key === "x") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "text" });
      }

      if (e.key === "c") {
        inputRef.current?.click();
      }

      if (e.key === "v") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "color" });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        canvasDispatch({ type: "UNDO" });
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        canvasDispatch({ type: "REDO" });
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const pos = getMousePos(canvasRef, { x: e.clientX, y: e.clientY });
      const currentSelected = selectedShapeRef.current;
      const currentState = canvasStateRef.current;
      const tool = currentState.toolState.currentTool;
      if (tool === "select") {
        const newSelected = selectInteraction.handleSelectMouseDown(
          pos,
          currentSelected,
          currentState,
          activeElementMap,
        );
        if (newSelected?.type === "text") {
          setTextEdit({
            elementId: newSelected.id,
            text: newSelected.text,
            x: newSelected.startX,
            y: newSelected.startY,
          });
        }
        if (newSelected) {
          setSelectedShape(newSelected);
          canvasDispatch({
            type: "UPD_SHAPE",
            payload: newSelected,
          });
        } else {
          setSelectedShape(undefined);
        }
        // } else {
        //   if (selectedShape)
        //     canvasDispatch({
        //       type: "UPD_SHAPE",
        //       payload: { ...selectedShape, isSelected: false },
        //     });
        //   setSelectedShape(undefined);
        // }
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      const pos = getMousePos(canvasRef, { x: e.clientX, y: e.clientY });
      const currentState = canvasStateRef.current;
      const currentSelected = selectedShapeRef.current;
      const tool = currentState.toolState.currentTool;
      console.log("current tool", tool);

      if (tool === "select") {
        const newSelected = selectInteraction.handleSelectMouseDown(
          screenToWorld(pos.x, pos.y, camera),
          currentSelected,
          currentState,
          activeElementMap,
        );
        setSelectedShape(newSelected);
      } else if (tool === "text") {
        e.preventDefault();
        textAreaRef.current?.blur();
        setTextEdit(() => ({
          elementId: "1",
          text: "",
          x: pos.x,
          y: pos.y,
        }));
      } else if (tool === "hand") {
        onPanStart(e);
      } else {
        drawInteraction.handleDrawMouseDown(
          screenToWorld(pos.x, pos.y, camera),
          currentState.toolState,
        );
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const pos = getMousePos(canvasRef, { x: e.clientX, y: e.clientY });
      const currentState = canvasStateRef.current;
      const currentSelected = selectedShapeRef.current;
      const tool = currentState.toolState.currentTool;

      sendCursorState(screenToWorld(pos.x, pos.y, camera));

      if (tool === "select") {
        selectInteraction.handleSelectMouseMove(
          screenToWorld(pos.x, pos.y, camera),
          ctx,
          currentSelected,
          currentState,
          camera,
          sendActiveElementUpdate,
        );
      } else if (tool === "hand") {
        onPanMove(e);
      } else {
        drawInteraction.handleDrawMouseMove(
          screenToWorld(pos.x, pos.y, camera),
          ctx,
          currentState.toolState,
          currentState.sideToolKitState,
          currentState.drawnShapes,
          currentSelected?.id,
          camera,
        );
      }

      cursor.updateCursor(
        tool,
        screenToWorld(pos.x, pos.y, camera),
        currentSelected as ShapeType,
        currentState.drawnShapes,
        isPanning.current,
        false,
        interactionState.interaction.current.isDragging,
        interactionState.interaction.current.isResizing,
      );
    };

    const onMouseUp = (e: MouseEvent) => {
      console.log("up ", e.target, sideToolkit);
      if (e.target === sideToolkit) {
        return;
      }
      const pos = getMousePos(canvasRef, { x: e.clientX, y: e.clientY });
      const currentState = canvasStateRef.current;
      const currentSelected = selectedShapeRef.current;
      const tool = currentState.toolState.currentTool;

      if (tool === "select") {
        selectInteraction.handleSelectMouseUp(
          screenToWorld(pos.x, pos.y, camera),
          currentSelected,
        );
      } else if (tool === "hand") {
        onPanEnd();
      } else {
        drawInteraction.handleDrawMouseUp(
          screenToWorld(pos.x, pos.y, camera),
          currentState.toolState,
          currentState.sideToolKitState,
        );
      }

      redrawPreviousShapes(
        ctx,
        currentState.drawnShapes,
        camera,
        currentSelected,
        currentSelected?.id,
      );
      canvasDispatch({ type: "CHANGE_TOOL", payload: "select" });
    };

    const handleWheel = (e: WheelEvent) => {
      onWheel(e);
    };

    const handleFileInput = async () => {
      const fileList = fileInput.files;
      console.log("in file");
      if (!fileList || fileList.length === 0) return;
      console.log("file item", fileList[fileList.length - 1]);
      const lastImg = fileList[fileList.length - 1]!;

      console.log("Mime type:", lastImg.type);
      //clean data and optimize
      const worker = new Worker(
        new URL("../../worker/worker.ts", import.meta.url),
      );
      const imgBitmap = await createImageBitmap(lastImg);

      // console.log("newimg", newImage);

      worker.postMessage({ imgBitmap });
      worker.onmessage = async (message) => {
        const compressedBlob = message.data;

        const compressedBitmap = await createImageBitmap(compressedBlob);
        const newImage = createNewImage(
          compressedBitmap.width / camera.z,
          compressedBitmap.height / camera.z,
          camera,
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
      // const tempUrl = URL.createObjectURL(lastImg);
      // const img = new Image();
      // img.onload = () => ctx.drawImage(img, 0, 0);
      // img.src =
      //   "http://res.cloudinary.com/dg6spymhq/image/upload/v1775821766/djv9uk6ksl2s344mnpqu.webp";
    };

    canvas.addEventListener("pointerdown", onMouseDown);
    canvas.addEventListener("dblclick", handleDoubleClick);
    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("pointermove", onMouseMove);
    canvas.addEventListener("pointerup", onMouseUp);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", onKeyDown);
    fileInput.addEventListener("change", handleFileInput);

    redrawPreviousShapes(
      ctx,
      canvasStateRef.current.drawnShapes,
      camera,
      selectedShape,
      selectedShape?.id,
    );

    return () => {
      canvas.removeEventListener("pointerdown", onMouseDown);
      canvas.removeEventListener("dblclick", handleDoubleClick);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointermove", onMouseMove);
      canvas.removeEventListener("pointerup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", onKeyDown);
      fileInput.removeEventListener("change", handleFileInput);
    };
  }, [inRoom, camera]);

  useEffect(() => {
    selectedShapeRef.current = selectedShape;
  }, [selectedShape]);

  useEffect(() => {
    canvasStateRef.current = canvasState;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    redrawPreviousShapes(
      ctx,
      canvasState.drawnShapes,
      camera,
      selectedShape,
      selectedShape?.id,
    );
    console.log("redraw occured");
  }, [canvasState]);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if(!canvas) return;
  //   const ctx = canvas.getContext("2d");
  //   resizeCanvas(canvas,ctx,redrawPreviousShapes,);
  // }, [isOpen]);

  return {
    selectedShape,
    setSelectedShape,
    camera,
    cancelText,
    finishText,
    textEdit,
    setTextEdit,
  };
};

export default useCanvasInteraction;
