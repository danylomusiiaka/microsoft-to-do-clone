"use client";

import "@/styles/sidebar.css";
import { useState, useEffect, useRef } from "react";
import { Task } from "@/interfaces/TaskInterface";
import { useTodos } from "@/contexts/TodosContext";
import Cross from "../../../public/cross";
import StatusDropdown from "../StatusDropdown";
import { adjustHeight } from "../functions/adjustHeight";
import Star from "../../../public/star";
import Calendar from "../Calendar";
import { useTodoFunctions } from "../functions/todosFunctions";
import Delete from "../../../public/delete";

export default function ToDoSidebar({ todo }: { todo: Task }) {
  const { todos, setTodoChoosed, error } = useTodos();

  const { updateField, todoOnFirstPos, deleteTodo } = useTodoFunctions();

  const [taskText, setTaskText] = useState(todo.text);
  const [taskDescription, setTaskDescription] = useState(todo.description);
  const [isImportant, setIsImportant] = useState(todo.isImportant);

  const currentTodo = todos.find((t) => t._id === todo._id);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTaskText(todo.text);
    setTaskDescription(todo.description);
    setIsImportant(todo.isImportant);
  }, [todo]);

  useEffect(() => {
    adjustHeight(textareaRef);
  }, [taskText]);

  useEffect(() => {
    adjustHeight(descriptionRef);
  }, [taskDescription]);

  return (
    <section className='flex flex-col justify-between sidebar todo-sidebar-hamburg min-w-80 p-3 rounded-md '>
      <main className='space-y-3 scroll-container'>
        <div className='flex justify-end items-center'>
          <button onClick={() => setTodoChoosed(null)}>
            <Cross />
          </button>
        </div>
        <p className='text-red-500'>{error}</p>
        <div className='flex text-sidebar-input items-center justify-between profile'>
          <textarea
            ref={textareaRef}
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            onBlur={() => currentTodo && updateField(currentTodo, { text: taskText })}
            placeholder='Введіть назву...'
            className='bg-transparent outline-none resize-none pt-1'
          />
          <button
            className='self-start mt-2'
            onClick={() => {
              if (currentTodo) {
                const newIsImportant = !isImportant;
                setIsImportant(newIsImportant);
                updateField(currentTodo, { isImportant: newIsImportant });
                todoOnFirstPos(currentTodo, newIsImportant);
              }
            }}
          >
            <Star isImportant={isImportant} />
          </button>
        </div>
        <StatusDropdown {...(currentTodo || todo)} />
        <textarea
          ref={descriptionRef}
          value={taskDescription}
          onBlur={() => currentTodo && updateField(currentTodo, { description: taskDescription })}
          onChange={(e) => setTaskDescription(e.target.value)}
          className='description-sidebar-input button'
          placeholder='Введіть опис...'
        />
        <Calendar currentTodo={currentTodo!} />
      </main>

      <button
        className='flex button items-center space-x-2 pl-0 p-2 rounded-md w-full'
        onClick={() => {
          deleteTodo(todo._id!);
          setTodoChoosed(null);
        }}
      >
        <Delete color='#b91c1c' width='30px' />
        <p className='text-red-700'>Видалити завдання</p>
      </button>
    </section>
  );
}
