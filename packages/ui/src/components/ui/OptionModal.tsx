import { QueryType } from "@repo/common";

export type selected = "draw" | "ask";

const OPTIONS: { name: QueryType; desc: string }[] = [
  { name: "create", desc: "Make BOBO create a flowchart" },
  { name: "tell", desc: "Ask BOBO about something" },
  { name: "edit", desc: "Tell BOBO to do some changes" },
  { name: "add", desc: "Try to add to exixting,with BOBO" },
];
const OptionModal = ({
  open,
  handleOptionSelect,
}: {
  open: boolean;
  handleOptionSelect: (option: QueryType) => void;
}) => {
  return (
    <div
      id="option"
      className={` absolute bg-primary border-t bottom-0 transform pt-1 left-0 w-full h-auto rounded-t-md transition-transform duration-300 text-sm ${open ? "translate-y-0" : "translate-y-full"} `}
    >
      <ul>
        {OPTIONS.map((ob, i) => (
          <li
            key={ob.name}
            className={`px-2 py-1 font-google-sans-code hover:bg-primary-700 transition-colors ease-in-out duration-200 cursor-pointer flex justify-between items-center gap-3 rounded-md `}
            onClick={() => handleOptionSelect(ob.name)}
          >
            <span className="bg-primary-700 text-xs px-2 py-1 rounded-sm">
              {ob.name}
            </span>
            <p className="font-sans text-xs font-normal text-center color-primary-contrast">
              {ob.desc}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OptionModal;
