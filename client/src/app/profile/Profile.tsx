"use client";
import { useEffect, useState } from "react";
import { useProfileFunctions } from "@/components/functions/userFunctions";
import ProfilePicture from "../profile/ProfilePicture";
import { formatText } from "@/components/functions/formatFields";
import Controls from "../profile/Controls";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import Axios from "axios";
import StatusEditor from "../profile/StatusEditor";
import ThemeOption from "@/components/ThemeOption";
import { User } from "@/interfaces/UserInterface";
import { useAlert } from "@/contexts/AlertContext";
import TeamAdd from "../../../public/team-add";
const themes = ["dark", "light", "purple"];
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export default function Profile({ userData }: { userData: User }) {
  const { updateField, joinTeam, exitTeam, createTeam } = useProfileFunctions();
  const { showAlert } = useAlert();
  const [name, setName] = useState(userData.name);
  const [isJoin, setIsJoin] = useState(false);
  const [profileInfo, setProfileInfo] = useState(userData);
  const { profileDetails, setProfileDetails } = useUserDetails();
  const [codeInput, setCodeInput] = useState("");

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
      updateField("name", name.trim());
    }
  };

  return (
    <main className='p-4 md:p-12 w-full space-y-5'>
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

      <section className='space-y-4'>
        {profileInfo.team ? (
          <div className='md:flex md:space-x-3 md:space-y-0 space-y-3'>
            <p
              className=' w-fit rounded-md p-1 px-6'
              style={{ backgroundColor: "var(--sidebar-block-color)" }}
            >
              Ваш код команди: {profileInfo.team}
            </p>
            <button
              className='w-fit rounded-md p-1 px-6'
              style={{ backgroundColor: "var(--sidebar-block-color)" }}
              onClick={exitTeam}
            >
              Вийти з команди
            </button>
          </div>
        ) : (
          <div className='md:flex md:space-x-3 md:space-y-0 space-y-3'>
            <button
              className='w-fit rounded-md p-1 px-6'
              style={{ backgroundColor: "var(--sidebar-block-color)" }}
              onClick={createTeam}
            >
              Створити команду
            </button>

            {isJoin ? (
              <div className='flex items-center'>
                <input
                  className='bg-transparent border rounded-md text-sm p-1 pl-2 mr-3'
                  placeholder='Введіть код команди'
                  autoFocus
                  onChange={(e) => setCodeInput(e.target.value)}
                />
                <button onClick={() => joinTeam(codeInput)}>
                  <TeamAdd />
                </button>
              </div>
            ) : (
              <button
                className='w-fit rounded-md p-1 px-6'
                style={{ backgroundColor: "var(--sidebar-block-color)" }}
                onClick={() => {
                  setIsJoin(true);
                }}
              >
                Приєднатись до існуючої
              </button>
            )}
          </div>
        )}
        <h2 className='text-2xl'>Загальні налаштування</h2>
        <p>Обрати тему для додатка</p>
        <div className='flex'>
          {themes.map((theme) => (
            <ThemeOption theme={theme} key={theme} />
          ))}
        </div>

        <StatusEditor />
      </section>
    </main>
  );
}
