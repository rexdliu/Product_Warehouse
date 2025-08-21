import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { DraggableAI } from '../ai/DraggableAI';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { sidebarOpen, theme, toggleSidebar, setTheme } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  useEffect(() => {
    const stored = localStorage.getItem('warehouse-settings');
    if (stored) {
      const data = JSON.parse(stored);
      const desiredTheme = data.theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : data.theme;
      setTheme(desiredTheme);
      document.body.classList.toggle('no-animations', !data.showAnimations);
      document.body.classList.toggle('no-tooltips', !data.showTooltips);
      if (data.compactSidebar !== !sidebarOpen) toggleSidebar();
    }
  }, [setTheme, sidebarOpen, toggleSidebar]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content */}
        <div className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}>
          <AppHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>

      {/* AI Assistant - 始终渲染，但根据路径决定是否隐藏 */}
      <DraggableAI hidden={location.pathname === '/ai'|| location.pathname === '/login'} />
    </div>
  );
};