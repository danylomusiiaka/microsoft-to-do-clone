"use client";

import ThemeOption from "@/components/ThemeOption";
import NavSidebar from "@/components/structure/NavSidebar";
import StatusEditor from "./StatusEditor";
import ProfilePicture from "./ProfilePicture";
import Controls from "./Controls";
import { useTodos } from "@/contexts/TodosContext";
import { useState, useEffect } from "react";
import { useProfileFunctions } from "@/components/functions/userFunctions";
import { formatText } from "@/components/functions/formatFields";

const themes = ["dark", "light", "purple"];

export default function Profile() {
  const { profileDetails } = useTodos();
  const [name, setName] = useState("");
  const { updateField } = useProfileFunctions();

  useEffect(() => {
    if (profileDetails?.name) {
      setName(profileDetails.name);
    }
  }, [profileDetails]);

  return (
    <>
      <NavSidebar />

      <main className='p-4 md:p-12 w-full space-y-5'>
        <section className='md:flex p-2 pl-0 items-center justify-between'>
          <div className='flex space-x-3 w-full items-center'>
            <ProfilePicture picture={profileDetails.picture} />
            <div className='w-4/6 md:w-6/6'>
              <textarea
                className='bg-transparent font-bold text-2xl hover:outline hover:outline-2 hover:outline-white hover:rounded-md p-1  resize-none profile-name h-10 w-full'
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => updateField("name", name)}
              />
              <p className='md:text-2xl pl-1 '>{formatText(profileDetails.email, 30)}</p>
            </div>
          </div>
          <Controls />
        </section>

        <hr className='divider' />

        <section className='space-y-4'>
          <h2 className='text-2xl'>Загальні налаштування</h2>
          <p>Обрати тему для додатка</p>
          <div className='flex'>
            {themes.map((theme) => (
              <ThemeOption theme={theme} key={theme} />
            ))}
          </div>

          <StatusEditor />
        </section>
      </main>
    </>
  );
}
