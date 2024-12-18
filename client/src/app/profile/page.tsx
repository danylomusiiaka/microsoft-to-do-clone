import React, { Suspense } from "react";
import Axios from "axios";
import Loading from "../loading";
import { cookies } from "next/headers";
const NavSidebar = React.lazy(() => import("@/components/structure/NavSidebar"));
const Profile = React.lazy(() => import("./Profile"));
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
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const userData = token ? await fetchUserData(token) : {};

  return (
    <section className='md:flex w-full'>
      <Suspense fallback={<Loading />}>
        <NavSidebar userData={userData} />
        <Profile userData={userData} />
      </Suspense>
    </section>
  );
}
