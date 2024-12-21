import { useTodos } from "@/contexts/TodosContext";
import ArrowDown from "../../public/arrow-down";
import ArrowUp from "../../public/arrow-up";
import { formatDate } from "@/components/functions/formatFields";
import { useEffect, useState } from "react";
import { useTodoFunctions } from "./functions/todosFunctions";
import { Task } from "@/interfaces/TaskInterface";

export default function Calendar({ currentTodo }: { currentTodo: Task }) {
  const [showDateEdit, setDateEdit] = useState(false);
  const { updateField } = useTodoFunctions();

  const [taskDate, setTaskDate] = useState(currentTodo.date);

  useEffect(() => {
    setTaskDate(currentTodo.date);
    setDateEdit(false);
  }, [currentTodo]);

  return (
    <>
      <div className='button sm:mt-2 p-2 pt-3 description-sidebar-input   text-nowrap'>
        <button
          onClick={() => {
            setDateEdit(!showDateEdit);
          }}
          className='flex items-center cursor-default justify-between w-full'
        >
          <p>Зробити до: {formatDate(taskDate)}</p>
          {showDateEdit ? <ArrowUp /> : <ArrowDown />}
        </button>

        {showDateEdit && (
          <div className='flex items-center space-x-2 mt-4'>
            <input
              type='date'
              value={taskDate}
              onChange={(e) => {
                setTaskDate(e.target.value);
                updateField(currentTodo, { date: e.target.value });
              }}
              className='p-2 rounded-md bg-transparent border ml-2 cursor-pointer'
            />
            <p>- оберіть дату</p>
          </div>
        )}
      </div>
    </>
  );
}
