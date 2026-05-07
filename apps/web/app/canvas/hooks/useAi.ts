"use client";
import { useCallback, useState } from "react";
import { getExcalidrawElements } from "../../services/ai.service";
import {
  AIResultType,
  convertToShapeType,
} from "@workspace/ui/lib/convertToShapeType";
import { useError } from "@repo/hooks";
import { getScalingFactor } from "../../canvas/helper/scaling.helper";
import { Action } from "../types";
import { screenToWorld } from "../../lib/math";
import { Camera } from "./useCamera";

const useAi = (
  canvas: React.RefObject<HTMLCanvasElement | null>,
  canvasDispatch: React.Dispatch<Action>,
  camera: Camera,
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIResultType[]>([]);
  const { setError } = useError();

  const handleDrawRequest = useCallback(
    async (
      ctx: CanvasRenderingContext2D,
      fontFamily: string,
      userCommand: string,
    ) => {
      setLoading(true);
      try {
        const elements = await getExcalidrawElements(userCommand);
        console.log("elements:", elements);
        const sf = getScalingFactor(elements);
        console.log(sf);

        // 2. Find the physical center of the user's monitor
        const screenMiddleX = window.innerWidth / 2;
        // const screenMiddleY = window.innerHeight / 2;

        const worldPos = screenToWorld(screenMiddleX, 30, camera);

        setResult(() =>
          elements.map((element) =>
            convertToShapeType(
              ctx,
              fontFamily,
              element,
              sf,
              worldPos.x,
              worldPos.y,
            ),
          ),
        );
      } catch (error) {
        setError({ code: "SERVER_ERROR", message: "Errorn with AI" });
        setLoading(false);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleChatRequest = async (userCommand: string) => {
    // setLoading(true);
    // try {
    //   const elements = await getExcalidrawElements(userCommand);
    //   // conversion to my local types
    //   setResult(() => elements.map((element) => convertToShapeType(element)));
    // } catch (error) {
    //   setError({ code: "SERVER_ERROR", message: "Errorn with AI" });
    //   setLoading(false);
    // } finally {
    //   setLoading(false);
    // }
  };

  // const handleDiagramAccept = (ctx: CanvasRenderingContext2D) => {
  //   dispatchwithsocket({});
  // };
  return { loading, result, handleDrawRequest, handleChatRequest };
};

export default useAi;
