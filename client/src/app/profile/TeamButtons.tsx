import React, { useState } from "react";

import { useProfileFunctions } from "@/functions/hooks/useUserFunctions";

import { User } from "@/interfaces/UserInterface";

import TeamAdd from "../../../public/icons/team-add.svg";

export default function TeamButtons({ profileInfo }: { profileInfo: User }) {
  const { joinTeam, exitTeam, createTeam } = useProfileFunctions();
  const [codeInput, setCodeInput] = useState("");
  const [isJoin, setIsJoin] = useState(false);
  const [loading, setLoading] = useState(false);

  type TeamAction = (props: string) => Promise<void>;

  const handleTeamAction = async (teamAction: TeamAction, props: string | null) => {
    setLoading(true);
    try {
      await teamAction(props || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {profileInfo.team ? (
        <div className="sm:flex sm:space-x-3 sm:space-y-0 space-y-3 items-center">
          <p
            className="w-full sm:w-fit rounded-md p-1 px-6 flex items-center justify-center text-nowrap"
            style={{ backgroundColor: "var(--sidebar-block-color)" }}
          >
            Ваш код команди: {profileInfo.team}
          </p>
          <div className="flex items-center space-x-3 ">
            <button
              className=" w-full sm:w-fit rounded-md p-1 px-6"
              style={{ backgroundColor: "var(--sidebar-block-color)" }}
              onClick={() => {
                handleTeamAction(exitTeam, "");
                setIsJoin(false);
              }}
            >
              <p>Вийти з команди</p>
            </button>
            {loading && <div className="spinner"></div>}
          </div>
        </div>
      ) : (
        <div className="sm:flex sm:space-x-3 sm:space-y-0 space-y-3 items-center">
          <button
            className="w-full sm:w-fit rounded-md p-1 px-6 flex items-center justify-center"
            style={{ backgroundColor: "var(--sidebar-block-color)" }}
            onClick={() => {
              handleTeamAction(createTeam, "");
            }}
          >
            Створити команду
          </button>

          {isJoin ? (
            <div className="flex items-center space-x-3 ">
              <input
                className="w-full sm:w-fit bg-transparent border rounded-md text-sm p-1 pl-2 px-4"
                placeholder="Введіть код команди"
                autoFocus
                onChange={(e) => setCodeInput(e.target.value)}
              />
              <button onClick={() => handleTeamAction(joinTeam, codeInput)}>
                <TeamAdd />
              </button>
              {loading && <div className="spinner"></div>}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                className="w-full sm:w-fit rounded-md p-1 px-6"
                style={{ backgroundColor: "var(--sidebar-block-color)" }}
                onClick={() => {
                  setIsJoin(true);
                }}
              >
                Приєднатись до існуючої
              </button>
              {loading && <div className="spinner"></div>}
            </div>
          )}
        </div>
      )}
    </>
  );
}
