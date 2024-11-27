import Axios from "axios";
import React, { useState } from "react";

interface InputActiveState {
  signInEmail: boolean;
  signInPassword: boolean;
}

export default function Login() {
  const [isInputActive, setInputActive] = useState({
    signInEmail: false,
    signInPassword: false,
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFocus = (field: keyof InputActiveState) => {
    setInputActive((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof InputActiveState, event: React.FocusEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setInputActive((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setErrorMessage("");

    setIsLoading(true);
    try {
      const response = await Axios.post(
        `http://localhost:3001/user/login`,
        {
          email: loginForm.email,
          password: loginForm.password,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        window.location.href = "/";
      }
    } catch (error: any) {
      if (error.response) {
        setErrorMessage(error.response.data);
      }
    }
  };

  return (
    <>
      <div className='input-wrap'>
        <input
          type='email'
          className={`input-field ${isInputActive.signInEmail ? "active" : ""}`}
          onFocus={() => handleFocus("signInEmail")}
          onBlur={(e) => handleBlur("signInEmail", e)}
          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
          autoComplete='email'
        />
        <label>Пошта</label>
      </div>

      <div className='input-wrap'>
        <input
          type='password'
          className={`input-field ${isInputActive.signInPassword ? "active" : ""}`}
          onFocus={() => handleFocus("signInPassword")}
          onBlur={(e) => handleBlur("signInPassword", e)}
          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
        />
        <label>Пароль</label>
      </div>

      <button className='sign-btn' onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? <span className='spinner'></span> : "Увійти"}
      </button>
      {errorMessage && <p className='text-red-600 text-sm mt-2'>{errorMessage}</p>}
    </>
  );
}
