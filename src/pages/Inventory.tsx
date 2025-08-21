// 页面：库存总览 + 经销商销售查询
// 要点：
// 1) 把筛选输入交给独立组件 <SalesHistoryFilter /> 收集；
// 2) 页面内通过 useMemo 在内存中做过滤（小数据量）；
//    —— 大数据量时建议把过滤条件带到后端分页查询（更稳更快）；
// 3) 日期过滤使用 date-fns 的 startOfDay/endOfDay/isWithinInterval，避免时区边界坑；
// 4) i18n 使用 useTranslation().t()，替换之前无效的 {('xxx')} 写法。
// src/pages/Inventory.tsx
import React, { useState, useMemo } from 'react';
import { useInventoryStore, useSalesStore, Distributor } from '@/stores';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { User, DollarSign, Package, Calendar as CalendarIcon, Phone, Boxes,  } from 'lucide-react';
import { SalesHistoryFilter } from '@/components/inventory/SalesHistoryFilter';
import type { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { useTranslation } from 'react-i18next';
 import i18n from '@/lib/i18n';

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
type SalesFilters = { dateRange?: DateRange; productName?: string };
// 主页面组件
const Inventory: React.FC = () => {
  // 国际化钩子(翻译函数)
    const { t } = useTranslation();
  // 从 zustand store 获取数据和方法
  const { products } = useInventoryStore();
  const { distributors, getSalesByDistributor } = useSalesStore();
   // 页面级本地状态：当前选中的经销商 + 筛选条件
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SalesFilters>({});

console.log('i18n language =', i18n.language);
console.log('demo =', t('inventory.totalStockQuantity'));


  // 计算总库存指标
  const totalStockQuantity = useMemo(() => products.reduce((sum, p) => sum + p.quantity, 0), [products]);
  const totalStockValue = useMemo(() => products.reduce((sum, p) => sum + p.quantity * p.price, 0), [products]);
  const totalCategories = useMemo(() => new Set(products.map(p => p.category)).size, [products]);

  // 当前选中的经销商信息
  const selectedDistributor = useMemo(
    () => distributors.find((d) => d.id === selectedDistributorId) || null,
    [distributors, selectedDistributorId]
  );

  // 销售历史过滤（小数据量：前端 useMemo 过滤；大数据量：建议改为后端分页查询）
  const salesHistory = useMemo(() => {
    if (!selectedDistributorId) return [];

    // 先取原始数据
    let history = getSalesByDistributor(selectedDistributorId);

    // 取出筛选条件
    const { dateRange, productName } = filters;

    // 日期范围过滤：包含端点（startOfDay ~ endOfDay），避免时区边界问题
    if (dateRange?.from || dateRange?.to) {
      const start = startOfDay(dateRange?.from ?? new Date(0)); // 没选 from 则取时间最小
      const end = endOfDay(dateRange?.to ?? new Date());        // 没选 to 则取今天
      history = history.filter((o) =>
        isWithinInterval(o.orderDate, { start, end })
      );
    }

    // 产品名关键词（大小写不敏感 & 去首尾空格）
    if (productName && productName.trim()) {
      const q = productName.trim().toLowerCase();
      history = history.filter((o) => o.productName.toLowerCase().includes(q));
    }

    return history;
  }, [getSalesByDistributor, selectedDistributorId, filters]);

  // 当前筛选下的销售总额
  const totalSalesValue = useMemo(
    () => salesHistory.reduce((acc, o) => acc + o.totalValue, 0),
    [salesHistory]
  );

  return (
    <div className="space-y-6">
      {/* ====== 1) 库存总览卡片 ====== */}
      <h1 className="text-3xl font-bold">{t('inventory.overview')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 总库存数量 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              {t('inventory.totalStockQuantity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStockQuantity.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* 库存总价值 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('inventory.totalValue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${totalStockValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* 品类数 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('inventory.categories')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCategories}</p>
          </CardContent>
        </Card>
      </div>

      {/* ====== 2) 经销商选择 + 筛选器 ====== */}
      <Card>
        <CardHeader>
          <CardTitle>{t('inventory.salesQuery')}</CardTitle>
          <CardDescription>{t('inventory.salesDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 经销商下拉选择 */}
          <Select onValueChange={setSelectedDistributorId}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder={t('inventory.searchPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {distributors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 选中经销商后展示筛选器（产品名 + 日期范围） */}
          {selectedDistributorId && (
            <>
              {/* 独立筛选器组件：只负责输入与回传 */}
              <SalesHistoryFilter onFilterChange={setFilters} />

              {/* 一键清空筛选条件 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({})}
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                {t('清除')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* ====== 3) 经销商详情 + 销售历史表格 ====== */}
      {selectedDistributor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：经销商信息 + 当前筛选下总销售额 */}
          <div className="lg:col-span-1 space-y-6">
            <DistributorDetails distributor={selectedDistributor} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {t('inventory.totalSales')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  ${totalSalesValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：销售历史表格 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {t('inventory.salesHistory')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('inventory.product')}</TableHead>
                      <TableHead className="text-right">{t('inventory.quantity')}</TableHead>
                      <TableHead className="text-right">{t('inventory.amount')}</TableHead>
                      <TableHead>{t('inventory.orderDate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesHistory.length ? (
                      salesHistory.map((order) => (
                        <TableRow key={order.orderId}>
                          <TableCell className="font-medium">{order.productName}</TableCell>
                          <TableCell className="text-right">{order.quantity}</TableCell>
                          <TableCell className="text-right">${order.totalValue.toFixed(2)}</TableCell>
                          <TableCell>{order.orderDate.toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          {t('inventory.noRecords')}
                        </TableCell>
                      </TableRow>
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