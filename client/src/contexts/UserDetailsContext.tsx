"use client";

import Cookies from "js-cookie";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { handleError } from "@/functions/handleError";

import { api } from "@/services/api";

import { User } from "@/interfaces/UserInterface";

import { useAlert } from "./AlertContext";

interface UserContextType {
  profileDetails: User;
  setProfileDetails: React.Dispatch<React.SetStateAction<User>>;
  teamMembers: { email: string; picture?: string; name: string }[];
  setTeamMembers: React.Dispatch<React.SetStateAction<{ email: string; picture?: string; name: string }[]>>;
  userQuest: number[];
  setUserQuest: React.Dispatch<React.SetStateAction<number[]>>;
  loadingProfile: boolean;
  setLoadingProfile: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserDetailsProvider = ({ children }: { children: ReactNode }) => {
  const [profileDetails, setProfileDetails] = useState<User>({
    _id: "",
    name: "",
    email: "",
    picture: "",
    team: "",
    categories: [""],
    statuses: [],
    isUserQuestDone: false,
  });

  const [loadingProfile, setLoadingProfile] = useState(false);

  const [teamMembers, setTeamMembers] = useState<{ email: string; picture?: string; name: string }[]>([]);
  const [userQuest, setUserQuest] = useState([0, 0, 0]);

  const { showAlert } = useAlert();

  useEffect(() => {
    if (profileDetails.team) {
      const fetchTeamMembers = async () => {
        try {
          const response = await api.get(`/team/all-members`, {
            params: { teamCode: profileDetails.team },
          });
          if (response.status === 200) {
            setTeamMembers(response.data);
            const cookiesUserQuest = Cookies.get("newUserQuest");
            if (cookiesUserQuest) {
              const userQuest = JSON.parse(cookiesUserQuest);
              if (response.data.length > 1 && userQuest.participantJoined != 50) {
                userQuest.participantJoined += 50;
                setUserQuest((prevQuest) => [prevQuest[0], prevQuest[1] + 50, ...prevQuest.slice(2)]);
                Cookies.set("newUserQuest", JSON.stringify(userQuest));
              }
            }
          }
        } catch (error) {
          handleError(error, showAlert);
        }
      };

      fetchTeamMembers();
    }
  }, [profileDetails.team]);

  return (
    <UserContext.Provider
      value={{
        profileDetails,
        setProfileDetails,
        teamMembers,
        setTeamMembers,
        userQuest,
        setUserQuest,
        loadingProfile,
        setLoadingProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserDetails = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useTodos must be used within a TodosProvider");
  }
  return context;
};
