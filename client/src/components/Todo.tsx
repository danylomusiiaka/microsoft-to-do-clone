import Checkmark from "../../public/checkmark";
import { Task } from "@/interfaces/TaskInterface";
import { useTodos } from "@/contexts/TodosContext";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "./constants/statuses";
import { formatDate } from "./functions/formatFields";
import Star from "../../public/star";
import { useTodoFunctions } from "./functions/todosFunctions";
import { Status } from "@/interfaces/UserInterface";
import { useEffect, useState } from "react";
import { useUserDetails } from "@/contexts/UserDetailsContext";

interface TodoProps {
  todo: Task;
  sortName: string;
  userStatuses: Status[];
  setOpenSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Todo({ todo, sortName, userStatuses, setOpenSuggestions }: TodoProps) {
  const { setTodoChoosed, todoChoosed, loading } = useTodos();
  const { updateField } = useTodoFunctions();
  const { profileDetails } = useUserDetails();
  const [statuses, setStatuses] = useState(userStatuses || []);

  useEffect(() => {
    if (profileDetails.statuses) {
      setStatuses(profileDetails.statuses);
    }
  }, [profileDetails.statuses]);

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
      setOpenSuggestions(false);
    }
  };

  return (
    <>
      <tr style={{ opacity: (!todo._id && loading == "no id") || todo._id == loading ? 0.5 : 1 }}>
        <td className='p-3 pl-0 md:hidden truncated-text'>
          {sortName == "За пріорітетністю" && (
            <span
              className='rounded-xl text-sm text-nowrap px-3'
              style={{
                backgroundColor: `${
                  PRIORITY_OPTIONS.find((option) => option.name === todo.priority)?.color ||
                  "#a8a29e"
                }`,
              }}
            >
              {todo.priority}
            </span>
          )}
          {sortName === "За терміном" && (
            <span className='bg-stone-500 rounded-xl text-sm text-nowrap px-3 pl-4'>
              {formatDate(todo.date)}
            </span>
          )}
          {(sortName === "За алфавітом" || sortName === "") && (
            <div
              className='rounded-xl text-sm text-nowrap px-3 w-fit truncated-text'
              style={{
                backgroundColor: `${
                  [...STATUS_OPTIONS, ...statuses].find((option) => option.name === todo.status)
                    ?.color || "#a8a29e"
                }`,
              }}
            >
              {todo.status}
            </div>
          )}
        </td>
      </tr>

      <tr
        className='task'
        onClick={
          (!todo._id && loading == "no id") || todo._id == loading ? undefined : toggleToDoSidebar
        }
        style={{ opacity: (!todo._id && loading == "no id") || todo._id == loading ? 0.5 : 1 }}
      >
        <td className='p-3 flex items-center'>
          <button
            className='circle-btn mr-5'
            onClick={
              (!todo._id && loading == "no id") || todo._id == loading
                ? undefined
                : toggleCompletion
            }
          >
            <Checkmark status={todo.status} />
          </button>
          <p className='truncated-text-todo'>{todo.text}</p>
        </td>
        <td className='md:p-3 align-text-top table-field'>
          {sortName == "За пріорітетністю" ? (
            <span
              className='rounded-xl text-sm text-nowrap px-3'
              style={{
                backgroundColor: `${
                  PRIORITY_OPTIONS.find((option) => option.name === todo.priority)?.color ||
                  "#a8a29e"
                }`,
              }}
            >
              {todo.priority}
            </span>
          ) : (
            <div
              className='rounded-xl text-sm text-nowrap px-3 w-fit truncated-text'
              style={{
                backgroundColor: `${
                  [...STATUS_OPTIONS, ...statuses].find((option) => option.name === todo.status)
                    ?.color || "#a8a29e"
                }`,
              }}
            >
              {todo.status}
            </div>
          )}
        </td>
        <td className='md:p-3 table-field'>{formatDate(todo.date)}</td>
        <td className=''>
          {todo.isImportant && (
            <div className='flex justify-end items-end md:block'>
              <Star isImportant={todo.isImportant} />
            </div>
          )}
        </td>
      </tr>
    </>
  );
}
