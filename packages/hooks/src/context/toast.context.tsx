"use client";
import React, {
  createContext,
  Provider,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type Toast = {
  type: "error" | "info" | "success" | "warn" | "none";
  title: string;
  message: string;
};
type ToastContext = {
  toast: Toast | null;
  setToast: React.Dispatch<SetStateAction<Toast | null>>;
};
const ToastContext = createContext<ToastContext | null>(null);

export function ToastContextProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  return (
    <ToastContext.Provider value={{ toast, setToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContext {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("Error in toast context.");
  return ctx;
}
