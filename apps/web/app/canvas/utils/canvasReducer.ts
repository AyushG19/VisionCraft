import { DrawElement } from "@repo/common";
import { Action, CanvasState } from "../types/index";

export const initialCanvasState: CanvasState = {
  drawnShapes: [],
  history: [[]],
  historyIndex: 0,
  toolState: {
    currentTool: "select",
    currentColor: { l: 84.586, c: 0.08089, h: 247.192 },
    strokeSize: 2,
  },
  sideToolKitState: {
    strokeColor: "oklch(0.6232 0.1502 284.72)",
    fillColor: "oklch(0.6232 0.1502 284.72)",
    strokeWidth: 2,
    roundness: 0,
    opacity: 100,
    strokeType: "normal",
  },
  textState: {
    fontFamily: "google sans code",
    alignment: "left",
    fontSize: 20,
  },
};

export default function canvasReducer(
  state: CanvasState,
  action: Action,
): CanvasState {
  const pushHistory = (newCanvasState: DrawElement[]): Partial<CanvasState> => {
    const previousHistory = state.history.slice(0, state.historyIndex + 1);
    return {
      drawnShapes: newCanvasState,
      history: [...previousHistory, newCanvasState],
      historyIndex: previousHistory.length,
    };
  };
  if (action.type === "INITIALIZE_BOARD") {
    return {
      ...state,
      drawnShapes: action.payload,
      history: [action.payload],
      historyIndex: 0,
    };
  }
  if (action.type === "DEL_SHAPE") {
    const newElemensArr = state.drawnShapes.filter(
      (e) => !action.payload.includes(e.id),
    );
    return {
      ...state,
      drawnShapes: newElemensArr,
      ...pushHistory(newElemensArr),
    };
  }
  if (action.type === "UPD_SHAPE") {
    const newCanvasState = state.drawnShapes.map((s) => {
      for (const ele of action.payload) {
        if (s.id === ele.id)
          return {
            ...ele,
            id: s.id,
          };
      }
      return s;
    });
    return {
      ...state,
      ...pushHistory(newCanvasState),
    };
  }
  if (action.type === "ADD_SHAPE") {
    const newCanvasState = [...state.drawnShapes, action.payload];
    return {
      ...state,
      ...pushHistory(newCanvasState),
    };
  }

  if (action.type === "REDO") {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const newState = state.history[newIndex];
      return {
        ...state,
        drawnShapes: newState || [],
        historyIndex: newIndex,
      };
    }
    return state;
  }
  if (action.type === "UNDO") {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const newState = state.history[newIndex];
      return {
        ...state,
        drawnShapes: newState || [],
        historyIndex: newIndex,
      };
    }
    return state;
  }
  if (action.type === "CHANGE_TOOL") {
    return {
      ...state,
      toolState: { ...state.toolState, currentTool: action.payload },
    };
  }
  if (action.type === "CHANGE_COLOR") {
    return {
      ...state,
      toolState: { ...state.toolState, currentColor: action.payload },
    };
  }
  if (action.type === "CHANGE_BRUSHSIZE") {
    return {
      ...state,
      toolState: { ...state.toolState, strokeSize: action.payload },
    };
  }
  if (action.type === "UPD_EDITOR") {
    return {
      ...state,
      sideToolKitState: {
        ...state.sideToolKitState,
        ...action.payload,
      },
    };
  }
  if (action.type === "UPD_TEXT_STATE") {
    return {
      ...state,
      textState: {
        ...state.textState,
        ...action.payload,
      },
    };
  }
  if (action.type === "CLEAR_CANVAS") {
    return { ...state, drawnShapes: [], ...pushHistory([]) };
  }
  if (action.type === "BULK_DEL_SHAPE") {
    const newElemensArr = state.drawnShapes.filter(
      (e) => !action.payload.includes(e.id),
    );
    return {
      ...state,
      drawnShapes: newElemensArr,
      ...pushHistory(newElemensArr),
    };
  }
  return state;
}
