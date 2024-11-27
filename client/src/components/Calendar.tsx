import { useTodos } from "@/contexts/TodosContext";
import ArrowDown from "../../public/arrow-down";
import ArrowUp from "../../public/arrow-up";
import { formatDate } from "@/components/functions/formatFields";
import { useEffect, useState } from "react";
import { useTodoFunctions } from "./functions/todosFunctions";

export default function Calendar() {
  const [showDateEdit, setDateEdit] = useState(false);
  const { todoChoosed } = useTodos();
  const { updateField } = useTodoFunctions();

  const [taskDate, setTaskDate] = useState(todoChoosed.date);

  useEffect(() => {
    setTaskDate(todoChoosed.date);
    setDateEdit(false);
  }, [todoChoosed]);

  return (
    <>
      <div className='button flex sm:mt-2 p-2 pt-3 description-sidebar-input  text-nowrap'>
        <button
          onClick={() => {
            setDateEdit(!showDateEdit);
          }}
          className='flex space-x-2 items-center cursor-default '
        >
          <p >Зробити до: {formatDate(taskDate)}</p>
          {showDateEdit ? <ArrowUp /> : <ArrowDown />}
        </button>
      </div>

      {showDateEdit && (
        <div className='flex items-center space-x-2 mt-4'>
          <input
            type='date'
            value={taskDate}
            onChange={(e) => {
              setTaskDate(e.target.value);
              updateField(todoChoosed, { date: e.target.value });
            }}
            className='p-2 rounded-md bg-transparent border ml-2'
          />
          <p>- оберіть дату</p>
        </div>
      )}
    </>
  );
}
