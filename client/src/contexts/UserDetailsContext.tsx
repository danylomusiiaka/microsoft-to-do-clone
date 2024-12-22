"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import Axios from "axios";
import { User } from "@/interfaces/UserInterface";
import { useAlert } from "./AlertContext";
import Cookies from "js-cookie";

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

interface UserContextType {
  profileDetails: User;
  setProfileDetails: React.Dispatch<React.SetStateAction<User>>;
  teamMembers: { email: string; picture?: string; name: string }[];
  userQuest: number[];
  setUserQuest: React.Dispatch<React.SetStateAction<number[]>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserDetailsProvider = ({ children }: { children: ReactNode }) => {
  const [profileDetails, setProfileDetails] = useState<User>({
    name: "",
    email: "",
    picture: "",
    team: "",
    categories: [""],
  });

  const [teamMembers, setTeamMembers] = useState<
    { email: string; picture?: string; name: string }[]
  >([]);
  const [userQuest, setUserQuest] = useState([0, 0, 0]);

  const { showAlert } = useAlert();

  useEffect(() => {
    if (profileDetails.team) {
      const fetchTeamMembers = async () => {
        try {
          const token = Cookies.get("token");

          const response = await Axios.get(`${webUrl}/user/team-members`, {
            params: { teamCode: profileDetails.team },
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.status === 200) {
            setTeamMembers(response.data);
            const cookiesUserQuest = Cookies.get("newUserQuest");
            if (cookiesUserQuest) {
              const userQuest = JSON.parse(cookiesUserQuest);
              if (response.data.length > 1 && userQuest.participantJoined != 50) {
                userQuest.participantJoined += 50;
                setUserQuest((prevQuest) => [
                  prevQuest[0],
                  prevQuest[1] + 50,
                  ...prevQuest.slice(2),
                ]);
                Cookies.set("newUserQuest", JSON.stringify(userQuest));
              }
            }
          }
        } catch (error: any) {
          showAlert(error.response.data, "error");
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
        userQuest,
        setUserQuest,
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
