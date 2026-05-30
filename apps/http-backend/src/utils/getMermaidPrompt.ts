// export const getMermaidPrompt = (userRequest: string): string => `
// Role:
// You are an expert in Mermaid.js syntax.

import { Type } from "@google/genai";
import { DrawElement, QueryType, AiContext } from "@repo/common";

// Task:
// Convert the user's description into valid Mermaid syntax code output ONLY the code, starting with graph TD, using this schema.

// General Rules:
// - Always start with a declaration (e.g., flowchart TD, sequenceDiagram, erDiagram)
// - Use %% for internal comments

// Flowchart Components:
// - Directions: TD (Top-Down), LR (Left-Right)
// - Shapes:
//   - [Rect]
//   - (Round)
//   - ([Stadium])
//   - [[Subroutine]]
//   - [(Database)]
//   - {Decision}
// - Lines:
//   - --> (Arrow)
//   - --- (Line)
//   - -.-> (Dotted)
//   - ==> (Thick)

// Sequence Diagram Components:
// - Participants:
//   - participant Name
//   - actor ActorName
// - Arrows:
//   - ->> (Sync)
//   - -->> (Return)
//   - -x (Async)
// - Groups:
//   - alt / else
//   - loop
//   - opt

// converty any request into the given format dont serve anything different than flowchart and sequence diagram
// Now, with the rules in mind, perform the instruction below.
// ${userRequest}
// `;
// ai/schema.ts

const messageField = {
  type: Type.STRING,
  description:
    "Clear, UI-friendly explanation of what was done or answered. Can be multiple sentences.",
};

const flowchartField = {
  type: Type.STRING,
  description:
    "Valid Mermaid flowchart syntax starting with 'flowchart TD' or 'flowchart LR'. No markdown fences.",
};

const suggestionsField = {
  type: Type.ARRAY,
  items: { type: Type.STRING },
  description:
    "2-4 concise actionable follow-up suggestions (5-15 words each).",
};

export const getSchema = (type: QueryType) => {
  switch (type) {
    case "create":
    case "edit":
    case "add":
      return {
        type: Type.OBJECT,
        properties: {
          message: messageField,
          flowchart: flowchartField,
          suggestions: suggestionsField,
        },
        required: ["message", "flowchart", "suggestions"],
      };

    case "tell":
      return {
        type: Type.OBJECT,
        properties: {
          message: messageField,
          suggestions: {
            ...suggestionsField,
            description: "Optional follow-up questions if applicable.",
          },
        },
        required: ["message"],
      };
  }
};

const SYSTEM_CONTEXT = `
You are an expert in Mermaid.js flowchart syntax and UX-friendly explanation writing.
Rules:
- flowchart field must start with "flowchart TD" or "flowchart LR" only.
- Use valid Mermaid flowchart syntax only — no sequenceDiagram, erDiagram, stateDiagram.
- Nodes: [rect] (round) ([stadium]) [[subroutine]] [(database)] {decision?}
- Edges: --> --- -.-> ==>
- message must be plain English, UI-friendly, no technical jargon.
- suggestions must be short actionable phrases (5-15 words each).
`.trim();

const CONTEXT_SHAPE_MAP = `
Shape type mapping for context:
rect       -> [Label]
round      -> (Label)
stadium    -> ([Label])
subroutine -> [[Label]]
database   -> [(Label)]
decision   -> {Label?}
`.trim();

const intentMap: Record<QueryType, string> = {
  create:
    "Create a new Mermaid flowchart from scratch based on the user description.",
  edit: "Modify the existing flowchart according to the user instruction. Preserve unchanged parts.",
  add: "Extend the existing flowchart by adding new nodes or connections as described.",
  tell: "Answer the user's question about flowcharts or the current diagram. Do not generate a new flowchart unless explicitly asked.",
};

