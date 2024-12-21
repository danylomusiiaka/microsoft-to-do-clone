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
import Delete from "../../public/delete";
import Axios from "axios";
import { useAlert } from "@/contexts/AlertContext";
import { useProfileFunctions } from "./functions/userFunctions";
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

interface MenuProps {
  listName: string;
  sortOptions: { name: string; desc: boolean };
  setSortOptions: (options: { name: string; desc: boolean }) => void;
}

export default function Menu({ listName, sortOptions, setSortOptions }: MenuProps) {
  const { todos, setTodos, setTodoChoosed } = useTodos();
  const { sortBy } = useTodoFunctions();
  const [desc, setDesc] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [name, setName] = useState(listName);
  const { showAlert } = useAlert();
  const { updateCategory } = useProfileFunctions();

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

  const handleDeleteAll = async () => {
    try {
      const response = await Axios.delete(`${webUrl}/task/all`, {
        params: { category: listName },
        withCredentials: true,
      });
      if (response.status === 200) {
        setTodoChoosed(null);
        setTodos(response.data.remainingTasks || []);
        showAlert(response.data.message);
      }
    } catch (error: any) {
      if (error.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
      }
    }
    setOpenMenu(false);
  };

  return (
    <>
      <main className='relative flex justify-between items-center'>
        {listName !== "Завдання" ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name.trim() === "") {
                setName(listName);
                return;
              }
              
              updateCategory(listName, name);
            }}
            className='bg-transparent text-5xl font-bold mb-5 h-14 pb-2 truncated-input'
          />
        ) : (
          <h2 className='text-5xl font-bold md:mb-5 mb-7 '>{name}</h2>
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
                className='flex space-x-2 w-full items-center profile p-2'
                onClick={() => handleSort("За алфавітом")}
              >
                <SortByAlphabetIcon />
                <p>За алфавітом</p>
              </button>
              <button
                className='flex space-x-2 w-full items-center profile p-2'
                onClick={() => handleSort("За терміном")}
              >
                <SortByDateIcon />
                <p>За терміном</p>
              </button>
              <button
                className='flex space-x-2 w-full items-center profile p-2'
                onClick={() => handleSort("За пріорітетністю")}
              >
                <SortByPriorityIcon />
                <p>За пріорітетністю</p>
              </button>
              <button
                className='flex space-x-2 w-full items-center profile p-2 pl-0'
                onClick={handleDeleteAll}
              >
                <Delete color='#b91c1c' width='25px' />
                <p className='text-red-600'> Видалити всі завдання</p>
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
