import { useState } from "react";
import Axios from "axios";

interface InputActiveState {
  signUpName: boolean;
  signUpEmail: boolean;
  signUpPassword: boolean;
}

export default function Register() {
  const [isInputActive, setInputActive] = useState({
    signUpName: false,
    signUpEmail: false,
    signUpPassword: false,
  });
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
      const response = await Axios.post(`http://localhost:3001/user/verify-email`, {
        email: registerForm.email,
      });
      if (response.status === 200) {
        setHashedKey(response.data.hashedKey);
        setIsVerification(true);
      }
    } catch (error: any) {
      if (error.response) {
        setErrorMessage(error.response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      const response = await Axios.post(
        `http://localhost:3001/user/register`,
        {
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          verificationKey: hashedKey,
          userInputKey: registerForm.userKey,
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = (field: keyof InputActiveState) => {
    setInputActive((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof InputActiveState, event: React.FocusEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setInputActive((prev) => ({ ...prev, [field]: false }));
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
      <div className='input-wrap'>
        <input
          type='text'
          className={`input-field ${isInputActive.signUpName ? "active" : ""}`}
          onFocus={() => handleFocus("signUpName")}
          onBlur={(e) => handleBlur("signUpName", e)}
          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
        />
        <label>Ім'я користувача</label>
      </div>

      <div className='input-wrap'>
        <input
          type='email'
          className={`input-field ${isInputActive.signUpEmail ? "active" : ""}`}
          onFocus={() => handleFocus("signUpEmail")}
          onBlur={(e) => handleBlur("signUpEmail", e)}
          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
          autoComplete='email'
        />
        <label>Пошта</label>
      </div>

      <div className='input-wrap'>
        <input
          type='password'
          className={`input-field ${isInputActive.signUpPassword ? "active" : ""}`}
          onFocus={() => handleFocus("signUpPassword")}
          onBlur={(e) => handleBlur("signUpPassword", e)}
          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
        />
        <label>Пароль</label>
      </div>

      <button className='sign-btn' onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? <span className='spinner'></span> : "Зареєструватись"}
      </button>
      {errorMessage && <p className='text-red-600 text-sm mt-2'>{errorMessage}</p>}
    </>
  ) : (
    <>
      <div>
        <div className='input-wrap'>
          <input
            type='password'
            className={`input-field ${isInputActive.signUpPassword ? "active" : ""}`}
            onFocus={() => handleFocus("signUpPassword")}
            onBlur={(e) => handleBlur("signUpPassword", e)}
            onChange={(e) => setRegisterForm({ ...registerForm, userKey: e.target.value })}
          />
          <label>Верифікаційний код</label>
        </div>
        <button className='sign-btn' onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <span className='spinner'></span> : "Підтвердити"}
        </button>
        {errorMessage && <p className='text-red-600 text-sm mt-2'>{errorMessage}</p>}
      </div>
      <div className='mt-7 text-sm'>
        На пошту <span className='text-blue-400'>{registerForm.email} </span>
        було надіслано лист з кодом
      </div>
      <div className='mt-4 text-sm' style={{ color: "var(--secondary-text-color)" }}>
        Ввели не ту пошту?{" "}
        <button
          className='toggle'
          style={{ fontSize: "14px" }}
          onClick={() => setIsVerification(false)}
        >
          Повернутись назад
        </button>
      </div>
    </>
  );
}
