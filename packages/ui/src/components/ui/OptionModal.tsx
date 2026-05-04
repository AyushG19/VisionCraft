export type selected = "draw" | "ask";

const OPTIONS: { name: selected; desc: string }[] = [
  { name: "draw", desc: "tell AI to draw something." },
  { name: "ask", desc: "ask AI about something." },
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
      className={` absolute bg-primary border-t bottom-0 transform  left-0 w-full h-auto rounded-t-md transition-transform duration-300 text-sm ${open ? "translate-y-0" : "translate-y-full"} `}
    >
      <ul>
        {OPTIONS.map((ob, i) => (
          <li
            key={ob.name}
            className={`px-4 py-2 font-semibold font-google-sans-code even:bg-primary-700 hover:bg-secondary transition-colors ease-in-out duration-200 cursor-pointer capitalize flex justify-between gap-3 hover:bg-light_sky_blue-700 rounded-md `}
            onClick={() => handleOptionSelect(ob.name)}
          >
            /{ob.name}
            <span className="font-handlee text-sm font-normal ">{ob.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OptionModal;
