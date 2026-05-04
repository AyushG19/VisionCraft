import React, { useRef, useState } from "react";
import { Button } from "./button";
import { IconClipboard } from "@tabler/icons-react";

interface CodeInputBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  toggleFunction: () => void;
  verifyJoin: (code: string) => Promise<void>;
  isLoading: boolean;
}
const CodeInputBox: React.FC<CodeInputBoxProps> = ({
  toggleFunction,
  verifyJoin,
  isLoading,
}) => {
  const [code, setCode] = useState(new Array(4).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  console.log(code);
  const handleOnchange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const value = e.target.value;
    if (!value) return;

    setCode((prev) => {
      const newArr = [...prev];
      newArr[idx] = value;
      return newArr;
    });

    if (idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }
  };
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.ctrlKey && e.key === "v") {
      handlePaste();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const sendCode = code.join("");
      verifyJoin(sendCode);
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault(); // prevent default deletion weirdness
      setCode((prev) => {
        const newArr = [...prev];
        if (prev[idx]) {
          // If current box has value, clear it
          newArr[idx] = "";
        } else if (idx > 0) {
          // If empty, move back and clear previous
          newArr[idx - 1] = "";
          inputRefs.current?.[idx - 1]?.focus();
        }
        return newArr;
      });

      // If current box empty, focus previous box
      if (!code[idx] && idx > 0) {
        inputRefs.current?.[idx - 1]?.focus();
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().slice(0, 4);
      const chars = cleaned.split("");
      const next = Array(4).fill("");

      chars.forEach((char, i) => {
        next[i] = char;
      });

      setCode(next);

      const focusIndex = Math.min(chars.length, 3);
      inputRefs.current[focusIndex]?.focus();
    } catch (err) {
      console.error("Clipboard access failed");
    }
  };

  return (
    <div
      className={`font-google-sans-code font-medium relative flex flex-col items-center justify-center gap-3 p-6 ${isLoading ? "pointer-events-none" : "pointer-events-auto"}`}
    >
      {/* input boxes for code */}
      <div className="flex gap-2">
        {code.map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            maxLength={1}
            value={code[i]}
            onChange={(e) => handleOnchange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="bg-secondary focus:bg-secondary-700 hover:bg-secondary-700 focus:shadow-shinyshadow-pressed text-3xl text-secondary-contrast w-20 h-20 text-center rounded-lg outline-1 outline-global-shadow "
          />
        ))}
      </div>

      {/* button to submit */}
      <div className="flex gap-2.5 w-full h-8">
        {/* button to cancel */}
        <Button
          onClick={() => toggleFunction()}
          size={"sm"}
          variant={"iconic"}
          className=" font-google-sans-code font-light bg-red outline-1 outline-global-shadow shadow-pressed w-20 rounded-sm  button-press-active capitalize h-full group"
        >
          <p className="group-active:translate-x-0.5 group-active:translate-y-0.5 ">
            cancel
          </p>
          {/* <IconX stroke={1.6} className="ml-1" size={18} color="black" /> */}
        </Button>
        <Button
          onClick={() => handlePaste()}
          variant={"iconic"}
          className="outline-1 h-auto font-google-sans-code font-light outline-global-shadow bg-accent shadow-pressed flex flex-1 text-sm items-center justify-center px-2 rounded-sm capitalize  button-press-active cursor-pointer group"
        >
          <p className="group-active:translate-x-0.5 group-active:translate-y-0.5 ">
            paste
          </p>
          <IconClipboard
            stroke={1.6}
            className="ml-1"
            size={18}
            color="black"
          />
        </Button>
        <Button
          onClick={() => verifyJoin(code.join(""))}
          size={"sm"}
          disabled={!code[3]}
          variant={"iconic"}
          className={`in-disabled:cursor-not-allowed bg-secondary font-google-sans-code font-light shadow-pressed rounded-sm w-20 capitalize h-full button-press-active text-secondary-contrast group`}
        >
          <p className="group-active:translate-x-0.5 group-active:translate-y-0.5 ">
            {isLoading ? "wait..." : "join"}
          </p>
          {/* <IconDoorEnter
            stroke={1.6}
            className="ml-1"
            size={18}
            color="black"
          /> */}
        </Button>
      </div>
    </div>
  );
};

export { CodeInputBox };
