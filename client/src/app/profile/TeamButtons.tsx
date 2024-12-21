import { useProfileFunctions } from "@/components/functions/userFunctions";
import { User } from "@/interfaces/UserInterface";
import React, { useState } from "react";
import TeamAdd from "../../../public/team-add";

export default function TeamButtons({ profileInfo }: { profileInfo: User }) {
  const { joinTeam, exitTeam, createTeam } = useProfileFunctions();
  const [codeInput, setCodeInput] = useState("");
  const [isJoin, setIsJoin] = useState(false);

  return (
    <>
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
    </>
  );
}
