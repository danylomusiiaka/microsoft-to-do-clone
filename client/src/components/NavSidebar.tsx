"use client";
import NavigationButton from "./NavSidebar/NavigationButton";
import Plus from "@/../public/icons/plus.svg";
import Delete from "@/../public/icons/delete.svg";
import { useState, useRef, useEffect, Fragment } from "react";
import { useTodos } from "@/contexts/TodosContext";
import { User } from "@/interfaces/UserInterface";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import Axios from "axios";
import { useAlert } from "@/contexts/AlertContext";
import Cookies from "js-cookie";
import { Task } from "@/interfaces/TaskInterface";
import Link from "next/link";
import { useProfileFunctions } from "@/functions/hooks/useUserFunctions";
import { backendUrl, wsUrl } from "@/constants/app-config";
import HomeIcon from "../../public/icons/home.svg";
import MyDayIcon from "../../public/icons/sun.svg";
import ListIcon from "../../public/icons/list.svg";
import DashboardIcon from "../../public/icons/star.svg";
import AssignmentIcon from "../../public/icons/assignment.svg";

export default function NavSidebar({ userData }: { userData: User }) {
  const [category, setCategory] = useState("");
  const { setSearch, setTodos, loading } = useTodos();
  const { profileDetails, setProfileDetails, teamMembers, setTeamMembers } = useUserDetails();
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

        if (message.remainingCategories.some((cat: string) => window.location.pathname === `/${encodeURIComponent(cat)}`)) {
          window.location.href = "/";
        }

        setTodos(message.remainingTasks);
      } else if (message.event === "statusesUpdated") {
        setProfileDetails((prevDetails) => ({
          ...prevDetails,
          statuses: message.newStatuses,
        }));
        setTodos((prevTodos) => prevTodos.map((todo) => message.updatedTodos.find((updatedTodo: Task) => updatedTodo._id === todo._id) || todo));
      } else if (message.event === "teamMemberJoined") {
        console.log(teamMembers);
        console.log(message.participant);
        showAlert(message.participant);
      } else if (message.event === "teamMemberExited") {
        console.log(teamMembers);
        console.log(message.participant);
        showAlert(message.participant);
      }
    };

    return () => {
      ws.close();
    };
  }, [profileDetails.team]);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = Cookies.get("token");
      try {
        const response = await Axios.get(`${backendUrl}/category/all`, {
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
          showAlert(error.response.data, "error");
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
  console.log(profileData.categories);

  return (
    <>
      <input type='checkbox' id='nav_check' hidden />
      <label htmlFor='nav_check' className='hamburger'>
        <div></div>
        <div></div>
        <div></div>
      </label>
      <section ref={sidebarRef} className='flex flex-col justify-between sidebar sidebar-hamburg min-w-72 w-80 p-3 rounded-md'>
        <div className='space-y-4'>
          <Link href='/profile' onClick={() => ((document.getElementById("nav_check") as HTMLInputElement).checked = false)} className='flex space-x-3 profile items-center rounded-md p-2 pl-1'>
            <img src={profileData.picture || `/icons/default-picture.svg`} alt='photo' className='w-12 h-12 object-cover rounded-full aspect-square' />
            <div className='min-w-0'>
              <h1 className='font-bold truncate'>{profileData.name}</h1>
              <p className='text-sm truncate'>{profileData.email}</p>
            </div>
          </Link>
          <div className='search-container'>
            <input type='text' placeholder='Пошук' className='search-input' onChange={(e) => setSearch(e.target.value)} />
          </div>

          <NavigationButton Icon={HomeIcon} href='/' text='Завдання' />
          <NavigationButton Icon={MyDayIcon} href='/list/Мій день' text='Мій день' />
          <NavigationButton Icon={DashboardIcon} href='/dashboard' text='Статистика' />
          <NavigationButton Icon={AssignmentIcon} href='/list/Призначено мені' text='Призначено мені' />

          <hr className='divider' />

          <div className='scroll-container-nav'>
            {profileData.categories?.map((category, i) => (
              <Fragment key={i}>
                {category !== "" && (
                  <div
                    className='flex justify-between rounded-md button listname-link'
                    style={{
                      opacity: category == loading ? 0.5 : 1,
                    }}
                  >
                    <NavigationButton Icon={ListIcon} href={`/list/${encodeURIComponent(category)}`} text={category} disabled={!!loading} />

                    <button
                      className='nav-delete pr-3'
                      onClick={() => {
                        deleteCategory(category);
                      }}
                    >
                      <Delete color='#6b7280' strokeWidth={2} style={{ width: "25px", marginLeft: "0.4rem" }} />
                    </button>
                  </div>
                )}
              </Fragment>
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
              <Plus />
            </button>
            <input type='text' placeholder='Створити список' className='create-list-input' value={category} onChange={(e) => setCategory(e.target.value)} onKeyDown={handleKeyDown} />
          </div>
        </div>
      </section>
    </>
  );
}
