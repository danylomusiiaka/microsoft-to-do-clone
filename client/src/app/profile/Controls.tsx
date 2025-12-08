"use client";

import Cookies from "js-cookie";

export default function Controls() {
  const handleLogOut = async () => {
    Cookies.remove("token");
    window.location.href = "/auth";
  };

  return (
    <div className="flex space-x-2 mt-4 text-nowrap">
      <button
        className="flex justify-center items-center md:w-40 w-full rounded-md p-1"
        style={{ backgroundColor: "var(--sidebar-block-color)" }}
        onClick={handleLogOut}
      >
        Вийти
      </button>
      <button className="text-white bg-red-600 md:w-40 w-full rounded-md p-1">Видалити профіль</button>
    </div>
  );
}
