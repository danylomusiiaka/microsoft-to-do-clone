"use client";
import { useEffect, useState } from "react";
import Plus from "../../../public/plus";
import Delete from "../../../public/delete";
import Pencil from "../../../public/pencil";
import { STATUS_OPTIONS } from "../../components/constants/statuses";
import { useProfileFunctions } from "@/components/functions/userFunctions";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { Status, User } from "@/interfaces/UserInterface";
import Cookies from "js-cookie";
import Axios from "axios";
import { useAlert } from "@/contexts/AlertContext";

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export default function StatusEditor({ userData }: { userData: User }) {
  const [isChangingStatuses, setChangingStatuses] = useState(false);
  const { profileDetails, setProfileDetails } = useUserDetails();
  const { updateField } = useProfileFunctions();
  const [statusOptions, setStatusOptions] = useState([...STATUS_OPTIONS, ...userData.statuses]);
  const { showAlert } = useAlert();

  const [status, setStatus] = useState({ name: "", color: "#a8a29e" });

  const addStatus = async () => {
    if (!status.name.trim()) return;

    const updatedStatuses = profileDetails.statuses.filter((s: Status) => s.name !== status.name);
    const newStatuses = [...updatedStatuses, status];
    setStatus({ ...status, name: "" });

    const responseSuccesful = await updateField("statuses", newStatuses);

    if (responseSuccesful) {
      setStatusOptions([...STATUS_OPTIONS, ...newStatuses]);
      setProfileDetails({
        ...profileDetails,
        statuses: newStatuses,
      });
    }
  };

  const deleteStatus = (statusName: string) => {
    const updatedStatuses = profileDetails.statuses.filter((o: Status) => o.name !== statusName);
    setStatusOptions(statusOptions.filter((o: Status) => o.name !== statusName));
    updateField("statuses", updatedStatuses);
    setProfileDetails({
      ...profileDetails,
      statuses: updatedStatuses,
    });
  };

  useEffect(() => {
    setStatusOptions([...STATUS_OPTIONS, ...profileDetails.statuses]);
  }, [profileDetails.statuses]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const token = Cookies.get("token");
      try {
        const response = await Axios.get(`${webUrl}/user/statuses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setProfileDetails((prevDetails) => ({
            ...prevDetails,
            statuses: response.data,
          }));
        }
      } catch (error: any) {
        if (error.response) {
          showAlert(error.response.data, 'error');
        }
      }
    };
    fetchStatuses();
  }, [profileDetails.team]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addStatus();
    }
  };

  return (
    <>
      <div className='md:flex items-center space-y-2 md:space-y-0 md:space-x-2'>
        <div className='flex items-center space-x-2'>
          <p>Відредагувати стани завдань</p>
          <button onClick={() => setChangingStatuses(!isChangingStatuses)}>
            <Pencil />
          </button>
        </div>

        {isChangingStatuses && (
          <div className='space-x-2 flex items-center '>
            <input
              type='color'
              className='bg-transparent theme-option w-8 h-6'
              value={status.color}
              onChange={(e) => setStatus({ ...status, color: e.target.value })}
            />
            <input
              type='text'
              value={status.name}
              className='bg-transparent border rounded-md text-sm p-1 w-full'
              placeholder='Введіть назву статусу..'
              onChange={(e) => setStatus({ ...status, name: e.target.value })}
              onKeyDown={handleKeyDown}
            />

            <button onClick={addStatus}>
              <Plus />
            </button>
          </div>
        )}
      </div>
      <div className='grid sm:grid-cols-5 grid-cols-3 w-fit'>
        {statusOptions.map((option: Status) => (
          <div
            key={option.name}
            className='flex p-2 mr-2 justify-center rounded-xl text-sm h-5 items-center mb-2 max-w-24'
            style={{ backgroundColor: `${option.color}` }}
          >
            <p className='truncated-text'>{option.name}</p>

            {isChangingStatuses && !STATUS_OPTIONS.some((o: Status) => o.name === option.name) && (
              <button
                onClick={() => {
                  deleteStatus(option.name);
                }}
              >
                <Delete color='#fff' width='18px' />
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
