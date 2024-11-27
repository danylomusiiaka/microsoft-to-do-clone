import { useTodos } from "@/contexts/TodosContext";
import { Task } from "@/interfaces/TaskInterface";
import Axios from "axios";

export const useTodoFunctions = () => {
  const { todos, setTodos } = useTodos();

  const PRIORITY_OPTIONS = [
    { name: "low", number: 3 },
    { name: "medium", number: 2 },
    { name: "high", number: 1 },
  ];

  const todoOnFirstPos = (todo: Task, isImportant: boolean) => {
    if (isImportant) {
      const updatedTodos = todos.filter((t) => t.id !== todo.id);
      setTodos([{ ...todo, isImportant: true }, ...updatedTodos]);
    } else {
      const importantTodos = todos.filter((t) => t.isImportant && t.id !== todo.id);
      const nonImportantTodos = todos.filter((t) => !t.isImportant && t.id !== todo.id);
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

    const newTodo: Task = {
      id: todos.length + 1,
      text: newTodoText,
      completed: false,
      status: "to do",
      date: "Нема дати",
      description: "",
      category: listName,
      isImportant: false,
      priority: "no priority",
    };

    try {
      await Axios.post("http://localhost:5101/api/tasks", newTodo);
    } catch (error) {
      console.log("Помилка додання таску");
    }
    const updatedTodos = [newTodo, ...todos];
    setTodos(formatStarTodos(updatedTodos));

    const sortSettings = sessionStorage.getItem("sortSettings");

    if (sortSettings) {
      const { name, desc } = JSON.parse(sortSettings);
      if (name) {
        sortBy(name, desc, updatedTodos);
      }
    }
  };

  const updateField = (todo: Task, updatedFields: Partial<Task>) => {
    const updatedTodo = {
      ...todo,
      ...updatedFields,
    };

    const updatedTodos = todos.map((t) => (t.id === todo.id ? updatedTodo : t));

    try {
      Axios.put(`http://localhost:5101/api/tasks/${todo.id}`, updatedTodo);
    } catch (error) {
      console.log("Помилка змінення завдання");
    }

    setTodos(updatedTodos);
    const sortSettings = sessionStorage.getItem("sortSettings");
    if (sortSettings) {
      const { name, desc } = JSON.parse(sortSettings);
      if (name) {
        sortBy(name, desc, updatedTodos);
      }
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await Axios.delete(`http://localhost:5101/api/tasks/${id}`);
    } catch (error) {
      console.log(`Помилка видалення завдання з ід ${id}`);
    }
    setTodos(todos.filter((o: any) => o.id !== id));
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
