import { IconCheck, IconChevronLeft, IconCopy } from "@tabler/icons-react";
import AvatarGroup from "./ui/AvatarGroup";
import { useState } from "react";
import { UserInfo } from "@repo/hooks";
import { Button } from "./ui/button";

const ChatTop = ({
  slug,
  avatars,
  inRoom,
  handleChatToggle,
}: {
  slug: string;
  avatars: UserInfo[];
  inRoom: boolean;
  handleChatToggle: () => void;
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const showFeedBack = () => {
    setIsCopied(true);
    const t = setTimeout(() => {
      setIsCopied(false);
    }, 1000);
    return () => clearTimeout(t);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(slug);
    showFeedBack();
  };
  if (!inRoom)
    return (
      <Button
        aria-label="back"
        onClick={() => handleChatToggle()}
        variant={"outline"}
        size={"sm"}
        className="absolute p-0 top-0 left-0 z-30 m-2 aspect-square"
      >
        <IconChevronLeft />
      </Button>
    );
  return (
    <div className=" w-full absolute top-0 left-0 z-30 p-2 ">
      {/* <div className="flex outline h-8 rounded-md"> */}
      {/* <h3 className="capitalize font-google-sans-code  ">code:</h3> */}
      {/* <h1 className="text-2xl font-google-sans-code px-2 ">{slug}</h1> */}
      <div className="flex items-center w-full bg-primary outline-1 outline-global-shadow pr-6 py-2 pl-2 rounded-lg h-fit">
        <Button
          aria-label="back"
          onClick={() => handleChatToggle()}
          variant={"outline"}
          size={"sm"}
          className=" z-30 mr-4 h-12 w-fit px-1 py-0 flex-start"
        >
          <IconChevronLeft />
        </Button>
        {/* <div className=""> */}
        {/* <div
            className=" capitalize text-[10px]  "
            style={{
              // fontSize: 9,
              // color: C.slate,
              // fontWeight: 700,
              letterSpacing: ".1em",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              // textTransform: "uppercase",
            }}
          >
            Name
          </div> */}
        <div
          className="flex relative gap-1 mt-4 items-center justify-center  hover:bg-secondary bg-primary-700 text-global-shadow transition-colors px-2.5 -ml-2 py-0.5 cursor-pointer rounded-md font-google-sans-code before:font-sans font-light text-xl before:content-['Code'] before:absolute before:-top-4 before:left-1 before:text-[10px] before:font-medium "
          onClick={handleCopy}
          style={{
            letterSpacing: ".04em",
          }}
        >
          {slug}

          {!isCopied ? (
            <IconCopy stroke={1.5} size={15} />
          ) : (
            <IconCheck color="green" size={18} />
          )}
        </div>
        {/* </div> */}
        {/* </div> */}
        <div
          className=" capitalize text-[10px] text-center text-global-shadow  h-full ml-auto  "
          style={{
            // fontSize: 9,
            // color: C.slate,
            // fontWeight: 700,
            letterSpacing: ".1em",
            // fontFamily: "'Plus Jakarta Sans',sans-serif",
            // textTransform: "uppercase",
          }}
        >
          online
          <AvatarGroup size={25} avatars={avatars} />
        </div>
      </div>
    </div>
  );
};

export default ChatTop;
