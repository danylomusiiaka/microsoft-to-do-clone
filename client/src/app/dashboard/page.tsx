import Axios from "axios";

import React, { Suspense } from "react";

import { cookies } from "next/headers";

import { handleError } from "@/functions/handleError";

import Loading from "../loading";
import Dashboard from "./Dashboard";
import { backendUrl } from "@/constants/app-config";

async function fetchUserData(token: string) {
  try {
    const userResponse = await Axios.get(`${backendUrl}/user/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return userResponse.data;
  } catch (error: any) {
    console.error("Dashboard page: ", error.response?.data || error.message);
    return {};
  }
}

async function fetchTodos(token: string, teamOrEmail: string) {
  try {
    const todosResponse = await Axios.get(`${backendUrl}/task/all`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { author: teamOrEmail },
    });

    return todosResponse.data;
  } catch (error) {
    handleError(error);
    return [];
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const userData = token ? await fetchUserData(token) : {};
  const allTodos = token ? await fetchTodos(token, userData.team || userData.email) : [];

  return (
    <Suspense fallback={<Loading />}>
      <Dashboard allTodos={allTodos} userData={userData} />
    </Suspense>
  );
}
