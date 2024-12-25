interface NavigationButtonProps {
  icon: string;
  href: string;
  text: string;
  disabled?: boolean;
}

export default function NavigationButton({ icon, href, text, disabled = false }: NavigationButtonProps) {
  const handleItemClick = () => {
    (document.getElementById("nav_check") as HTMLInputElement).checked = false;
  };
  return (
    <a
      href={disabled ? undefined : href}
      onClick={disabled ? (e) => e.preventDefault() : handleItemClick}
      className='flex items-center space-x-3 w-full p-3 rounded-md button'
    >
      <img src={`${icon}`} className='w-6' />
      <p className='truncated-text'>{text}</p>
    </a>
  );
}
