import Checkmark from "../../public/checkmark";
import { Task } from "@/interfaces/TaskInterface";
import { useTodos } from "@/contexts/TodosContext";
import { STATUS_OPTIONS } from "./constants/statuses";
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
  const { setTodoChoosed, todoChoosed, loading } = useTodos();
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
      <tr style={{ opacity: (!todo._id && loading == "no id") || todo._id == loading ? 0.5 : 1 }}>
        <td className='p-3 pl-0 md:hidden'>
          {sortName == "За пріорітетністю" && (
            <span
              className={`${
                PRIORITY_OPTIONS.find((option) => option.name === todo.priority)?.color ||
                "bg-stone-500"
              } rounded-xl text-sm text-nowrap px-3`}
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
            <span
              className={`${
                STATUS_OPTIONS.find((option) => option.name === todo.status)?.color || ""
              } rounded-xl text-sm text-nowrap px-3 `}
            >
              {todo.status}
            </span>
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
              className={`${
                PRIORITY_OPTIONS.find((option) => option.name === todo.priority)?.color ||
                "bg-stone-500"
              } rounded-xl text-sm text-nowrap px-3`}
            >
              {todo.priority}
            </span>
          ) : (
            <div
              className={`${
                STATUS_OPTIONS.find((option) => option.name === todo.status)?.color ||
                "bg-stone-500"
              } rounded-xl text-sm text-nowrap px-3 w-fit`}
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
