"use client";

import React from "react";
import { useCallback, useState, useRef, useEffect } from "react";
import { IconGridDots } from "@tabler/icons-react";
import { useError, useSocketContext } from "@repo/hooks";
import { AppError } from "@repo/common";
import { AnimatePresence, motion, Variants } from "motion/react";
import { CodeInputBox } from "./ui/CodeInputBox";
import { OptionId, ROOM_OPTION_SECTIONS } from "../lib/roomOptions";
import ThemeSwitcher from "./ui/ThemeSwitcher";

type Props = {
  verifyJoin: (code: string) => Promise<void>;
  makeNewRoom: () => Promise<void>;
  onChatToggle: () => void;
  onExitRoom: () => void;
  onLogout: () => void;
  isChatOpen: boolean;
  clearCanvas: () => void;
  setTheme: (t: string) => void;
};

const containerVariants = {
  hidden: {
    opacity: 0,
    height: 20,
    width: 20,
    transition: { staggerChildren: 0.05, staggerDirection: -1, duration: 0.3 },
  },
  show: {
    opacity: 1,
    height: "auto",
    width: "auto",
    transition: { staggerChildren: 0.05, duration: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -5 }, // Starts pushed to the right
  show: { opacity: 1, x: 0, transition: { ease: "easeOut" } }, // Slides in beautifully
};

// ── Component ─────────────────────────────────────────────────────────────
export default function JoinRoomModal({
  verifyJoin,
  makeNewRoom,
  onChatToggle,
  onExitRoom,
  onLogout,
  isChatOpen,
  setTheme,
  clearCanvas,
}: Props) {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setError } = useError();
  const menuRef = useRef<HTMLDivElement>(null);
  const { inRoom } = useSocketContext();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -- handlers
  const withLoading = async (fn: () => Promise<void>) => {
    try {
      setIsLoading(true);
      await fn();
    } catch (err) {
      setError(
        err instanceof AppError
          ? { code: err.code, message: err.message }
          : { code: "UNKNOWN_ERROR", message: String(err) },
      );
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
      setShowCodeInput(false);
    }
  };

  const handleAction = useCallback(
    (id: OptionId) => {
      const actions: Partial<Record<OptionId, () => void>> = {
        create: () => withLoading(makeNewRoom),
        join: () => {
          setShowCodeInput(true);
          setIsMenuOpen(false);
        },
        "room-chat": onChatToggle,
        "ai-chat": onChatToggle,
        "exit-room": onExitRoom,
        "clear-canvas": clearCanvas,
        // commands: showCommands,
        github: () => {
          window.open("https://github.com/AyushG19/VisionCraft.git", "_blank");
        },
        x: () => {
          window.open("https://x.com/AyushTE", "_blank");
        },
      };
      actions[id]?.();
      setIsMenuOpen(false);
    },
    [makeNewRoom, onChatToggle, onExitRoom, onLogout],
  );

  return (
    <>
      {/* ── Main Menu Container ── */}
      <div
        ref={menuRef}
        className={`
          fixed right-0 top-14 lg:top-6 z-40 flex flex-col items-end font-google-sans-code 
          transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isChatOpen ? " lg:-translate-x-[360px]" : "translate-x-0"}
        `}
      >
        {/* Trigger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`
            flex items-center justify-end w-8 h-8 
            bg-primary text-primary-contrast rounded-l-xl outline-1 outline-global-shadow cursor-pointer
            transition-all 
            ${isMenuOpen ? "!rounded-bl-none px-4 md:h-10 md:w-full " : "pr-2 md:h-10 md:w-10 delay-75"}
          `}
        >
          <span
            className={`text-xs font-semibold capitalise whitespace-nowrap overflow-hidden transition-all delay-100 ${isMenuOpen ? " opacity-100 translate-x-0 mr-2 max-w-full" : "max-w-0 translate-x-10 opacity-0 "}`}
          >
            Options
          </span>
          <IconGridDots
            className=" w-[10px] h-[10px] md:w-[15px] md:h-[15px]"
            stroke={2}
          />
        </button>

        {/* Animated Drawer (Expands horizontally & slides items from right) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="flex flex-col items-end overflow-hidden w-full outline-1 outline-global-shadow rounded-bl-xl bg-secondary"
            >
              {ROOM_OPTION_SECTIONS.map((section, i) => {
                if (!inRoom && section.label === "room") return null;
                if (inRoom && section.label === "default") return null;
                return (
                  <React.Fragment key={i}>
                    {section.items.map((item, i) => {
                      return (
                        <motion.button
                          key={item.id}
                          variants={itemVariants}
                          onClick={() => handleAction(item.id)}
                          className={`
                            flex items-center justify-end w-32 md:w-full h-auto py-2 md:py-2.5 px-3
                      ${item.id === "exit-room" && "hover:bg-red text-global-shadow"} 
                      bg-secondary text-secondary-contrast text-xs
                      last:border-b-0
                      last:rounded-bl-xl hover:bg-secondary-700 hover:text-secondary-contrast
                      transition-colors duration-100 ease-in-out cursor-pointer
                    `}
                        >
                          <p className={`mr-2 text-xs capitalize text-inherit`}>
                            {item.id === "ai-chat" && isChatOpen
                              ? "close chat"
                              : item.label}
                          </p>
                          <item.icon
                            className="w-[14px] h-[14px] lg:w-[16px] lg:h-[16px]"
                            stroke={1.6}
                          />
                        </motion.button>
                      );
                    })}
                    <div className="w-full h-[1px] bg-primary/30 my-1"></div>
                  </React.Fragment>
                );
              })}
              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-2.5 justify-end text-secondary-contrast bg-secondary mt-1 mx-3 mb-3"
              >
                <p className={`text-xs capitalize text-end`}>canvas themes</p>
                <ThemeSwitcher setTheme={setTheme} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Code Input Modal ── */}
      <AnimatePresence>
        {showCodeInput && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCodeInput(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
              className="fixed top-1/2 left-1/2 z-50 bg-primary outline-1 outline-global-shadow rounded-md shadow-xl w-[90vw] max-w-sm"
            >
              <CodeInputBox
                verifyJoin={(code) => withLoading(() => verifyJoin(code))}
                toggleFunction={() => setShowCodeInput(false)}
                isLoading={isLoading}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
