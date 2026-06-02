"use client";
import { useCallback, useState } from "react";
import {
  getAiResponse,
  getExcalidrawElements,
} from "../../services/ai.service";
import { AIResultType } from "@repo/ui/lib/convertToShapeType";
import { useToast } from "@repo/hooks";

import { Camera } from "./useCamera";
import { DrawElement, QueryType } from "@repo/common";
import { ExcalidrawElementSkeleton } from "@repo/ui/components/types";

const useAi = (
  selectedElementRef: React.RefObject<DrawElement[]>,
  camera: Camera,
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIResultType[]>([]);
  const { setToast } = useToast();

  const handleDrawRequest = useCallback(
    async (
      userCommand: string,
      centerElements: (
        elements: ExcalidrawElementSkeleton[],
        camera: Camera,
      ) => AIResultType[],
      updateMessages: (
        message: string,
        name: string,
        suggestions?: string[],
      ) => void,
      queryType: QueryType,
      fontSize: number = 10,
    ) => {
      setLoading(true);
      try {
        const context = selectedElementRef.current;

        const aiRes = await getExcalidrawElements(
          userCommand,
          queryType,
          fontSize,
          context,
        );
        console.log("elements:", aiRes);

        setResult([...centerElements(aiRes.elements, camera)]);
        updateMessages(aiRes.message, "BOBO", aiRes.suggestions);
      } catch (error) {
        console.error(error);
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

  const handleChatRequest = async (
    userCommand: string,
    updateMessages: (
      message: string,
      name: string,
      suggestions?: string[],
    ) => void,
    queryType: QueryType,
  ) => {
    setLoading(true);
    try {
      const context = selectedElementRef.current;
      const { message } = await getAiResponse(userCommand, queryType, context);
      // conversion to my local types
      updateMessages(message, "BOBO");
    } catch (error) {
      setToast({
        title: "Woah! AI chocked!",
        message: "Try again please.",
        type: "error",
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, handleDrawRequest, handleChatRequest };
};

export default useAi;
