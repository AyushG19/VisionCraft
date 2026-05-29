import type { MermaidToExcalidrawResult } from "@excalidraw/mermaid-to-excalidraw/dist/interfaces";
import { fetchMermaidPrompt } from "../api/ai.api";
import { DrawElement } from "@repo/common";

export async function getExcalidrawElements(
  userPrompt: string,
  fontSize?: number,
  userContext: DrawElement[] = [],
): Promise<{
  elements: MermaidToExcalidrawResult["elements"];
  message: string;
  suggestions: string[];
}> {
  const { parseMermaidToExcalidraw } = await import(
    "@excalidraw/mermaid-to-excalidraw"
  );
  const { flowchart, message, suggestions } = await fetchMermaidPrompt(
    userPrompt,
    userContext,
  );
  const parsed = await parseMermaidToExcalidraw(flowchart, {
    themeVariables: {
      fontSize: fontSize ? `${fontSize}px` : "10px",
    },
  });

  return { elements: parsed.elements, message, suggestions };
}
