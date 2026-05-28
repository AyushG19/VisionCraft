"use client";

import { useEffect, useRef, useState } from "react";
import { pingAllBackend } from "./api/ping";
import { useError, useToast } from "@repo/hooks";

export function PingProvider() {
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const textRef = useRef<HTMLDivElement | null>(null);
  const { setToast } = useToast();
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  function startInterval() {
    let limit = 3;
    intervalIdRef.current = setInterval(() => {
      if (!textRef.current) return;
      if (limit <= 0) {
        textRef.current.innerText = "waking up backend";
        limit = 3;
      } else {
        limit--;
        textRef.current.append(".");
      }
    }, 1000);
  }
  useEffect(() => {
    startInterval();
    setLoading(true);
    pingAllBackend()
      .then(() => {
        if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      })
      .catch((err) => {
        setToast({ title: "Ping error", message: err.message, type: "error" });
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      clearInterval(intervalIdRef.current);
    };
  }, []);

  if (loading)
    return (
      <div className="absolute top-2 left-2 z-100 min-w-60 max-w-70 h-fit px-6 py-4 rounded-xl bg-easy-blue ouline-1 outline-global-shadow shadow-primary text-canvas-contrast ">
        <button
          onClick={() => setShowDescription((prev) => !prev)}
          className="inline-flex items-center justify-center italic rounded-full w-4 h-4 outline-1 outline-easy-light-blue  text-white/80 text-xs font-sans mr-2 hover:outline-2 cursor-pointer"
        >
          i
        </button>
        <span
          ref={textRef}
          className="capitalize font-google-sans-code font-semibold text-easy-light-blue text-sm"
        >
          waking up backend
        </span>

        {showDescription && (
          <p className="font-handlee text-black mt-2 text-balance">
            Hey there! Please wait a bit, i use a free instance so the thing
            just keeps sleeping. It will be up in 30 - 60 sec.
            <br />
            Thank you!
          </p>
        )}
      </div>
    );
}
