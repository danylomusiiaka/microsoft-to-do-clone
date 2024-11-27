import { useTodos } from "@/contexts/TodosContext";
import Link from "next/link";
import { formatText } from "./functions/formatFields";

export default function ProfileNavigation() {
  const handleItemClick = () => {
    (document.getElementById("nav_check") as HTMLInputElement).checked = false;
  };

  const { profileDetails } = useTodos();

  return (
    <Link
      href='/profile'
      className='flex space-x-3 profile items-center rounded-md p-2 pl-1'
      onClick={handleItemClick}
    >
      <img
        src={profileDetails.picture || `default-picture.svg`}
        alt='photo'
        className='w-12 h-12 object-cover rounded-full'
      />
      <div>
        <h1 className='font-bold'>{formatText(profileDetails.name, 30)}</h1>
        <p className='text-sm'>{formatText(profileDetails.email,30)}</p>
      </div>
    </Link>
  );
}
