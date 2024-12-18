import { useAlert } from "@/contexts/AlertContext";
import { useTodos } from "@/contexts/TodosContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import Axios from "axios";
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export const useProfileFunctions = () => {
  const { profileDetails, setProfileDetails } = useUserDetails();
  const { showAlert } = useAlert();
  const { setTodoChoosed, setTodos } = useTodos();

  const updateField = async (userfieldName: string, userfieldValue: string) => {
    try {
      const response = await Axios.post(
        `${webUrl}/user/update-field`,
        {
          fieldName: userfieldName,
          fieldValue: userfieldValue,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setProfileDetails({ ...profileDetails, [userfieldName]: userfieldValue });
        showAlert("Ваші дані були успішно оновлені", "success");
      }
    } catch (error: any) {
      if (error.status === 401) {
        window.location.href = "/auth";
      }
      showAlert(error.response.data, "error");
    }
  };

  const addCategory = async (category: string) => {
    try {
      category = category.trim();
      if (category === "") return;

      await Axios.post(
        `${webUrl}/category/create`,
        { category },
        {
          withCredentials: true,
        }
      );

      setProfileDetails((prevDetails) => {
        const alreadyExists = prevDetails.categories.some((cat) => cat === category);
        if (alreadyExists) {
          return prevDetails;
        }
        return {
          ...prevDetails,
          categories: [...prevDetails.categories, category],
        };
      });

      showAlert("Список успішно створено!", "success");
    } catch (error: any) {
      if (error.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
      }
    }
  };

  const deleteCategory = async (category: string) => {
    try {
      const response = await Axios.delete(`${webUrl}/category/${encodeURIComponent(category)}`, {
        withCredentials: true,
      });
      setTodoChoosed(null);
      setTodos(response.data.remainingTasks);
      setProfileDetails((prevDetails) => ({
        ...prevDetails,
        categories: response.data.remainingCategories,
      }));

      if (decodeURIComponent(window.location.pathname) === `/list/${category}`) {
        window.location.href = "/";
      } else {
        showAlert(response.data.message);
      }
    } catch (error: any) {
      if (error.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
      }
    }
  };

  const updateCategory = async (oldCategory: string, newCategory: string) => {
    if (newCategory.trim() === oldCategory) {
      return;
    }
    try {
      const response = await Axios.put(
        `${webUrl}/category/${oldCategory}`,
        { newCategory },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setTodos(response.data.updatedTodos);
        setProfileDetails((prevDetails) => ({
          ...prevDetails,
          categories: response.data.updatedCategories,
        }));
        window.location.href = `/list/${newCategory}`;
      }
    } catch (error: any) {
      if (error.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
      }
    }
  };

  const createTeam = async () => {
    try {
      const response = await Axios.post(
        `${webUrl}/user/create-team`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        setProfileDetails((prev) => ({ ...prev, team: response.data }));
        showAlert("Ви успішно створили команду");
      }
    } catch (error: any) {
      if (error.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
      }
    }
  };

  const exitTeam = async () => {
    try {
      const response = await Axios.post(`${webUrl}/user/exit-team`, {}, { withCredentials: true });
      if (response.status === 200) {
        setProfileDetails((prev) => ({ ...prev, team: response.data }));
        showAlert("Ви вийшли з команди", "info");
      }
    } catch (error: any) {
      showAlert(error.response.data, "error");
    }
  };

  const joinTeam = async (codeInput: string) => {
    const code = codeInput.trim();
    if (code === "") {
      return;
    }
    try {
      const response = await Axios.post(
        `${webUrl}/user/join-team`,
        { teamCode: code },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setProfileDetails((prev) => ({ ...prev, team: code }));
      }
    } catch (error: any) {
      if (error.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
      }
    }
  };

  return {
    updateField,
    addCategory,
    deleteCategory,
    updateCategory,
    createTeam,
    joinTeam,
    exitTeam,
  };
};
