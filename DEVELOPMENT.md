# 开发指南

## 热更新说明

### ✅ 支持热更新（无需重启）
修改以下文件时，Vite 会自动热更新，Electron 窗口会自动刷新：
- `src/**/*.tsx` - React 组件
- `src/**/*.ts` - TypeScript 工具/类型
- `src/**/*.css` - 样式文件
- `uno.config.ts` - UnoCSS 配置

### ❌ 需要重启应用
修改以下文件时，需要重启 Electron：
- `electron/main.cjs` - Electron 主进程
- `vite.config.ts` - Vite 配置
- `package.json` - 依赖配置

## 启动方式

### 方式一：一键启动（推荐）
```bash
pnpm electron:dev
```
这会同时启动 Vite 开发服务器和 Electron 窗口。

### 方式二：分开启动（更稳定）
终端 1：
```bash
pnpm dev
```

终端 2（等待 Vite 启动后）：
```bash
pnpm start
```

## 开发调试

打开 Electron 开发者工具：
- 菜单：View → Toggle Developer Tools
- 快捷键：Ctrl+Shift+I (Windows/Linux)

## 常见问题

**Q: 修改代码后页面没更新？**
A: 确保你修改的是 `src/` 目录下的文件，并且没有报错。查看 Vite 终端和浏览器控制台的错误信息。

**Q: 如何确认热更新是否工作？**
A: 修改 `src/App.tsx` 中的文字，保存后看窗口是否自动更新。
