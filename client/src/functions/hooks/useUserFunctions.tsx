import { useAlert } from "@/contexts/AlertContext";
import { useTodos } from "@/contexts/TodosContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { Status } from "@/interfaces/UserInterface";
import Cookies from "js-cookie";
import { revalidateHomePage } from "../revalidate";
import { api } from "@/services/api";
import { handleError } from "../handleError";

export const useProfileFunctions = () => {
  const { profileDetails, setProfileDetails, setUserQuest, setLoadingProfile } = useUserDetails();
  const { showAlert } = useAlert();
  const { setTodoChoosed, setTodos, setLoading } = useTodos();

  const updateField = async (userfieldName: string, userfieldValue: string | Status[] | boolean) => {
    try {
      setLoadingProfile(true);
      const response = await api.put(`/user/update-field`, {
        fieldName: userfieldName,
        fieldValue: userfieldValue,
      });
      if (response.status === 200) {
        setProfileDetails({ ...profileDetails, [userfieldName]: userfieldValue });
        showAlert("Ваші дані були успішно оновлені", "success");
      }
    } catch (error) {
      handleError(error, showAlert);
    } finally {
      setLoadingProfile(false);
    }
  };

  const addCategory = async (category: string) => {
    if (category.length > 80) {
      showAlert("Назва списку не має перевищувати 80 символів", "error");
      return;
    }
    category = category.trim();
    if (category === "") return;
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
    setLoading(category);
    try {
      const result = await api.post(`/category/create`, { category });
      if (result.status === 200) {
        setLoading(undefined);
        const cookienewUserQuest = Cookies.get("newUserQuest");
        if (cookienewUserQuest) {
          const userQuest = JSON.parse(cookienewUserQuest);
          if (userQuest.listCreated != 25) {
            userQuest.listCreated = 25;
            setUserQuest((prevQuest) => [prevQuest[0] + 25, ...prevQuest.slice(1)]);
            Cookies.set("newUserQuest", JSON.stringify(userQuest));
          }
        }

        showAlert("Список успішно створено!", "success");
      }
    } catch (error) {
      handleError(error, showAlert);
    }
  };

  const deleteCategory = async (category: string) => {
    setLoading(category);

    try {
      const response = await api.delete(`/category/${encodeURIComponent(category)}`);
      setTodoChoosed(null);

      setTodos(response.data.remainingTasks);

      setProfileDetails((prevDetails) => ({
        ...prevDetails,
        categories: response.data.remainingCategories,
      }));
      setLoading(undefined);

      if (decodeURIComponent(window.location.pathname) === `/list/${category}`) {
        window.location.href = "/";
      } else {
        showAlert(response.data.message);
      }
    } catch (error) {
      handleError(error, showAlert);
    }
  };

  const updateCategory = async (oldCategory: string, newCategory: string) => {
    if (newCategory.trim() === oldCategory) {
      return;
    }
    if (newCategory.length > 80) {
      showAlert("Назва списку не має перевищувати 80 символів", "error");
      return;
    }
    try {
      const response = await api.put(`/category/${oldCategory}`, { newCategory });
      if (response.status === 200) {
        setTodos(response.data.updatedTodos);
        setProfileDetails((prevDetails) => ({
          ...prevDetails,
          categories: response.data.updatedCategories,
        }));
        window.location.href = `/list/${newCategory}`;
      }
    } catch (error) {
      handleError(error, showAlert);
    }
  };

  const createTeam = async () => {
    try {
      const response = await api.post(`/team/create`, {});
      if (response.status === 200) {
        setProfileDetails((prev) => ({ ...prev, team: response.data }));
        showAlert("Ви успішно створили команду");
        const cookiesUserQuest = Cookies.get("newUserQuest");
        if (cookiesUserQuest) {
          const userQuest = JSON.parse(cookiesUserQuest);
          if (userQuest.teamCreated != 50) {
            userQuest.teamCreated += 50;
            setUserQuest((prevQuest) => [prevQuest[0], prevQuest[1] + 50, ...prevQuest.slice(2)]);
            Cookies.set("newUserQuest", JSON.stringify(userQuest));
          }
        }
        await revalidateHomePage();
      }
    } catch (error) {
      handleError(error, showAlert);
    }
  };

  const exitTeam = async () => {
    try {
      const response = await api.post(`/team/exit`, {});
      if (response.status === 200) {
        setProfileDetails((prev) => ({ ...prev, team: response.data }));
        showAlert("Ви вийшли з команди", "info");
        await revalidateHomePage();
      }
    } catch (error) {
      handleError(error, showAlert);
    }
  };

  const joinTeam = async (codeInput: string) => {
    const code = codeInput.trim();
    if (code === "") return;
    try {
      const response = await api.post(`/team/join`, { teamCode: code });
      if (response.status === 200) {
        setProfileDetails((prev) => ({ ...prev, team: code }));
        showAlert("Ви успішно вступили в команду", "success");
        await revalidateHomePage();
      }
    } catch (error) {
      handleError(error, showAlert);
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
