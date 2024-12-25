"use client";
import "@/styles/task.css";
import dynamic from "next/dynamic";
import { useTodos } from "@/contexts/TodosContext";
import { Task } from "@/interfaces/TaskInterface";
import { Status } from "@/interfaces/UserInterface";
import React, { useEffect, useMemo, useState } from "react";
import Plus from "../../../public/plus";
import Todo from "../Todo";
const ToDoSidebar = dynamic(() => import("./ToDoSidebar"));
const StartScreen = dynamic(() => import("../StartScreen"));
const Menu = dynamic(() => import("../Menu"));
import { useTodoFunctions } from "../functions/todosFunctions";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useParams } from "next/navigation";
import { useProfileFunctions } from "../functions/userFunctions";
import ThreeDots from "../../../public/three-dots";

const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

export default function TodoList({allTodos, userStatuses }: { allTodos: Task[]; userStatuses: Status[] }) {
  const { category } = useParams();
  const { todoChoosed, setTodoChoosed, todos, setTodos, search } = useTodos();
  const listName = useMemo(() => decodeURIComponent(
    Array.isArray(category) ? category[0] : category || "Завдання"
  ), [category]);

  const { profileDetails } = useUserDetails();
  const { loading } = useTodos();

  const { addToDo, formatStarTodos } = useTodoFunctions();
  const [tasks, setTasks] = useState(formatStarTodos(allTodos));

  const [newTodoText, setNewTodoText] = useState("");
  const [dataReady, setDataReady] = useState(false);
  const [sortOptions, setSortOptions] = useState({ name: "", desc: false });
  const [name, setName] = useState(listName);
  const [openMenu, setOpenMenu] = useState(false);
  const { updateCategory } = useProfileFunctions();

  const incompleteTodos = useMemo(() => tasks.filter((todo: Task) => !todo.isCompleted), [tasks]);
  const completedTodos = useMemo(() => tasks.filter((todo: Task) => todo.isCompleted), [tasks]);

  useEffect(() => {
    const ws = new WebSocket(`${wsUrl}`);

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
  }, [todos]);

  useEffect(() => {
    setTodoChoosed(null);
    setTodos(formatStarTodos(allTodos));
    setDataReady(true);
  }, []);

  useEffect(() => {
    setTasks(formatStarTodos(todos));
  }, [todos]);

  const handleAddTodo = async () => {
    const todoText = newTodoText;
    setNewTodoText("");
    await addToDo(todoText, listName);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      await handleAddTodo();
    }
  };

  return (
    <>
      <main className='flex flex-col justify-between md:p-12 w-full'>
        <section className=' md:mt-0'>
          <div className='flex justify-between items-center'>
            {listName !== "Завдання" ? (
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
                className='bg-transparent text-5xl font-bold mb-5 h-14 pb-2 truncated-input'
              />
            ) : (
              <h2 className='text-5xl font-bold mb-5 mt-3 md:mt-0 '>{name}</h2>
            )}
            <div className='relative'>
              <div className='flex space-x-3'>
                <button onClick={() => setOpenMenu(!openMenu)}>
                  <ThreeDots />
                </button>
              </div>
              {openMenu && (
                <Menu
                  listName={listName}
                  sortOptions={sortOptions}
                  setSortOptions={setSortOptions}
                  setOpenMenu={setOpenMenu}
                />
              )}
            </div>
          </div>

          <div className='scroll-container-todos'>
            {dataReady && todos.length == 0 && <StartScreen />}
            <table className='w-full text-left'>
              <tbody>
                {incompleteTodos
                  .filter((todo: Task) =>
                    search
                      ? todo.text.toLowerCase().startsWith(search.toLowerCase())
                      : listName === "Завдання" || todo.category === listName
                  )
                  .map((todo: Task) => (
                    <React.Fragment key={todo._id}>
                      <Todo todo={todo} sortName={sortOptions.name} userStatuses={userStatuses} />
                    </React.Fragment>
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
                        <React.Fragment key={todo._id}>
                          <Todo
                            todo={todo}
                            sortName={sortOptions.name}
                            userStatuses={userStatuses}
                          />
                        </React.Fragment>
                      )
                  )}
              </tbody>
            </table>
          </div>
        </section>
        <section className='flex search-input'>
          <button onClick={handleAddTodo} disabled={!!loading}>
            <Plus />
          </button>
          <input
            type='text'
            value={newTodoText}
            placeholder='Додайте завдання'
            className='task-input '
            autoFocus
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </section>
      </main>
      {todoChoosed && <ToDoSidebar todo={todoChoosed} />}
    </>
  );
}