export const buildPrompt = (
  type: QueryType,
  userQuery: string,
  context?: AiContext,
): string => {
  const parts: string[] = [SYSTEM_CONTEXT, `\nIntent: ${intentMap[type]}`];

  if (context?.length) {
    parts.push(`\n${CONTEXT_SHAPE_MAP}`);
    parts.push(`\nCurrent canvas shapes:\n${JSON.stringify(context, null, 2)}`);
  }

  parts.push(`\nUser instruction: ${userQuery}`);

  return parts.join("\n");
};

export const getMermaidPrompt = (
  instruction: string,
  context?: DrawElement[],
): string => `Role:
You are an expert in Mermaid.js flowchart syntax and UX-friendly explanation writing.

Goal:
Convert the user's natural-language description into:
1) A valid Mermaid flowchart (flowchart only, not sequence/ER/state diagrams).
2) A clear, concise message suitable for display in a UI.
3) 2–4 helpful, UI-oriented suggestion phrases that help the user refine or extend the flowchart.

Output Format:
You MUST output ONLY a valid JSON object with this exact schema (no markdown, no extra text):

{
  "flowchart": {
    "type": "string",
    "description": "Pure Mermaid flowchart syntax starting with 'flowchart TD' or 'flowchart LR'. No markdown fences, no extra text, just the Mermaid code."
  },
  "message": {
    "type": "string",
    "description": "A short, clear, UI-friendly explanation of what the flowchart represents, including key decision points and endpoints. Write in plain English, 1–3 sentences."
  },
  "suggestions": {
    "type": "array",
    "items": { "type": "string" },
    "description": "2–4 concise, actionable suggestion phrases (each 5–15 words) that a UI can show as clickable follow-up questions, e.g. 'Switch orientation to LR', 'Add a brewing subroutine', 'Include a decision for sugar or milk'."
  }
}

Constraints & Rules:
- Output ONLY JSON. No markdown, no explanations outside the JSON, no code fences.
- The "flowchart" field must:
  - Start with "flowchart TD" by default.
  - Use "flowchart LR" only if it clearly improves clarity.
  - Contain valid Mermaid flowchart syntax only (no sequenceDiagram, erDiagram, etc.).
  - Use simple, readable node labels (no excessive punctuation).
  - Use decision nodes with curly braces {Question?} and arrows --> for flow.
- The "message" field:
  - Must be human-readable, UI-friendly, and directly related to the flowchart logic.
  - Should mention the main process, key decisions, and start/end points.
- The "suggestions" field:
  - Must contain 2–4 short, specific suggestions that a UI can use as follow-up prompts.
  - Focus on common enhancements: orientation changes, subroutines, extra decisions, labels, or subgraphs.
- Input Context (from frontend):
- The user may provide an optional "context" array of frontend shape elements.
- Each element describes a shape on the canvas: { id, type, label, ... }.
- Shape types map to Mermaid:
  - rect        -> [Label]
  - round       -> (Label)
  - stadium     -> ([Label])
  - subroutine  -> [[Label]]
  - database    -> [(Label)]
  - decision    -> {Label?}
- If "context" is provided:
  - Treat it as the current set of shapes on the canvas.
  - Build or modify the flowchart based on these shapes and the user's instruction.
- If "context" is not provided:
  - Create a new flowchart from scratch based only on the user's description.

Mermaid Flowchart Syntax Guide (for reference only; do not output this guide):
- Declaration: flowchart TD (Top-Down) or flowchart LR (Left-Right)
- Nodes:
  - Rect: [Label]
  - Round: (Label)
  - Stadium: ([Label])
  - Subroutine: [[Label]]
  - Database: [(Label)]
  - Decision: {Label?}
- Edges:
  - --> (solid arrow)
  - --- (line)
  - -.-> (dotted)
  - ==> (thick arrow)
- Comments: %% comment

Process:
1. Interpret the user's description as a process or decision flow.
2. Design a simple, clear Mermaid flowchart that matches the logic.
3. Write a short, clear message explaining the flowchart for a UI.
4. Generate 2–4 practical suggestions for refining or extending the flowchart.
5. Output ONLY the JSON object matching the schema above.

Now, with the rules in mind, perform the instruction with context below.
instruction : ${instruction}
context : ${context}`;
