"use client";
import { useEffect, useRef, useState } from "react";
import { useProfileFunctions } from "@/components/functions/userFunctions";
import ProfilePicture from "./Picture";
import Controls from "../profile/Controls";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import ThemeOption from "@/components/ThemeOption";
import { User } from "@/interfaces/UserInterface";
import { useAlert } from "@/contexts/AlertContext";
const themes = ["dark", "light", "purple"];
import TeamButtons from "./TeamButtons";
import NewUserQuest from "./NewUserQuest";
import StatusEditor from "./StatusEditor";
import { adjustHeight } from "@/components/functions/adjustHeight";

export default function Profile({ userData }: { userData: User }) {
  const { updateField } = useProfileFunctions();
  const { showAlert } = useAlert();
  const [name, setName] = useState(userData.name);
  const [profileInfo, setProfileInfo] = useState(userData);
  const { profileDetails, setProfileDetails } = useUserDetails();
  const nameRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleResize = () => adjustHeight(nameRef, "auto");
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [name]);

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
      <section className='md:flex md:p-2 items-center justify-between'>
        <div className='flex space-x-3 w-full items-center min-w-0'>
          <ProfilePicture picture={profileInfo.picture} />
          <div className='w-full min-w-0'>
            <textarea
              className='bg-transparent font-bold text-2xl hover:outline hover:outline-white hover:rounded-md p-1 w-full resize-none overflow-hidden'
              value={name}
              ref={nameRef}
              onChange={(e) => setName(e.target.value)}
              onBlur={updateName}
              rows={1}
            />
            <p className='md:text-2xl pl-1 break-words'>{profileInfo.email}</p>
          </div>
        </div>
        <Controls />
      </section>
      <hr className='divider' />
      <section className='space-y-4'>
        <TeamButtons profileInfo={profileInfo} />

        <NewUserQuest isUserQuestDone={profileInfo.isUserQuestDone} />

        <h2 className='text-2xl'>Загальні налаштування</h2>
        <p>Обрати тему для додатка</p>
        <div className='flex'>
          {themes.map((theme) => (
            <ThemeOption theme={theme} key={theme} />
          ))}
        </div>
      </section>
      <StatusEditor userData={profileInfo} />
    </main>
  );
}
