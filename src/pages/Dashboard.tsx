import React, { useEffect, useState } from 'react';
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
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'daily' | 'monthly'>('weekly');
  const { products, loadInventory, loading: inventoryLoading } = useInventoryStore();
  const { addNotification } = useUIStore();

  // Calculate metrics
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.status === 'low-stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out-of-stock').length;
  const pendingOrders = 12; // Mock data
  const warehouseCapacity = 85; // Mock percentage
  const metricsLoading = inventoryLoading && products.length === 0;

  const totalProductsValue = metricsLoading ? '...' : totalProducts.toString();
  const lowStockValue = metricsLoading ? '...' : lowStockCount.toString();
  const pendingOrdersValue = pendingOrders.toString();
  const capacityValue = metricsLoading ? '...' : `${warehouseCapacity}%`;

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const recentActivities = [
    {
      id: '1',
      action: '库存已更新',
      item: 'iPhone 14 Pro',
      time: '2分钟前',
      type: 'update'
    },
    {
      id: '2',
      action: '订单已处理',
      item: 'Order #WH-2024-045',
      time: '15分钟前',
      type: 'order'
    },
    {
      id: '3',
      action: '低库存警报',
      item: 'Samsung Galaxy S23',
      time: '1小时前',
      type: 'alert'
    },
    {
      id: '4',
      action: '新增产品',
      item: 'Office Desk Pro',
      time: '2小时前',
      type: 'add'
    }
  ];

  const aiInsights = [
    {
      title: '需求预测',
      message: '预计下周 iPhone 14 Pro 需求将增加 25%',
      confidence: 92
    },
    {
      title: '库存优化',
      message: '将高需求商品移至 A 区可提升 15% 效率',
      confidence: 88
    },
    {
      title: '异常检测',
      message: '检测到 FURN-OC-001 异常退货模式',
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
            <h1 className="text-3xl font-bold mb-2">仓库 AI 仪表盘</h1>
            <p className="text-lg opacity-90">
              实时洞察与 AI 驱动的仓库管理
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="产品总数"
          value={totalProductsValue}
          change={{ value: '12%', type: 'increase' }}
          icon={Package}
          variant="default"
        />
        <MetricsCard
          title="低库存警报"
          value={lowStockValue}
          change={{ value: '3', type: 'decrease' }}
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricsCard
          title="待处理订单"
          value={pendingOrdersValue}
          change={{ value: '8%', type: 'increase' }}
          icon={ShoppingCart}
          variant="default"
        />
        <MetricsCard
          title="仓库容量使用率"
          value={capacityValue}
          change={{ value: '5%', type: 'increase' }}
          icon={Warehouse}
          variant={warehouseCapacity > 90 ? 'error' : warehouseCapacity > 75 ? 'warning' : 'success'}
        />
      </div>

     {/* 2. 将图表用 Card 包裹，并添加切换按钮 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>销售与库存趋势</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant={timePeriod === 'daily' ? 'secondary' : 'outline'} size="sm" onClick={() => setTimePeriod('daily')}>
              按天
            </Button>
            <Button variant={timePeriod === 'weekly' ? 'secondary' : 'outline'} size="sm" onClick={() => setTimePeriod('weekly')}>
              按周
            </Button>
            <Button variant={timePeriod === 'monthly' ? 'secondary' : 'outline'} size="sm" onClick={() => setTimePeriod('monthly')}>
              按月
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pl-2 pt-6">
          <DashboardCharts timePeriod={timePeriod} />
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>最近活动</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              查看全部
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
              <span>AI 洞察</span>
            </CardTitle>
            <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10">
              <TrendingUp className="h-3 w-3 mr-1" />
              实时
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      置信度 {insight.confidence}%
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
