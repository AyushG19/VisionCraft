"use client";

const THEMES = [
  {
    name: "default",
    canvas: "#191a26",
    primary: "#d9ff3a",
    secondary: "#ffffff",
  },
  {
    name: "terra",
    canvas: "#1a1a1a",
    primary: "#4e6851",
    secondary: "#dcc9a9",
  },
  {
    name: "punktown",
    canvas: "#233d4d",
    primary: "#fe7f3d",
    secondary: "#fff2df",
  },
  {
    name: "eyeburn",
    canvas: "#fafafa",
    primary: "#868686",
    secondary: "#e7e6e6",
  },
  {
    name: "batman",
    canvas: "#181818",
    primary: "#e2e2e2",
    secondary: "#3f3f3f",
  },
  {
    name: "lowsun",
    canvas: "#331233",
    primary: "#e45e32",
    secondary: "#fbca69",
  },
] as const;

type ThemeName = (typeof THEMES)[number]["name"];

export default function ThemeSwitcher({
  setTheme,
}: {
  setTheme: (t: ThemeName) => void;
}) {
  return (
    <div className="grid grid-rows-1 grid-cols-6 gap-1.5">
      {THEMES.map(({ name, canvas, primary, secondary }) => (
        <button
          key={name}
          aria-label={`${name} theme`}
          onClick={() => setTheme(name)}
          className="w-5 h-5 grid grid-cols-2 grid-rows-2 overflow-clip rounded-sm
            outline-1 hover:outline-2 outline-global-shadow cursor-pointer
            transition-transform duration-100 hover:bg-secondary "
        >
          {/* canvas spans full left column */}
          <div className="row-span-2" style={{ background: canvas }} />
          <div style={{ background: primary }} />
          <div style={{ background: secondary }} />
        </button>
      ))}
    </div>
  );
}
