"use client";
import { motion, AnimatePresence } from "motion/react";
import { useError } from "@repo/hooks";
import { IconX } from "@tabler/icons-react";
import { useEffect } from "react";

export const ErrorModal = () => {
  const { error, setError } = useError();
  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => clearError(), 3000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 right-4 z-[1000] w-80 rounded-xl bg-red-500 text-white shadow-primary flex justify-between p-4 "
        >
          <div>
            <h3 className="font-semibold">{error.code}</h3>
            <p className="text-sm opacity-90">{error.message}</p>
          </div>
          <IconX
            onClick={clearError}
            size={25}
            className="rounded-full hover:bg-red-400 p-1 cursor-pointer"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
