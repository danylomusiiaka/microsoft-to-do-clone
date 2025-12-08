import Axios from "axios";

import { Suspense } from "react";

import { cookies } from "next/headers";

import { backendUrl } from "@/constants/app-config";

import Loading from "../loading";
import Profile from "./Profile";

async function fetchUserData(token: string) {
  try {
    const userResponse = await Axios.get(`${backendUrl}/user/details`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return userResponse.data;
  } catch (error: any) {
    console.error("Profile page: ", error.response?.data || error.message);
    return {};
  }
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const userData = token ? await fetchUserData(token) : {};

  return (
    <section className="md:flex w-full">
      <Suspense fallback={<Loading />}>
        <Profile userData={userData} />
      </Suspense>
    </section>
  );
}
