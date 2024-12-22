"use client";
import { useEffect, useState } from "react";
import { useProfileFunctions } from "@/components/functions/userFunctions";
import ProfilePicture from "./Picture";
import { formatText } from "@/components/functions/formatFields";
import Controls from "../profile/Controls";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import ThemeOption from "@/components/ThemeOption";
import { User } from "@/interfaces/UserInterface";
import { useAlert } from "@/contexts/AlertContext";
const themes = ["dark", "light", "purple"];
import TeamButtons from "./TeamButtons";
import NewUserQuest from "./NewUserQuest";

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export default function Profile({ userData }: { userData: User }) {
  const { updateField } = useProfileFunctions();
  const { showAlert } = useAlert();
  const [name, setName] = useState(userData.name);
  const [profileInfo, setProfileInfo] = useState(userData);
  const { profileDetails, setProfileDetails } = useUserDetails();

  useEffect(() => {
    setProfileDetails(userData);
  }, []);

  useEffect(() => {
    setName(profileDetails.name);
    setProfileInfo(profileDetails);
  }, [profileDetails]);

  const updateName = () => {
    if (name.trim() === "" || name.trim() === profileDetails.name.trim()) {
      setName(userData.name);
      return;
    } else {
      if (name.length > 80) {
        showAlert("Ім'я профілю не має перевищувати 80 символів", "error");
        return;
      }
      updateField("name", name.trim());
    }
  };

  return (
    <main className='p-4 md:p-12 w-full space-y-5 md:pb-0 scroll-container-profile'>
      <section className='md:flex p-2 pl-0 items-center justify-between'>
        <div className='flex space-x-3 w-full items-center'>
          <ProfilePicture picture={profileInfo.picture} />
          <div className='w-4/6 md:w-6/6'>
            <input
              className='bg-transparent font-bold text-2xl hover:outline hover:outline-white hover:rounded-md p-1 w-full'
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={updateName}
            />
            <p className='md:text-2xl pl-1 '>{formatText(profileInfo.email, 30)}</p>
          </div>
        </div>
        <Controls />
      </section>
      <hr className='divider' />
      <section className='space-y-4 '>
        <TeamButtons profileInfo={profileInfo} />
        <NewUserQuest />

        <h2 className='text-2xl'>Загальні налаштування</h2>
        <p>Обрати тему для додатка</p>
        <div className='flex'>
          {themes.map((theme) => (
            <ThemeOption theme={theme} key={theme} />
          ))}
        </div>

        
      </section>
    </main>
  );
}
