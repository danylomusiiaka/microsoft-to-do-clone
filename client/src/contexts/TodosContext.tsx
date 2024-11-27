"use client";

import { Category, Task } from "@/interfaces/TaskInterface";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { listNames } from "../../public/responses/listNames";
import Axios from "axios";

interface TodosContextType {
  todos: Task[];
  setTodos: React.Dispatch<React.SetStateAction<Task[]>>;
  todoChoosed: Task;
  setTodoChoosed: React.Dispatch<React.SetStateAction<Task | null>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

export const TodosProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Task[]>([]);
  const [todoChoosed, setTodoChoosed] = useState<Task | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [profileDetails, setProfileDetails] = useState({
    name: "",
    email: "",
    picture: "",
  });

  useEffect(() => {
    const selectedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (selectedTheme) {
      document.querySelector("body")?.setAttribute("data-theme", selectedTheme);
    }
    setCategories(listNames);
  }, []);

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await Axios.get("http://localhost:3001/user/details", {
          withCredentials: true,
        });
        const { name, email, picture } = result.data;
        setProfileDetails({ name, email, picture });
      } catch (err) {
        setProfileDetails({
          name: "Guest",
          email: "Not logged in",
          picture: "",
        });
      }
    };

    fetchData();
  }, []);

  return (
    <TodosContext.Provider
      value={{
        todos,
        setTodos,
        todoChoosed,
        setTodoChoosed,
        categories,
        setCategories,
        search,
        setSearch,
        profileDetails,
        setProfileDetails,
      }}
    >
      {children}
    </TodosContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodosContext);
  if (!context) {
    throw new Error("useTodos must be used within a TodosProvider");
  }
  return context;
};
