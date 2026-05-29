"use client";
import { motion, AnimatePresence } from "motion/react";
import { type Toast as ToastType, useToast } from "@repo/hooks";
import { IconX } from "@tabler/icons-react";
import { useEffect } from "react";

const Toast = () => {
  const { toast, setToast } = useToast();
  const clearToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => clearToast(), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const getColor = (type: ToastType["type"]): string => {
    switch (type) {
      case "error":
        return "bg-red text-white";
      case "info":
        return "bg-accent text-black";
      case "success":
        return "bg-green-500 text-black";
      case "warn":
        return "bg-yellow-500 text-black";
      case "none":
        return "";
    }
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`fixed bottom-4 right-4 z-[1000] w-80 rounded-xl border-1 border-global-shadow shadow-primary flex justify-between p-4 ${getColor(toast.type)}`}
        >
          <div>
            <h3 className="font-semibold capitalize font-krona-one">
              {toast.title}
            </h3>
            <p className="text-sm opacity-90 font-sans">{toast.message}</p>
          </div>
          <IconX
            onClick={clearToast}
            size={25}
            className="rounded-full p-1 cursor-pointer hover:scale-110"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
