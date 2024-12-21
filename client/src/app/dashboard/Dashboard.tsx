"use client";
import React, { useEffect, useState } from "react";
import DonutChart from "./DonutChart";
import { Task } from "@/interfaces/TaskInterface";
import { useTodoFunctions } from "@/components/functions/todosFunctions";
import { User } from "@/interfaces/UserInterface";

interface ChartData {
  labels: string[];
  data: number[];
}

export default function Dashboard({ allTodos, userData }: { allTodos: Task[]; userData: User }) {
  const { formatForChart } = useTodoFunctions();
  const [chartData, setChartData] = useState<{
    status: ChartData;
    priority: ChartData;
  }>({
    status: { labels: [], data: [] },
    priority: { labels: [], data: [] },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (allTodos.length > 0) {
      const statusChart = formatForChart(allTodos, "status");
      const priorityChart = formatForChart(allTodos, "priority");
      console.log(statusChart);

      setChartData({
        status: statusChart,
        priority: priorityChart,
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [allTodos]);

  console.log(chartData.priority);

  return (
    <main className='md:p-12 md:pr-0 md:mt-0 mt-5 w-full'>
      <h1 className='text-5xl font-bold'>Статистика</h1>
      <p className='my-3 mb-6 '>
        {userData.team ? `для команди ${userData.team}` : `для користувача ${userData.name}`}
      </p>

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
            <section className='flex flex-wrap xl:space-x-6  space-y-3'>
              <div
                className='p-3 md:w-fit w-full space-y-3 mt-3'
                style={{ backgroundColor: "var(--secondary-background-color)" }}
              >
                <div className='flex items-center flex-wrap space-y-3'>
                  <p className='mt-3'>Всього </p>
                  <span className='flex mx-2 w-20 items-center justify-center rounded-xl text-sm h-5 bg-yellow-700'>
                    to do
                  </span>
                  <p>завдань: {chartData.status.data[0] + chartData.status.data[1]}</p>
                </div>
                <div className='flex items-center flex-wrap  space-y-3'>
                  <p className='mt-3'>З них</p>
                  <span className='flex mx-2 w-20 items-center justify-center rounded-xl text-sm h-5 bg-green-500'>
                    done
                  </span>
                  <p>вже {chartData.status.data[2]} та</p>
                  <span className='flex mx-2 w-20 items-center justify-center rounded-xl text-nowrap text-sm h-5 bg-yellow-500'>
                    in progress
                  </span>
                  <p>є {chartData.status.data[1]}</p>
                </div>
                <DonutChart
                  data={chartData.status.data}
                  inputLabels={chartData.status.labels}
                  backgroundColors={["#a16207", "#eab308", "#22c55e"]}
                />
              </div>
              <div
                className='p-3 md:w-fit w-full space-y-3'
                style={{ backgroundColor: "var(--secondary-background-color)" }}
              >
                <div className='flex items-center flex-wrap space-y-3'>
                  <p className='mt-3'>Завдань з </p>
                  <span className='flex mx-2 w-20 items-center justify-center rounded-xl text-sm h-5 bg-red-500'>
                    high
                  </span>
                  <p>пріорітетністю: {chartData.priority.data[2]}</p>
                </div>
                <div className='flex items-center flex-wrap space-y-3'>
                  <p className='mt-3'>З них</p>
                  <span className='flex mx-2 w-20 items-center justify-center rounded-xl text-sm h-5 bg-yellow-500'>
                    medium
                  </span>
                  <p> всього {chartData.priority.data[1]} та</p>
                  <span className='flex mx-2 w-20 items-center justify-center rounded-xl text-nowrap text-sm h-5 bg-blue-500'>
                    low
                  </span>
                  <p>є {chartData.priority.data[0]}</p>
                </div>
                <DonutChart
                  data={chartData.priority.data}
                  inputLabels={chartData.priority.labels}
                  backgroundColors={["#3b82f6", "#eab308", "#ef4444", "#a8a29e"]}
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
