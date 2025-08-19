import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  Warehouse,
  TrendingUp,
  Clock,
  Brain
} from 'lucide-react';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInventoryStore, useUIStore } from '@/stores';
import warehouseHero from '@/assets/warehouse-hero.jpg';

const Dashboard: React.FC = () => {
  const { products } = useInventoryStore();
  const { addNotification } = useUIStore();

  // Calculate metrics
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.status === 'low-stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out-of-stock').length;
  const pendingOrders = 12; // Mock data
  const warehouseCapacity = 85; // Mock percentage

  const recentActivities = [
    {
      id: '1',
      action: 'Stock Updated',
      item: 'iPhone 14 Pro',
      time: '2 minutes ago',
      type: 'update'
    },
    {
      id: '2',
      action: 'Order Processed',
      item: 'Order #WH-2024-045',
      time: '15 minutes ago',
      type: 'order'
    },
    {
      id: '3',
      action: 'Low Stock Alert',
      item: 'Samsung Galaxy S23',
      time: '1 hour ago',
      type: 'alert'
    },
    {
      id: '4',
      action: 'Product Added',
      item: 'Office Desk Pro',
      time: '2 hours ago',
      type: 'add'
    }
  ];

  const aiInsights = [
    {
      title: 'Demand Prediction',
      message: 'iPhone 14 Pro demand expected to increase 25% next week',
      confidence: 92
    },
    {
      title: 'Stock Optimization',
      message: 'Move high-demand items to Zone A for 15% efficiency gain',
      confidence: 88
    },
    {
      title: 'Anomaly Detection',
      message: 'Unusual return pattern detected for FURN-OC-001',
      confidence: 85
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-lg overflow-hidden">
        <img 
          src={warehouseHero} 
          alt="Warehouse"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60 flex items-center">
          <div className="text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Warehouse AI Dashboard</h1>
            <p className="text-lg opacity-90">
              Real-time insights and AI-powered warehouse management
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Products"
          value={totalProducts.toString()}
          change={{ value: '12%', type: 'increase' }}
          icon={Package}
          variant="default"
        />
        <MetricsCard
          title="Low Stock Alerts"
          value={lowStockCount.toString()}
          change={{ value: '3', type: 'decrease' }}
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricsCard
          title="Pending Orders"
          value={pendingOrders.toString()}
          change={{ value: '8%', type: 'increase' }}
          icon={ShoppingCart}
          variant="default"
        />
        <MetricsCard
          title="Capacity Used"
          value={`${warehouseCapacity}%`}
          change={{ value: '5%', type: 'increase' }}
          icon={Warehouse}
          variant={warehouseCapacity > 90 ? 'error' : warehouseCapacity > 75 ? 'warning' : 'success'}
        />
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activities</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === 'alert' ? 'bg-warning' :
                      activity.type === 'order' ? 'bg-success' :
                      activity.type === 'add' ? 'bg-primary' : 'bg-muted'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.item}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Insights</span>
            </CardTitle>
            <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10">
              <TrendingUp className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confident
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.message}</p>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-1 rounded-full transition-all duration-500"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;