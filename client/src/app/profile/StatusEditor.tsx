"use client";
import { useEffect, useState } from "react";

import { useAlert } from "@/contexts/AlertContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";

import { handleError } from "@/functions/handleError";
import { useProfileFunctions } from "@/functions/hooks/useUserFunctions";

import { api } from "@/services/api";

import { Status, User } from "@/interfaces/UserInterface";

import Delete from "../../../public/delete";
import Pencil from "../../../public/pencil";
import Plus from "../../../public/plus";
import { STATUS_OPTIONS } from "../../constants/statuses";

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

    await updateField("statuses", newStatuses);
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
      try {
        const response = await api.get(`/user/statuses`);
        if (response.status === 200) {
          setProfileDetails((prevDetails) => ({
            ...prevDetails,
            statuses: response.data,
          }));
        }
      } catch (error) {
        handleError(error, showAlert);
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
      <div className="md:flex items-center space-y-2 md:space-y-0 md:space-x-2">
        <div className="flex items-center space-x-2">
          <p>Відредагувати стани завдань</p>
          <button onClick={() => setChangingStatuses(!isChangingStatuses)}>
            <Pencil />
          </button>
        </div>

        {isChangingStatuses && (
          <div className="space-x-2 flex items-center ">
            <input
              type="color"
              className="bg-transparent theme-option w-8 h-6"
              value={status.color}
              onChange={(e) => setStatus({ ...status, color: e.target.value })}
            />
            <input
              type="text"
              value={status.name}
              className="bg-transparent border rounded-md text-sm p-1"
              placeholder="Введіть назву статусу.."
              onChange={(e) => setStatus({ ...status, name: e.target.value })}
              onKeyDown={handleKeyDown}
            />

            <button onClick={addStatus}>
              <Plus />
            </button>
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-5 grid-cols-3 w-fit">
        {statusOptions.map((option: Status) => (
          <div
            key={option.name}
            className="flex p-2 mr-2 justify-center rounded-xl text-sm h-5 items-center mb-2 max-w-24"
            style={{ backgroundColor: `${option.color}` }}
          >
            <p className="truncated-text">{option.name}</p>

            {isChangingStatuses && !STATUS_OPTIONS.some((o: Status) => o.name === option.name) && (
              <button
                onClick={() => {
                  deleteStatus(option.name);
                }}
              >
                <Delete color="#fff" width="18px" />
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
