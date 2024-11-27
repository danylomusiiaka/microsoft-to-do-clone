"use client";
import { useEffect, useState } from "react";
import Loading from "./loading";
import { useTodos } from "../contexts/TodosContext";
import TodoList from "../components/structure/TodoList";
import ToDoSidebar from "../components/structure/ToDoSidebar";
import NavSidebar from "@/components/structure/NavSidebar";
import { useTodoFunctions } from "@/components/functions/todosFunctions";
import Axios from "axios";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const { todos, setTodos, todoChoosed } = useTodos();
  const { formatStarTodos } = useTodoFunctions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Axios.get("http://localhost:5101/api/tasks");
        setTodos(formatStarTodos(response.data));
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <section className='md:flex w-full'>
      <NavSidebar />

      <TodoList />
      {todoChoosed && <ToDoSidebar todo={todoChoosed} />}
    </section>
  );
}
