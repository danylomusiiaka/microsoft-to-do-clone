import { useAlert } from "@/contexts/AlertContext";
import { useTodos } from "@/contexts/TodosContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { Status } from "@/interfaces/UserInterface";
import Axios from "axios";
import Cookies from "js-cookie";
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export const useProfileFunctions = () => {
  const { profileDetails, setProfileDetails, setUserQuest } = useUserDetails();
  const { showAlert } = useAlert();
  const { setTodoChoosed, setTodos, setLoading } = useTodos();

  const updateField = async (userfieldName: string, userfieldValue: string | Status[] | boolean) => {
    try {
      const token = Cookies.get("token");

      const response = await Axios.put(
        `${webUrl}/user/update-field`,
        {
          fieldName: userfieldName,
          fieldValue: userfieldValue,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setProfileDetails({ ...profileDetails, [userfieldName]: userfieldValue });
        showAlert("Ваші дані були успішно оновлені", "success");
        return true
      }
    } catch (error: any) {
      if (error.status === 401) {
        window.location.href = "/auth";
      }
      showAlert(error.response.data, "error");
      return false
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
      const token = Cookies.get("token");

      const result = await Axios.post(
        `${webUrl}/category/create`,
        { category },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
        setProfileDetails((prevDetails) => ({
          ...prevDetails,
          categories: prevDetails.categories.filter((cat) => cat !== category),
        }));
      }
    }
  };

  const deleteCategory = async (category: string) => {
    setLoading(category);

    try {
      const token = Cookies.get("token");

      const response = await Axios.delete(`${webUrl}/category/${encodeURIComponent(category)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    } catch (error: any) {
      if (error.response.status === 401) {
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
    if (newCategory.length > 80) {
      showAlert("Назва списку не має перевищувати 80 символів", "error");
      return;
    }
    try {
      const token = Cookies.get("token");

      const response = await Axios.put(
        `${webUrl}/category/${oldCategory}`,
        { newCategory },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      if (error.response.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
      }
    }
  };

  const createTeam = async () => {
    try {
      const token = Cookies.get("token");

      const response = await Axios.post(
        `${webUrl}/team/create`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      }
    } catch (error: any) {
      if (error.response.status === 401) {
        window.location.href = "/auth";
      } else {
        showAlert(error.response.data, "error");
      }
    }
  };

  const exitTeam = async () => {
    try {
      const token = Cookies.get("token");

      const response = await Axios.post(
        `${webUrl}/team/exit`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      const token = Cookies.get("token");

      const response = await Axios.post(
        `${webUrl}/team/join`,
        { teamCode: code },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setProfileDetails((prev) => ({ ...prev, team: code }));
      }
    } catch (error: any) {
      if (error.response.status === 401) {
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
