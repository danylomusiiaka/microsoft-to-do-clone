import { useTodos } from "@/contexts/TodosContext";
import Axios from "axios";

export const useProfileFunctions = () => {
  const { profileDetails, setProfileDetails } = useTodos();
  const updateField = async (userfieldName: string, userfieldValue: string) => {
    if (userfieldValue) {
      Axios.post(
        "http://localhost:3001/user/update-field",
        {
          fieldName: userfieldName,
          fieldValue: userfieldValue,
        },
        { withCredentials: true }
      );
      setProfileDetails({ ...profileDetails, [userfieldName]: userfieldValue });
    }
  };

  return { updateField };
};
