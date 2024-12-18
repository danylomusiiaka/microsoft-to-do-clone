"use client";
import { useEffect, useState } from "react";
import "@/styles/auth.css";
import Register from "./Register";
import Login from "./Login";
import Slideshow from "./Slideshow";
import Cookies from "js-cookie";
import { useAlert } from "@/contexts/AlertContext";

export default function AuthForms() {
  const [isSignUpMode, setSignUpMode] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (Cookies.get("session-expired")) {
      showAlert("Ваша сесія закінчилась. Увійдіть знову", "warning");
      Cookies.remove("session-expired", { path: "/auth" });
    }
  }, []);

  return (
    <main className={isSignUpMode ? "sign-up-mode" : ""}>
      <div className='box'>
        <div className='inner-box'>
          <section className='forms-wrap'>
            <form className='sign-in-form'>
              <div className='actual-form'>
                <div className='heading mb-10'>
                  <h2>Логін</h2>
                  <h6>Ще не зареєстровані?</h6>
                  <a className='toggle cursor-pointer' onClick={() => setSignUpMode(!isSignUpMode)}>
                    Зареєструйтесь
                  </a>
                </div>
                <Login />
              </div>
            </form>

            <form className='sign-up-form'>
              <div className='actual-form'>
                <div className='heading mb-10'>
                  <h2>Реєстрація</h2>
                  <h6>Вже маєте профіль?</h6>
                  <a className='toggle cursor-pointer' onClick={() => setSignUpMode(!isSignUpMode)}>
                    Увійдіть
                  </a>
                </div>
                <Register />
              </div>
            </form>
          </section>
          <Slideshow />
        </div>
      </div>
    </main>
  );
}
