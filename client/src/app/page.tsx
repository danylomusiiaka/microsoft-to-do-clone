import axios from "axios";

import React, { Suspense } from "react";

import { cookies } from "next/headers";

import TodoList from "@/components/TodoList";

import { backendUrl } from "@/constants/app-config";

import Loading from "./loading";

async function fetchUserData(token: string) {
  try {
    const userResponse = await axios.get(`${backendUrl}/user/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return userResponse.data;
  } catch (error: any) {
    console.error("Main page: ", error.response?.data || error.message);
    return {};
  }
}

async function fetchTodos(token: string) {
  try {
    const { team, email } = await fetchUserData(token);

    const todosResponse = await axios.get(`${backendUrl}/task/all`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { author: team || email },
    });

    return todosResponse.data;
  } catch (error: any) {
    console.error("Main page: ", error.response?.data || error.message);
    return [];
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const allTodos = token ? await fetchTodos(token) : [];

  const userData = token ? await fetchUserData(token) : {};

  return (
    <section className="md:flex w-full">
      <Suspense fallback={<Loading />}>
        <TodoList allTodos={allTodos.reverse()} userData={userData} category="Завдання" />
      </Suspense>
    </section>
  );
}
