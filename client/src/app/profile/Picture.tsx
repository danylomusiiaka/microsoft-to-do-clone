"use client";
import Cookies from "js-cookie";

import { useEffect, useState } from "react";

import { useAlert } from "@/contexts/AlertContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";

import { useProfileFunctions } from "@/functions/hooks/useUserFunctions";

export default function ProfilePicture({ picture }: { picture: string }) {
  const [profilePicture, setProfilePicture] = useState(picture);
  const { updateField } = useProfileFunctions();
  const { setUserQuest, loadingProfile } = useUserDetails();
  const { showAlert } = useAlert();

  useEffect(() => {
    setProfilePicture(picture);
  }, [picture]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64Image = await convertToBase64(file);
        await updateField("picture", base64Image);
      } catch (error) {
        showAlert("Не вдалось загрузити зображення. Спробуйте ще раз", "error");
        return;
      }
      const cookienewUserQuest = Cookies.get("newUserQuest");
      if (cookienewUserQuest) {
        const userQuest = JSON.parse(cookienewUserQuest);
        if (userQuest.profilePictureChanged != 50) {
          userQuest.profilePictureChanged = 50;
          setUserQuest((prevQuest) => {
            const updatedQuest = [...prevQuest];
            updatedQuest[2] += 50;
            return updatedQuest;
          });
          Cookies.set("newUserQuest", JSON.stringify(userQuest));
        }
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.onerror = () => reject(new Error("File conversion failed"));
      fileReader.readAsDataURL(file);
    });

  return (
    <div className="w-25 sm:w-20 ">
      {loadingProfile && <div className="loading-bar"></div>}
      <label htmlFor="img-upload" className="w-20 h-20 rounded-full overflow-hidden block">
        <img src={profilePicture || "/icons/default-picture.svg"} alt="Profile" className="w-full h-full object-cover rounded-full cursor-pointer" />
      </label>
      <input type="file" id="img-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
    </div>
  );
}
