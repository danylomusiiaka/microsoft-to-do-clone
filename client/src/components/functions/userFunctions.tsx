import { useUserDetails } from "@/contexts/UserDetailsContext";
import Axios from "axios";
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export const useProfileFunctions = () => {
  const { profileDetails, setProfileDetails } = useUserDetails();
  const updateField = async (userfieldName: string, userfieldValue: string) => {
    if (userfieldValue) {
      await Axios.post(
        `${webUrl}/user/update-field`,
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
