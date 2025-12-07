import Axios from "axios";
import { useRef, useState } from "react";
import Cookies from "js-cookie";
import { backendUrl } from "@/constants/app-config";

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setErrorMessage("");

    setIsLoading(true);
    try {
      const response = await Axios.post(`${backendUrl}/user/login`, {
        email: emailRef.current?.value || "",
        password: passwordRef.current?.value || "",
      });
      if (response.status === 200) {
        const { token } = response.data;
        Cookies.set("token", token, {
          expires: 7,
          secure: true,
          sameSite: "None",
        });

        window.location.href = "/";
      }
    } catch (error: any) {
      if (error.response) {
        setErrorMessage(error.response.data);
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='input-wrap'>
        <input type='email' id='email2' ref={emailRef} autoComplete='email' placeholder=' ' />
        <label htmlFor='email2'>Пошта</label>
      </div>

      <div className='input-wrap'>
        <input type='password' id='password2' ref={passwordRef} placeholder=' ' />
        <label htmlFor='password2'>Пароль</label>
      </div>

      <button className='sign-btn' onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? <span className='spinner'></span> : "Увійти"}
      </button>
      {errorMessage && <p className='text-red-600 text-sm mt-2'>{errorMessage}</p>}
    </>
  );
}
