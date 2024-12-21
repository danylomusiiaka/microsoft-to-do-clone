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
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useAlert } from "@/contexts/AlertContext";
import { formatText } from "../functions/formatFields";
import Cookies from "js-cookie";

export default function ToDoSidebar({ todo }: { todo: Task }) {
  const { todos, setTodoChoosed } = useTodos();
  const { profileDetails, teamMembers, setUserQuest } = useUserDetails();
  const { showAlert } = useAlert();

  const { updateField, todoOnFirstPos, deleteTodo } = useTodoFunctions();

  const [taskText, setTaskText] = useState(todo.text);
  const [taskDescription, setTaskDescription] = useState(todo.description);
  const [isImportant, setIsImportant] = useState(todo.isImportant);

  const [asigneeMenu, setAsigneeMenu] = useState(false);
  const [assignee, setAssignee] = useState({ name: "", email: "", picture: "" });

  const currentTodo = todos.find((t) => t._id === todo._id);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTaskText(todo.text);
    setTaskDescription(todo.description);
    setIsImportant(todo.isImportant);
    if (profileDetails.team) {
      const assignedMember = teamMembers.find((member) => member.email === todo.assignee);
      if (assignedMember) {
        setAssignee({
          name: assignedMember.name,
          email: assignedMember.email,
          picture: assignedMember.picture || "",
        });
      } else {
        setAssignee({ name: "Нема призначення", email: "", picture: "" });
      }
    }
  }, [todo]);

  useEffect(() => {
    adjustHeight(textareaRef);
  }, [taskText]);

  useEffect(() => {
    adjustHeight(descriptionRef);
  }, [taskDescription]);

  const handleAssigneeChoosed = (member: { name: string; email: string; picture?: string }) => {
    updateField(currentTodo!, { assignee: member.email });
    setAssignee({
      name: member.name,
      email: member.email,
      picture: member.picture || "",
    });
    showAlert(`Завдання успішно призначене ${formatText(member.name, 30)}`);
    const cookienewUserQuest = Cookies.get("newUserQuest");
    if (cookienewUserQuest) {
      const userQuest = JSON.parse(cookienewUserQuest);
      if (userQuest.authorAssignedTask != 50) {
        userQuest.authorAssignedTask = 50;
        setUserQuest((prevQuest) => {
          const updatedQuest = [...prevQuest];
          updatedQuest[2] += 50;
          return updatedQuest;
        });
        Cookies.set("newUserQuest", JSON.stringify(userQuest));
      }
    }
  };

  return (
    <section className='flex flex-col justify-between sidebar todo-sidebar-hamburg min-w-80 p-3 rounded-md '>
      <main className='space-y-3 scroll-container'>
        <div className='flex justify-end items-center'>
          <button onClick={() => setTodoChoosed(null)}>
            <Cross />
          </button>
        </div>
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
        {profileDetails.team && (
          <div
            className='button description-sidebar-input space-y-3 cursor-pointer'
            onClick={() => setAsigneeMenu(!asigneeMenu)}
          >
            <p>Призначено</p>
            <div className='flex items-center space-x-3 text-lg'>
              <img
                src={assignee.picture || `/default-picture.svg`}
                className='w-10 h-10 object-cover rounded-full'
                alt='profile-photo'
              />
              <p>{formatText(assignee.name, 30)}</p>
            </div>
            {asigneeMenu && (
              <>
                <hr className='divider-assignees' />
                {teamMembers
                  .filter((member) => member.email !== assignee.email)
                  .map((member) => (
                    <div
                      key={member.email}
                      onClick={() => {
                        handleAssigneeChoosed(member);
                      }}
                      className='flex items-center space-x-3 text-lg'
                    >
                      <img
                        src={member.picture || `/default-picture.svg`}
                        className='w-10 h-10 object-cover rounded-full'
                        alt='profile-photo'
                      />
                      <p>{formatText(member.name, 30)}</p>
                    </div>
                  ))}
              </>
            )}
          </div>
        )}
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
