import { DrawElement } from "@repo/common";
import { axiosInstance } from "./axios";

export async function fetchMermaidPrompt(
  userPrompt: string,
  context: DrawElement[],
): Promise<{ flowchart: string; message: string; suggestions: string[] }> {
  const res = await axiosInstance.post(
    "/api/ai/draw",
    {
      instruction: userPrompt,
      context: context,
    },
    { timeout: 120_000 },
  );
  console.log("mermaid prompt:", res.data.res);
  const data = await JSON.parse(res.data.res);
  return data;
}
