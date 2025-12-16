import axios from "axios";

import "@/styles/globals.css";

import { cookies } from "next/headers";

import { AlertProvider } from "@/contexts/AlertContext";
import { TodosProvider } from "@/contexts/TodosContext";
import { UserDetailsProvider } from "@/contexts/UserDetailsContext";

import NavSidebar from "@/components/NavSidebar";

import { backendUrl } from "@/constants/app-config";

export const metadata = {
  title: "Microsoft To Do Clone ",
  description: "Моя кастомна веб версія Microsoft To Do запущена в тестовому режимі",
  icons: {
    icon: "/microsoft-todo.ico",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  async function fetchUserData(token: string) {
    try {
      const userResponse = await axios.get(`${backendUrl}/user/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return userResponse.data;
    } catch (error: any) {
      console.error("Layout page: ", error.response?.data || error.message);
      return {};
    }
  }
  const cookieStore = await cookies();
  const result = cookieStore.get("theme")?.value || "dark";

  const token = cookieStore.get("token")?.value;
  const userData = token ? await fetchUserData(token) : null;

  return (
    <html lang="en">
      <body className="m-2 flex flex-col lg:flex-row" data-theme={result}>
        <AlertProvider>
          <UserDetailsProvider>
            <TodosProvider>
              {userData && <NavSidebar userData={userData} />}
              {children}
            </TodosProvider>
          </UserDetailsProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
