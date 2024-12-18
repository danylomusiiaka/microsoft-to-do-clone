import { formatText } from "./functions/formatFields";

type OptionsProps = {
  options: { name: string; color: string }[] | string[];
  handleClick: (name: string) => void;
};

export default function Options({ options, handleClick }: OptionsProps) {
  return (
    <div className='grid grid-cols-3' style={{ backgroundColor: "var(--sidebar-block-color)" }}>
      {options.map((option: any) => (
        <div
          key={option.name || option}
          onClick={() => handleClick(option.name || option)}
          className={`flex m-3 ml-2.5 w-20 items-center cursor-pointer justify-center rounded-xl text-sm h-5  ${
            option.color ? option.color : "bg-stone-400"
          }`}
        >
          {formatText(option.name || option, 11)}
        </div>
      ))}
    </div>
  );
}
