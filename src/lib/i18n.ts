// src/lib/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // 自动检测浏览器语言
  .use(initReactI18next) // 将 i18n 实例传递给 react-i18next
  .init({
    // 建议在开发阶段开启 debug，上线时可以关闭
    debug: true,
    // 如果检测不到用户的语言，或者用户的语言没有对应的翻译，则使用中文
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false, // React 已经可以防范 XSS 攻击
    },
    // 支持的语言列表
    supportedLngs: ['en', 'zh'],
    resources: {
      // 英文翻译资源
      en: {
        translation: {
          // --- 通用 ---
          common: {
            settings: 'Settings',
            logout: 'Log out',
            searchPlaceholder: 'Search products, orders, or ask AI...',
            loading: 'Loading...',
            noData: 'No data found.',
            comingSoon: 'Page - Coming Soon',
            applyFilter: 'Apply Filter',
            selectDateRange: 'Select date range',
            clearFilters: 'Clear Filters',
            notifications: 'Notifications',
            noNotifications: 'No new notifications',
          },
          // --- 侧边栏 ---
          sidebar: {
            dashboard: 'Dashboard',
            inventory: 'Inventory',
            analytics: 'Analytics',
            warehouseMap: 'Warehouse Map',
            reports: 'Reports',
            aiAssistant: 'AI Assistant',
            settings: 'Settings',
            collapse: 'Collapse',
          },
          // --- 仪表盘 ---
          dashboard: {
            title: 'Warehouse AI Dashboard',
            subtitle: 'Real-time insights and AI-powered warehouse management',
            totalProducts: 'Total Products',
            lowStockAlerts: 'Low Stock Alerts',
            pendingOrders: 'Pending Orders',
            capacityUsed: 'Capacity Used',
            vsLastMonth: 'vs last month',
            inventoryTrends: 'Inventory Trends',
            recentActivities: 'Recent Activities',
            aiInsights: 'AI Insights',
          },
          // --- 库存页面 ---
          inventory: {
            overview: 'Inventory & Sales Overview',
            totalStockQuantity: 'Total Stock Quantity',
            totalValue: 'Total Stock Value',
            categories: 'Product Categories',
            salesQuery: 'Distributor Sales Performance',
            salesDescription: 'Select a distributor to view detailed sales history and totals.',
            searchPlaceholder: 'Search by distributor name or ID...',
            distributorDetails: 'Distributor Details',
            contactPerson: 'Contact Person',
            contactPhone: 'Contact Phone',
            totalSales: 'Total Sales Value',
            salesHistory: 'Sales History',
            product: 'Product Name',
            quantity: 'Quantity',
            amount: 'Total Amount',
            orderDate: 'Order Date',
            noRecords: 'No sales records found for this distributor.',
          },
          // --- AI助手 ---
          ai: {
            title: 'AI Warehouse Assistant',
            online: 'Online',
            thinking: 'Thinking...',
            placeholder: 'Ask about inventory, predictions, or insights...',
          },
          // --- 报告页面 ---
          reports: {
            title: 'AI Reports & Analytics',
            generateCustomReport: 'Generate a Custom Report',
            reportPlaceholder: "e.g., 'Show total sales and current stock for all electronics' or 'List top 5 selling products last month'",
            generateReport: 'Generate Report',
            generating: 'Generating...',
          }
        }
      },
      // 中文翻译资源
      zh: {
        translation: {
          // --- 通用 ---
           common: {
             settings: '设置',
             logout: '退出登录',
             searchPlaceholder: '搜索产品、订单，或询问AI...',
             loading: '加载中...',
             noData: '未找到数据。',
             comingSoon: '页面 - 敬请期待',
             applyFilter: '应用筛选',
             selectDateRange: '选择日期范围',
             clearFilters: '清除筛选',
             notifications: '通知',
             noNotifications: '暂无新通知',
           },
          // --- 侧边栏 ---
          sidebar: {
            dashboard: '仪表盘',
            inventory: '库存',
            analytics: '分析',
            warehouseMap: '仓库地图',
            reports: '报告',
            aiAssistant: 'AI 助手',
            settings: '设置',
            collapse: '收起',
          },
          // --- 仪表盘 ---
          dashboard: {
            title: 'Warehouse AI 仪表盘',
            subtitle: '实时洞察与AI驱动的仓库管理',
            totalProducts: '产品总数',
            lowStockAlerts: '低库存警报',
            pendingOrders: '待处理订单',
            capacityUsed: '仓库容量使用率',
            vsLastMonth: '与上月相比',
            inventoryTrends: '库存趋势',
            recentActivities: '最近活动',
            aiInsights: 'AI 洞察',
          },
          // --- 库存页面 ---
            inventory: {
            overview: '库存与销售总览',
            totalStockQuantity: "库存总数",
            totalValue: "库存总价值",
            categories: '产品种类',
            salesQuery: '经销商销售业绩查询',
            salesDescription: '选择一个经销商以查看其详细的销售历史和总额。',
            searchPlaceholder: '通过经销商名称或ID搜索...',
            distributorDetails: '经销商详情',
            contactPerson: '联系人',
            contactPhone: '联系电话',
            totalSales: '总销售额',
            salesHistory: '销售历史记录',
            product: '产品',
            quantity: '数量',
            amount: '总金额',
            orderDate: '订单日期',
            noRecords: '未找到该经销商的销售记录。',
           },
           // --- AI助手 ---
           ai: {
             title: 'AI仓库助手',
             online: '在线',
             thinking: '思考中...',
             placeholder: '询问库存、预测或见解...',
           },
           // --- 报告页面 ---
          reports: {
            title: 'AI 智能报告中心',
            generateCustomReport: '生成自定义报告',
            reportPlaceholder: "例如：'显示所有电子产品的总销售额和当前库存' 或 '列出上个月销量最高的5种产品'",
            generateReport: '生成报告',
            generating: '正在生成...',
          }
        }
      }
    }
  });

export default i18n;