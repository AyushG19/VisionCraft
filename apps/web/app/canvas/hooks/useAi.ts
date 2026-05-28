"use client";
import { useCallback, useState } from "react";
import { getExcalidrawElements } from "../../services/ai.service";
import { AIResultType } from "@workspace/ui/lib/convertToShapeType";
import { useToast } from "@repo/hooks";

import { convertAllElements } from "../utils/elementsConverter";
import { Action } from "../types";
import { Camera } from "./useCamera";
import { createDraggedGroup } from "../utils/createTempShapeHelper";
import { DrawElement } from "@repo/common";
import { ExcalidrawElementSkeleton } from "@workspace/ui/components/types";

const useAi = (
  canvas: React.RefObject<HTMLCanvasElement | null>,
  canvasDispatch: React.Dispatch<Action>,
  camera: Camera,
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIResultType[]>([]);
  const { setToast } = useToast();

  const handleDrawRequest = useCallback(
    async (
      ctx: CanvasRenderingContext2D,
      fontFamily: string,
      userCommand: string,
      centerElements: (
        elements: ExcalidrawElementSkeleton[],
        camera: Camera,
      ) => AIResultType[],
    ) => {
      setLoading(true);
      try {
        const elements = await getExcalidrawElements(userCommand, 20);
        console.log("elements:", elements);
        // const sf = getScalingFactor(elements);
        // console.log(sf);

        // 2. Find the physical center of the user's monitor
        // const screenMiddleX = window.innerWidth / 2;
        // const screenMiddleY = window.innerHeight / 2;

        // const worldPos = screenToWorld(screenMiddleX, 120, camera);
        // const bounds = getDiagramBounds(elements);

        // const scale = getScaleFactor(bounds);

        // const transform = createTransform(
        //   bounds,
        //   scale,
        //   worldPos.x,
        //   worldPos.y,
        // );
        // console.log("bounds:", bounds);
        // console.log("scale:", scale);
        // console.log("transform:", transform);
        // setResult(
        //   elements.map((element) =>
        //     convertToShapeType(ctx, fontFamily, element, transform),
        //   ),
        // );
        setResult([...centerElements(elements, camera)]);
        // centerElement[...convertAllElements(elements,fontFamily)]);
      } catch (error) {
        setToast({
          title: "Broken LLM!",
          //@ts-ignore
          message: error?.message,
          type: "error",
        });
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
