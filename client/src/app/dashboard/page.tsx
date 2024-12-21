import Axios from "axios";
import { cookies } from "next/headers";
import React, { Suspense } from "react";
import Loading from "../loading";
import Dashboard from "./Dashboard";
const NavSidebar = React.lazy(() => import("@/components/structure/NavSidebar"));

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

async function fetchUserData(token: string) {
  try {
    const userResponse = await Axios.get(`${webUrl}/user/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return userResponse.data;
  } catch (error: any) {
    console.error("Error fetching user details:", error.response?.data || error.message);
    return {};
  }
}

async function fetchTodos(token: string, teamOrEmail: string) {
  try {
    const todosResponse = await Axios.get(`${webUrl}/task/all`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { author: teamOrEmail },
    });

    return todosResponse.data;
  } catch (error: any) {
    console.error("Error fetching todos:", error.response?.data || error.message);
    return [];
  }
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const userData = token ? await fetchUserData(token) : {};
  const allTodos = token ? await fetchTodos(token, userData.team || userData.email) : [];

  return (
    <Suspense fallback={<Loading />}>
      <NavSidebar userData={userData} />
      <Dashboard allTodos={allTodos} userData={userData} />
    </Suspense>
  );
}
