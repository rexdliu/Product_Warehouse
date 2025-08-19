import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for charts
const inventoryTrendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Stock Levels',
      data: [850, 920, 780, 1100, 950, 1020],
      borderColor: 'hsl(var(--primary))',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      tension: 0.4,
    },
    {
      label: 'Orders',
      data: [200, 280, 350, 420, 380, 460],
      borderColor: 'hsl(var(--accent))',
      backgroundColor: 'hsl(var(--accent) / 0.1)',
      tension: 0.4,
    },
  ],
};

const categoryData = {
  labels: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Home & Garden'],
  datasets: [
    {
      data: [35, 25, 20, 12, 8],
      backgroundColor: [
        'hsl(var(--primary))',
        'hsl(var(--accent))',
        'hsl(var(--success))',
        'hsl(var(--warning))',
        'hsl(var(--muted))',
      ],
      borderWidth: 0,
    },
  ],
};

const movementData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Items Moved',
      data: [120, 190, 300, 500, 200, 300, 150],
      backgroundColor: 'hsl(var(--primary))',
      borderRadius: 4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'hsl(var(--border))',
      },
    },
    x: {
      grid: {
        color: 'hsl(var(--border))',
      },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};

export const DashboardCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inventory Trends */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Inventory Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={inventoryTrendData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Product Movement */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Product Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <Bar data={movementData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Stock by Category</CardTitle>
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