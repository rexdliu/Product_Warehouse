import { create } from 'zustand';

// Translation interface
export interface Translations {
  [key: string]: string;
}

// Locale data
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.inventory': 'Inventory',
    'nav.warehouse': 'Warehouse Map',
    'nav.analytics': 'Analytics',
    'nav.reports': 'Reports',
    'nav.ai': 'AI Assistant',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'Warehouse Dashboard',
    'dashboard.totalProducts': 'Total Products',
    'dashboard.lowStockAlerts': 'Low Stock Alerts',
    'dashboard.pendingOrders': 'Pending Orders',
    'dashboard.warehouseCapacity': 'Warehouse Capacity',
    'dashboard.inventoryTrends': 'Inventory Trends',
    'dashboard.productMovement': 'Weekly Product Movement',
    'dashboard.stockByCategory': 'Stock by Category',
    'dashboard.aiInsights': 'AI Insights',
    'dashboard.recentActivities': 'Recent Activities',
    'dashboard.quickActions': 'Quick Actions',
    
    // Inventory
    'inventory.title': 'Inventory & Sales Overview',
    'inventory.totalStock': 'Total Stock',
    'inventory.totalValue': 'Total Value',
    'inventory.categories': 'Product Categories',
    'inventory.salesQuery': 'Distributor Sales Query',
    'inventory.salesDescription': 'Select a distributor to view detailed sales history and totals.',
    'inventory.searchPlaceholder': 'Search by distributor name or ID...',
    'inventory.totalSales': 'Total Sales',
    'inventory.salesHistory': 'Sales History',
    'inventory.product': 'Product',
    'inventory.quantity': 'Quantity',
    'inventory.amount': 'Amount',
    'inventory.orderDate': 'Order Date',
    'inventory.noRecords': 'No sales records found for this distributor.',
    
    // AI Assistant
    'ai.title': 'AI Warehouse Assistant',
    'ai.online': 'Online',
    'ai.thinking': 'Thinking...',
    'ai.placeholder': 'Ask about inventory, predictions, or insights...',
    'ai.suggestions.lowStock': 'Show me low stock items',
    'ai.suggestions.demand': 'Predict next week\'s demand',
    'ai.suggestions.optimize': 'Optimize warehouse layout',
    'ai.suggestions.report': 'Generate inventory report',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.refresh': 'Refresh',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.logout': 'Log out',
    
    // Time periods
    'time.weekly': 'Weekly',
    'time.monthly': 'Monthly',
    'time.yearly': 'Yearly',
    'time.daily': 'Daily',
    'time.thisWeek': 'This Week',
    'time.thisMonth': 'This Month',
    'time.thisYear': 'This Year',
    
    // Categories
    'category.electronics': 'Electronics',
    'category.furniture': 'Furniture',
    'category.clothing': 'Clothing',
    'category.books': 'Books',
    'category.homeGarden': 'Home & Garden',
  },
  zh: {
    // Navigation
    'nav.dashboard': '仪表板',
    'nav.inventory': '库存管理',
    'nav.warehouse': '仓库地图',
    'nav.analytics': '数据分析',
    'nav.reports': '报表',
    'nav.ai': 'AI助手',
    'nav.settings': '设置',
    
    // Dashboard
    'dashboard.title': '仓库仪表板',
    'dashboard.totalProducts': '产品总数',
    'dashboard.lowStockAlerts': '低库存警报',
    'dashboard.pendingOrders': '待处理订单',
    'dashboard.warehouseCapacity': '仓库容量',
    'dashboard.inventoryTrends': '库存趋势',
    'dashboard.productMovement': '每周产品移动',
    'dashboard.stockByCategory': '按类别库存',
    'dashboard.aiInsights': 'AI洞察',
    'dashboard.recentActivities': '最近活动',
    'dashboard.quickActions': '快速操作',
    
    // Inventory
    'inventory.title': '库存与销售总览',
    'inventory.totalStock': '库存总数',
    'inventory.totalValue': '库存总价值',
    'inventory.categories': '产品种类',
    'inventory.salesQuery': '经销商销售业绩查询',
    'inventory.salesDescription': '选择一个经销商以查看其详细的销售历史和总额。',
    'inventory.searchPlaceholder': '通过经销商名称或ID搜索...',
    'inventory.totalSales': '总销售额',
    'inventory.salesHistory': '销售历史记录',
    'inventory.product': '产品',
    'inventory.quantity': '数量',
    'inventory.amount': '总金额',
    'inventory.orderDate': '订单日期',
    'inventory.noRecords': '未找到该经销商的销售记录。',
    
    // AI Assistant
    'ai.title': 'AI仓库助手',
    'ai.online': '在线',
    'ai.thinking': '思考中...',
    'ai.placeholder': '询问库存、预测或见解...',
    'ai.suggestions.lowStock': '显示低库存物品',
    'ai.suggestions.demand': '预测下周需求',
    'ai.suggestions.optimize': '优化仓库布局',
    'ai.suggestions.report': '生成库存报告',
    
    // Common
    'common.save': '保存',
    'common.cancel': '取消',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.export': '导出',
    'common.import': '导入',
    'common.refresh': '刷新',
    'common.loading': '加载中...',
    'common.noData': '无数据',
    'common.logout': '退出登录',
    
    // Time periods
    'time.weekly': '每周',
    'time.monthly': '每月',
    'time.yearly': '每年',
    'time.daily': '每日',
    'time.thisWeek': '本周',
    'time.thisMonth': '本月',
    'time.thisYear': '今年',
    
    // Categories
    'category.electronics': '电子产品',
    'category.furniture': '家具',
    'category.clothing': '服装',
    'category.books': '书籍',
    'category.homeGarden': '家居园艺',
  }
};

// Locale store interface
interface LocaleState {
  currentLocale: 'en' | 'zh';
  setLocale: (locale: 'en' | 'zh') => void;
  t: (key: string) => string;
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  currentLocale: 'en',
  setLocale: (locale) => set({ currentLocale: locale }),
  t: (key: string) => {
    const { currentLocale } = get();
    return translations[currentLocale][key] || key;
  },
}));