"use client";
import { useState } from "react";
import Plus from "../../../public/plus";
import Delete from "../../../public/delete";
import Pencil from "../../../public/pencil";
import { STATUS_OPTIONS } from "../../../public/statuses";

export default function StatusEditor() {
  const [isChangingStatuses, setChangingStatuses] = useState(false);
  const [statusOptions, setStatusOptions] = useState(STATUS_OPTIONS);
  const [status, setStatus] = useState({ name: "", color: "#57534e" });

  const addStatus = () => {
    if (status.name.trim() === "") return;
    setStatusOptions([...statusOptions, status]);
    setStatus({ ...status, name: "" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addStatus();
    }
  };

  return (
    <>
      <div className='flex items-center space-x-2'>
        <p>Відредагувати стани завдань</p>
        <button onClick={() => setChangingStatuses(!isChangingStatuses)}>
          <Pencil />
        </button>
      </div>
      <div className='grid sm:grid-cols-5 grid-cols-3 w-fit'>
        {statusOptions.map((option: any) => (
          <div
            key={option.name}
            className={`flex p-2 mr-2 justify-center rounded-xl text-sm h-5 items-center mb-2 ${option.color} max-w-28`}
            style={{ backgroundColor: `${option.color}` }}
          >
            <p className='truncated-text'>{option.name}</p>

            {isChangingStatuses && !STATUS_OPTIONS.some((o: any) => o.name === option.name) && (
              <button
                onClick={() =>
                  setStatusOptions(statusOptions.filter((o: any) => o.name !== option.name))
                }
              >
                <Delete color='#fff' width='18px' />
              </button>
            )}
          </div>
        ))}
      </div>

      {isChangingStatuses && (
        <div className='space-x-2 flex items-center'>
          <input
            type='text'
            value={status.name}
            className='bg-transparent border rounded-md text-sm p-1'
            placeholder='Введіть назву статусу..'
            onChange={(e) => setStatus({ ...status, name: e.target.value })}
            onKeyDown={handleKeyDown}
          />
          <input
            type='color'
            className='bg-transparent  theme-option'
            value={status.color}
            onChange={(e) => setStatus({ ...status, color: e.target.value })}
          />
          <button
            onClick={() => {
              addStatus();
            }}
          >
            <Plus />
          </button>
        </div>
      )}
    </>
  );
}
