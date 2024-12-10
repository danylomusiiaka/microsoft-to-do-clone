import React, { useEffect, useState } from "react";
import Checkmark from "../../public/checkmark";
import Calendar from "../../public/calendar";
import { Task } from "@/interfaces/TaskInterface";
import { useTodos } from "@/contexts/TodosContext";
import { STATUS_OPTIONS } from "../../public/statuses";
import { formatDate, formatText } from "./functions/formatFields";
import Star from "../../public/star";
import { useTodoFunctions } from "./functions/todosFunctions";

interface TodoProps {
  todo: Task;
  sortName: string;
}

const PRIORITY_OPTIONS = [
  { name: "low", color: "bg-blue-500" },
  { name: "medium", color: "bg-yellow-500" },
  { name: "high", color: "bg-red-500" },
];

export default function Todo({ todo, sortName }: TodoProps) {
  const { setTodoChoosed, todoChoosed } = useTodos();
  const { updateField } = useTodoFunctions();

  const toggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateField(todo, {
      status: todo.status === "done" ? "to do" : "done",
      isCompleted: !todo.isCompleted,
    });
  };

  const toggleToDoSidebar = () => {
    if (todoChoosed?._id === todo._id) {
      setTodoChoosed(null);
    } else {
      setTodoChoosed(todo);
    }
  };

  return (
    <>
      <td className='p-3 pl-0 md:hidden'>
        <span
          className={`${
            STATUS_OPTIONS.find((option) => option.name === todo.status)?.color || ""
          } rounded-xl text-sm text-nowrap px-3 pb-0.5 `}
        >
          {todo.status}
        </span>
      </td>
      <tr key={todo._id} className='task' onClick={toggleToDoSidebar}>
        <td className='p-3 flex items-center'>
          <button className='circle-btn mr-5' onClick={toggleCompletion}>
            <Checkmark status={todo.status} />
          </button>
          <p>{formatText(todo.text, 40)}</p>
        </td>
        <td className='md:p-3 align-text-top table-field'>
          {sortName == "За пріорітетністю" ? (
            <span
              className={`${
                PRIORITY_OPTIONS.find((option) => option.name === todo.priority)?.color || ""
              } rounded-xl text-sm text-nowrap px-3`}
            >
              {todo.priority}
            </span>
          ) : (
            <span
              className={`${
                STATUS_OPTIONS.find((option) => option.name === todo.status)?.color || ""
              } rounded-xl text-sm text-nowrap px-3 `}
            >
              {todo.status}
            </span>
          )}
        </td>
        <td className='md:p-3 table-field'>{formatDate(todo.date)}</td>
        <td>{todo.isImportant && <Star isImportant={todo.isImportant} />}</td>
      </tr>
    </>
  );
}
