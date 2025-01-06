"use client";
import "@/styles/task.css";
import { useTodos } from "@/contexts/TodosContext";
import { Task } from "@/interfaces/TaskInterface";
import { User } from "@/interfaces/UserInterface";
import React, { useEffect, useMemo, useState } from "react";
import Todo from "../Todo";
import Plus from "../../../public/plus";
import Menu from "../Menu";
import ToDoSidebar from "./ToDoSidebar";
import { useTodoFunctions } from "../functions/todosFunctions";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import StartScreen from "../StartScreen";
import NoAssignments from "../NoAssignments";
import Loading from "@/app/loading";
import Cross from "../../../public/cross";
import Propositions from "../Propositions";

const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

interface TodoListProps {
  allTodos: Task[];
  userData: User;
  category: string;
}

export default function TodoList({ allTodos, userData, category }: TodoListProps) {
  const { todoChoosed, setTodoChoosed, todos, setTodos, search } = useTodos();

  const { profileDetails } = useUserDetails();
  const { loading } = useTodos();

  const { addToDo, formatStarTodos, updateField } = useTodoFunctions();
  const [tasks, setTasks] = useState(formatStarTodos(todos));

  const [newTodoText, setNewTodoText] = useState("");
  const [dataReady, setDataReady] = useState(false);
  const [sortOptions, setSortOptions] = useState({ name: "", desc: false });
  const [openSuggestions, setOpenSuggestions] = useState(false);

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
  }, []);

  useEffect(() => {
    const filteredTodos = todos
      .filter((todo: Task) => {
        if (category === "Призначено мені") {
          return todo.assignee === userData.email;
        } else if (category !== "Завдання") {
          return todo.category === category;
        }
        return true;
      })
      .filter((todo: Task) => todo.text.toLowerCase().includes(search.toLowerCase()));

    setTasks(formatStarTodos(filteredTodos));
    setDataReady(true);
  }, [todos, search, category]);

  const incompleteTodos = useMemo(() => tasks.filter((todo: Task) => !todo.isCompleted), [tasks]);
  const completedTodos = useMemo(() => tasks.filter((todo: Task) => todo.isCompleted), [tasks]);

  const handleAddTodo = async () => {
    const newTodo: Task = {
      author: profileDetails.team || profileDetails.email,
      text: newTodoText,
      isCompleted: false,
      status: "to do",
      date: category === "Мій день" ? new Date().toISOString().split("T")[0] : "Нема дати",
      description: "",
      category: category,
      isImportant: false,
      priority: "no priority",
    };
    const todoText = newTodoText;
    setNewTodoText("");
    await addToDo(todoText, category, newTodo);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      await handleAddTodo();
    }
  };

  return (
    <>
      <main className='flex flex-col justify-between md:p-12 w-full'>
        <section className='md:mt-0'>
          <Menu
            listName={category}
            sortOptions={sortOptions}
            setSortOptions={setSortOptions}
            setOpenSuggestions={setOpenSuggestions}
          />

          <div className='scroll-container-todos'>
            {!dataReady ? (
              <Loading />
            ) : category === "Призначено мені" ? (
              todos.filter((todo: Task) => todo.assignee === userData.email).length === 0 && (
                <NoAssignments />
              )
            ) : (
              todos.filter((todo: Task) => category === "Завдання" || todo.category === category)
                .length === 0 && <StartScreen />
            )}
            <table className='w-full text-left'>
              <tbody>
                {incompleteTodos.map((todo: Task) => (
                  <React.Fragment key={todo._id}>
                    <Todo
                      todo={todo}
                      sortName={sortOptions.name}
                      userStatuses={userData.statuses}
                      setOpenSuggestions={setOpenSuggestions}
                    />
                  </React.Fragment>
                ))}

                {completedTodos.filter(
                  (todo: Task) =>
                    (search ? todo.text.toLowerCase().startsWith(search.toLowerCase()) : true) &&
                    (category === "Завдання" || todo.category === category)
                ).length > 0 && (
                  <tr>
                    <td colSpan={4} className='pt-6 pb-3 font-semibold'>
                      Завершені
                    </td>
                  </tr>
                )}

                {completedTodos.map((todo: Task) => (
                  <React.Fragment key={todo._id}>
                    <Todo
                      todo={todo}
                      sortName={sortOptions.name}
                      userStatuses={userData.statuses}
                      setOpenSuggestions={setOpenSuggestions}
                    />
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {category !== "Призначено мені" && (
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
        )}
      </main>
      {todoChoosed && <ToDoSidebar todo={todoChoosed} />}
      {openSuggestions && (
        <Propositions setOpenSuggestions={setOpenSuggestions} category={category} />
      )}
    </>
  );
}
