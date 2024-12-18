import React, { Suspense } from "react";
import Loading from "@/app/loading";
import axios from "axios";
import { cookies } from "next/headers";
const TodoList = React.lazy(() => import("@/components/structure/TodoList"));
const NavSidebar = React.lazy(() => import("@/components/structure/NavSidebar"));

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

async function fetchUserData(token: string) {
  try {
    const userResponse = await axios.get(`${webUrl}/user/details`, {
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
    const todosResponse = await axios.get(`${webUrl}/task/all`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { author: teamOrEmail },
    });

    return todosResponse.data;
  } catch (error: any) {
    console.error("Error fetching todos:", error.response?.data || error.message);
    return [];
  }
}

export default async function Category({ params }: { params: { category: string } }) {
  const category = decodeURIComponent(params.category);

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const userData = token ? await fetchUserData(token) : {};
  let allTodos = [];
  if (userData.categories?.includes(category)) {
    allTodos = token ? await fetchTodos(token, userData.team || userData.email) : [];
  }

  return (
    <section className='md:flex w-full'>
      <Suspense fallback={<Loading />}>
        <NavSidebar userData={userData} />
        {!userData.categories?.includes(category) ? (
          <div className='md:flex items-center space-x-6 justify-center w-full'>
            <img src='/not-found.png' alt='cat-not-found' className='w-60 h-48' />
            <div className='space-y-4'>
              <h1 className='text-2xl font-semibold'>
                Ми чесно шукали, але нічого не змогли знайти..
              </h1>
              <p>Зверніть увагу на наступні кроки: </p>
              <ul className='list-disc pl-5 space-y-2'>
                <li>чи створений список, який ви шукаєте</li>
                <li>чи в тій Ви команді, в якій створений список</li>
              </ul>
              <div>
                <a
                  href='/'
                  className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
                >
                  Повернутись на головну
                </a>
              </div>
            </div>
          </div>
        ) : (
          <TodoList allTodos={allTodos} />
        )}
      </Suspense>
    </section>
  );
}
