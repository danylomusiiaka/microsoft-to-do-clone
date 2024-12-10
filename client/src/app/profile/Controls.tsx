"use client";
import Axios from "axios";
import Link from "next/link";
import React from "react";
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;


export default function Controls() {
  const handleLogOut = async () => {
    await Axios.post(`${webUrl}/user/logout`, {}, { withCredentials: true });
  };

  return (
    <div className='flex space-x-2 mt-4'>
      <Link
        href='/auth'
        className='flex justify-center items-center w-40 rounded-md p-1'
        style={{ backgroundColor: "var(--sidebar-block-color)" }}
        onClick={handleLogOut}
      >
        Вийти
      </Link>
      <button className='text-white bg-red-600 w-40 rounded-md p-1'>Видалити профіль</button>
    </div>
  );
}
