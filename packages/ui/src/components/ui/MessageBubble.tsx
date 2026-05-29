import { ServerMessageType } from "@repo/common";
import { motion } from "motion/react";
type MessageBubbleProps = {
  message: ServerMessageType;
  isOwn: boolean;
  positionInBlock: "single" | "first" | "middle" | "last";
  color?: string;
};

function getTimeString(timestamp: number) {
  const date = new Date(timestamp);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

// const messageContent = (content: string) => {
//   return (
//     <p
//       className={`font-[google_sans_code] font-light text-xs p-1`}
//       style={{ wordSpacing: "0.1rem" }}
//     >
//       {content}
//     </p>
//   );
// };

const MessageBubble = ({
  message,
  isOwn,
  positionInBlock,
  color = "black",
}: MessageBubbleProps) => {
  // Base classes
  let base =
    "w-fit max-w-3/5 px-3 py-1 whitespace-pre-wrap break-words max-w-[80%] font-handlee border-1 border-global-shadow rounded-xl";

  let radiusClasses = "";

  if (isOwn) {
    switch (positionInBlock) {
      case "single":
        radiusClasses = " rounded-tr-xs mb-1";
        break;
      case "first":
        radiusClasses = " rounded-tr-xs rounded-br-sm mb-[1px]";
        break;
      case "middle":
        radiusClasses = " rounded-r-sm mb-[1px]";
        break;
      case "last":
        radiusClasses = " rounded-r-sm mb-1";
        break;
    }
    base += " ml-auto bg-[#FCFAED]";
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className={`${base} ${radiusClasses}`}
      >
        <div className="relative py-0.5">
          <p className=" " style={{ lineHeight: "1.2rem" }}>
            {message.content}
            <span className="w-8 inline-block"></span>
            <span className="absolute right-0 bottom-0 -mb-1 text-[10px] font-semibold opacity-50">
              {getTimeString(message.timeStamp_ms)}
            </span>
          </p>
        </div>
      </motion.div>
    );
  } else {
    switch (positionInBlock) {
      case "single":
        radiusClasses = " rounded-tl-xs mb-1";
        break;
      case "first":
        radiusClasses = " rounded-tl-xs rounded-bl-sm mb-[1px] ";
        break;
      case "middle":
        radiusClasses = " rounded-l-sm mb-[1px] ";
        break;
      case "last":
        radiusClasses = " rounded-l-sm mb-1";
        break;
    }
    base += " bg-secondary text-secondary-contrast mr-auto ";
  }
  return (
    <div className="flex items-start gap-1.5 ">
      {positionInBlock === "first" || positionInBlock === "single" ? (
        <div
          className="size-7 rounded-full border flex justify-center items-center capitalize text-xs font-krona-one  "
          style={{ background: color }}
        >
          {message.name[0]}
        </div>
      ) : (
        <div className="size-7 "></div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className={`${base} ${radiusClasses} `}
        // style={{ background: color }}
      >
        <div className="relative py-0.5">
          <p className=" " style={{ lineHeight: "1.2rem" }}>
            {message.content}
            <span className="w-8 inline-block"></span>
            <span className="absolute right-0 bottom-0 -mb-1 text-[10px] font-semibold opacity-50">
              {getTimeString(message.timeStamp_ms)}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default MessageBubble;
