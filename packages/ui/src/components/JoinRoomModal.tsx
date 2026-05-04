"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { IconGridDots } from "@tabler/icons-react";
import { useError } from "@repo/hooks";
import { AppError } from "@repo/common";
import { AnimatePresence, motion, Variants } from "motion/react";
import { CodeInputBox } from "./ui/CodeInputBox";
import ThemeSwitcher from "./ui/ThemeSwitcher";
import { OptionId, ROOM_OPTIONS } from "../lib/roomOptions";

type Props = {
  verifyJoin: (code: string) => Promise<void>;
  makeNewRoom: () => Promise<void>;
  onChatToggle: () => void;
  onExitRoom: () => void;
  onLogout: () => void;
  isChatOpen: boolean;
  inRoom: boolean;
  setTheme: (t: string) => void;
};

const containerVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    width: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
  show: {
    opacity: 1,
    height: "auto",
    width: "auto",
    transition: { staggerChildren: 0.05 },
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
  inRoom,
  setTheme,
}: Props) {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setError } = useError();
  const menuRef = useRef<HTMLDivElement>(null);

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
        logout: onLogout,
      };
      actions[id]?.();
      setIsMenuOpen(false);
    },
    [makeNewRoom, onChatToggle, onExitRoom, onLogout],
  );

  const visibleOptions = ROOM_OPTIONS.filter(
    (opt) => opt.mode === "both" || (opt.mode === "room") === inRoom,
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
            flex items-center justify-end w-8 h-8 lg:w-10 lg:h-10 ${isMenuOpen ? "px-6" : "pr-2"}
            bg-primary text-primary-contrast rounded-l-xl outline-1 outline-global-shadow cursor-pointer
            transition-all duration-300
            ${isMenuOpen ? "!rounded-bl-none lg:w-full w-32 scale-[103%]" : ""}
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
              className="flex flex-col items-end overflow-hidden"
            >
              {visibleOptions.map((opt) => {
                const isTheme = opt.id === "themes";
                const Comp = isTheme ? motion.div : motion.button; // Fix for hydration error!

                return (
                  <Comp
                    key={opt.id}
                    variants={itemVariants}
                    onClick={() => !isTheme && handleAction(opt.id)}
                    className={`
                      flex items-center ${isTheme ? "flex-col items-end" : "justify-end"} w-32 lg:w-full h-auto py-2 lg:py-3 lg:px-6 px-4
                      ${(opt.id === "exit-room" || opt.id === "logout") && "hover:bg-red text-global-shadow"} bg-secondary text-secondary-contrast text-xs
                     border-b border-black/10 last:border-b-0
                      last:rounded-bl-xl hover:bg-primary hover:text-primary-contrast
                      transition-colors cursor-pointer
                    `}
                  >
                    {isTheme ? (
                      <>
                        <p className={`text-xs text-end capitalize block pb-2`}>
                          themes
                        </p>
                        <ThemeSwitcher setTheme={setTheme} />
                      </>
                    ) : (
                      <>
                        <p className={`mr-1.5 capitalize text-xs lg:text-base`}>
                          {opt.id === "ai-chat" && isChatOpen
                            ? "close chat"
                            : opt.label}
                        </p>
                        <opt.icon
                          className="w-[14px] h-[14px] lg:w-[16px] lg:h-[16px]"
                          stroke={1.6}
                        />
                      </>
                    )}
                  </Comp>
                );
              })}
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
