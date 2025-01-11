"use client";
import NavigationButton from "../NavigationButton";
import Plus from "@/../public/plus";
import Delete from "@/../public/delete";
import { useState, useRef, useEffect } from "react";
import { useTodos } from "@/contexts/TodosContext";
import { User } from "@/interfaces/UserInterface";
import { formatText } from "../functions/formatFields";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import Axios from "axios";
import { useProfileFunctions } from "../functions/userFunctions";
import { useAlert } from "@/contexts/AlertContext";
import Cookies from "js-cookie";
import { Task } from "@/interfaces/TaskInterface";

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

export default function NavSidebar({ userData }: { userData: User }) {
  const [category, setCategory] = useState("");
  const { setSearch, setTodos, loading } = useTodos();
  const { profileDetails, setProfileDetails } = useUserDetails();
  const { addCategory, deleteCategory } = useProfileFunctions();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [profileData, setProfileData] = useState(userData);
  const { showAlert } = useAlert();

  useEffect(() => {
    setProfileDetails(userData);
  }, []);

  useEffect(() => {
    setProfileData(profileDetails);
  }, [profileDetails]);

  useEffect(() => {
    const ws = new WebSocket(`${wsUrl}`);

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
      } else if (message.event === "statusesUpdated") {
        setProfileDetails({
          ...profileDetails,
          statuses: message.newStatuses,
        });
        setTodos((prevTodos) =>
          prevTodos.map(
            (todo) =>
              message.updatedTodos.find((updatedTodo: Task) => updatedTodo._id === todo._id) || todo
          )
        );
      }
    };

    return () => {
      ws.close();
    };
  }, [profileDetails]);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = Cookies.get("token");
      try {
        const response = await Axios.get(`${webUrl}/category/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setProfileDetails((prevDetails) => ({
            ...prevDetails,
            categories: response.data,
          }));
        }
      } catch (error: any) {
        if (error.response) {
          showAlert(error.response.data, 'error');
        }
      }
    };
    fetchCategories();
  }, [profileDetails.team]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      addCategory(category);
      setCategory("");
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      (document.getElementById("nav_check") as HTMLInputElement).checked = false;
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
          <a href='/profile' className='flex space-x-3 profile items-center rounded-md p-2 pl-1'>
            <img
              src={profileData.picture || `/default-picture.svg`}
              alt='photo'
              className='w-12 h-12 object-cover rounded-full'
            />
            <div>
              <h1 className='font-bold'>{formatText(profileData.name, 30)}</h1>
              <p className='text-sm'>{formatText(profileData.email, 30)}</p>
            </div>
          </a>
          <div className='search-container'>
            <input
              type='text'
              placeholder='Пошук'
              className='search-input'
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <NavigationButton icon='/home.svg' href='/' text='Завдання' />
          <NavigationButton icon='/sun.svg' href='/list/Мій день' text='Мій день' />
          <NavigationButton icon='/star.svg' href='/dashboard' text='Статистика' />

          <NavigationButton
            icon='/assignment.svg'
            href='/list/Призначено мені'
            text='Призначено мені'
          />

          <hr className='divider' />
          <div className='scroll-container-nav'>
            {profileData.categories?.map((category) => (
              <div
                className='flex justify-between rounded-md button listname-link'
                style={{
                  opacity: category == loading ? 0.5 : 1,
                }}
                key={category}
              >
                <NavigationButton
                  icon='/list.svg'
                  href={`/list/${encodeURIComponent(category)}`}
                  text={category}
                  disabled={!!loading}
                />

                <button
                  className='nav-delete pr-3'
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
              disabled={!!loading}
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
