import React, { Suspense } from "react";
import Loading from "./loading";
const TodoList = React.lazy(() => import("@/components/structure/TodoList"));
const NavSidebar = React.lazy(() => import("@/components/structure/NavSidebar"));
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
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const allTodos = token ? await fetchTodos(token) : [];

  const userData = token ? await fetchUserData(token) : {};

  return (
    <section className='md:flex w-full'>
      <Suspense fallback={<Loading />}>
        <NavSidebar userData={userData} />
        <TodoList allTodos={allTodos.reverse()} userStatuses={userData.statuses} />
      </Suspense>
    </section>
  );
}
