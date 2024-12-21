import Chart from "chart.js/auto";
import { useEffect, useRef } from "react";

interface DonutChartProps {
  data: number[];
  backgroundColors: string[];
  inputLabels: string[];
}

export default function DonutChart({ data, backgroundColors, inputLabels }: DonutChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart<"doughnut", number[], string> | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const myCharRef = chartRef.current.getContext("2d");
      if (myCharRef) {
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
      }
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, backgroundColors, inputLabels]);

  return (
    <div className='md:w-96 w-full'>
      <canvas ref={chartRef} />
    </div>
  );
}
