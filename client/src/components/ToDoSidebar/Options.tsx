type OptionsProps = {
  options: { name: string; color: string }[] | string[];
  handleClick: (name: string) => void;
};

interface Options {
  name: string;
  color: string;
}

export default function Options({ options, handleClick }: OptionsProps) {
  return (
    <div className="grid grid-cols-3 " style={{ backgroundColor: "var(--sidebar-block-color)" }}>
      {options.map((option: Options | string) => (
        <div
          key={typeof option === "string" ? option : option.name}
          onClick={() => handleClick(typeof option === "string" ? option : option.name)}
          className={`text-center m-3 mx-2 cursor-pointer rounded-xl bg-stone-400 text-sm h-5 truncated-text`}
          style={typeof option !== "string" && option.color ? { backgroundColor: option.color } : undefined}
        >
          {typeof option === "string" ? option : option.name}
        </div>
      ))}
    </div>
  );
}
