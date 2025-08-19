import { create } from 'zustand';

// Auth Store
interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
  login: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: '1',
    name: 'John Smith',
    email: 'john@warehouse.com',
    role: 'Warehouse Manager'
  },
  isAuthenticated: true,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// UI Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
  }>;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
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
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  addNotification: (notification) => set((state) => ({
    notifications: [
      { ...notification, id: Date.now().toString(), timestamp: new Date() },
      ...state.notifications
    ]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));

// Inventory Store
interface Product {
  id: string;
  name: string;
  sku: string;
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
  products: [
    {
      id: '1',
      name: 'iPhone 14 Pro',
      sku: 'APPL-IP14P-256',
      category: 'Electronics',
      quantity: 5,
      minStock: 10,
      price: 999.99,
      location: 'A1-B2-C3',
      status: 'low-stock',
      lastUpdated: new Date()
    },
    {
      id: '2',
      name: 'Samsung Galaxy S23',
      sku: 'SAMS-GS23-128',
      category: 'Electronics',
      quantity: 25,
      minStock: 15,
      price: 799.99,
      location: 'A1-B3-C1',
      status: 'in-stock',
      lastUpdated: new Date()
    },
    {
      id: '3',
      name: 'Office Chair',
      sku: 'FURN-OC-001',
      category: 'Furniture',
      quantity: 0,
      minStock: 5,
      price: 199.99,
      location: 'B2-C1-D1',
      status: 'out-of-stock',
      lastUpdated: new Date()
    }
  ],
  categories: ['All', 'Electronics', 'Furniture', 'Clothing', 'Books'],
  filters: {
    category: 'All',
    status: 'All',
    search: ''
  },
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p =>
      p.id === id ? { ...p, ...updates, lastUpdated: new Date() } : p
    )
  })),
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
      content: 'Hello! I\'m your AI warehouse assistant. I can help you with inventory management, predictions, and insights. How can I assist you today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ],
  suggestions: [
    'Show me low stock items',
    'Predict next week\'s demand',
    'Optimize warehouse layout',
    'Generate inventory report'
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