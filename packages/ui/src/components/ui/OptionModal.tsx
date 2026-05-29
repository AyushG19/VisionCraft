export type selected = "draw" | "ask";

const OPTIONS: { name: selected; desc: string }[] = [
  { name: "draw", desc: "Make BOBO create a flowchart" },
  { name: "ask", desc: "Ask BOBO about something" },
];
const OptionModal = ({
  open,
  handleOptionSelect,
}: {
  open: boolean;
  handleOptionSelect: (option: selected) => void;
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
              /{ob.name}
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
