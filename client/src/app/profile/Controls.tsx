"use client";

import Cookies from "js-cookie";

export default function Controls() {
  const handleLogOut = async () => {
    Cookies.remove("token");
    window.location.href = "/auth";
  };

  return (
    <div className='flex space-x-2 mt-4'>
      <button
        className='flex justify-center items-center w-40 rounded-md p-1'
        style={{ backgroundColor: "var(--sidebar-block-color)" }}
        onClick={handleLogOut}
      >
        Вийти
      </button>
      <button className='text-white bg-red-600 w-40 rounded-md p-1'>Видалити профіль</button>
    </div>
  );
}
