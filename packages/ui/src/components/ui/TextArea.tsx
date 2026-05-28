import { useEffect } from "react";
import oklchToCSS from "../../utils/colorHelper";
import { ToolKitType } from "@repo/common";

type TextEditState = {
  elementId: string;
  x: number;
  y: number;
  text: string;
} | null;

type TextAreaProps = {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
  finishText: () => void;
  textEditState: TextEditState;
  textEditorState: {
    fontFamily: string;
    fontSize: number;
    alignment: "left" | "center" | "right";
  };
  cancelText: () => void;
  toolKitState: ToolKitType;
  setTextEdit: React.Dispatch<React.SetStateAction<TextEditState>>;
};

const TextArea = ({
  textAreaRef,
  finishText,
  textEditState,
  textEditorState,
  cancelText,
  toolKitState,
  setTextEdit,
}: TextAreaProps) => {
  if (!textEditState) return null;
  return (
    <textarea
      autoFocus
      ref={textAreaRef}
      // onBlur={finishText}
      value={textEditState.text}
      onChange={(e) => setTextEdit({ ...textEditState!, text: e.target.value })}
      onKeyDown={(e) => {
        if (e.key === "Enter") finishText();
        if (e.key === "Escape") cancelText();
      }}
      style={{
        position: "absolute",
        left: textEditState.x,
        top: textEditState.y,
        width: "auto",
        height: "auto",
        fontSize: textEditorState.fontSize,
        background: "transparent",
        border: "none",
        outline: "none",
        resize: "none",
        color: oklchToCSS(toolKitState.currentColor),
        textAlign: textEditorState.alignment,
        overflow: "hidden",
        fontFamily: textEditorState.fontFamily,
      }}
    />
  );
};

export default TextArea;
