import React, { useState } from "react";
import { motion } from "motion/react";
import { UserInfo } from "@repo/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ToolTip";

interface AvatarGroupProps {
  avatars: UserInfo[];
  maxVisible?: number;
  size?: number;
  overlapAmount?: number;
  onAvatarClick?: (userInfo: UserInfo) => void;
  onShowAllClick?: () => void;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  maxVisible = 5,
  size = 40,
  overlapAmount = 0.65,
  onAvatarClick,
  onShowAllClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = Math.max(0, avatars.length - maxVisible);

  const overlapOffset = size * overlapAmount;
  const slideDistance = size * 0.3; // How far to slide left
  const totalItemsCount = visibleAvatars.length + (remainingCount > 0 ? 1 : 0);
  const baseWidth =
    totalItemsCount > 0 ? (totalItemsCount - 1) * overlapOffset + size : 0;

  console.log(avatars[0]!.name.split("")[0]?.toUpperCase());

  return (
    <div
      className="relative flex items-center mt-0.5 "
      style={{
        height: size,
        width: baseWidth,
        marginLeft: slideDistance,
      }}
    >
      {visibleAvatars.map((avatar, index) => {
        const baseOffset = index * overlapOffset;
        const isHovered = hoveredIndex === index;

        return (
          <motion.div
            key={avatar.userId}
            className="absolute cursor-pointer font-krona-one outline-1 outline-global-shadow rounded-full text-white "
            initial={false}
            animate={{
              x: isHovered ? baseOffset - slideDistance : baseOffset,
              scale: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
              mass: 0.5,
            }}
            style={{
              width: size,
              height: size,
              zIndex: isHovered ? 100 : index,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAvatarClick?.(avatar)}
          >
            <div
              className="relative w-full h-full rounded-full border-personal overflow-hidden bg-gray-200 "
              style={{
                backgroundColor: avatar.color || "#6366f1",
              }}
            >
              {/* {avatar.imageUrl ? (
                <img
                  src={avatar.imageUrl}
                  alt={avatar.name.trim()[0]?.toUpperCase()}
                  className="absolute inset-0 w-full h-full object-cover text-center"
                />
              ) : ( */}
              <Tooltip>
                <TooltipTrigger>
                  <div className="w-full h-full flex items-center justify-center font-semibold text-sm outline-3 outline-global-shadow">
                    {avatar.name.trim()[0]?.toUpperCase()}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{avatar.name.trim()}</TooltipContent>
              </Tooltip>
              {/* )} */}
            </div>
          </motion.div>
        );
      })}

      {/* Remaining count indicator */}
      {remainingCount > 0 && (
        <motion.div
          className="absolute flex items-center justify-center rounded-full border-2 border-white shadow-md bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors"
          initial={false}
          animate={{
            x:
              hoveredIndex === visibleAvatars.length
                ? visibleAvatars.length * overlapOffset - slideDistance
                : visibleAvatars.length * overlapOffset,
          }}
          whileTap={{ scale: 0.98 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 28,
            mass: 0.5,
          }}
          style={{
            width: size,
            height: size,
            zIndex:
              hoveredIndex === visibleAvatars.length
                ? 100
                : visibleAvatars.length,
          }}
          onMouseEnter={() => setHoveredIndex(visibleAvatars.length)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={onShowAllClick}
        >
          <span className="text-gray-700 font-semibold text-sm">
            +{remainingCount}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default AvatarGroup;
