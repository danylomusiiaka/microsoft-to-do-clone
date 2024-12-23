import { useAlert } from "@/contexts/AlertContext";
import { useTodos } from "@/contexts/TodosContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { Task } from "@/interfaces/TaskInterface";
import Axios from "axios";
import { PRIORITY_RATING, STATUS_OPTIONS } from "@/components/constants/statuses";
import Cookies from "js-cookie";

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

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

  const addToDo = async (newTodoText: string, listName: string) => {
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

    if (profileDetails.team) {
      newTodo.assignee = "Нема виконавця";
    }

    const temporaryTodos = [newTodo, ...todos];
    setTodos(temporaryTodos);
    setLoading("no id");

    try {
      const token = Cookies.get("token");

      const response = await Axios.post(`${webUrl}/task/create`, newTodo, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        const updatedTodos = temporaryTodos.map((todo) =>
          todo.text === newTodoText && !todo._id ? { ...todo, _id: response.data.id } : todo
        );
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
    } catch (error: any) {
      setTodos(todos.filter((todo) => todo.text !== newTodoText));
      if (error.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response?.data, "error");
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

    if (updatedFields.description && updatedFields.description.length >= 1000) {
      showAlert("Опис завдання не може перевищувати 1000 символів", "error");
      return;
    }

    try {
      const token = Cookies.get("token");
      setLoading(todo._id);

      const response = await Axios.put(`${webUrl}/task/${todo._id}`, updatedTodo, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    } catch (error: any) {
      if (error.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
      }
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const token = Cookies.get("token");

      const response = await Axios.delete(`${webUrl}/task/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setTodos(todos.filter((o: any) => o._id !== id));
        showAlert(`Завдання було успішно видалено`);
      }
    } catch (error: any) {
      if (error.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
      }
    }
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
        const priorityA = PRIORITY_RATING.find((option) => option.name === a.priority)?.number || 4;
        const priorityB = PRIORITY_RATING.find((option) => option.name === b.priority)?.number || 4;
        return desc ? priorityB - priorityA : priorityA - priorityB;
      });
    } else {
      return;
    }
    setTodos(sortedTodos);
  };

  const formatForChart = (todos: Task[], type: "status" | "priority") => {
    const options = type === "status" ? STATUS_OPTIONS : PRIORITY_RATING;

    const chartData: { labels: string[]; data: number[] } = {
      labels: [],
      data: [],
    };

    options.forEach((option) => {
      const count = todos.filter((todo) => todo[type] === option.name).length;
      chartData.labels.push(option.name);
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
