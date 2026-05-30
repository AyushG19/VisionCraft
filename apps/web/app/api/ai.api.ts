import { AiResponse, DrawElement, QueryType } from "@repo/common";
import { axiosInstance } from "./axios";

export async function fetchMermaidPrompt(
  instruction: string,
  queryType: QueryType,
  context: DrawElement[],
): Promise<AiResponse> {
  const res = await axiosInstance.post(
    "/api/ai/query",
    {
      instruction,
      context,
      queryType,
    },
    { timeout: 120_000 },
  );
  console.log("backend ai res: ", res.data.res);
  const data = await JSON.parse(res.data.res);
  return data;
}
