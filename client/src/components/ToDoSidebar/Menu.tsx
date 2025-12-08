import React, { useEffect, useState } from "react";

import { useAlert } from "@/contexts/AlertContext";
import { useTodos } from "@/contexts/TodosContext";

import { formatDate } from "@/functions/formatFields";
import { handleError } from "@/functions/handleError";
import { useTodoFunctions } from "@/functions/hooks/useTodosFunctions";
import { useProfileFunctions } from "@/functions/hooks/useUserFunctions";

import { api } from "@/services/api";

import Propositions from "../../../public/Idea";
import CloseCircle from "../../../public/close-circle";
import Delete from "../../../public/delete";
import SortByAlphabetIcon from "../../../public/sort-by-alphabet";
import SortByDateIcon from "../../../public/sort-by-date";
import SortByPriorityIcon from "../../../public/sort-by-priority";
import SortDesc from "../../../public/sort-down";
import SortAsc from "../../../public/sort-up";
import ThreeDots from "../../../public/three-dots";

interface MenuProps {
  listName: string;
  sortOptions: { name: string; desc: boolean };
  setSortOptions: (options: { name: string; desc: boolean }) => void;
  setOpenSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Menu({ listName, sortOptions, setSortOptions, setOpenSuggestions }: MenuProps) {
  const { todos, setTodos, setTodoChoosed, todoChoosed } = useTodos();
  const { sortBy } = useTodoFunctions();
  const [desc, setDesc] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [name, setName] = useState(listName);
  const { showAlert } = useAlert();
  const { updateCategory } = useProfileFunctions();
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const response = await api.delete(`/task/all`, {
        params: { category: listName },
      });
      if (response.status === 200) {
        setTodoChoosed(null);
        setTodos(response.data.remainingTasks || []);
        showAlert(response.data.message);
      }
    } catch (error) {
      handleError(error, showAlert);
    } finally {
      setOpenMenu(false);
      setLoading(false);
    }
  };

  return (
    <>
      <section className="flex justify-between items-center">
        {!["Завдання", "Мій день", "Призначено мені"].includes(listName) ? (
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
            className="bg-transparent text-5xl font-bold mb-5 h-14 pb-2 truncated-input"
          />
        ) : (
          <div className="space-y-3 mb-5 items-center">
            <h2 className="text-5xl font-bold mt-3 md:mt-0">{name}</h2>
            {listName === "Мій день" && <div>{formatDate(`${new Date()}`)}</div>}
          </div>
        )}
        <section className="relative">
          <div className="flex space-x-3">
            {listName == "Мій день" && (
              <button
                style={{ backgroundColor: "var(--secondary-background-color)" }}
                className="p-2 rounded-md"
                onClick={() => {
                  setTodoChoosed(null);
                  setOpenSuggestions((prev) => !prev);
                }}
              >
                <Propositions />
              </button>
            )}
            <button onClick={() => setOpenMenu(!openMenu)}>
              <ThreeDots />
            </button>
          </div>

          {openMenu && (
            <section className="absolute right-0 mt-2 menu shadow-lg rounded-md p-3">
              <p className="p-2 pl-1">Відсортувати:</p>
              <button className="flex space-x-2 w-full items-center profile p-2" onClick={() => handleSort("За алфавітом")}>
                <SortByAlphabetIcon />
                <p>За алфавітом</p>
              </button>
              <button className="flex space-x-2 w-full items-center profile p-2" onClick={() => handleSort("За терміном")}>
                <SortByDateIcon />
                <p>За терміном</p>
              </button>
              <button className="flex space-x-2 w-full items-center profile p-2" onClick={() => handleSort("За пріорітетністю")}>
                <SortByPriorityIcon />
                <p>За пріорітетністю</p>
              </button>
              <button className="flex space-x-2 w-full items-center profile p-2 pl-0 text-nowrap" onClick={handleDeleteAll}>
                {loading ? (
                  <div className="spinner" style={{ borderTopColor: "red", marginLeft: "0.5rem" }}></div>
                ) : (
                  <Delete color="#b91c1c" width="25px" />
                )}
                <p className="text-red-600"> Видалити всі завдання</p>
              </button>
            </section>
          )}
        </section>
      </section>
      {sortOptions.name && (
        <div className="flex items-center space-x-2 mb-3">
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
