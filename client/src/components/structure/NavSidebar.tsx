"use client";
import NavigationButton from "../NavigationButton";
import Plus from "@/../public/plus";
import Delete from "@/../public/delete";
import { useState, useRef, useEffect } from "react";
import { useTodos } from "@/contexts/TodosContext";
import { User } from "@/interfaces/UserInterface";
import Link from "next/link";
import { formatText } from "../functions/formatFields";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import Axios from "axios";
import { useProfileFunctions } from "../functions/userFunctions";
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export default function NavSidebar({ userData }: { userData: User }) {
  const [category, setCategory] = useState("");
  const { setSearch, setTodos } = useTodos();
  const { profileDetails, setProfileDetails } = useUserDetails();
  const { addCategory, deleteCategory } = useProfileFunctions();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [profileData, setProfileData] = useState(userData);

  useEffect(() => {
    setProfileDetails(userData);
  }, []);

  useEffect(() => {
    setProfileData(profileDetails);
  }, [profileDetails]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "init",
          profileDetails: { team: profileDetails.team },
        })
      );
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.event === "categoryCreated") {
        setProfileDetails((prevDetails) => {
          return {
            ...prevDetails,
            categories: message.categories,
          };
        });
      } else if (message.event === "categoryDeleted") {
        setProfileDetails((prevDetails) => {
          return {
            ...prevDetails,
            categories: message.remainingCategories,
          };
        });

        if (
          message.remainingCategories.some(
            (cat: string) => window.location.pathname === `/${encodeURIComponent(cat)}`
          )
        ) {
          window.location.href = "/";
        }

        setTodos(message.remainingTasks);
      }
    };

    return () => {
      ws.close();
    };
  }, [profileDetails]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await Axios.get(`${webUrl}/category/all`, {
        withCredentials: true,
      });
      setProfileDetails((prevDetails) => ({
        ...prevDetails,
        categories: response.data,
      }));
    };
    fetchCategories();
  }, [profileDetails.team]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addCategory(category);
      setCategory("");
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
              src={profileData.picture || `/default-picture.svg`}
              alt='photo'
              className='w-12 h-12 object-cover rounded-full'
            />
            <div>
              <h1 className='font-bold'>{formatText(profileData.name, 30)}</h1>
              <p className='text-sm'>{formatText(profileData.email, 30)}</p>
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
            <img src='/home.svg' className='w-6' />
            <p>Завдання</p>
          </a>
          <NavigationButton icon='/star.svg' href='/dashboard' text='Статистика' />
          <hr className='divider' />
          <div className='scroll-container-nav'>
            {profileData.categories?.map((category) => (
              <div
                className='flex justify-between p-3 rounded-md button listname-link'
                key={category}
              >
                <a
                  href={`/list/${encodeURIComponent(category)}`}
                  className='flex items-center space-x-3 w-full '
                >
                  <img src='/list.svg' className='w-6' />
                  <p className='truncated-text'>{category}</p>
                </a>
                <button
                  className='nav-delete'
                  onClick={() => {
                    deleteCategory(category);
                  }}
                >
                  <Delete color='#6b7280' width='25px' />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className='space-y-2 '>
          <div className='search-input flex '>
            <button
              onClick={() => {
                addCategory(category);
                setCategory("");
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
