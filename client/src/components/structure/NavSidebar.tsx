"use client";
import NavigationButton from "../NavigationButton";
import Plus from "../../../public/plus";
import { useState, useRef, useEffect } from "react";
import { useTodos } from "@/contexts/TodosContext";
import { Category } from "@/interfaces/TaskInterface";
import { User } from "@/interfaces/UserInterface";
import Link from "next/link";
import { formatText } from "../functions/formatFields";
import { useUserDetails } from "@/contexts/UserDetailsContext";

export default function NavSidebar({ userData }: { userData: User | null }) {
  const [category, setCategory] = useState("");
  const { categories, setCategories, setSearch } = useTodos();
  const { profileDetails, setProfileDetails } = useUserDetails();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [profileData, setProfileData] = useState(userData);

  useEffect(() => {
    setProfileData(userData);
  }, []);

  useEffect(() => {
    setProfileData(profileDetails);
  }, [profileDetails]);

  const addCategory = (category: string) => {
    if (category.trim() === "") return;
    setCategories([...categories, { name: category, color: "bg-stone-600" }]);
    setCategory("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addCategory(category);
    }
  };

  const handleItemClick = () => {
    (document.getElementById("nav_check") as HTMLInputElement).checked = false;
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      handleItemClick();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <input type='checkbox' id='nav_check' hidden />
      <label htmlFor='nav_check' className='hamburger'>
        <div></div>
        <div></div>
        <div></div>
      </label>
      <section
        ref={sidebarRef}
        className='flex flex-col justify-between sidebar sidebar-hamburg min-w-72 p-3 rounded-md'
      >
        <div className='space-y-4'>
          <Link
            href='/profile'
            className='flex space-x-3 profile items-center rounded-md p-2 pl-1'
            onClick={handleItemClick}
          >
            <img
              src={profileData!.picture || `default-picture.svg`}
              alt='photo'
              className='w-12 h-12 object-cover rounded-full'
            />
            <div>
              <h1 className='font-bold'>{formatText(profileData!.name, 30)}</h1>
              <p className='text-sm'>{formatText(profileData!.email, 30)}</p>
            </div>
          </Link>
          <div className='search-container'>
            <input
              type='text'
              placeholder='Пошук'
              className='search-input'
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <a href='/' className='flex items-center space-x-3 w-full p-3 rounded-md button'>
            <img src='home.svg' className='w-6' />
            <p>Завдання</p>
          </a>
          <NavigationButton icon='star.svg' href='/dashboard' text='Статистика' />
          <hr className='divider' />
          <div className='scroll-container-nav'>
            {categories.map((category: Category) => (
              <NavigationButton
                icon='list.svg'
                href={`/${category.name}`}
                text={category.name}
                key={category.name}
              />
            ))}
          </div>
        </div>

        <div className='space-y-2 '>
          <div className='search-input flex '>
            <button
              onClick={() => {
                addCategory(category);
              }}
            >
              <Plus name='plus-2' />
            </button>
            <input
              type='text'
              placeholder='Створити список'
              className='create-list-input'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </section>
    </>
  );
}
