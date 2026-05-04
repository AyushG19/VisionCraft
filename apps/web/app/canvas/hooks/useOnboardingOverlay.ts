import { useEffect, useRef } from "react";
import { drawOnboardingOverlay } from "../helper/initialdraw.helper";

export function useOnboardingOverlay(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const base = canvasRef.current;
    if (!base) return;

    // create overlay canvas, size + position it over the main one
    const overlay = document.createElement("canvas");
    overlay.width = base.width;
    overlay.height = base.height;
    Object.assign(overlay.style, {
      position: "absolute",
      top: base.offsetTop + "px",
      left: base.offsetLeft + "px",
      width: base.style.width || base.width + "px",
      height: base.style.height || base.height + "px",
      pointerEvents: "none", // clicks pass through to main canvas
      zIndex: "10",
    });

    base.parentElement?.appendChild(overlay);
    overlayRef.current = overlay;

    if (window.innerWidth > 640) {
      drawOnboardingOverlay(overlay);
    } else {
      // drawOnboardingOverlayMobile(overlay);
    }

    const dismiss = () => {
      overlay.remove();
      overlayRef.current = null;
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", dismiss);
    };

    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("keydown", dismiss);

    return () => {
      overlay.remove();
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, []); // once on mount
}
