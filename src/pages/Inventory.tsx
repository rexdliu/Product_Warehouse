// src/pages/Inventory.tsx
import React, { useState, useMemo } from 'react';
import { useInventoryStore, useSalesStore, Distributor } from '@/stores';
import { useLocaleStore } from '@/stores/localeStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, DollarSign, Package, Calendar, Phone, Boxes, Filter, Search } from 'lucide-react';

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
  const { t } = useLocaleStore();
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  // 计算总库存指标
  const totalStockQuantity = useMemo(() => products.reduce((sum, p) => sum + p.quantity, 0), [products]);
  const totalStockValue = useMemo(() => products.reduce((sum, p) => sum + p.quantity * p.price, 0), [products]);
  const totalCategories = useMemo(() => new Set(products.map(p => p.category)).size, [products]);

  // 根据选择的经销商筛选销售历史
  const selectedDistributor = useMemo(() => distributors.find(d => d.id === selectedDistributorId) || null, [distributors, selectedDistributorId]);
  const salesHistory = useMemo(() => {
    if (!selectedDistributorId) return [];
    let history = getSalesByDistributor(selectedDistributorId);
    
    // Apply date filter
    if (dateFilter) {
      history = history.filter(order => 
        order.orderDate.toISOString().split('T')[0] >= dateFilter
      );
    }
    
    // Apply product filter
    if (productFilter) {
      history = history.filter(order => 
        order.productName.toLowerCase().includes(productFilter.toLowerCase())
      );
    }
    
    return history;
  }, [getSalesByDistributor, selectedDistributorId, dateFilter, productFilter]);
  const totalSalesValue = useMemo(() => salesHistory.reduce((acc, order) => acc + order.totalValue, 0), [salesHistory]);

  return (
    <div className="space-y-6">
      {/* 第一部分：库存总览 */}
      <h1 className="text-3xl font-bold">{t('inventory.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Boxes className="h-5 w-5" />{t('inventory.totalStock')}</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalStockQuantity.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />{t('inventory.totalValue')}</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">${totalStockValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />{t('inventory.categories')}</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalCategories}</p></CardContent>
        </Card>
      </div>

      {/* 第二部分：经销商销售查询 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('inventory.salesQuery')}</CardTitle>
          <CardDescription>{t('inventory.salesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedDistributorId}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder={t('inventory.searchPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {distributors.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedDistributorId && (
            <div className="mt-4 flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">{t('common.filter')} by Date:</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">{t('common.filter')} by Product:</label>
                <Input
                  placeholder={t('inventory.product')}
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setDateFilter('');
                    setProductFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDistributor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <DistributorDetails distributor={selectedDistributor} />
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />{t('inventory.totalSales')}</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">${totalSalesValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p></CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />{t('inventory.salesHistory')}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>{t('inventory.product')}</TableHead><TableHead className="text-right">{t('inventory.quantity')}</TableHead><TableHead className="text-right">{t('inventory.amount')}</TableHead><TableHead>{t('inventory.orderDate')}</TableHead></TableRow></TableHeader>
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
                      <TableRow><TableCell colSpan={4} className="text-center h-24">{t('inventory.noRecords')}</TableCell></TableRow>
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