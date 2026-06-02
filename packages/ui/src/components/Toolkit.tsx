"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { ToolIcon } from "./ui/ToolIcon";
import {
  Icon,
  IconGripVertical,
  IconLine,
  IconPhoto,
  IconProps,
  IconSend,
  IconSquareRotated,
  IconTextSize,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCircle,
  IconSquare,
  IconTrendingUp,
  IconHandStop,
  IconDroplet,
  IconEraser,
  IconPencil,
} from "@tabler/icons-react";
import {
  type ToolKitType,
  type AllToolTypes,
  type ColorType,
} from "@repo/common";
import { Button } from "./ui/button";

const tools: {
  id: AllToolTypes;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
  keyBind: string;
}[] = [
  { id: "select" as const, icon: IconSend, label: "select", keyBind: "q" },
  { id: "hand" as const, icon: IconHandStop, label: "hand", keyBind: "w" },
  { id: "ellipse" as const, icon: IconCircle, label: "circle", keyBind: "e" },
  { id: "rectangle" as const, icon: IconSquare, label: "square", keyBind: "r" },
  {
    id: "diamond" as const,
    icon: IconSquareRotated,
    label: "diamond",
    keyBind: "a",
  },
  { id: "line" as const, icon: IconLine, label: "line", keyBind: "s" },
  { id: "arrow" as const, icon: IconTrendingUp, label: "arrow", keyBind: "d" },
  {
    id: "pencil" as const,
    icon: IconPencil,
    label: "pencil",
    keyBind: "f",
  },
  { id: "eraser" as const, icon: IconEraser, label: "eraser", keyBind: "z" },
  { id: "text" as const, icon: IconTextSize, label: "text", keyBind: "x" },
  { id: "color" as const, icon: IconDroplet, label: "color", keyBind: "v" },
  { id: "image" as const, icon: IconPhoto, label: "image", keyBind: "c" },
];

