import { UserInfo } from "@repo/hooks";
import { IconLocationFilled } from "@tabler/icons-react";

const UsersCursor = ({ name, color, userId }: UserInfo) => {
  return (
    <div
      className="flex"
      id={`cursor:${userId}`}
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        rotate: "revert",
        pointerEvents: "none",
        color: color,
      }}
    >
      <span
        className={`truncate max-w-20 text-black px-2 py-0.5 text-sm rounded-full mt-4 -mr-1 font-handlee`}
        style={{ backgroundColor: color }}
      >
        {name}
      </span>

      <IconLocationFilled color={"black"} fill="currentColor" stroke={1} />
    </div>
  );
};

export default UsersCursor;
