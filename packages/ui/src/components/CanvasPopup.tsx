"use client";
import React, {
  DialogHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
interface CanvasPopupProps extends DialogHTMLAttributes<HTMLDialogElement> {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const CanvasPopup = ({
  isOpen,
  onClose,
  onAccept,
  children,
}: CanvasPopupProps) => {
  const popupRef = useRef<HTMLDialogElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (isOpen) {
      popupRef.current?.showModal();
    } else {
      popupRef.current?.close();
    }
  }, [isOpen]);

  const closeModal = () => {
    popupRef.current?.close();
    onClose();
  };
  if (!mounted) return null;
  return createPortal(
    <dialog
      ref={popupRef}
      className="
      bg-canvas
      w-[90dvw] lg:w-1/2
      max-h-[80dvh]
      m-auto
      rounded-lg
      outline-1 outline-global-shadow
      shadow-pressed lg:shadow-primary
      backdrop:bg-black/50
      backdrop:backdrop-blur-sm
      relative
      py-3
      overflow-hidden
    "
    >
      <div className="absolute top-0 right-0 flex gap-2 h-8 mt-2 mr-4 z-10 font-google-sans-code ">
        <Button
          onClick={onAccept}
          size={"sm"}
          variant={"iconic"}
          className="outline-1 h-auto font-google-sans-code font-light outline-global-shadow bg-secondary shadow-primary active:shaow-pressed w-20 text-sm items-center justify-center rounded-sm capitalize cursor-pointer p-0 transition-shadow ease-out group scale-100 active:translate-[1px] "
        >
          accept
        </Button>
        {/*<Button
          onClick={onRetry}
          size={"sm"}
          variant={"iconic"}
          className="outline-1 h-auto font-google-sans-code font-light outline-global-shadow bg-primary shadow-primary active:shaow-pressed w-20 text-sm items-center justify-center rounded-sm capitalize cursor-pointer p-0 transition-shadow ease-out group scale-100 active:translate-[1px] "
        >
          retry
        </Button>*/}
        <Button
          onClick={closeModal}
          size={"sm"}
          variant={"iconic"}
          className="outline-1 h-auto font-google-sans-code font-light outline-global-shadow bg-red shadow-primary active:shaow-pressed w-20 text-sm items-center justify-center rounded-sm capitalize cursor-pointer p-0 transition-shadow ease-out group scale-100 active:translate-[1px] "
        >
          cancel
        </Button>
      </div>
      <div className="overflow-y-auto max-h-[calc(80dvh-3rem)]">
        {mounted && children}
      </div>
    </dialog>,
    document.body,
  );
};

export default CanvasPopup;
