"use client";
function ThemeOption({ theme }: { theme: string }) {
  const setTheme = () => {
    if (typeof window !== "undefined") {
      document.querySelector("body")?.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  };

  return <div onClick={setTheme} className='theme-option mr-2 ' id={`theme-${theme}`}></div>;
}

export default ThemeOption;
