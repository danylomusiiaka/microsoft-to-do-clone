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
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

export const TodosProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Task[]>([]);
  const [todoChoosed, setTodoChoosed] = useState<Task | null>(null);
  const [search, setSearch] = useState("");

  return (
    <TodosContext.Provider
      value={{
        todos,
        setTodos,
        todoChoosed,
        setTodoChoosed,
        search,
        setSearch,
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
