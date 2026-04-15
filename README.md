# NVM Manager

一个轻量级的 nvm 桌面管理应用，使用 Electron + React + TypeScript + Vite 构建。

vibe coding含量极高。

## 功能特性

- 显示当前 Node.js 版本
- 查看已安装的 Node.js 版本
- 一键切换 Node.js 版本（Windows）
- 查看可下载的 Node.js 版本（从 Node.js 官方获取）
- 安装新的 Node.js 版本
- 卸载 Node.js 版本
- 版本搜索功能
- 镜像源配置（支持淘宝镜像/官方源）
- 自定义标题栏，支持最小化/最大化/关闭
- 优雅的深色主题 UI
- Toast 通知提示
- NVM 安装状态检测
- 安装/卸载进度显示

## 技术栈

- **Electron 28** - 桌面应用框架
- **React 18** - UI 框架
- **TypeScript ~5.4** - 类型安全
- **Vite 5** - 构建工具
- **Tailwind CSS 3.4** / **UnoCSS** - 样式方案
- **Lucide React** - 图标库
- **Radix UI** - 组件库基础
- **class-variance-authority** - 组件变体管理

## 前置要求

- 已安装 nvm (Node Version Manager)
  - Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows)
  - macOS/Linux: [nvm](https://github.com/nvm-sh/nvm)
- **pnpm** >= 8.0.0（强制要求，由 package.json 保证）
- Node.js 和 npm

## 安装

```bash
pnpm install
```

## 开发

**推荐方式** - 同时启动 Vite 开发服务器和 Electron：

```bash
pnpm electron:dev
```

或分别启动：

```bash
# 启动 Vite 开发服务器（端口 5173）
pnpm dev

# 在另一个终端启动 Electron（需要先启动 Vite）
pnpm start
```

### 热重载

- **无需重启**：`src/**/*.tsx`、`src/**/*.ts`、`src/**/*.css`、`uno.config.ts`
- **需要重启**：`electron/main.cjs`、`vite.config.ts`、`package.json`

### 调试

- 打开 Electron DevTools：Ctrl+Shift+I（Windows/Linux）或 View → Toggle Developer Tools

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

| 命令 | 描述 |
|------|------|
| `pnpm preview` | 预览 Vite 构建结果 |
| `pnpm lint` | 运行 ESLint 检查 |

## 使用说明

1. **已安装** - 查看所有已安装的 Node.js 版本，点击"使用"切换版本
2. **可下载** - 查看所有可用的 Node.js 版本，点击"安装"下载新版本
3. **搜索** - 在可下载页面搜索特定版本（支持 `18`、`v20`、`16.14` 等格式）
4. **设置** - 配置 Node.js 和 npm 镜像源
5. **刷新** - 重新加载版本列表
6. **安装 NVM** - 如果未检测到 NVM，可点击跳转到下载页面

## 项目结构

```
nvm-ui/
├── electron/
│   └── main.cjs              # Electron 主进程（IPC、窗口管理、nvm 集成）
├── src/
│   ├── components/
│   │   ├── layout/            # 布局组件
│   │   │   ├── TitleBar.tsx   # 自定义标题栏
│   │   │   ├── Header.tsx      # 页面头部
│   │   │   ├── VersionTabs.tsx # 标签页切换
│   │   │   ├── Footer.tsx      # 页脚
│   │   │   └── GlobalStyles.tsx # 全局样式
│   │   ├── versions/          # 版本列表组件
│   │   │   ├── InstalledVersionsTab.tsx   # 已安装版本列表
│   │   │   ├── AvailableVersionsTab.tsx   # 可下载版本列表
│   │   │   ├── VersionSearch.tsx           # 搜索框
│   │   │   ├── VersionStatusLegend.tsx     # 版本状态图例
│   │   │   └── AvailableVersionsError.tsx  # 错误提示
│   │   ├── dialogs/           # 对话框组件
│   │   │   ├── SettingsDialog.tsx    # 设置对话框
│   │   │   ├── ConfirmDialog.tsx     # 操作确认对话框
│   │   │   └── ProgressOverlay.tsx   # 安装/卸载进度遮罩
│   │   ├── ui/                # UI 基础组件
│   │   │   └── button.tsx
│   │   ├── Toast.tsx          # Toast 通知组件
│   │   ├── VersionItem.tsx    # 版本列表项
│   │   └── Dialog.tsx         # 对话框基础组件
│   ├── hooks/
│   │   ├── useElectron.ts     # Electron IPC 通信 Hook
│   │   ├── useToast.ts        # Toast 通知 Hook
│   │   ├── useWindowControls.ts   # 窗口控制 Hook
│   │   ├── useVersionActions.ts   # 版本操作 Hook
│   │   ├── useSettings.ts     # 设置 Hook
│   │   └── useVersionSearch.ts    # 版本搜索 Hook
│   ├── lib/
│   │   ├── utils.ts
│   │   └── nodeVersionStatus.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx               # 主应用组件（已解耦）
│   └── main.tsx              # React 入口
├── dist/                     # 前端构建输出
├── dist-electron/            # Electron 应用构建输出
├── package.json
├── vite.config.ts
├── tsconfig.json
├── uno.config.ts
├── tailwind.config.js
└── README.md
```

## 架构说明

### 工程化重构

项目已进行组件化解耦，主要改进：

1. **Hooks 分层** - 将业务逻辑抽取到独立的自定义 Hooks 中
2. **组件细分** - 将大组件拆分为多个职责单一的小组件
3. **目录组织** - 按功能模块组织组件（layout/versions/dialogs）
4. **类型安全** - 完整的 TypeScript 类型定义

### 重要配置

- **路径别名**：`@` 映射到 `./src`（tsconfig.json + vite.config.ts）
- **严格 TypeScript**：启用，无未使用变量/参数
- **Electron 入口**：`electron/main.cjs`
- **构建输出**：`dist-electron/`（Electron 应用）、`dist/`（仅前端）

## License

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**非商业使用** - 本项目仅供学习和非商业用途使用。
