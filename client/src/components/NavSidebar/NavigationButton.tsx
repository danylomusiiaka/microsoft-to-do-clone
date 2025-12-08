import Link from "next/link";
import { FC, SVGProps } from "react";

interface NavigationButtonProps {
  Icon: FC<SVGProps<SVGSVGElement>>;
  href: string;
  text: string;
  disabled?: boolean;
}

export default function NavigationButton({ Icon, href, text, disabled = false }: NavigationButtonProps) {
  const handleItemClick = () => {
    (document.getElementById("nav_check") as HTMLInputElement).checked = false;
  };

  if (disabled) {
    return (
      <div onClick={(e) => e.preventDefault()} className='flex items-center space-x-3 w-full p-3 rounded-md button opacity-50 cursor-not-allowed'>
        <Icon style={{ width: "24px", height: "24px" }} color='pink' />
        <p className='truncated-text'>{text}</p>
      </div>
    );
  }

  return (
    <Link href={href} onClick={handleItemClick} className='flex items-center space-x-3 w-full p-3 rounded-md button'>
      <Icon style={{ width: "24px", height: "24px" }} color='pink'/>
      <p className='truncated-text'>{text}</p>
    </Link>
  );
}
