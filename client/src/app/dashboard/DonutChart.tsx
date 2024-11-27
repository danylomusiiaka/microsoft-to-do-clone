import Chart from "chart.js/auto";
import { useEffect, useRef, useState } from "react";

interface DonutChartProps {
  data: number[];
  backgroundColors: string[];
  inputLabels: string[];
}

export default function DonutChart({ data, backgroundColors, inputLabels }: DonutChartProps) {
  const chartRef = useRef(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const myCharRef = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(myCharRef, {
      type: "doughnut",
      data: {
        labels: inputLabels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: "right",
          },
        },
      },
    });
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className='md:w-96'>
      <canvas ref={chartRef} />
    </div>
  );
}
