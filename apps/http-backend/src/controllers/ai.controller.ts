import { AiResponse, ShapeType } from "@repo/common";
import { AppError } from "../error";
import { Request, Response } from "express";
import env from "../env.js";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import {
  buildPrompt,
  getMermaidPrompt,
  getSchema,
} from "../utils/getMermaidPrompt";
const groq = new Groq({ apiKey: env.GROQ_API_KEY });
const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function getGroqChatCompletion(
  userCommand: string,
  context: ShapeType[],
) {
  const shapeSchema = {
    type: "object",
    properties: {
      id: { type: "string" },
      type: {
        type: "string",
        enum: [
          "SELECT",
          "CIRCLE",
          "SQUARE",
          "TRIANGLE",
          "ARROW",
          "COLOR",
          "PENCIL",
          "UNDO",
          "REDO",
        ],
      },
      lineWidth: { type: "number" },
      lineColor: {
        type: "object",
        properties: {
          l: { type: "number" },
          c: { type: "number" },
          h: { type: "number" },
        },
        required: ["l", "c", "h"],
      },
      startX: { type: "number" },
      startY: { type: "number" },
      endX: { type: "number" },
      endY: { type: "number" },
      fillColor: {
        type: "object",
        properties: {
          l: { type: "number" },
          c: { type: "number" },
          h: { type: "number" },
        },
        required: ["l", "c", "h"],
      },
      points: {
        type: "array",
        items: {
          type: "object",
          properties: { x: { type: "number" }, y: { type: "number" } },
          required: ["x", "y"],
        },
      },
    },
    required: [
      "id",
      "type",
      "lineWidth",
      "lineColor",
      "startX",
      "startY",
      "endX",
      "endY",
    ],
    additionalProperties: false,
  };

  const rootSchema = {
    type: "array",
    items: shapeSchema,
    additionalItems: false,
  };
  return await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `You are an expert drawing assistant specialized in canvas-based diagramming and flowcharts. Your goal is to interpret user commands creatively yet precisely, enhancing the existing board state without disrupting its layout. Always infer intent fully from the command and context—never seek clarification.

**Core Guidelines:**
- **Reason Step-by-Step First (Internally):** Analyze the current board context: Identify key shapes, their positions, colors, and relationships (e.g., clusters, flows). Then, map the user command to additions/modifications that fit logically—e.g., for "add a decision box," place it downstream from relevant nodes; for "connect A to B," use an ARROW linking their centers.
- **Colors:** Extract and reuse light, contrasting colors from the existing board (e.g., pastels or tints for visibility on a dark canvas). For any shape with fillColor (only add it for closed/filled shapes like CIRCLE, SQUARE, TRIANGLE where enclosure makes sense—omit for lines/ARROW/PENCIL), ensure fillColor differs from lineColor (e.g., complementary hues: if line is blue, fill light orange). Default to subtle opacities if unspecified.
- **Positions & Linking:** Place new shapes relative to context (e.g., offset 50-100px from nearby elements to avoid overlap). For ARROW, start from a meaningful edge/midpoint of the source shape and end at a logical point on the target. Maintain visual sync: Align edges, use consistent spacing for diagrams.
- **Efficiency:** Add minimal shapes needed; prioritize clarity in flowcharts/system designs (e.g., use SELECT for groups if complex).

Generate ONLY a valid JSON array of ShapeType objects for the command "${userCommand}". Base it on the current board: ${JSON.stringify(context)}. Match the schema exactly—include fillColor sparingly and differently from lineColor where appropriate. No explanations, text, or wrappers.`,
      },
    ],
    model: env.MODEL,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "generate_shapes",
        schema: rootSchema,
      },
    },
  });
}
export const drawWithGroq = async (req: Request, res: Response) => {
  try {
    const { userCommand, context } = req.body;
    const groqRes = await getGroqChatCompletion(userCommand, context);
    if (!groqRes) {
      res.status(505).json({
        error: "Undefines Response recieves from AI",
        details: undefined,
      });
      return;
    }
    const result = JSON.parse(groqRes.choices[0]?.message.content || "{}");
    res.status(200).json({ result });
  } catch (error: any) {
    console.error("Groq Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Extract the first ```mermaid fenced block; return content inside or null
function extractMermaidBlock(text: string) {
  // match ```mermaid\n ... \n```
  const re = /```mermaid\s*([\s\S]*?)\s*```/i;
  const m = text.match(re);
  if (!m) return null;
  return m[1]?.trim();
}

// Simple validation: check typical mermaid starts
function isValidMermaid(src: any) {
  if (!src) return false;
  return /^(graph|sequenceDiagram|stateDiagram|classDiagram|gantt|flowchart|pie)/i.test(
    src.trim(),
  );
}
export async function fetchMermaidSyntax(req: Request, res: Response) {
  try {
    const { instruction, context, queryType } = req.body;
    const MERMAID_PROMPT = buildPrompt(queryType, instruction, context);

    const result = await gemini.models.generateContent({
      model: env.MODEL,
      contents: [{ role: "user", parts: [{ text: MERMAID_PROMPT }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: getSchema(queryType),
      },
    });
    console.log(result.text);
    if (!result.text) throw new AppError(500, "No syntax found");
    // const mermaid = extractMermaidBlock(result.text);
    // if (!isValidMermaid(mermaid)) {
    //   throw new AppError(500, "Invalid Syntax");
    // }
    res.status(200).json({ res: result.text }); //result.text is jsonobj of schema
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

export async function fetchAiResponse(req: Request, res: Response) {
  const { instruction, context } = req.body;
  const PROMPT = buildPrompt("tell", instruction, context);
  const aiRes = await gemini.models.generateContent({
    model: env.MODEL,
    contents: { role: "user", parts: [{ text: PROMPT }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: getSchema("tell"),
    },
  });

  if (!aiRes.text) throw new AppError(500, "Invalid response from LLM");
  res.status(200).json({ res: aiRes.text });
}
