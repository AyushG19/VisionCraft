import {
  ClientSocketDataType,
  QueryType,
  ServerMessageType,
} from "@repo/common";

type sendType = Extract<
  ClientSocketDataType,
  { type: "ADD_SHAPE" | "UPD_SHAPE" | "DEL_SHAPE" | "CHAT" | "CURSOR" }
>;
export type SideChatPropsType = {
  inRoom: boolean;
  send: (type: sendType["type"], payload: sendType["payload"]) => void;
  messages: ServerMessageType[];
  setMessages: React.Dispatch<React.SetStateAction<ServerMessageType[]>>;
  fetchFromAi: (userCommand: string, queryType: QueryType) => Promise<void>;
  isOpen: boolean;
  isLoading: boolean;
  slug: string;
  handleChatToggle: () => void;
};

// Minimal generic skeleton to get autocomplete. Replace fields with concrete ones after inspecting runtime output.
export type ExcalidrawElementSkeleton = {
  id?: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  // add more properties you observe in the output...
  [key: string]: any;
};
