import React from "react";

import { useTodos } from "@/contexts/TodosContext";

import { useTodoFunctions } from "@/functions/hooks/useTodosFunctions";

import { Task } from "@/interfaces/TaskInterface";

import Cross from "../../../public/icons/cross.svg";

interface PropositionsProps {
  category: string;
  setOpenSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Propositions({ category, setOpenSuggestions }: PropositionsProps) {
  const { todos } = useTodos();
  const { updateField } = useTodoFunctions();
  return (
    <section className="flex flex-col justify-between sidebar todo-sidebar-hamburg min-w-80 p-3 rounded-md ">
      <main className="space-y-3 scroll-container">
        <div className="flex justify-end items-center">
          <button onClick={() => setOpenSuggestions(false)}>
            <Cross />
          </button>
        </div>
        {todos.filter((todo: Task) => todo.category !== category).length !== 0 ? (
          <>
            <div className="special-offers p-2 space-y-2 rounded-md mb-4">
              <p className="text-2xl">Це спеціальні пропозиції для Вас</p>
              <p>Натисніть на завдання, щоб додати його в Мій день</p>
            </div>
            <>
              {todos
                .filter((todo: Task) => todo.category !== category)
                .map((todo: Task) => (
                  <div
                    className="proposition p-3"
                    key={todo._id}
                    onClick={() => {
                      updateField(todo, {
                        category: category,
                        date: new Date().toISOString().split("T")[0],
                      });
                    }}
                  >
                    <p className="truncated-text-todo">{todo.text}</p>
                    <p className="text-gray-400">{todo.category}</p>
                  </div>
                ))}
            </>
          </>
        ) : (
          <>
            <div className="special-offers p-2 space-y-2 rounded-md mb-4">
              <p className="text-2xl">Наразі більше для Вас нема пропозицій</p>
            </div>
            <img src="/gifs/not-found.gif" alt="no-tasks-cherry" className="w-60 h-60" />
          </>
        )}
      </main>
    </section>
  );
}
