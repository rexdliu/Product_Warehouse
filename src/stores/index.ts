import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Auth Store
interface User {
  id: string;
  name: string;
  email: string;
  account: string;
  role: string;
}
interface AuthState {
  user: User|null;
  isAuthenticated: boolean;
  login: (user:User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: '1',
    name: 'John Smith',
    email:'john@warehouse.com',
    account: 'rex',
    role: 'Warehouse Manager'
  },
  isAuthenticated: true,
   login: (user: User) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// UI Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  showAnimations: boolean;
  showTooltips: boolean;
  aiSettings: {
    enabled: boolean;
    autoSuggestions: boolean;
    voiceInput: boolean;
    contextMemory: string;
    responseSpeed: string;
  };
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
  }>;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setShowAnimations: (show: boolean) => void;
  setShowTooltips: (show: boolean) => void;
  setAISettings: (settings: Partial<UIState['aiSettings']>) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system', // 默认跟随系统，更现代的做法
      showAnimations: true,
      showTooltips: true,
      aiSettings: {
        enabled: true,
        autoSuggestions: true,
        voiceInput: false,
        contextMemory: 'session',
        responseSpeed: 'balanced',
      },
      notifications: [
        {
          id: '1',
          title: 'Low Stock Alert',
          message: 'iPhone 14 Pro stock is running low (5 units remaining)',
          type: 'warning',
          timestamp: new Date()
        },
        {
          id: '2',
          title: 'Order Completed',
          message: 'Order #WH-2024-001 has been successfully processed',
          type: 'success',
          timestamp: new Date()
        }
      ],
      setTheme: (theme) => set({ theme }),
      setShowAnimations: (show) => set({ showAnimations: show }),
      setShowTooltips: (show) => set({ showTooltips: show }),
      setAISettings: (settings) => set((state) => {
        const newSettings = { ...state.aiSettings, ...settings };
        return { aiSettings: newSettings };
      }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        return { theme: newTheme };
      }),
      addNotification: (notification) => set((state) => ({
        notifications: [
          { ...notification, id: Date.now().toString(), timestamp: new Date() },
          ...state.notifications
        ]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
    }),
    {
      name: 'warehouse-settings',
      storage: createJSONStorage(() => localStorage),
     partialize: (state) => ({ 
        theme: state.theme, 
        aiSettings: state.aiSettings,
        sidebarOpen: state.sidebarOpen,
        showAnimations: state.showAnimations,
        showTooltips: state.showTooltips,
      }),
    }
  )
);

// --- 库存 Store (已更新) ---
export interface Product { // 定义产品接口
  id: string;
  name: string;
  sku: string;//库存量单位
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: Date;
}

interface InventoryState {
  products: Product[];
  categories: string[];
  filters: {
    category: string;
    status: string;
    search: string;
  };
  setFilters: (filters: Partial<InventoryState['filters']>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  // 增加了更多模拟数据
  products: [
    { id: '1', name: 'iPhone 14 Pro', sku: 'APPL-IP14P-256', category: '电子产品', quantity: 5, minStock: 10, price: 999.99, location: 'A1-B2-C3', status: 'low-stock', lastUpdated: new Date() },
    { id: '2', name: 'Samsung Galaxy S23', sku: 'SAMS-GS23-128', category: '电子产品', quantity: 25, minStock: 15, price: 799.99, location: 'A1-B3-C1', status: 'in-stock', lastUpdated: new Date() },
    { id: '3', name: '办公椅', sku: 'FURN-OC-001', category: '家具', quantity: 0, minStock: 5, price: 199.99, location: 'B2-C1-D1', status: 'out-of-stock', lastUpdated: new Date() },
    { id: '4', name: '品牌T恤', sku: 'CLTH-TS-M-BLK', category: '服装', quantity: 150, minStock: 50, price: 29.99, location: 'C3-A1-B2', status: 'in-stock', lastUpdated: new Date() },
    { id: '5', name: '精装笔记本', sku: 'STAT-NB-LG-RED', category: '文具', quantity: 200, minStock: 100, price: 15.50, location: 'D1-C2-A3', status: 'in-stock', lastUpdated: new Date() },
  ],
  categories: ['全部', '电子产品', '家具', '服装', '文具'],
  filters: {
    category: 'All',
    status: 'All',
    search: ''
  },
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(product =>
      product.id === id ? { ...product, ...updates, lastUpdated: new Date() } : product
    )
  })),
}));

// --- 新增：销售和经销商 Store ---
export interface Distributor { // 定义经销商接口
  id: string;
  name: string;
  contactPerson: string;
  phone: string; // email 已改为 phone
  region: string;
}

export interface SalesOrder { // 定义销售订单接口
  orderId: string;
  distributorId: string;
  productId: string;
  productName: string;
  quantity: number;
  totalValue: number;
  orderDate: Date;
}

interface SalesState {
  distributors: Distributor[];
  salesHistory: SalesOrder[];
  getSalesByDistributor: (distributorId: string) => SalesOrder[];
}

// 模拟的经销商和销售数据
const mockDistributors: Distributor[] = [
  { id: 'dist-001', name: '环球科技供应商', contactPerson: '李女士', phone: '138-0001-0001', region: '华北美区' },
  { id: 'dist-002', name: '欧洲电子配件公司', contactPerson: '王先生', phone: '139-0002-0002', region: '欧洲区' },
];

const mockSalesHistory: SalesOrder[] = [
  { orderId: 'SO-1001', distributorId: 'dist-001', productId: '1', productName: 'iPhone 14 Pro', quantity: 50, totalValue: 49999.50, orderDate: new Date('2024-07-15') },
  { orderId: 'SO-1002', distributorId: 'dist-002', productId: '2', productName: 'Samsung Galaxy S23', quantity: 30, totalValue: 23999.70, orderDate: new Date('2024-07-20') },
  { orderId: 'SO-1003', distributorId: 'dist-001', productId: '2', productName: 'Samsung Galaxy S23', quantity: 20, totalValue: 15999.80, orderDate: new Date('2024-08-05') },
];

export const useSalesStore = create<SalesState>((set, get) => ({
  distributors: mockDistributors,
  salesHistory: mockSalesHistory,
  getSalesByDistributor: (distributorId) => {
    return get().salesHistory.filter(order => order.distributorId === distributorId);
  }
}));
// AI Store
interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIState {
  isOpen: boolean;
  isLoading: boolean;
  messages: AIMessage[];
  suggestions: string[];
  toggleChat: () => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  setLoading: (loading: boolean) => void;
}

export const useAIStore = create<AIState>((set) => ({
  isOpen: false,
  isLoading: false,
  messages: [
    {
      id: '1',
      content: '你好！我是你的 AI 仓库助手。我可以协助你进行库存管理、趋势预测和数据洞察。请问我今天能为你做些什么？',
      role: 'assistant',
      timestamp: new Date()
    }
  ],
 suggestions: [
  '显示库存不足的商品',
  '预测下周的需求',
  '优化仓库布局',
  '生成库存报告'
],
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (content, role) => set((state) => ({
    messages: [
      ...state.messages,
      { id: Date.now().toString(), content, role, timestamp: new Date() }
    ]
  })),
  setLoading: (loading) => set({ isLoading: loading }),
}));