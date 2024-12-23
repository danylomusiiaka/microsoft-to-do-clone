"use client";

import { Task } from "@/interfaces/TaskInterface";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface TodosContextType {
  todos: Task[];
  setTodos: React.Dispatch<React.SetStateAction<Task[]>>;
  todoChoosed: Task | null;
  setTodoChoosed: React.Dispatch<React.SetStateAction<Task | null>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: string | undefined;
  setLoading: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

export const TodosProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Task[]>([]);
  const [todoChoosed, setTodoChoosed] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | undefined>(undefined);

  return (
    <TodosContext.Provider
      value={{
        todos,
        setTodos,
        todoChoosed,
        setTodoChoosed,
        search,
        setSearch,
        loading,
        setLoading,
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
