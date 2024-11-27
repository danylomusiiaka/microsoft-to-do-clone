import React, { useEffect, useState } from "react";
import ThreeDots from "../../public/three-dots";
import SortByAlphabetIcon from "../../public/sort-by-alphabet";
import SortByDateIcon from "../../public/sort-by-date";
import SortByPriorityIcon from "../../public/sort-by-priority";
import { useTodoFunctions } from "./functions/todosFunctions";
import CloseCircle from "../../public/close-circle";
import SortAsc from "../../public/sort-up";
import SortDesc from "../../public/sort-down";
import { useTodos } from "@/contexts/TodosContext";

interface MenuProps {
  listName: string;
  sortOptions: { name: string; desc: boolean };
  setSortOptions: (options: { name: string; desc: boolean }) => void;
}

export default function Menu({ listName, sortOptions, setSortOptions }: MenuProps) {
  const { todos } = useTodos();
  const { sortBy } = useTodoFunctions();
  const [desc, setDesc] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [name, setName] = useState(listName);

  useEffect(() => {
    const savedSortOptions = sessionStorage.getItem("sortSettings");

    if (savedSortOptions) {
      const parsedOptions = JSON.parse(savedSortOptions);
      setSortOptions(parsedOptions);
      handleSort(parsedOptions.name, parsedOptions.desc);
      setDesc(parsedOptions.desc);
    }
  }, []);

  const handleSort = (name: string, desc: boolean = false) => {
    sortBy(name, desc, todos);
    setOpenMenu(false);
    setSortOptions({ name, desc });
    sessionStorage.setItem("sortSettings", JSON.stringify({ name, desc }));
  };

  const handleSortOrder = () => {
    setDesc((prevDesc) => {
      const newDesc = !prevDesc;
      sortBy(sortOptions.name, newDesc, todos);
      const sortSettings = { name: sortOptions.name, desc: newDesc };
      sessionStorage.setItem("sortSettings", JSON.stringify(sortSettings));
      return newDesc;
    });
  };

  return (
    <>
      <main className='relative flex justify-between items-center'>
        {listName !== "Завдання" ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='bg-transparent text-5xl font-bold mb-5 h-14 pb-2 truncated-input'
          />
        ) : (
          <h1 className='text-5xl font-bold md:mb-5 mb-7 '>{name}</h1>
        )}

        <section className='relative'>
          <div className='flex space-x-3'>
            <button onClick={() => setOpenMenu(!openMenu)}>
              <ThreeDots />
            </button>
          </div>

          {openMenu && (
            <section className='absolute right-0 mt-2 menu shadow-lg rounded-md p-3'>
              <p className='p-2 pl-1'>Відсортувати:</p>
              <button
                className='flex space-x-2 w-full items-center profile p-2 pl-1'
                onClick={() => handleSort("За алфавітом")}
              >
                <SortByAlphabetIcon />
                <p className='text-sm'>За алфавітом</p>
              </button>
              <button
                className='flex space-x-2 w-full items-center profile p-2 pl-1'
                onClick={() => handleSort("За терміном")}
              >
                <SortByDateIcon />
                <p className='text-sm'>За терміном</p>
              </button>
              <button
                className='flex space-x-2 w-full items-center profile p-2 pl-1'
                onClick={() => handleSort("За пріорітетністю")}
              >
                <SortByPriorityIcon />
                <p className='text-sm'>За пріорітетністю</p>
              </button>
            </section>
          )}
        </section>
      </main>
      {sortOptions.name && (
        <div className='flex items-center space-x-2 mb-3'>
          <button onClick={handleSortOrder}>{!desc ? <SortDesc /> : <SortAsc />}</button>
          <button onClick={() => handleSort("")}>
            <CloseCircle />
          </button>
          <p>Посортовано {sortOptions.name.toLowerCase()}</p>
        </div>
      )}
    </>
  );
}
