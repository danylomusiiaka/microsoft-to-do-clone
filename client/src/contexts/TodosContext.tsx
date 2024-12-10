"use client";

import { Category, Task } from "@/interfaces/TaskInterface";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { listNames } from "../../public/responses/listNames";

interface TodosContextType {
  todos: Task[];
  setTodos: React.Dispatch<React.SetStateAction<Task[]>>;
  todoChoosed: Task | null;
  setTodoChoosed: React.Dispatch<React.SetStateAction<Task | null>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

export const TodosProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Task[]>([]);
  const [todoChoosed, setTodoChoosed] = useState<Task | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setCategories(listNames);
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
        error,
        setError,
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
