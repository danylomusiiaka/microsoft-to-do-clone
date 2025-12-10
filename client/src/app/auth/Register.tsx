import Axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

import { useState } from "react";

import { backendUrl } from "@/constants/app-config";

export default function Register() {
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    userKey: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerification, setIsVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hashedKey, setHashedKey] = useState("");

  const verifyEmail = async () => {
    try {
      const response = await Axios.post(`${backendUrl}/user/verify-email`, {
        email: registerForm.email,
      });
      if (response.status === 200) {
        setHashedKey(response.data.hashedKey);
        setIsVerification(true);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(error.response?.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      const response = await Axios.post(`${backendUrl}/user/register`, {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        verificationKey: hashedKey,
        userInputKey: registerForm.userKey,
      });
      if (response.status === 200) {
        const { token } = response.data;
        Cookies.set("token", token, {
          sameSite: "None",
          secure: true,
          expires: 30,
        });
        window.location.href = "/profile";
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(error.response?.data);
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setErrorMessage("");
    if (!isVerification) {
      if (registerForm.name.length < 2) {
        setErrorMessage("Ім'я користувача має бути більше ніж 2 символи.");
        return;
      }
      if (registerForm.password.length < 8) {
        setErrorMessage("Пароль має бути принаймі більше ніж 8 символів.");
        return;
      }
      setIsLoading(true);
      verifyEmail();
    } else {
      setIsLoading(true);
      registerUser();
    }
  };

  return !isVerification ? (
    <>
      <div className="input-wrap">
        <input
          type="text"
          id="name"
          value={registerForm.name}
          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
          placeholder=" "
        />
        <label htmlFor="name">Ім'я користувача</label>
      </div>

      <div className="input-wrap">
        <input
          type="email"
          id="email"
          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
          value={registerForm.email}
          placeholder=" "
        />
        <label htmlFor="email">Пошта</label>
      </div>

      <div className="input-wrap">
        <input
          type="password"
          id="password"
          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
          value={registerForm.password}
          placeholder=" "
        />
        <label htmlFor="password">Пароль</label>
      </div>

      <button className="sign-btn" onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? <span className="spinner"></span> : "Зареєструватись"}
      </button>
      {errorMessage && <p className="text-red-600 text-sm mt-2">{errorMessage}</p>}
    </>
  ) : (
    <>
      <div>
        <div className="input-wrap">
          <input type="password" id="verification" onChange={(e) => setRegisterForm({ ...registerForm, userKey: e.target.value })} placeholder=" " />
          <label htmlFor="verification">Верифікаційний код</label>
        </div>
        <button className="sign-btn" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <span className="spinner"></span> : "Підтвердити"}
        </button>
        {errorMessage && <p className="text-red-600 text-sm mt-2">{errorMessage}</p>}
      </div>
      <div className="mt-7 text-sm">
        На пошту <span className="text-blue-400">{registerForm.email} </span>
        було надіслано лист з кодом
      </div>
      <div className="mt-4 text-sm" style={{ color: "var(--secondary-text-color)" }}>
        Ввели не ту пошту?{" "}
        <button className="toggle" style={{ fontSize: "14px" }} onClick={() => setIsVerification(false)}>
          Повернутись назад
        </button>
      </div>
    </>
  );
}
