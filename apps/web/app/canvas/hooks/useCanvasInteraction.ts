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
import redrawPreviousShapes, {
  imageCache,
} from "../utils/redrawPreviousShapes";

import useInteractionState from "./useInteractionState";
import useSelectInteraction from "./useSelectInteraction";
import useDrawInteraction from "./useDrawingInteraction";
import { getMousePos, getMousePosOnWorld } from "../helper/coordinate.helper";
import { Camera, useCamera } from "./useCamera";
import { screenToWorld, worldToScreen } from "../../lib/math";
import { storeImg } from "../../services/canvas.service";
import { set } from "idb-keyval";
import { createNewImage, createNewText } from "../utils/createNewShape";
import { measureText } from "../helper/canvas.helper";
import { isClickOnShape } from "../utils/isPointInShape";
import { MemberCursor } from "@repo/hooks";
import useCanvasRenderer from "./useCanvasRenderer";
import { updateCursor } from "../helper/cursorUpdate.helper";

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
  memberCursorMapRef: React.RefObject<MemberCursor>,
  activeElementMapRef: React.RefObject<ActiveElementMapType>,
): {
  selectedElementRef: React.RefObject<DrawElement | undefined>;
  cameraRef: React.RefObject<Camera>;
  cancelText: () => void;
  finishText: () => void;
  textEdit: TextEditState;
  setTextEdit: Dispatch<SetStateAction<TextEditState>>;
} => {
  // const [selectedElement, setSelectedElement] = useState<
  //   DrawElement | undefined
  // >(undefined);
  const [textEdit, setTextEdit] = useState<TextEditState>(null);
  const interactionState = useInteractionState();
  const selectedElementRef = interactionState.tempShapeRef;
  // const cursor = useCanvasCursor(canvasRef);
  const staticDirtyRef = useRef(true);
  const markStaticDirty = useCallback(() => {
    staticDirtyRef.current = true;
  }, []);

  // 2. useCamera gets markStaticDirty, returns cameraRef
  const { cameraRef, onPanStart, onPanMove, onPanEnd, isPanning, onWheel } =
    useCamera(canvasRef, canvasState.toolState.currentTool, markStaticDirty);

  useEffect(() => {
    canvasStateRef.current = canvasState;
  }); // no deps = runs every render

  useCanvasRenderer(
    canvasRef,
    canvasState,
    selectedElementRef,
    cameraRef,
    memberCursorMapRef,
    activeElementMapRef,
    staticDirtyRef,
  );

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

    console.log("cameraRefera;", cameraRef);
  }, [textEdit, canvasState.textState]);

  const cancelText = useCallback(() => {
    setTextEdit(null);
  }, []);

  const selectInteraction = useSelectInteraction(
    interactionState,
    dispatchWithSocket,
  );

  const drawInteraction = useDrawInteraction(
    interactionState,
    dispatchWithSocket,
  );

  const canvasStateRef = useRef(canvasState);

  useEffect(() => {
    const tool = canvasState.toolState.currentTool;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // if (tool === "image") {
    //   inputRef.current?.click();
    //   inputRef.current?.blur();
    // }
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
        redrawPreviousShapes(
          ctx,
          canvasStateRef.current.drawnShapes,
          cameraRef.current,
          activeElementMapRef.current,
        ),
      canvasStateRef.current.toolState,
    );

    const handleResize = () => {
      resizeCanvas(
        canvas,
        ctx,
        () =>
          redrawPreviousShapes(
            ctx,
            canvasStateRef.current.drawnShapes,
            cameraRef.current,
            activeElementMapRef.current,
          ),
        canvasStateRef.current.toolState,
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (textAreaRef.current) return;
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElementRef.current
      ) {
        e.preventDefault();
        dispatchWithSocket({
          type: "DEL_SHAPE",
          payload: selectedElementRef.current.id,
        });
        // setSelectedElement(undefined);
        selectedElementRef.current = undefined;
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

    // const handleDoubleClick = (e: MouseEvent) => {
    //   const pos = getMousePos(canvasRef, { x: e.clientX, y: e.clientY });
    //   const currentSelected = selectedElementRef.current;
    //   const currentState = canvasStateRef.current;
    //   const tool = currentState.toolState.currentTool;
    //   if (tool === "select") {
    //     const newSelected = selectInteraction.handleSelectMouseDown(
    //       pos,
    //       currentState,
    //       selectedElementRef,
    //       // activeElementMap,
    //       sendActiveElementUpdate,
    //     );
    //     if (newSelected?.type === "text") {
    //       setTextEdit({
    //         elementId: newSelected.id,
    //         text: newSelected.text,
    //         x: newSelected.startX,
    //         y: newSelected.startY,
    //       });
    //     }
    //     if (newSelected) {
    //       setSelectedElement(newSelected);
    //       canvasDispatch({
    //         type: "UPD_SHAPE",
    //         payload: newSelected,
    //       });
    //     } else {
    //       setSelectedElement(undefined);
    //     }
    //     // } else {
    //     //   if (selectedShape)
    //     //     canvasDispatch({
    //     //       type: "UPD_SHAPE",
    //     //       payload: { ...selectedShape, isSelected: false },
    //     //     });
    //     //   setSelectedElement(undefined);
    //     // }
    //   }
    // };
    const onMouseDown = (e: MouseEvent) => {
      // const worldPos = screenToWorld(...getMousePos(canvasRef, { x: e.clientX, y: e.clientY }),cameraRef);
      const pos = getMousePosOnWorld(
        canvas,
        { x: e.clientX, y: e.clientY },
        cameraRef.current,
      );
      const currentState = canvasStateRef.current;
      const tool = currentState.toolState.currentTool;
      console.log("Mouse down", "current tool :", tool);

      if (tool === "select") {
        const newshape = selectInteraction.handleSelectMouseDown(
          pos,
          currentState,
          selectedElementRef,
          activeElementMapRef,
        );

        //setting shape to undefined
        if (!newshape) {
          sendActiveElementUpdate({ type: "DESELECT", payload: {} });
          selectedElementRef.current = newshape;
          markStaticDirty();
        } else if (newshape === selectedElementRef.current) {
          sendActiveElementUpdate({ type: "DESELECT", payload: {} }); //handles not inroom itself
          selectedElementRef.current = undefined;
          markStaticDirty();
        } else {
          sendActiveElementUpdate({ type: "DRAG", payload: newshape }); //handles not inroom itself
          selectedElementRef.current = newshape;
          markStaticDirty();
        }
      } else if (tool === "text") {
        e.preventDefault();
        textAreaRef.current?.blur();

        const screenPos = { x: e.clientX, y: e.clientY }; // raw screen coords
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
        drawInteraction.handleDrawMouseDown(
          pos,
          currentState.toolState,
          selectedElementRef,
        );
        markStaticDirty();
      }
      // markStaticDirty();
    };

    const onMouseMove = (e: MouseEvent) => {
      const pos = getMousePosOnWorld(
        canvas,
        { x: e.clientX, y: e.clientY },
        cameraRef.current,
      );
      const currentState = canvasStateRef.current;
      const tool = currentState.toolState.currentTool;

      sendCursorState(screenToWorld(pos.x, pos.y, cameraRef.current));

      if (tool === "select") {
        const isDone = selectInteraction.handleSelectMouseMove(
          pos,
          // ctx,
          selectedElementRef,
          // currentState,
          // cameraRef,
          sendActiveElementUpdate,
        );
        // if (isDone) markStaticDirty();
      } else if (tool === "hand") {
        onPanMove(e);
      } else if (tool === "eraser") {
        if (!interactionState.eraseStateRef.current.isErasing) return;
        // const worldPos = screenToWorld(pos.x, pos.y, cameraRef.current);
        // console.log(worldPos);
        const clickedShape = [...currentState.drawnShapes].find(
          (shape: DrawElement) => isClickOnShape(pos, shape),
        );

        console.log(clickedShape);
        if (!clickedShape) return;

        // Inside handleSelectMouseDown, before allowing selection of a shape:
        const isLockedByOther = [...activeElementMapRef.current.values()].some(
          (entry) => entry.element.id === clickedShape.id,
        );

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

        return;
      } else {
        drawInteraction.handleDrawMouseMove(
          pos,
          // ctx,
          currentState.toolState,
          currentState.sideToolKitState,
          selectedElementRef,
          sendActiveElementUpdate,
          // currentState.drawnShapes,
          // currentSelected,
          // setSelectedElement,
          // cameraRef,
        );
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
      console.log("up ", e.target, sideToolkit);
      if (e.target === sideToolkit) {
        return;
      }
      const pos = getMousePosOnWorld(
        canvas,
        { x: e.clientX, y: e.clientY },
        cameraRef.current,
      );
      const currentState = canvasStateRef.current;
      // const currentSelected = selectedElementRef.current;
      const tool = currentState.toolState.currentTool;

      if (tool === "select") {
        selectInteraction.handleSelectMouseUp(
          pos,
          selectedElementRef,
          // selectedElementRef,
        );
        sendActiveElementUpdate({ type: "DESELECT", payload: {} });
        selectedElementRef.current = undefined;
      } else if (tool === "hand") {
        onPanEnd();
      } else if (tool === "eraser") {
        dispatchWithSocket({
          type: "BULK_DEL_SHAPE",
          payload: interactionState.eraseStateRef.current.elementsToDelete,
        });

        interactionState.eraseStateRef.current = {
          isErasing: false,
          elementsToDelete: [],
        };
      } else {
        drawInteraction.handleDrawMouseUp(
          pos,
          currentState.toolState,
          currentState.sideToolKitState,
          selectedElementRef,
          // currentSelected,
          // setSelectedElement,
        );
      }

      // redrawPreviousShapes(
      //   ctx,
      //   currentState.drawnShapes,
      //   cameraRef,
      //   activeElementMap,
      //   currentSelected,
      //   currentSelected?.id,
      // );
      if (canvasStateRef.current.toolState.currentTool !== "select") {
        canvasDispatch({ type: "CHANGE_TOOL", payload: "select" });
      }
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
      // const tempUrl = URL.createObjectURL(lastImg);
      // const img = new Image();
      // img.onload = () => ctx.drawImage(img, 0, 0);
      // img.src =
      //   "http://res.cloudinary.com/dg6spymhq/image/upload/v1775821766/djv9uk6ksl2s344mnpqu.webp";
    };

    canvas.addEventListener("pointerdown", onMouseDown);
    // canvas.addEventListener("dblclick", handleDoubleClick);
    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("pointermove", onMouseMove);
    window.addEventListener("pointerup", onMouseUp);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", onKeyDown);
    fileInput.addEventListener("change", handleFileInput);

    // redrawPreviousShapes(
    //   ctx,
    //   canvasStateRef.current.drawnShapes,
    //   cameraRef,
    //   activeElementMap,
    //   selectedShape,
    //   selectedShape?.id,
    // );

    return () => {
      canvas.removeEventListener("pointerdown", onMouseDown);
      // canvas.removeEventListener("dblclick", handleDoubleClick);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointermove", onMouseMove);
      window.removeEventListener("pointerup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", onKeyDown);
      fileInput.removeEventListener("change", handleFileInput);
    };
  }, [inRoom, cameraRef]);

  // useEffect(() => {
  //   selectedElementRef.current = selectedElement;
  // }, [selectedElement]);

  // useEffect(() => {
  //   canvasStateRef.current = canvasState;

  //   const ctx = canvasRef.current?.getContext("2d");
  //   if (!ctx) return;
  //   redrawPreviousShapes(
  //     ctx,
  //     canvasState.drawnShapes,
  //     camera,
  //     activeElementMap,
  //     selectedShape,
  //     selectedShape?.id,
  //   );
  //   console.log("redraw occured");
  // }, [canvasState]);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if(!canvas) return;
  //   const ctx = canvas.getContext("2d");
  //   resizeCanvas(canvas,ctx,redrawPreviousShapes,);
  // }, [isOpen]);

  return {
    selectedElementRef,
    // setSelectedElement,
    cameraRef,
    cancelText,
    finishText,
    textEdit,
    setTextEdit,
  };
};

export default useCanvasInteraction;
