import { IconMinus, IconPlus } from "@tabler/icons-react";
import { Button } from "./ui/button";

const Zoom = ({
  zoomDisplay,
  changeZoom,
}: {
  zoomDisplay: number;
  changeZoom: (direction: "in" | "out") => void;
}) => {
  return (
    <div className="fixed left-20 bottom-4 lg:left-27 lg:bottom-6 text-secondary-contrast outline-1 outline-global-shadow  bg-secondary h-7 lg:h-9 rounded-md flex items-center justify-center  ">
      {/*<div className="relative flex gap-12">*/}
      <Button
        variant={"secondary"}
        className={`w-7 h-7 lg:w-9 lg:h-9 p-0 flex items-center justify-center cursor-pointer shadow-shinysecondary text-secondary-contrast button-press-active transition-transform ease-in-out duration-100 outline-1 outline-global-shadow button-press rounded-r-none scale-100  z-0`}
        onClick={() => changeZoom("out")}
      >
        <IconMinus size={15} stroke={2}></IconMinus>
      </Button>
      <span className="h-7 w-12 lg:h-9 px-2 flex items-center justify-center bg-secondary shadow-pressed pointer-events-none border-l-1 border-global-shadow z-1 font-google-sans-code text-sm">
        {/*<span >
        </span>*/}
        {zoomDisplay}
      </span>
      <Button
        variant={"secondary"}
        className={`w-7 h-7 lg:w-9 lg:h-9 p-0 flex items-center justify-center cursor-pointer shadow-shinysecondary text-secondary-contrast button-press-active transition-transform ease-in-out duration-100 outline-1 outline-global-shadow button-press rounded-l-none scale-100 z-2 `}
        onClick={() => changeZoom("in")}
      >
        <IconPlus size={15} stroke={2}></IconPlus>
      </Button>
    </div>
    // </div>
  );
};
export default Zoom;
