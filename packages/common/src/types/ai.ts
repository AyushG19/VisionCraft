import z from "zod";
import { DrawSchema } from "./canvas";

export const QueryTypeArr = ["create", "edit", "add", "tell"];
export type QueryType = "create" | "edit" | "add" | "tell";

export const AiResponse = z.object({
  message: z.string(),
  flowchart: z.string().optional(),
  suggestions: z.array(z.string()).optional(),
});
export type AiResponse = z.infer<typeof AiResponse>;

export const AiContext = z.array(DrawSchema);
export type AiContext = z.infer<typeof AiContext>;
