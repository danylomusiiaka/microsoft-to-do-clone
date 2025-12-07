import React, { Suspense } from "react";
import Axios from "axios";
import Loading from "../loading";
import { cookies } from "next/headers";
import Profile from "./Profile";

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

async function fetchUserData(token: string) {
  try {
    const userResponse = await Axios.get(`${webUrl}/user/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return userResponse.data;
  } catch (error: any) {
    console.error("Error fetching todos:", error.response?.data || error.message);
    return {};
  }
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const userData = token ? await fetchUserData(token) : {};

  return (
    <section className='md:flex w-full'>
      <Suspense fallback={<Loading />}>
        <Profile userData={userData} />
      </Suspense>
    </section>
  );
}
