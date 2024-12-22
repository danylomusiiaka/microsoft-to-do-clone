import "@/styles/globals.css";
import { TodosProvider } from "@/contexts/TodosContext";
import { UserDetailsProvider } from "@/contexts/UserDetailsContext";
import { AlertProvider } from "@/contexts/AlertContext";
import { cookies } from "next/headers";

export const metadata = {
  title: "Microsoft To Do Clone",
  description: "Моя кастомна веб версія Microsoft To Do запущена в тестовому режимі",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const result = cookieStore.get("theme")?.value || "dark";

  return (
    <html lang='en'>
      <body className='m-2 flex flex-col lg:flex-row' data-theme={result}>
        <AlertProvider>
          <UserDetailsProvider>
            <TodosProvider>{children}</TodosProvider>
          </UserDetailsProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
