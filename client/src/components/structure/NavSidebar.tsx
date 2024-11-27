"use client";
import NavigationButton from "../NavigationButton";
import ProfileNavigation from "../ProfileDetails";
import Plus from "../../../public/plus";
import { useState, useRef, useEffect } from "react";
import { useTodos } from "@/contexts/TodosContext";
import { Category } from "@/interfaces/TaskInterface";
import { useRouter } from "next/navigation";

export default function NavSidebar() {
  const [category, setCategory] = useState("");
  const { categories, setCategories, search, setSearch } = useTodos();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
  

  if (router.query === "/auth") {
    return null;
  }

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
          <ProfileNavigation />
          <div className='search-container'>
            <input
              type='text'
              placeholder='Пошук'
              className='search-input'
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <NavigationButton icon='home.svg' href='/' text='Завдання' onClick={handleItemClick} />
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
