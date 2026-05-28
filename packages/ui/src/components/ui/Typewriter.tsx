"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { IconCursorText } from "@tabler/icons-react";

export default function MotionTypewriter({
  words,
  speed = 0.1,
  pauseDuration = 2000,
}: {
  words: string[];
  speed?: number;
  pauseDuration?: number;
}) {
  const [index, setIndex] = useState(0);
  const currentWord = words[index] || "disigner";

  const count = useMotionValue(0);

  const displayText = useTransform(count, (latest) =>
    currentWord.slice(0, Math.round(latest)),
  );

  useEffect(() => {
    let isMounted = true;

    const runAnimation = async () => {
      await animate(count, currentWord.length, {
        type: "tween",
        duration: currentWord.length * speed,
        ease: "linear",
      });

      if (!isMounted) return;

      await new Promise((resolve) => setTimeout(resolve, pauseDuration));

      if (!isMounted) return;

      await animate(count, 0, {
        type: "tween",
        duration: currentWord.length * (speed / 1.5),
        ease: "linear",
      });

      if (!isMounted) return;

      setIndex((prev) => (prev + 1) % words.length);
    };

    runAnimation();

    return () => {
      isMounted = false;
    };
  }, [index, currentWord, pauseDuration, speed, words.length, count]);

  return (
    <span className="font-krona-one text-[50px] leading-none text-[#E7E3F3] text-shadow-generic flex items-center justify-center h-full w-full bg-easy-pink rounded-lg shadow-primary capitalize pb-3">
      <motion.span>{displayText}</motion.span>

      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
        }}
      >
        <IconCursorText
          className="mt-3 -mx-2"
          color="#000000"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          size={60}
        />
      </motion.span>
    </span>
  );
}
