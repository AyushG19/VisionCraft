import {
  IconBrandGithub,
  IconBrandX,
  IconDoorEnter,
  IconDoorExit,
  IconMessages,
  IconPhotoUp,
  IconSparkles,
  IconSquareRoundedPlus,
  IconTerminal2,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";

export const ROOM_OPTION_SECTIONS = [
  {
    section: "default",
    label: "default",
    items: [
      {
        id: "create",
        label: "create Room",
        mode: "normal",
        icon: IconSquareRoundedPlus,
      },
      {
        id: "join",
        label: "Join Room",
        mode: "normal",
        icon: IconDoorEnter,
      },
      {
        id: "ai-chat",
        label: "Chat with AI",
        mode: "normal",
        icon: IconSparkles,
      },
    ],
  },
  {
    section: "room",
    label: "room",
    items: [
      {
        id: "room-chat",
        label: "Open Chat",
        mode: "room",
        icon: IconMessages,
      },
      {
        id: "exit-room",
        label: "Exit Room",
        mode: "room",
        icon: IconDoorExit,
      },
    ],
  },
  {
    section: "canvas",
    label: "Canvas",
    items: [
      {
        id: "clear-canvas",
        label: "Clear Canvas",
        mode: "normal",
        icon: IconTrash,
      },
      {
        id: "export",
        label: "Export Image",
        mode: "both",
        icon: IconPhotoUp,
      },

      {
        id: "commands",
        label: "View Commands",
        mode: "both",
        icon: IconTerminal2,
      },
    ],
  },
  {
    section: "links",
    label: "Links",
    items: [
      {
        id: "auth",
        label: "Login",
        mode: "both",
        icon: IconUser,
      },
      {
        id: "github",
        label: "open github",
        mode: "both",
        icon: IconBrandGithub,
      },
      {
        id: "x",
        label: "follow me ?",
        mode: "both",
        icon: IconBrandX,
      },
    ],
  },
] as const;

// Flat list derived from sections — use wherever a single array is needed
// export const ROOM_OPTIONS = ROOM_OPTION_SECTIONS.flatMap((s) => s.items);

export type OptionId =
  | "create"
  | "join"
  | "room-chat"
  | "exit-room"
  | "ai-chat"
  | "themes"
  | "clear-canvas"
  | "export"
  | "commands"
  | "auth"
  | "github"
  | "x";
export type OptionSection = (typeof ROOM_OPTION_SECTIONS)[number]["section"];
