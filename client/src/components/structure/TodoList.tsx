"use client";
import "@/styles/task.css";
import { useTodos } from "@/contexts/TodosContext";
import { Task } from "@/interfaces/TaskInterface";
import React, { useEffect, useState } from "react";
import Todo from "../Todo";
import Plus from "../../../public/plus";
import { useTodoFunctions } from "../functions/todosFunctions";
import Menu from "../Menu";
import ToDoSidebar from "./ToDoSidebar";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useParams } from "next/navigation";
import StartScreen from "../StartScreen";

export default function TodoList({ allTodos }: { allTodos: Task[] }) {
  const { category } = useParams();
  const { todoChoosed, setTodoChoosed, todos, setTodos, search } = useTodos();
  const listName = decodeURIComponent(
    Array.isArray(category) ? category[0] : category || "Завдання"
  );

  const { profileDetails } = useUserDetails();

  const { addToDo, formatStarTodos } = useTodoFunctions();
  const [tasks, setTasks] = useState(formatStarTodos(allTodos));

  const [newTodoText, setNewTodoText] = useState("");
  const [dataReady, setDataReady] = useState(false);
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
            {(dataReady && todos.length == 0) && <StartScreen />}
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
                      <Todo todo={todo} sortName={sortOptions.name} />
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
                        <Todo key={todo._id} todo={todo} sortName={sortOptions.name} />
                      )
                  )}
              </tbody>
            </table>
          </div>
        </section>
        <section className='flex search-input'>
          <button onClick={handleAddTodo}>
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
