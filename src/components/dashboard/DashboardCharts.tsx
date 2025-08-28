import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Register all necessary components for Chart.js
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

// --- DATA PROCESSING LOGIC ---
const generateChartData = (period: 'daily' | 'weekly' | 'monthly') => {
  let labels: string[] = [];
  let inventoryLevels: number[] = [];
  let salesData: number[] = [];
  let movementDataPoints: number[] = [];

  switch (period) {
    case 'daily':
      labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
      inventoryLevels = [1020, 1010, 1015, 1005, 990, 995, 1000];
      salesData = [20, 25, 15, 30, 28, 35, 40];
      movementDataPoints = [25, 30, 45, 50, 40, 60, 70];
      break;
    case 'weekly':
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      inventoryLevels = [950, 1020, 980, 1050];
      salesData = [150, 180, 160, 200];
      movementDataPoints = [300, 500, 450, 550];
      break;
    case 'monthly':
    default:
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      inventoryLevels = [850, 920, 780, 1100, 950, 1020];
      salesData = [110, 150, 250, 200, 310, 380];
      movementDataPoints = [1200, 1900, 3000, 2500, 3500, 4200];
      break;
  }

  return {
    inventoryTrendData: {
      labels,
      datasets: [
        {
          label: '库存量', // 标签保持为“库存量”
          data: inventoryLevels,
          borderColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--primary) / 0.1)',
          tension: 0.4,
          fill: false, // 确保不填充
        },
        {
          label: '销售额',
          data: salesData,
          borderColor: 'hsl(var(--accent))',
          backgroundColor: 'hsl(var(--accent) / 0.1)',
          tension: 0.4,
          fill: false, // 确保不填充
        },
      ],
    },
    movementData: {
      labels,
      datasets: [
        {
          label: '移动物品数',
          data: movementDataPoints,
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: 4,
        },
      ],
    }
  };
};

// --- CHART OPTIONS (Simplified) ---
// 移除了复杂的 onClick 逻辑，恢复 Chart.js 默认行为
const chartOptions: ChartOptions<'line' | 'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'hsl(var(--border))' } }
  }
};

const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};

const categoryData = {
    labels: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Home & Garden'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
            'rgb(59, 130, 246)', 'rgb(239, 68, 68)', 'rgb(34, 197, 94)',
            'rgb(245, 158, 11)', 'rgb(168, 85, 247)'
        ],
        borderWidth: 0,
      },
    ],
};

// --- COMPONENT ---
interface DashboardChartsProps {
  timePeriod: 'daily' | 'weekly' | 'monthly';
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ timePeriod }) => {
  const { inventoryTrendData, movementData } = generateChartData(timePeriod);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>库存/销售趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={inventoryTrendData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>产品动向</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <Bar data={movementData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>库存种类</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};