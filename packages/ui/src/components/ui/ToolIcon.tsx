"use client";
import React, { useEffect, useState } from "react";

import { Tooltip, TooltipTrigger, TooltipContent } from "./ToolTip";
import { AllToolTypes, ColorType } from "@repo/common";
import { ColorSelector } from "./ColorSelector";
import { Button } from "./button";

type ToolIconProps = {
  onSelectTool: (toolname: AllToolTypes) => void;
  onSelectColor: (color: ColorType) => void;
  currTool: AllToolTypes;
  toolInfo: {
    id: AllToolTypes;
    icon: React.ElementType;
    label: string;
    keyBind: string;
  };
  initialColor: ColorType;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

const ToolIcon = ({
  currTool,
  toolInfo,
  onSelectTool,
  onSelectColor,
  initialColor,
  inputRef,
}: ToolIconProps) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (currTool === "color") setIsHovered(true);
    else setIsHovered(false);
  }, [currTool]);

  if (toolInfo.id === "image") {
    return (
      <div
        className={`w-6 h-6 lg:w-9 lg:h-9 relative flex items-center justify-center  rounded-md lg:rounded-lg bg-secondary pointer-events-none outline-1 outline-global-shadow scale-[97%] hover:scale-100 $${
          currTool === toolInfo.id
            ? "shadow-shinyshadow-pressed button-active translate-[1px]"
            : "button-press "
        }  text-secondary-contrast `}
      >
        <label>
          <input
            ref={inputRef}
            className="absolute text-transparent top-0 left-0 w-full h-full cursor-pointer pointer-events-auto"
            type="file"
            id="fileInput"
            accept="image/*"
          ></input>
        </label>
        <span className="hidden lg:inline absolute right-[3px] bottom-1 text-xs font-handlee">
          {toolInfo.keyBind}
        </span>
        <toolInfo.icon
          color={"currentColor"}
          className="w-[10px] h-[10px] md:w-[14px] md:h-[14px]"
          fill={"none"}
          stroke={1.8}
        />
      </div>
    );
  }
  return (
    <Tooltip key={toolInfo.id}>
      <TooltipTrigger asChild>
        <Button
          aria-label={toolInfo.label}
          variant={"secondary"}
          onClick={() => onSelectTool(toolInfo.id)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`w-6 h-6 lg:w-9 lg:h-9 p-0 relative cursor-pointer z-10 outline-1 outline-global-shadow  rounded-md lg:rounded-lg scale-100 ${
            toolInfo.id !== "color" && currTool === toolInfo.id
              ? "shadow-shinyshadow-pressed button-active translate-[1px]"
              : "button-press "
          } text-secondary-contrast active:translate-[1px]`}
        >
          {toolInfo.id === "color" && isHovered && (
            <ColorSelector
              selectedColor={initialColor}
              setSelectedColor={onSelectColor}
            />
          )}
          <span className="hidden lg:inline absolute right-[3px] bottom-[3px] color-secondary-700 text-xs font-handlee cursor-event-none">
            {toolInfo.keyBind}
          </span>
          <toolInfo.icon
            color={"currentColor"}
            fill={
              toolInfo.id === "color"
                ? `oklch(${initialColor.l} ${initialColor.c} ${initialColor.h})`
                : toolInfo.id === currTool
                  ? "currentColor"
                  : "none"
            }
            fillOpacity={toolInfo.id === currTool ? 0.2 : 1}
            className={`w-[10px] h-[10px] lg:w-[14px] lg:h-[14px]`}
            stroke={toolInfo.id === "color" ? 1 : 1.8}
          />
        </Button>
      </TooltipTrigger>
      {!(toolInfo.id === "color") && (
        <TooltipContent>{toolInfo.label}</TooltipContent>
      )}
    </Tooltip>
  );
};
export { ToolIcon };
