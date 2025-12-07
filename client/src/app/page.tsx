import React, { Suspense } from "react";
import Loading from "./loading";
import TodoList from "@/components/structure/TodoList";
import axios from "axios";
import { cookies } from "next/headers";

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

async function fetchUserData(token: string) {
  try {
    const userResponse = await axios.get(`${webUrl}/user/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return userResponse.data;
  } catch (error: any) {
    console.error("Error fetching todos:", error.response?.data || error.message);
    return {};
  }
}

async function fetchTodos(token: string) {
  try {
    const { team, email } = await fetchUserData(token);

    const todosResponse = await axios.get(`${webUrl}/task/all`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { author: team || email },
    });

    return todosResponse.data;
  } catch (error: any) {
    console.error("Error fetching todos:", error.response?.data || error.message);
    return [];
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const allTodos = token ? await fetchTodos(token) : [];

  const userData = token ? await fetchUserData(token) : {};

  return (
    <section className='md:flex w-full'>
      <Suspense fallback={<Loading />}>
        <TodoList allTodos={allTodos.reverse()} userData={userData} category='Завдання' />
      </Suspense>
    </section>
  );
}
