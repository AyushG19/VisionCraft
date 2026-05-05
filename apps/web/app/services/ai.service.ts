import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { MermaidToExcalidrawResult } from "@excalidraw/mermaid-to-excalidraw/dist/interfaces";
import { fetchMermaidPrompt } from "@/api/ai.api";

export async function getExcalidrawElements(
  userPrompt: string,
  fontSize?: number,
): Promise<MermaidToExcalidrawResult["elements"]> {
  const diagramDefinition = await fetchMermaidPrompt(userPrompt);
  const res = await parseMermaidToExcalidraw(diagramDefinition, {
    themeVariables: {
      fontSize: `${fontSize}px` || "10px",
    },
  });

  return res.elements;
}
