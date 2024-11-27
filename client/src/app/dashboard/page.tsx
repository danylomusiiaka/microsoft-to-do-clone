"use client";

import NavSidebar from "@/components/structure/NavSidebar";
import { useTodos } from "@/contexts/TodosContext";
import DonutChart from "./DonutChart";
import { useEffect, useState } from "react";
import { useTodoFunctions } from "@/components/functions/todosFunctions";
import Loading from "../loading";
import Axios from "axios";

interface ChartData {
  labels: string[];
  data: number[];
}

export default function Favorite() {
  const { todos, setTodos } = useTodos();
  const { formatForChart } = useTodoFunctions();

  const [chartData, setChartData] = useState<{
    status: ChartData;
    priority: ChartData;
  }>({
    status: { labels: [], data: [] },
    priority: { labels: [], data: [] },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Axios.get("http://localhost:5101/api/tasks");
        const fetchedTodos = response.data;

        setTodos(fetchedTodos);

        const statusChart = formatForChart(fetchedTodos, "status");
        const priorityChart = formatForChart(fetchedTodos, "priority");

        setChartData({
          status: statusChart,
          priority: priorityChart,
        });
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <div className='flex justify-between'>
        <NavSidebar />

        <div className='md:hidden'>
          <p>Показати діаграму</p>
          <button>Кругову</button>
          <button>Стовпчикову</button>
        </div>
      </div>
      <section className='md:p-12 md:mt-0 mt-5'>
        <h1 className='text-5xl font-bold'>Статистика</h1>
        <p className='mt-3'>для списку Завдання</p>
        <div className='md:flex items-center md:space-x-10 mt-2'>
          <DonutChart
            data={chartData.status.data}
            inputLabels={chartData.status.labels}
            backgroundColors={["#a16207", "#22c55e", "#eab308"]}
          />

          <DonutChart
            data={chartData.priority.data}
            inputLabels={chartData.priority.labels}
            backgroundColors={["#eab308", "#ef4444", "#3b82f6"]}
          />
        </div>
        <div className='hidden md:visible'>
          <p>Показати діаграму</p>
          <button>Кругову</button>
          <button>Стовпчикову</button>
        </div>
      </section>
    </>
  );
}
