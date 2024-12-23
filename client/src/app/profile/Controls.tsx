"use client";
import Link from "next/link";
import React from "react";
import Cookies from "js-cookie";

export default function Controls() {
  const handleLogOut = async () => {
    Cookies.remove("token");
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
