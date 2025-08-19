// src/pages/Inventory.tsx
import React, { useState, useMemo } from 'react';
import { useInventoryStore, useSalesStore, Distributor } from '@/stores';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, DollarSign, Package, Calendar, Phone, Boxes } from 'lucide-react';

// 组件：经销商详情卡片
const DistributorDetails = ({ distributor }: { distributor: Distributor | null }) => {
  if (!distributor) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{distributor.name}</CardTitle>
        <CardDescription>{distributor.region}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p className="flex items-center"><User className="h-4 w-4 mr-2 text-muted-foreground" />联系人: {distributor.contactPerson}</p>
        <p className="flex items-center"><Phone className="h-4 w-4 mr-2 text-muted-foreground" />联系电话: {distributor.phone}</p>
      </CardContent>
    </Card>
  );
};

// 主页面组件
const Inventory: React.FC = () => {
  // 从 zustand store 获取数据和方法
  const { products } = useInventoryStore();
  const { distributors, getSalesByDistributor } = useSalesStore();
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);

  // 计算总库存指标
  const totalStockQuantity = useMemo(() => products.reduce((sum, p) => sum + p.quantity, 0), [products]);
  const totalStockValue = useMemo(() => products.reduce((sum, p) => sum + p.quantity * p.price, 0), [products]);
  const totalCategories = useMemo(() => new Set(products.map(p => p.category)).size, [products]);

  // 根据选择的经销商筛选销售历史
  const selectedDistributor = useMemo(() => distributors.find(d => d.id === selectedDistributorId) || null, [distributors, selectedDistributorId]);
  const salesHistory = useMemo(() => selectedDistributorId ? getSalesByDistributor(selectedDistributorId) : [], [getSalesByDistributor, selectedDistributorId]);
  const totalSalesValue = useMemo(() => salesHistory.reduce((acc, order) => acc + order.totalValue, 0), [salesHistory]);

  return (
    <div className="space-y-6">
      {/* 第一部分：库存总览 */}
      <h1 className="text-3xl font-bold">库存与销售总览</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Boxes className="h-5 w-5" />库存总数</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalStockQuantity.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />库存总价值</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">${totalStockValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />产品种类</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalCategories}</p></CardContent>
        </Card>
      </div>

      {/* 第二部分：经销商销售查询 */}
      <Card>
        <CardHeader>
          <CardTitle>经销商销售业绩查询</CardTitle>
          <CardDescription>选择一个经销商以查看其详细的销售历史和总额。</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedDistributorId}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder="通过经销商名称或ID搜索..." />
            </SelectTrigger>
            <SelectContent>
              {distributors.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedDistributor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <DistributorDetails distributor={selectedDistributor} />
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />总销售额</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">${totalSalesValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p></CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />销售历史记录</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>产品</TableHead><TableHead className="text-right">数量</TableHead><TableHead className="text-right">总金额</TableHead><TableHead>订单日期</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {salesHistory.length > 0 ? (
                      salesHistory.map(order => (
                        <TableRow key={order.orderId}>
                          <TableCell className="font-medium">{order.productName}</TableCell>
                          <TableCell className="text-right">{order.quantity}</TableCell>
                          <TableCell className="text-right">${order.totalValue.toFixed(2)}</TableCell>
                          <TableCell>{order.orderDate.toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={4} className="text-center h-24">未找到该经销商的销售记录。</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;