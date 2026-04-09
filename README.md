# NVM Manager

一个轻量级的 nvm 桌面管理应用，使用 Electron + React + TypeScript + Vite 构建。

## 功能特性

- 显示当前 Node.js 版本
- 查看已安装的 Node.js 版本
- 一键切换 Node.js 版本（Windows）
- 查看可下载的 Node.js 版本（从 Node.js 官方获取）
- 安装新的 Node.js 版本
- 自定义标题栏，支持最小化/最大化/关闭
- 优雅的深色主题 UI
- Toast 通知提示
- NVM 安装状态检测

## 技术栈

- **Electron** - 桌面应用框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** / **UnoCSS** - 样式方案
- **Lucide React** - 图标库
- **Radix UI** - 组件库基础

## 前置要求

- 已安装 nvm (Node Version Manager)
  - Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows)
  - macOS/Linux: [nvm](https://github.com/nvm-sh/nvm)
- **pnpm** >= 8.0.0（推荐）
- Node.js 和 npm

## 安装

```bash
pnpm install
```

## 开发

同时启动 Vite 开发服务器和 Electron：

```bash
pnpm electron:dev
```

或分别启动：

```bash
# 启动 Vite 开发服务器
pnpm dev

# 在另一个终端启动 Electron（需要先启动 Vite）
pnpm start
```

## 构建

### 构建前端

```bash
pnpm build
```

### 构建 Electron 应用

```bash
pnpm electron:build
```

构建产物将输出到 `dist-electron/` 目录。

## 其他命令

- `pnpm preview` - 预览 Vite 构建结果
- `pnpm lint` - 运行 ESLint 检查

## 使用说明

1. **已安装** - 查看所有已安装的 Node.js 版本，点击"使用"切换版本
2. **可下载** - 查看所有可用的 Node.js 版本，点击"安装"下载新版本
3. **刷新** - 重新加载版本列表
4. **安装 NVM** - 如果未检测到 NVM，可点击跳转到下载页面

## 项目结构

```
nvm-ui/
├── electron/
│   └── main.cjs          # Electron 主进程
├── src/
│   ├── components/
│   │   ├── Toast.tsx     # Toast 通知组件
│   │   ├── VersionItem.tsx  # 版本列表项
│   │   └── ui/
│   │       └── button.tsx
│   ├── hooks/
│   │   ├── useElectron.ts   # Electron 交互 Hook
│   │   └── useToast.ts      # Toast Hook
│   ├── lib/
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx           # 主应用组件
│   └── main.tsx          # React 入口
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## License

MIT
