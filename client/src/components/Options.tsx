
type OptionsProps = {
  options: { name: string; color: string }[] | string[];
  handleClick: (name: string) => void;
};

export default function Options({ options, handleClick }: OptionsProps) {
  return (
    <div className='grid grid-cols-3 ' style={{ backgroundColor: "var(--sidebar-block-color)" }}>
      {options.map((option: any) => (
        <div
          key={option.name || option}
          onClick={() => handleClick(option.name || option)}
          className={`text-center m-3 mx-2 cursor-pointer rounded-xl bg-stone-400 text-sm h-5 truncated-text`}
          style={{ backgroundColor: `${option.color}` }}
        >
          {option.name || option}
        </div>  
      ))}
    </div>
  );
}
