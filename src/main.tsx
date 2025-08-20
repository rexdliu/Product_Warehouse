// src/main.tsx

import React, { Suspense } from 'react'; // 1. 从 react 引入 Suspense
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@/lib/i18n';  // ✅ 一定要在任何使用 t() 的组件之前引入
import './lib/i18n'; // 2. 确保 i18n 配置文件被引入 (放在 lib 目录下)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 3. 使用 Suspense 包裹 App 组件 */}
    {/* fallback 可以是一个简单的文本，也可以是一个加载动画组件 */}
    <Suspense fallback="正在加载语言包...">
      <App />
    </Suspense>
  </React.StrictMode>,
);