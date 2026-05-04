"use client";
import { IconAi, IconSend2 } from "@tabler/icons-react";
import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Virtuoso } from "react-virtuoso";
import MessageBubble from "./ui/MessageBubble";
import { SideChatPropsType } from "./types";
import { useError, UserInfo, useSocketContext, useUser } from "@repo/hooks";
import OptionModal, { selected } from "./ui/OptionModal";
import { AnimatePresence, motion } from "motion/react";
import ChatTop from "./ChatTop";
import { ClientMessageType, ServerMessageType } from "@repo/common";
import Loader from "./ui/Loader";

const SideCollapseChat = React.forwardRef<HTMLDivElement, SideChatPropsType>(
  (
    {
      inRoom,
      send,
      messages,
      setMessages,
      isOpen,
      handleChatToggle,
      fetchChartFromAi,
      isLoading,
      slug,
    },
    ref,
  ) => {
    const [inputText, setInputText] = useState<string>("");
    const [showOptions, setShowOptions] = useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const { currentUser } = useUser();
    const { roomInfo } = useSocketContext();
    const { setError } = useError();

    const handleMessageSend = async (content: string) => {
      if (currentUser === null) {
        setError({ code: "VALIDATION_ERROR", message: "Please Login again." });
        return;
      }
      const { userId, name } = currentUser;

      const userMessage: ServerMessageType = {
        sender_id: userId,
        name: name,
        timeStamp_ms: Date.now(),
        content: content,
      };

      if (content.startsWith("/draw")) {
        const command = content.replace("/draw", "").trim();
        fetchChartFromAi(command);
        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        return;
      }

      setMessages((prev) => [...prev, userMessage]);

      if (inRoom) {
        const messageToBackend: ClientMessageType = {
          name: name,
          content: content,
        };
        send("CHAT", messageToBackend);
      }
    };

    const handleShowOption = () => {
      setShowOptions((prev) => !prev);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!inputRef.current) return;
      if (e.key === "Enter" && inputText.trim()) {
        handleMessageSend(inputText);
        setInputText("");
      }
    };

    const handleOptionSelect = (option: selected) => {
      if (!inputRef.current) return;
      setInputText(`/${option} `);
      inputRef.current.focus();
      setShowOptions(false);
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            ref={ref}
            className="absolute right-0 top-0 flex flex-col items-center justify-center h-dvh w-dvw lg:w-[360px] bg-priamry shadow-primary overflow-hidden outline-1 outline-global-shadow z-40"
          >
            <ChatTop
              handleChatToggle={handleChatToggle}
              inRoom={inRoom}
              slug={slug}
              avatars={roomInfo.users}
            />
            <div className="w-full relative !h-full bg-gradient-to-t from-primary via-secondary to-primary overflow-hidden ">
              <div className="absolute inset-0 bg-[url('/pattern-2.svg')] bg-repeat bg-top-left opacity-20 pointer-events-none " />

              <div className="absolute h-full inset-0 bottom-14 p-2 pt-20">
                <Virtuoso
                  data={messages}
                  initialTopMostItemIndex={messages.length - 1}
                  itemContent={(index, message) => {
                    const prev = index > 0 ? messages[index - 1] : null;
                    const next =
                      index < messages.length - 1 ? messages[index + 1] : null;

                    const isSameAsPrev =
                      prev && prev.sender_id === message.sender_id;
                    const isSameAsNext =
                      next && next.sender_id === message.sender_id;

                    let position: "single" | "first" | "middle" | "last" =
                      "single";

                    if (!isSameAsPrev && !isSameAsNext) {
                      position = "single";
                    } else if (!isSameAsPrev && isSameAsNext) {
                      position = "first";
                    } else if (isSameAsPrev && isSameAsNext) {
                      position = "middle";
                    } else if (isSameAsPrev && !isSameAsNext) {
                      position = "last";
                    }

                    let isOwn = false;
                    if (inRoom && currentUser) {
                      isOwn = message.sender_id === currentUser.userId;
                    }

                    return (
                      <MessageBubble
                        key={`${message.sender_id}-${message.timeStamp_ms}-${index}`}
                        message={message}
                        isOwn={isOwn}
                        color={
                          roomInfo.users.find(
                            (user: UserInfo) =>
                              user.userId === message.sender_id,
                          )?.color
                        }
                        positionInBlock={position}
                      />
                    );
                  }}
                />
              </div>

              <OptionModal
                open={showOptions}
                handleOptionSelect={handleOptionSelect}
              />
            </div>

            <div
              draggable={false}
              className="p-2 flex w-full h-14 gap-1.5 mt-auto items-center justify-center bg-primary"
            >
              <Button
                onClick={handleShowOption}
                aria-label="command"
                variant={"outline"}
                className="h-full p-0 aspect-square  rounded-md cursor-pointer text-primary-contrast hover:bg-accent flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <Loader />
                ) : (
                  <IconAi color={"currentColor"} size={25} stroke={1.6} />
                )}
              </Button>
              <input
                ref={inputRef}
                value={inputText}
                onKeyDown={handleKeyDown}
                onInput={(e) => setInputText(e.currentTarget.value)}
                disabled={!isOpen}
                placeholder="/ for AI, say hAI"
                className="font-google-sans-code text-secondary-contrast placeholder:text-xs text-sm min-w-40 max-w-200 h-full flex-1 rounded-md bg-white px-2 outline-1 outline-global-shadow "
              />
              <Button
                onClick={() => {
                  if (inputText.trim()) {
                    handleMessageSend(inputText);
                    setInputText("");
                  }
                }}
                disabled={!isOpen}
                variant={"secondary"}
                className="translate-x-0 rounded-lg aspect-square p-0 h-full items-center justify-center flex shadow-shinyshadow button-press-active transition-all ease-in disabled:opacity-50 text-secondary-contrast hover:text-accent outline-1 outline-global-shadow"
              >
                <IconSend2 fill="currentColor" size={18} stroke={1} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

export default SideCollapseChat;
