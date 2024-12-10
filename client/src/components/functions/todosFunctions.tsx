import { useAlert } from "@/contexts/AlertContext";
import { useTodos } from "@/contexts/TodosContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { Task } from "@/interfaces/TaskInterface";
import Axios from "axios";
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export const useTodoFunctions = () => {
  const { todos, setTodos, error, setError } = useTodos();
  const { profileDetails } = useUserDetails();
  const { showAlert } = useAlert();

  const PRIORITY_OPTIONS = [
    { name: "low", number: 3 },
    { name: "medium", number: 2 },
    { name: "high", number: 1 },
  ];

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

  const addToDo = async (newTodoText: string, listName: string) => {
    setError("");
    if (newTodoText.trim() === "") return;
    if (newTodoText.length >= 200) {
      showAlert("Назва завдання не може перевищувати 200 символів", "error");
      return;
    }
    const newTodo: Task = {
      author: profileDetails.team || profileDetails.email,
      text: newTodoText,
      isCompleted: false,
      status: "to do",
      date: "Нема дати",
      description: "",
      category: listName,
      isImportant: false,
      priority: "no priority",
    };

    try {
      const response = await Axios.post(`${webUrl}/task/create`, newTodo, {
        withCredentials: true,
      });
      newTodo._id = response.data.id;
    } catch (error) {
      console.log("Помилка додання таску");
      return;
    }
    const updatedTodos = [newTodo, ...todos];
    setTodos(updatedTodos);

    const sortSettings = sessionStorage.getItem("sortSettings");

    if (sortSettings) {
      const { name, desc } = JSON.parse(sortSettings);
      if (name) {
        sortBy(name, desc, updatedTodos);
      }
    }
  };

  const updateField = async (todo: Task, updatedFields: Partial<Task>) => {
    const updatedTodo = {
      ...todo,
      ...updatedFields,
    };

    if (
      (updatedFields.text !== undefined && updatedFields.text.trim() === todo.text.trim()) ||
      (updatedFields.description !== undefined &&
        updatedFields.description.trim() === todo.description.trim())
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

    if (updatedFields.description && updatedFields.description.length >= 500) {
      showAlert("Опис завдання не може перевищувати 500 символів", "error");
      return;
    }

    const updatedTodos = todos.map((t) => (t._id === todo._id ? updatedTodo : t));

    try {
      await Axios.put(`${webUrl}/task/${todo._id}`, updatedTodo, {
        withCredentials: true,
      });
    } catch (error) {
      showAlert("Помилка змінення завдання", "error");
      return;
    }

    setTodos(updatedTodos);
    const sortSettings = sessionStorage.getItem("sortSettings");
    if (sortSettings) {
      const { name, desc } = JSON.parse(sortSettings);
      if (name) {
        sortBy(name, desc, updatedTodos);
      }
    }

    return updatedTodo;
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await Axios.delete(`${webUrl}/task/${id}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        showAlert(`Завдання було успішно видалено`);
      }
    } catch (error) {
      showAlert("Помилка видалення завдання", "error");
      return;
    }
    setTodos(todos.filter((o: any) => o._id !== id));
  };

  const sortBy = (name: string, desc: boolean, todosList: Task[]) => {
    const sortedTodos = [...todosList];
    if (name === "За алфавітом") {
      sortedTodos.sort((a, b) =>
        desc ? b.text.localeCompare(a.text) : a.text.localeCompare(b.text)
      );
    } else if (name === "За терміном") {
      sortedTodos.sort((a, b) =>
        desc
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (name === "За пріорітетністю") {
      sortedTodos.sort((a, b) => {
        const priorityA =
          PRIORITY_OPTIONS.find((option) => option.name === a.priority)?.number || 4;
        const priorityB =
          PRIORITY_OPTIONS.find((option) => option.name === b.priority)?.number || 4;
        return desc ? priorityB - priorityA : priorityA - priorityB;
      });
    } else {
      return;
    }
    setTodos(sortedTodos);
  };

  function formatForChart(data: any[], field: string) {
    const fieldCounts = data.reduce((acc, item) => {
      acc[item[field]] = (acc[item[field]] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(fieldCounts);
    console.log(labels);

    const formattedData = labels.map((label) => fieldCounts[label]);

    return { labels, data: formattedData };
  }

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
