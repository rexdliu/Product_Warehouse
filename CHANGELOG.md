# 变更日志 (Changelog)

记录项目的所有重要变更。

## 2025-08-22

### 修复 (Fixes)
- 修复 TypeScript 无法找到 React 类型声明的问题，通过安装 `@types/react` 包解决
- 修复 AI 聊天机器人设置在页面刷新后丢失的问题，使用 Zustand 的 persist 中间件实现状态持久化

### 新增 (Added)
- 创建变更日志文件 CHANGELOG.md
