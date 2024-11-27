import "@/styles/task.css";
import { useTodos } from "@/contexts/TodosContext";
import { Task } from "@/interfaces/TaskInterface";
import { useEffect, useState } from "react";
import Todo from "../Todo";
import Plus from "../../../public/plus";
import { useTodoFunctions } from "../functions/todosFunctions";
import Menu from "../Menu";
import { STATUS_OPTIONS } from "../StatusDropdown";
import { formatDate } from "../functions/formatFields";

const PRIORITY_OPTIONS = [
  { name: "low", color: "bg-blue-500" },
  { name: "medium", color: "bg-yellow-500" },
  { name: "high", color: "bg-red-500" },
];

export default function TodoList({ listName = "Завдання" }: { listName: string }) {
  const { todos, setTodos, setTodoChoosed, search } = useTodos();
  const { addToDo } = useTodoFunctions();

  const [newTodoText, setNewTodoText] = useState("");
  const [draggedTodoId, setDraggedTodoId] = useState<number | null>(null);
  const [sortOptions, setSortOptions] = useState({ name: "", desc: false });

  const incompleteTodos = todos.filter((todo: Task) => !todo.completed);
  const completedTodos = todos.filter((todo: Task) => todo.completed);  

  useEffect(() => {
    setTodoChoosed(null);
  }, [listName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addToDo(newTodoText, listName);
      setNewTodoText("");
    }
  };

  const handleDragStart = (id: number) => {
    setDraggedTodoId(id);
  };

  const handleDrop = (droppedId: number) => {
    if (draggedTodoId === null || draggedTodoId === droppedId) return;

    const draggedIndex = todos.findIndex((todo) => todo.id === draggedTodoId);
    const droppedIndex = todos.findIndex((todo) => todo.id === droppedId);

    const updatedTodos = [...todos];
    const [draggedTodo] = updatedTodos.splice(draggedIndex, 1);
    updatedTodos.splice(droppedIndex, 0, draggedTodo);

    setTodos(updatedTodos);
    setDraggedTodoId(null);
  };

  return (
    <main className='flex flex-col justify-between md:p-12 w-full md:pb-4'>
      <section className='mt-5 md:mt-0'>
        <Menu listName={listName} sortOptions={sortOptions} setSortOptions={setSortOptions} />

        <div className='scroll-container'>
          <table className='w-full text-left'>
            <tbody>
              {incompleteTodos
                .filter((todo: Task) =>
                  search
                    ? todo.text.toLowerCase().startsWith(search.toLowerCase())
                    : listName === "Завдання" || todo.category === listName
                )
                .map((todo: Task) => (
                  <>
                    {sortOptions.name === "За терміном" && (
                      <td className='p-3 pl-0 text-sm md:hidden'>{formatDate(todo.date)}</td>
                    )}
                    {sortOptions.name === "За пріорітетністю" && (
                      <div className='p-3 pl-0 md:hidden'>
                        <span
                          className={`${
                            PRIORITY_OPTIONS.find((option) => option.name === todo.priority)
                              ?.color || ""
                          } rounded-xl text-sm text-nowrap px-3 pb-1 `}
                        >
                          {todo.priority}
                        </span>
                      </div>
                    )}
                    {(sortOptions.name === "" || sortOptions.name === "За алфавітом") && (
                      <div className='p-3 pl-0 md:hidden'>
                        <span
                          className={`${
                            STATUS_OPTIONS.find((option) => option.name === todo.status)?.color ||
                            ""
                          } rounded-xl text-sm text-nowrap px-3 pb-1 `}
                        >
                          {todo.status}
                        </span>
                      </div>
                    )}
                    <Todo
                      todo={todo}
                      onDragStart={() => handleDragStart(todo.id)}
                      onDrop={() => handleDrop(todo.id)}
                      sortName={sortOptions.name}
                    />
                  </>
                ))}

              {completedTodos.filter(
                (todo: Task) =>
                  (search ? todo.text.toLowerCase().startsWith(search.toLowerCase()) : true) &&
                  (listName === "Завдання" || todo.category === listName)
              ).length > 0 && (
                <tr>
                  <td colSpan={4} className='pt-6 pb-3 font-semibold'>
                    Завершені
                  </td>
                </tr>
              )}

              {completedTodos
                .filter((todo: Task) =>
                  search
                    ? todo.text.toLowerCase().startsWith(search.toLowerCase())
                    : listName === "Завдання" || todo.category === listName
                )
                .map(
                  (todo: Task) =>
                    (listName === "Завдання" || todo.category === listName) && (
                      <Todo
                        todo={todo}
                        onDragStart={() => handleDragStart(todo.id)}
                        onDrop={() => handleDrop(todo.id)}
                        sortName={sortOptions.name}
                      />
                    )
                )}
            </tbody>
          </table>
        </div>
      </section>

      <section className='flex search-input'>
        <button
          onClick={() => {
            addToDo(newTodoText, listName);
            setNewTodoText("");
          }}
        >
          <Plus />
        </button>
        <input
          type='text'
          value={newTodoText}
          placeholder='Додайте завдання'
          className='task-input'
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </section>
    </main>
  );
}
