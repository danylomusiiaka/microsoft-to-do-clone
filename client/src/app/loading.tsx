import React from "react";

export default function Loading() {
  return (
    <div className="loading-container flex flex-col">
      <div className="loader">
        <div></div>
        <div></div>
        <div></div>
      </div>
      Ми завантажуємо ваш todo
    </div>
  );
}
