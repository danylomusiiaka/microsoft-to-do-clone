import { useTodos } from "@/contexts/TodosContext";
import { Task } from "@/interfaces/TaskInterface";
import { useState, useEffect } from "react";
import { useTodoFunctions } from "./functions/todosFunctions";
import Options from "./Options";
import { formatText } from "./functions/formatFields";
import { useUserDetails } from "@/contexts/UserDetailsContext";

export const STATUS_OPTIONS = [
  { name: "to do", color: "bg-yellow-700" },
  { name: "in progress", color: "bg-yellow-500" },
  { name: "done", color: "bg-green-500" },
];

const PRIORITY_OPTIONS = [
  { name: "low", color: "bg-blue-500" },
  { name: "medium", color: "bg-yellow-500" },
  { name: "high", color: "bg-red-500" },
];

export default function StatusDropdown(todo: Task) {
  const [isOpenStatuses, setIsOpenStatuses] = useState(false);
  const [isOpenCategories, setIsOpenCategories] = useState(false);
  const [isOpenPriority, setIsOpenPriority] = useState(false);

  const { profileDetails } = useUserDetails();

  const { updateField } = useTodoFunctions();

  const [selectedStatus, setSelectedStatus] = useState(todo.status);
  const [selectedCategory, setSelectedCategory] = useState(todo.category);
  const [selectedPriority, setSelectedPriority] = useState(todo.priority);

  const color = STATUS_OPTIONS.find((option) => option.name === selectedStatus)?.color || "";

  const color2 =
    PRIORITY_OPTIONS.find((option) => option.name === selectedPriority)?.color || "bg-stone-400";

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
      <section className='grid grid-cols-[repeat(3,1fr)] items-center'>
        <button
          onClick={() => {
            setIsOpenStatuses((prev) => !prev);
            setIsOpenCategories(false);
            setIsOpenPriority(false);
          }}
          className='rounded p-2 cursor-pointer w-full'
          title='Стан завдання'
        >
          <div
            className={`flex items-center justify-center text-sm rounded-xl h-5 ${color} space-x-2`}
          >
            {formatText(selectedStatus, 12)}
          </div>
        </button>

        <button
          onClick={() => {
            setIsOpenCategories((prev) => !prev);
            setIsOpenStatuses(false);
            setIsOpenPriority(false);
          }}
          className='rounded p-2 cursor-pointer w-full'
          title='До якого списку належить завдання'
        >
          <div className='flex items-center justify-center text-sm bg-stone-400 rounded-xl h-5 space-x-2'>
            {formatText(selectedCategory, 11)}
          </div>
        </button>

        <button
          onClick={() => {
            setIsOpenPriority((prev) => !prev);
            setIsOpenStatuses(false);
            setIsOpenCategories(false);
          }}
          className='rounded p-2 cursor-pointer w-full'
        >
          <div
            className={`flex items-center justify-center text-sm rounded-xl h-5 ${color2} space-x-2`}
          >
            {selectedPriority}
          </div>
        </button>
      </section>

      {isOpenStatuses && <Options options={STATUS_OPTIONS} handleClick={handleOptionClick} />}

      {isOpenCategories && (
        <Options options={profileDetails.categories} handleClick={handleCategoryClick} />
      )}

      {isOpenPriority && <Options options={PRIORITY_OPTIONS} handleClick={handlePriorityClick} />}
    </main>
  );
}
