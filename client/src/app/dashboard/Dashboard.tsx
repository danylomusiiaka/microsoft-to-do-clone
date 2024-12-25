"use client";
import React, { useEffect, useState } from "react";
import DonutChart from "./DonutChart";
import { Task } from "@/interfaces/TaskInterface";
import { useTodoFunctions } from "@/components/functions/todosFunctions";
import { User } from "@/interfaces/UserInterface";

interface ChartData {
  labels: string[];
  data: number[];
  colors: string[];
}

export default function Dashboard({ allTodos, userData }: { allTodos: Task[]; userData: User }) {
  const { formatForChart } = useTodoFunctions();
  const [chartData, setChartData] = useState<ChartData>({ labels: [], data: [], colors: [] });
  const [toggleStats, setToggleStats] = useState("status");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (allTodos.length > 0) {
      if (toggleStats == "status") {
        const statusChart = formatForChart(allTodos, "status", userData);
        setChartData(statusChart);
      } else if (toggleStats == "priority") {
        const priorityChart = formatForChart(allTodos, "priority", userData);
        setChartData(priorityChart);
      }
    }
    setIsLoading(false);
  }, [toggleStats]);

  return (
    <main className='md:p-12 md:pr-0 md:mt-0 mt-5 w-full scroll-container-profile'>
      <h1 className='text-5xl font-bold'>Статистика</h1>
      <p className='my-3 mb-6 '>
        {userData.team ? `для команди ${userData.team}` : `для користувача ${userData.name}`}
      </p>
      <div className='flex space-x-4 mb-5'>
        <button
          className='px-4 py-2 rounded-md font-semibold shadow-md hover:opacity-90 active:translate-y-1 transform'
          style={{ backgroundColor: "var(--secondary-background-color)" }}
          onClick={() => setToggleStats("status")}
        >
          По статусам
        </button>
        <button
          className='px-4 py-2 rounded-md font-semibold shadow-md hover:opacity-90 active:translate-y-1 transform'
          style={{ backgroundColor: "var(--secondary-background-color)" }}
          onClick={() => setToggleStats("priority")}
        >
          По пріорітетності
        </button>
      </div>

      {isLoading ? (
        <div className='loading-container flex flex-col h-5/6'>
          <div className='loader'>
            <div></div>
            <div></div>
            <div></div>
          </div>
          Завантажуємо вашу статистику
        </div>
      ) : (
        <>
          {allTodos.length > 0 ? (
            <section className='flex flex-wrap xl:space-x-6  md:space-y-0 space-y-3'>
              <div
                className='p-3 md:w-96 w-full space-y-3 shadow-md'
                style={{ backgroundColor: "var(--secondary-background-color)" }}
              >
                {chartData.labels.map((status, index) => (
                  <div key={index} className='flex justify-between space-x-2'>
                    <div className='flex items-center space-x-2'>
                      <span
                        className='w-4 h-4 inline-block'
                        style={{ backgroundColor: chartData.colors[index] }}
                      ></span>
                      <p className='truncated-text'>{status} </p>
                    </div>
                    <p>{chartData.data[index]}</p>
                  </div>
                ))}
              </div>
              <div
                className='p-3 md:w-fit w-full space-y-5 mt-3 shadow-md'
                style={{ backgroundColor: "var(--secondary-background-color)" }}
              >
                <p className='text-xl mt-3'>Кругова діаграма</p>
                <DonutChart
                  data={chartData.data}
                  inputLabels={chartData.labels}
                  backgroundColors={chartData.colors}
                />
              </div>
            </section>
          ) : (
            <div className='md:flex justify-center items-center w-full space-x-6 h-4/6'>
              <img src='/not-found.gif' alt='cat-not-found' className='w-60 h-60' />
              <div className='space-y-4'>
                <h1 className='text-3xl font-semibold'>
                  Отакої! Схоже статистики не було знайдено
                </h1>
                <p>Зверніть увагу на наступні кроки:</p>
                <ul className='list-disc pl-5 space-y-2'>
                  <li>чи Ви створили хоча б одне завдання</li>
                  <li>чи в тому Ви контексті, де створені завдання</li>
                </ul>
                <div className='pt-3 w-fit'>
                  <a
                    href='/'
                    className='bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  >
                    Повернутись на головну
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
