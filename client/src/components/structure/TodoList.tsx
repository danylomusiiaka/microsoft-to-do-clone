"use client";
import "@/styles/task.css";
import { useTodos } from "@/contexts/TodosContext";
import { Task } from "@/interfaces/TaskInterface";
import React, { useEffect, useState } from "react";
import Todo from "../Todo";
import Plus from "../../../public/plus";
import { useTodoFunctions } from "../functions/todosFunctions";
import Menu from "../Menu";
import { formatDate } from "../functions/formatFields";
import ToDoSidebar from "./ToDoSidebar";
import { useUserDetails } from "@/contexts/UserDetailsContext";

const PRIORITY_OPTIONS = [
  { name: "low", color: "bg-blue-500" },
  { name: "medium", color: "bg-yellow-500" },
  { name: "high", color: "bg-red-500" },
];

export default function TodoList({ listName, allTodos }: { listName: string; allTodos: Task[] }) {
  const { todoChoosed, setTodoChoosed, todos, setTodos, search, error } = useTodos();
  const [tasks, setTasks] = useState(allTodos);
  const { addToDo } = useTodoFunctions();
  const { profileDetails } = useUserDetails();

  const [newTodoText, setNewTodoText] = useState("");
  const [sortOptions, setSortOptions] = useState({ name: "", desc: false });

  const incompleteTodos = tasks.filter((todo: Task) => !todo.isCompleted);
  const completedTodos = tasks.filter((todo: Task) => todo.isCompleted);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "init",
          profileDetails: { team: profileDetails.team },
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.event === "taskCreated") {
        setTodos((prevTodos) => [message.task, ...prevTodos]);
      } else if (message.event === "taskUpdated") {
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo._id === message.task._id ? message.task : todo))
        );
      } else if (message.event === "taskDeleted") {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== message.taskId));
      }
    };

    return () => {
      ws.close();
    };
  }, [profileDetails]);

  useEffect(() => {
    setTodoChoosed(null);
    setTodos(allTodos);
  }, []);

  useEffect(() => {
    setTasks(todos);
  }, [todos]);

  const handleAddTodo = async () => {
    await addToDo(newTodoText, listName);
    setNewTodoText("");
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await handleAddTodo();
    }
  };

  return (
    <>
      <main className='flex flex-col justify-between md:p-12 w-full md:pb-4'>
        <section className='mt-5 md:mt-0'>
          <Menu listName={listName} sortOptions={sortOptions} setSortOptions={setSortOptions} />

          <div className='scroll-container-todos'>
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

                      <Todo todo={todo} sortName={sortOptions.name} />
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
                        <Todo todo={todo} sortName={sortOptions.name} />
                      )
                  )}
              </tbody>
            </table>
          </div>
        </section>
        {!todoChoosed && <p className='text-red-500'>{error}</p>}

        <section className='flex search-input'>
          <button onClick={handleAddTodo}>
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
      {todoChoosed && <ToDoSidebar todo={todoChoosed} />}
    </>
  );
}
