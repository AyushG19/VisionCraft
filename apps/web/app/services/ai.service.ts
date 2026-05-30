import type { MermaidToExcalidrawResult } from "@excalidraw/mermaid-to-excalidraw/dist/interfaces";
import { fetchMermaidPrompt } from "../api/ai.api";
import { DrawElement, QueryType } from "@repo/common";
import { UserProvider } from "@repo/hooks";

export async function getExcalidrawElements(
  userPrompt: string,
  queryType: QueryType,
  fontSize?: number,
  userContext: DrawElement[] = [],
): Promise<{
  elements: MermaidToExcalidrawResult["elements"];
  message: string;
  suggestions?: string[];
}> {
  const { parseMermaidToExcalidraw } = await import(
    "@excalidraw/mermaid-to-excalidraw"
  );
  const data = await fetchMermaidPrompt(userPrompt, queryType, userContext);
  console.log(data);
  if (!data || !data.flowchart) throw new Error("Missing backend response.");
  const parsed = await parseMermaidToExcalidraw(data.flowchart, {
    themeVariables: {
      fontSize: fontSize ? `${fontSize}px` : "10px",
    },
  });

  return {
    elements: parsed.elements,
    message: data.message,
    suggestions: data.suggestions,
  };
}

export async function getAiResponse(
  userPrompt: string,
  queryType: QueryType,
  userContext: DrawElement[] = [],
): Promise<{ message: string }> {
  const { message } = await fetchMermaidPrompt(
    userPrompt,
    queryType,
    userContext,
  );
  return { message };
}
