"use client";

import TodoList from "@/components/structure/TodoList";
import ToDoSidebar from "@/components/structure/ToDoSidebar";
import { useTodos } from "@/contexts/TodosContext";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../loading";
import NavSidebar from "@/components/structure/NavSidebar";
import { useTodoFunctions } from "@/components/functions/todosFunctions";
import Axios from "axios";

export default function CategoryPage() {
  const { todoChoosed, setTodos, categories } = useTodos();
  const { formatStarTodos } = useTodoFunctions();

  const { category } = useParams();
  const listName = decodeURIComponent(category);

  const [loading, setLoading] = useState(true);
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

  if (!categories.some((category) => category.name === listName)) {
    return (
      <div className='loading-container flex flex-col'>
        <h1 className='text-2xl mb-4'>Ми чесно шукали, але нічого не змогли знайти..</h1>
        <img src='/not-found.png' className='w-50 h-40' alt='Not Found' />
      </div>
    );
  }

  return (
    <>
      <NavSidebar />
      <TodoList listName={listName} />
      {todoChoosed && <ToDoSidebar todo={todoChoosed} />}
    </>
  );
}
