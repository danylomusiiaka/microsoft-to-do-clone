"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import Axios from "axios";
import { User } from "@/interfaces/UserInterface";
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

interface UserContextType {
  profileDetails: User;
  setProfileDetails: React.Dispatch<React.SetStateAction<User>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserDetailsProvider = ({ children }: { children: ReactNode }) => {
  const [profileDetails, setProfileDetails] = useState({
    name: "",
    email: "",
    picture: "",
    team: "",
  });

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await Axios.get(`${webUrl}/user/details`, {
          withCredentials: true,
        });
        const { name, email, picture, team } = result.data;
        setProfileDetails({ name, email, picture, team });
      } catch (error: any) {
        console.log(error.response);
        

      }
    };

    fetchData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        profileDetails,
        setProfileDetails,
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
