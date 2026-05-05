"use client";
import { useEffect } from "react";
import { type MemberCursor } from "@repo/hooks";
import { DrawElement } from "@repo/common";
import { worldToScreen } from "@/lib/math";
import { Camera } from "./useCamera";
import { getUserColor } from "../helper/color.helper";

const useRafLoop = ({
  cursorMap,
  activeElementMap,
  redrawForActiveElement,
  camera,
}: {
  cursorMap: MemberCursor;
  activeElementMap: Map<
    string,
    {
      isDirty: boolean;
      element: DrawElement;
      operation: "drag" | "resize";
    }
  >;
  redrawForActiveElement: (element: DrawElement, color: string) => void;
  camera: Camera;
}) => {
  useEffect(() => {
    let frameId: number;
    const renderLoop = () => {
      const memberCursorArr = Array.from(cursorMap.entries());
      memberCursorArr.forEach((user) => {
        const el = document.getElementById(`cursor:${user[0]}`);
        if (!el) return;
        const pos = worldToScreen(user[1].x, user[1].y, camera);
        el.style.transform = `translate(${pos.x - 20}px,${pos.y - 3}px)`;
      });

      const activeElementArr = Array.from(activeElementMap.entries());

      activeElementArr.forEach((ele) => {
        if (ele[1].isDirty) {
          console.log("ele", ele);
          redrawForActiveElement(ele[1].element, getUserColor(ele[0]));
          ele[1].isDirty = false;
        }
      });
      frameId = requestAnimationFrame(renderLoop);
    };
    frameId = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(frameId);
  }, []);
};

export default useRafLoop;
