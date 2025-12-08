import { useEffect, useRef } from "react";

interface DonutChartProps {
  data: number[];
  backgroundColors: string[];
  inputLabels: string[];
}

export default function DonutChart({ data, backgroundColors, inputLabels }: DonutChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<any | null>(null);

  useEffect(() => {
    const loadChart = async () => {
      const Chart = (await import("chart.js/auto")).default;

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
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
                  display: false,
                  position: "right",
                },
              },
            },
          });
        }
      }
    };

    loadChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, backgroundColors, inputLabels]);

  return (
    <div className="md:w-96 w-full">
      <canvas ref={chartRef} />
    </div>
  );
}
