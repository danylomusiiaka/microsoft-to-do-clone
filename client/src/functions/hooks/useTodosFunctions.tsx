import Cookies from "js-cookie";

import { useAlert } from "@/contexts/AlertContext";
import { useTodos } from "@/contexts/TodosContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";

import { api } from "@/services/api";

import { Task } from "@/interfaces/TaskInterface";
import { User } from "@/interfaces/UserInterface";

import { PRIORITY_OPTIONS, PRIORITY_RATING, STATUS_OPTIONS } from "@/constants/statuses";

import { handleError } from "../handleError";

export const useTodoFunctions = () => {
  const { todos, setTodos, setLoading } = useTodos();
  const { profileDetails, setUserQuest } = useUserDetails();
  const { showAlert } = useAlert();

  const todoOnFirstPos = (todo: Task, isImportant: boolean) => {
    if (isImportant) {
      const updatedTodos = todos.filter((t) => t._id !== todo._id);
      setTodos([{ ...todo, isImportant: true }, ...updatedTodos]);
    } else {
      const importantTodos = todos.filter((t) => t.isImportant && t._id !== todo._id);
      const nonImportantTodos = todos.filter((t) => !t.isImportant && t._id !== todo._id);
      setTodos([...importantTodos, { ...todo, isImportant: false }, ...nonImportantTodos]);
    }
  };

  const formatStarTodos = (todoList: Task[]) => {
    const importantTodos = todoList.filter((t) => t.isImportant);
    const nonImportantTodos = todoList.filter((t) => !t.isImportant);
    return [...importantTodos, ...nonImportantTodos];
  };

  const addToDo = async (newTodo: Task) => {
    if (newTodo.text.trim() === "") return;
    if (newTodo.text.length >= 200) {
      showAlert("Назва завдання не може перевищувати 200 символів", "error");
      return;
    }

    if (profileDetails.team) {
      newTodo.assignee = "Нема виконавця";
    }

    const temporaryTodos = [newTodo, ...todos];
    setTodos(temporaryTodos);
    setLoading("no id");

    try {
      const response = await api.post("/task/create", newTodo);
      if (response.status === 201) {
        const updatedTodos = temporaryTodos.map((todo) => (todo.text === newTodo.text && !todo._id ? { ...todo, _id: response.data.id } : todo));
        setTodos(updatedTodos);
        setLoading(undefined);

        const sortSettings = sessionStorage.getItem("sortSettings");

        if (sortSettings) {
          const { name, desc } = JSON.parse(sortSettings);
          if (name) {
            sortBy(name, desc, updatedTodos);
          }
        }
      }
    } catch (error) {
      setTodos(todos.filter((todo) => todo.text !== newTodo.text));
      setLoading(undefined);
      handleError(error, showAlert);
    }
  };

  const updateField = async (todo: Task, updatedFields: Partial<Task>) => {
    const updatedTodo = {
      ...todo,
      ...updatedFields,
    };

    if (
      (updatedFields.text !== undefined && updatedFields.text.trim() === todo.text.trim()) ||
      (updatedFields.description !== undefined && updatedFields.description.trim() === todo.description.trim())
    ) {
      return;
    }

    if (updatedFields.text !== undefined && updatedFields.text.trim().length === 0) {
      showAlert("Назва завдання є обов'язковою", "error");
      return;
    }
    if (updatedFields.text && updatedFields.text.length >= 200) {
      showAlert("Назва завдання не може перевищувати 200 символів", "error");
      return;
    }

    if (updatedFields.description && updatedFields.description.length >= 1000) {
      showAlert("Опис завдання не може перевищувати 1000 символів", "error");
      return;
    }

    try {
      setLoading(todo._id);

      const response = await api.put(`/task/${todo._id}`, updatedTodo);
      if (response.status === 200) {
        const updatedTodos = todos.map((t) => (t._id === todo._id ? updatedTodo : t));
        setTodos(updatedTodos);
        setLoading(undefined);
        const completedTodos = updatedTodos.filter((todo: Task) => todo.isCompleted);

        const cookiesUserQuest = Cookies.get("newUserQuest");
        if (cookiesUserQuest) {
          const userQuest = JSON.parse(cookiesUserQuest);
          if (completedTodos.length >= 3 && userQuest.completedThreeTasks != 75) {
            userQuest.completedThreeTasks += 75;
            setUserQuest((prevQuest) => [prevQuest[0] + 75, ...prevQuest.slice(1)]);
            Cookies.set("newUserQuest", JSON.stringify(userQuest));
          }
        }
        const sortSettings = sessionStorage.getItem("sortSettings");
        if (sortSettings) {
          const { name, desc } = JSON.parse(sortSettings);
          if (name) {
            sortBy(name, desc, updatedTodos);
          }
        }
        return updatedTodo;
      }
    } catch (error) {
      handleError(error, showAlert);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await api.delete(`/task/${id}`);
      if (response.status === 200) {
        setTodos(todos.filter((o: Task) => o._id !== id));
        showAlert(`Завдання було успішно видалено`);
      }
    } catch (error) {
      handleError(error, showAlert);
    }
  };

  const sortBy = (name: string, desc: boolean, todosList: Task[]) => {
    const sortedTodos = [...todosList];
    if (name === "За алфавітом") {
      sortedTodos.sort((a, b) => (desc ? b.text.localeCompare(a.text) : a.text.localeCompare(b.text)));
    } else if (name === "За терміном") {
      sortedTodos.sort((a, b) =>
        desc ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (name === "За пріорітетністю") {
      sortedTodos.sort((a, b) => {
        const priorityA = PRIORITY_RATING.find((option) => option.name === a.priority)?.number || 4;
        const priorityB = PRIORITY_RATING.find((option) => option.name === b.priority)?.number || 4;
        return desc ? priorityB - priorityA : priorityA - priorityB;
      });
    } else {
      return;
    }
    setTodos(sortedTodos);
  };

  const formatForChart = (todos: Task[], type: "status" | "priority", userData: User) => {
    const options = type === "status" ? [...STATUS_OPTIONS, ...userData.statuses] : PRIORITY_OPTIONS;

    const chartData: { labels: string[]; data: number[]; colors: string[] } = {
      labels: [],
      data: [],
      colors: [],
    };

    options.forEach((option) => {
      const count = todos.filter((todo) => todo[type] === option.name).length;
      chartData.labels.push(option.name);
      chartData.colors.push(option.color);
      chartData.data.push(count);
    });

    return chartData;
  };

  return {
    todoOnFirstPos,
    addToDo,
    updateField,
    deleteTodo,
    sortBy,
    formatStarTodos,
    formatForChart,
  };
};
