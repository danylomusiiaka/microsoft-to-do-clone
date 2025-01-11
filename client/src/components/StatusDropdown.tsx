import { Task } from "@/interfaces/TaskInterface";
import { useState, useEffect } from "react";
import { useTodoFunctions } from "./functions/todosFunctions";
import Options from "./Options";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "./constants/statuses";

export default function StatusDropdown(todo: Task) {
  const [isOpenStatuses, setIsOpenStatuses] = useState(false);
  const [isOpenCategories, setIsOpenCategories] = useState(false);
  const [isOpenPriority, setIsOpenPriority] = useState(false);

  const { profileDetails } = useUserDetails();

  const { updateField } = useTodoFunctions();

  const [selectedStatus, setSelectedStatus] = useState(todo.status);
  const [selectedCategory, setSelectedCategory] = useState(todo.category);
  const [selectedPriority, setSelectedPriority] = useState(todo.priority);

  const color =
    [...STATUS_OPTIONS, ...(profileDetails?.statuses || [])].find((option) => option.name === selectedStatus)
      ?.color || "#a8a29e";

  const color2 =
    PRIORITY_OPTIONS.find((option) => option.name === selectedPriority)?.color || "#a8a29e";

  useEffect(() => {
    setSelectedStatus(todo.status);
    setSelectedCategory(todo.category);
    setSelectedPriority(todo.priority);
  }, [todo]);

  const handleOptionClick = (option: string) => {
    setSelectedStatus(option);
    updateField(todo, { status: option, isCompleted: option === "done" });
    setIsOpenStatuses(false);
  };

  const handleCategoryClick = (option: string) => {
    setSelectedCategory(option);
    updateField(todo, { category: option });
    setIsOpenCategories(false);
  };

  const handlePriorityClick = (option: string) => {
    setSelectedPriority(option);
    updateField(todo, { priority: option });
    setIsOpenPriority(false);
  };

  return (
    <main className='w-full'>
      <section className='grid grid-cols-3'>
        <button
          onClick={() => {
            setIsOpenStatuses((prev) => !prev);
            setIsOpenCategories(false);
            setIsOpenPriority(false);
          }}
          className='rounded p-2 cursor-pointer '
          title='Стан завдання'
        >
          <div
            className='text-sm rounded-xl h-5 space-x-2 truncated-text'
            style={{ backgroundColor: `${color}` }}
          >
            {selectedStatus}
          </div>
        </button>

        <button
          onClick={() => {
            setIsOpenCategories((prev) => !prev);
            setIsOpenStatuses(false);
            setIsOpenPriority(false);
          }}
          className='rounded p-2 cursor-pointer'
          title='До якого списку належить завдання'
        >
          <div className='text-sm bg-stone-400 rounded-xl h-5 space-x-2 truncated-text'>
            {selectedCategory}
          </div>
        </button>

        <button
          onClick={() => {
            setIsOpenPriority((prev) => !prev);
            setIsOpenStatuses(false);
            setIsOpenCategories(false);
          }}
          className='rounded p-2 cursor-pointer '
        >
          <div
            className='text-sm rounded-xl h-5 space-x-2'
            style={{ backgroundColor: `${color2}` }}
          >
            {selectedPriority}
          </div>
        </button>
      </section>

      {isOpenStatuses && (
        <Options
          options={[...STATUS_OPTIONS, ...(profileDetails?.statuses || [])]}
          handleClick={handleOptionClick}
        />
      )}

      {isOpenCategories && (
        <Options
          options={[...(profileDetails?.categories || []), "Завдання"]}
          handleClick={handleCategoryClick}
        />
      )}

      {isOpenPriority && <Options options={PRIORITY_OPTIONS} handleClick={handlePriorityClick} />}
    </main>
  );
}
