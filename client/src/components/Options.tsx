import { Category, Task } from "@/interfaces/TaskInterface";
import { formatText } from "./functions/formatFields";

type OptionsProps = {
  options: Task[] | Category[];
  handleClick: (name: string) => void;
};

export default function Options({ options, handleClick }: OptionsProps) {
  return (
    <div className='grid grid-cols-3' style={{ backgroundColor: "var(--sidebar-block-color)" }}>
      {options.map((option: any) => (
        <div
          key={option.name}
          onClick={() => handleClick(option.name)}
          className={`flex m-3 ml-2.5 w-20 items-center cursor-pointer justify-center rounded-xl text-sm h-5  ${
            option.color ? option.color : "bg-stone-400"
            }`}
        >
          {formatText(option.name, 11)}
        </div>
      ))}
    </div>
  );
}