type toolkitProps = {
  toolKitState: ToolKitType;
  handleToolSelect: (toolname: AllToolTypes) => void;
  handleColorSelect: (color: ColorType) => void;
  currentColor: ColorType;
  handleUndo: () => void;
  handleRedo: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

const Toolkit = ({
  toolKitState,
  handleToolSelect,
  handleColorSelect,
  handleUndo,
  handleRedo,
  inputRef,
}: toolkitProps) => {
  const toolkitRef = useRef<HTMLDivElement | null>(null);
  const toolIconRef = useRef<HTMLDivElement | null>(null);
  const resizeRef = useRef<any | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const currWidth = useRef(0);
  const maxWidth = useRef(0);

  const dragState = useRef<{
    isDraging: boolean;
    dragX: number;
    dragY: number;
  }>({ isDraging: false, dragX: 0, dragY: 0 });

  const resizeState = useRef<{
    isResizing: boolean;
    initialX: number;
    initialWidth: number;
  }>({
    isResizing: false,
    initialX: 0,
    initialWidth: 0,
  });

  // if (!currPos) return null;
  const handleClick = (name: string) => {
    if (name === "redo") {
      handleRedo();
    } else {
      handleUndo();
    }
  };

  // Calculate max width on mount
  // useLayoutEffect(() => {
  //   if (!toolkitRef.current || !toolIconRef.current) return;

  //   toolkitRef.current.style.width = "auto";
  //   const naturalWidth = toolkitRef.current.scrollWidth;
  //   currWidth.current = naturalWidth;
  //   maxWidth.current = naturalWidth;
  //   toolkitRef.current.style.width = `${naturalWidth}px`;
  //   toolkitRef.current.style.maxWidth = `${naturalWidth}px`;

  //   const x = window.innerWidth / 2 - naturalWidth / 2;
  //   posRef.current = { x, y: 0 };

  //   toolkitRef.current.style.transform = `translate(${x}px,0px)`;
  // }, []);

  const onMouseDown = useCallback(
    (e: PointerEvent) => {
      if (!toolkitRef.current || !resizeRef.current) return;

      if (resizeRef.current.contains(e.target as Node)) {
        resizeState.current = {
          isResizing: true,
          initialX: e.clientX,
          initialWidth: currWidth.current,
        };
      } else {
        dragState.current = {
          isDraging: true,
          dragX: e.clientX - posRef.current.x,
          dragY: e.clientY - posRef.current.y,
        };
      }
    },
    [currWidth],
  );

  const onMouseMove = useCallback(
    (e: PointerEvent) => {
      if (!toolkitRef.current) return;

      if (dragState.current.isDraging) {
        const newX = e.clientX - dragState.current.dragX;
        const newY = e.clientY - dragState.current.dragY;

        const width = toolkitRef.current.clientWidth;
        const height = toolkitRef.current.clientHeight;

        const x = Math.max(0, Math.min(newX, window.innerWidth - width));
        const y = Math.max(0, Math.min(newY, window.innerHeight - height));

        toolkitRef.current.style.transform = `translate(${x}px, ${y}px)`;
        posRef.current = { x, y };
      } else if (resizeState.current.isResizing) {
        // Define these as constants at the top of the component (or outside it)
        const windowWidth = window.innerWidth;
        const ITEM_CHUNK = windowWidth < 1024 ? 28 + 4 : 36 + 6; // w-9 (36px) + gap-1.5 (6px)
        const LEFT_PAD = windowWidth < 1024 ? 8 : 12;
        const GRIP_WIDTH = 16 + 4; // w-4 (16px) + ml-1.5 (6px)
        const CHROME = LEFT_PAD + GRIP_WIDTH;

        const snapToColumns = (rawWidth: number) => {
          const available = rawWidth - CHROME;
          const cols = Math.max(1, Math.round(available / ITEM_CHUNK));
          if (cols > 2) return cols * ITEM_CHUNK + CHROME + cols * 4;
          return cols * ITEM_CHUNK + CHROME;
        };
        const deltaX = e.clientX - resizeState.current.initialX;
        const rawWidth = resizeState.current.initialWidth + deltaX;

        // Clamp between 1-column min and full-row max
        const minWidth = 1 * ITEM_CHUNK + CHROME;
        const clamped = Math.max(
          minWidth,
          Math.min(rawWidth, maxWidth.current),
        );

        // Snap to the nearest whole column count — no leftover space
        const snapped = snapToColumns(clamped);
        currWidth.current = snapped;
        toolkitRef.current.style.width = `${snapped}px`;
      }
    },
    [maxWidth],
  );
  const onMouseUp = useCallback(() => {
    if (dragState.current.isDraging) {
      dragState.current.isDraging = false;
      dragState.current = {
        ...dragState.current,
        dragX: 0,
        dragY: 0,
      };
    } else if (resizeState.current.isResizing) {
      resizeState.current.isResizing = false;
    }
  }, []);

  useEffect(() => {
    const toolkit = toolkitRef.current;
    if (!toolkit) return;

    const resizer = resizeRef.current;
    if (!resizer) return;

    const rect = toolkit.getBoundingClientRect();
    const naturalWidth = toolkit.scrollWidth;
    currWidth.current = naturalWidth;
    maxWidth.current = naturalWidth;
    toolkit.style.width = `${naturalWidth}px`;
    toolkit.style.maxWidth = `${naturalWidth}px`;

    const x = window.innerWidth / 2 - naturalWidth / 2;
    posRef.current = { x, y: rect.top };

    toolkit.addEventListener("pointerdown", onMouseDown);
    window.addEventListener("pointermove", onMouseMove, { passive: true });
    window.addEventListener("pointerup", onMouseUp);

    return () => {
      toolkit.removeEventListener("pointerdown", onMouseDown);
      window.removeEventListener("pointermove", onMouseMove);
      window.removeEventListener("pointerup", onMouseUp);
    };
  }, []);

  return (
    <>
      <div
        ref={toolkitRef}
        draggable={false}
        style={{ transform: `translate(calc(50vw - 50%), 8px)` }}
        className=" p-2 !pr-0 absolute rounded-lg flex items-center cursor-move bg-primary outline-1 outline-global-shadow shadow-pressed lg:shadow-shinyprimary text-primary-contrast "
      >
        <div ref={toolIconRef} className="flex flex-wrap gap-1 md:gap-1.5">
          {tools.map((tool) => {
            return (
              <ToolIcon
                inputRef={inputRef}
                currTool={toolKitState.currentTool}
                key={tool.id}
                toolInfo={tool}
                onSelectColor={handleColorSelect}
                onSelectTool={handleToolSelect}
                initialColor={toolKitState.currentColor}
              />
            );
          })}
          {/* <div className="h-8 w-[1px] ml-1 mt-1 bg-black"></div> */}
        </div>
        <div
          className="cursor-e-resize w-4 h-full ml-1 shrink-0 "
          ref={resizeRef}
        >
          <IconGripVertical size={18} color="currentColor" />
        </div>
      </div>
      <div className="fixed bottom-4 lg:left-6 lg:bottom-6 left-4 flex">
        {["undo", "redo"].map((name, i) => (
          <Button
            key={i}
            aria-label={name}
            variant={"secondary"}
            className={`w-7 h-7 lg:w-9 lg:h-9 p-0 flex items-center justify-center cursor-pointer shadow-shinysecondary text-secondary-contrast button-press-active transition-transform ease-in-out duration-100 outline-1 outline-global-shadow button-press ${i === 0 ? "rounded-r-none -mr-[1px]" : "rounded-l-none"}`}
            onClick={() => handleClick(name)}
          >
            {i === 0 ? (
              <IconArrowBackUp
                className="w-[10px] h-[10px] md:w-[15px] md:h-[15px]"
                stroke={1.6}
              />
            ) : (
              <IconArrowForwardUp
                className="w-[10px] h-[10px] md:w-[15px] md:h-[15px]"
                stroke={1.6}
              />
            )}
          </Button>
        ))}
      </div>
    </>
  );
};

export { Toolkit, type toolkitProps };
