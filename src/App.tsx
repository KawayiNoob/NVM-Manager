import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Minus, Square, Copy, X, Download, Settings, Search } from 'lucide-react';
import { useElectron } from '@/hooks/useElectron';
import { useToast } from '@/hooks/useToast';
import { VersionItem } from '@/components/VersionItem';
import { Toast } from '@/components/Toast';
import { Dialog } from '@/components/Dialog';
import { Button } from '@/components/ui/button';

type TabType = 'installed' | 'available';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('installed');
  const [isMaximized, setIsMaximized] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempNodeMirror, setTempNodeMirror] = useState('');
  const [tempNpmMirror, setTempNpmMirror] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installingVersion, setInstallingVersion] = useState('');
  const [installProgress, setInstallProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState('');
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [uninstallingVersion, setUninstallingVersion] = useState('');
  const [uninstallProgress, setUninstallProgress] = useState(0);
  const [uninstallStatus, setUninstallStatus] = useState('');
  const {
    currentVersion,
    installedVersions,
    availableVersions,
    availableVersionsError,
    nvmInstalled,
    nvmSettings,
    loading,
    isRefreshing,
    useVersion,
    installVersion,
    uninstallVersion,
    refreshAll,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    isMaximized: checkIsMaximized,
    hasElectron,
    openExternalUrl,
    copyToClipboard,
    fetchNvmSettings,
    saveNvmSettings,
  } = useElectron();
  const { toasts, showToast, clearToastsByMessage } = useToast();

  // 过滤可下载版本
  const filteredAvailableVersions = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableVersions;
    }
    const query = searchQuery.toLowerCase().trim();
    return availableVersions.filter((version) => {
      // 移除v前缀进行匹配
      const cleanVersion = version.toLowerCase().replace(/^v/, '');
      const cleanQuery = query.replace(/^v/, '');
      return (
        version.toLowerCase().includes(query) ||
        cleanVersion.includes(cleanQuery) ||
        // 支持只输入数字的匹配，比如 "18" 匹配 "v18.x.x"
        cleanVersion.startsWith(cleanQuery)
      );
    });
  }, [availableVersions, searchQuery]);

  const updateMaximizedState = useCallback(async () => {
    if (hasElectron) {
      const maximized = await checkIsMaximized();
      setIsMaximized(maximized);
    }
  }, [hasElectron, checkIsMaximized]);

  const handleMaximize = useCallback(() => {
    maximizeWindow();
    setTimeout(updateMaximizedState, 100);
  }, [maximizeWindow, updateMaximizedState]);

  useEffect(() => {
    updateMaximizedState();
  }, [updateMaximizedState]);

  const handleUseVersion = async (version: string) => {
    showToast(`正在切换到 ${version}...`, 'info');
    try {
      await useVersion(version);
      await refreshAll();
      showToast(`已切换到 ${version}`, 'success');
    } catch (error) {
      showToast(`切换失败: ${(error as Error).message}`, 'error');
    }
  };

  const handleInstallVersion = async (version: string) => {
    setIsInstalling(true);
    setInstallingVersion(version);
    setInstallProgress(0);
    setInstallStatus('准备安装...');

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setInstallProgress((prev) => {
          if (prev < 90) {
            return prev + Math.random() * 15;
          }
          return prev;
        });
        setInstallStatus((prev) => {
          if (prev === '准备安装...') return '下载中...';
          if (prev === '下载中...') return '解压中...';
          return prev;
        });
      }, 800);

      const message = await installVersion(version);

      clearInterval(progressInterval);
      setInstallProgress(100);
      setInstallStatus('安装完成！');

      // 检查消息中是否包含命令
      const cmdMatch = message.match(/nvm install [^\s]+/);
      if (cmdMatch) {
        // 如果包含命令，显示一个带复制按钮的 toast
        const cmd = cmdMatch[0];
        showToast(
          message,
          'info',
          {
            label: '复制命令',
            onClick: async () => {
              const success = await copyToClipboard(cmd);
              if (success) {
                showToast('命令已复制到剪贴板', 'success');
              }
            }
          }
        );
      } else {
        // 普通成功消息
        showToast(message, 'success');
      }

      // 短暂显示完成状态，然后关闭遮罩并刷新
      setTimeout(async () => {
        setIsInstalling(false);
        await refreshAll();
      }, 800);
    } catch (error) {
      setIsInstalling(false);
      const errorMsg = (error as Error).message;
      // 如果是版本不存在的错误，显示更友好的提示
      if (errorMsg.includes('not yet released') || errorMsg.includes('not available')) {
        showToast(`${version} 暂不可用，请选择其他版本`, 'error');
      } else {
        showToast(`安装失败: ${errorMsg}`, 'error');
      }
    }
  };

  const handleUninstallVersion = async (version: string) => {
    setIsUninstalling(true);
    setUninstallingVersion(version);
    setUninstallProgress(0);
    setUninstallStatus('准备卸载...');

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setUninstallProgress((prev) => {
          if (prev < 90) {
            return prev + Math.random() * 20;
          }
          return prev;
        });
        setUninstallStatus((prev) => {
          if (prev === '准备卸载...') return '删除文件中...';
          return prev;
        });
      }, 500);

      const message = await uninstallVersion(version);

      clearInterval(progressInterval);
      setUninstallProgress(100);
      setUninstallStatus('卸载完成！');

      // 检查消息中是否包含命令
      const cmdMatch = message.match(/nvm uninstall [^\s]+/);
      if (cmdMatch) {
        // 如果包含命令，显示一个带复制按钮的 toast
        const cmd = cmdMatch[0];
        showToast(
          message,
          'info',
          {
            label: '复制命令',
            onClick: async () => {
              const success = await copyToClipboard(cmd);
              if (success) {
                showToast('命令已复制到剪贴板', 'success');
              }
            }
          }
        );
      } else {
        // 普通成功消息
        showToast(message, 'success');
      }

      // 短暂显示完成状态，然后关闭遮罩并刷新
      setTimeout(async () => {
        setIsUninstalling(false);
        await refreshAll();
      }, 600);
    } catch (error) {
      setIsUninstalling(false);
      showToast(`卸载失败: ${(error as Error).message}`, 'error');
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    // 清除之前的刷新相关 toast
    clearToastsByMessage(['正在刷新...', '刷新完成']);
    showToast('正在刷新...', 'info');
    await refreshAll();
    clearToastsByMessage(['正在刷新...']);
    showToast('刷新完成', 'success');
  };

  const handleInstallNvm = () => {
    openExternalUrl('https://github.com/coreybutler/nvm-windows');
  };

  const handleOpenSettings = useCallback(async () => {
    await fetchNvmSettings();
    setTempNodeMirror(nvmSettings.node_mirror || '');
    setTempNpmMirror(nvmSettings.npm_mirror || '');
    setSettingsOpen(true);
  }, [fetchNvmSettings, nvmSettings]);

  const handleSaveSettings = useCallback(async () => {
    const success = await saveNvmSettings({
      node_mirror: tempNodeMirror || undefined,
      npm_mirror: tempNpmMirror || undefined,
    });
    if (success) {
      showToast('设置已保存', 'success');
      setSettingsOpen(false);
    } else {
      showToast('保存失败', 'error');
    }
  }, [saveNvmSettings, tempNodeMirror, tempNpmMirror, showToast]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 flex flex-col">
      <style>{`
        /* 自定义滚动条样式 */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #666;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #888;
        }
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #666 transparent;
        }
        /* 防止整个页面滚动 */
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100%;
        }
        /* 可拖拽区域 */
        .drag-region {
          -webkit-app-region: drag;
        }
        .no-drag {
          -webkit-app-region: no-drag;
        }
      `}</style>

      {/* 自定义标题栏 */}
      <div className="drag-region h-10 flex items-center justify-between px-3 select-none">
        <div className="flex-1" />
        <div className="no-drag flex items-center gap-1">
          <button
            onClick={minimizeWindow}
            className="w-8 h-8 flex items-center justify-center rounded transition-opacity text-white border-none outline-none hover:opacity-80"
            style={{ backgroundColor: '#192336' }}
            title="最小化"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="w-8 h-8 flex items-center justify-center rounded transition-opacity text-white border-none outline-none hover:opacity-80"
            style={{ backgroundColor: '#192336' }}
            title={isMaximized ? "还原" : "最大化"}
          >
            {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={closeWindow}
            className="w-8 h-8 flex items-center justify-center rounded transition-opacity text-white border-none outline-none hover:opacity-80"
            style={{ backgroundColor: '#192336' }}
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-5 pt-0">
        {/* Header */}
        <header className="flex justify-between items-center mb-4 pt-5">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            NVM Manager
          </h1>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-slate-400 uppercase tracking-wide">当前版本</span>
            <span className="text-xl font-semibold text-green-400">
              {loading.current ? '加载中...' : currentVersion || '未安装'}
            </span>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'installed'
                ? 'bg-blue-500/15 border border-blue-500/40 text-blue-400'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('installed')}
          >
            已安装
          </button>
          <button
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'available'
                ? 'bg-blue-500/15 border border-blue-500/40 text-blue-400'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('available')}
          >
            可下载
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-white/3 rounded-xl border border-white/8 min-h-0">
          {/* 两个标签页都使用绝对定位确保高度一致 */}
          <div className="relative h-full">
            {/* Installed Tab */}
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                activeTab === 'installed' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="h-full overflow-y-auto p-3 custom-scrollbar">
                <div className="pb-4">
                  {loading.installed ? (
                    <div className="text-center py-10 text-slate-500">加载中...</div>
                  ) : installedVersions.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">暂无已安装版本</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {installedVersions.map((version) => (
                        <VersionItem
                          key={version}
                          version={version}
                          isCurrent={
                            version === currentVersion || version === currentVersion.replace('v', '')
                          }
                          isInstalled={true}
                          onUse={handleUseVersion}
                          onUninstall={handleUninstallVersion}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Available Tab */}
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                activeTab === 'available' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="h-full overflow-y-auto p-3 custom-scrollbar">
                <div className="pb-4">
                  {/* 搜索框 */}
                  <div className="mb-4 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索 Node.js 版本 (如: 18, v20, 16.14)..."
                      className="w-full box-border pl-11 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-sm"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 !pr-2 flex items-center"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          boxShadow: 'none',
                          outline: 'none'
                        }}
                      >
                        <div className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                          <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-200" />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* 版本状态图例 */}
                  <div className="mb-4 flex flex-wrap gap-2 items-center text-xs">
                    <span className="text-slate-500">版本状态：</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-medium border bg-green-500/20 text-green-400 border-green-500/40">
                      活跃 LTS
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
                      维护 LTS
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-medium border bg-purple-500/20 text-purple-400 border-purple-500/40">
                      Current
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-medium border bg-red-500/20 text-red-400 border-red-500/40">
                      EoL
                    </span>
                  </div>

                  {loading.available ? (
                    <div className="text-center py-10 text-slate-500">加载中...</div>
                  ) : availableVersionsError ? (
                    <div className="text-center py-10 text-slate-500">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-red-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="mb-2 text-slate-300">{availableVersionsError}</p>
                      <p className="text-xs text-slate-500">请检查网络连接后点击刷新按钮重试</p>
                    </div>
                  ) : availableVersions.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <p className="mb-2">暂无可用版本</p>
                      <p className="text-xs text-slate-600">点击刷新按钮重试</p>
                    </div>
                  ) : filteredAvailableVersions.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <p className="mb-2">未找到匹配的版本</p>
                      <p className="text-xs text-slate-600">请尝试其他搜索关键词</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {filteredAvailableVersions.map((version) => (
                        <VersionItem
                          key={version}
                          version={version}
                          isCurrent={
                            version === currentVersion || version === currentVersion.replace('v', '')
                          }
                          isInstalled={
                            installedVersions.includes(version) ||
                            installedVersions.includes(version.replace('v', ''))
                          }
                          onUse={handleUseVersion}
                          onInstall={handleInstallVersion}
                          onUninstall={handleUninstallVersion}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-center py-4 mt-4">
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${nvmInstalled ? 'bg-green-400' : 'bg-red-400'}`}
            />
            <span className={nvmInstalled ? 'text-green-400' : 'text-red-400'}>
              NVM {nvmInstalled ? '已安装' : '未安装'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!nvmInstalled && (
              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2.5 bg-green-500/15 text-green-400 border border-green-500/40 hover:bg-green-500/25 hover:text-green-300"
                onClick={handleInstallNvm}
              >
                <Download className="w-4 h-4" />
                安装NVM
              </Button>
            )}
            {/* 设置按钮 */}
            <div className="relative group">
              <Button
                variant="outline"
                className="flex items-center gap-2 px-3 py-2.5 bg-white/8 text-slate-300 border border-white/12 hover:bg-white/12 hover:text-slate-100"
                onClick={handleOpenSettings}
              >
                <Settings className="w-4 h-4" />
              </Button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                设置
              </div>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/8 text-slate-300 border border-white/12 hover:bg-white/12 hover:text-slate-100"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4" />
              刷新
            </Button>
          </div>
        </footer>
      </div>

      <Toast toasts={toasts} />

      {/* 安装/卸载进度条遮罩 */}
      {(isInstalling || isUninstalling) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 w-80 border border-slate-700 shadow-2xl">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isInstalling ? 'bg-blue-500/20' : 'bg-red-500/20'
              }`}>
                {isInstalling ? (
                  <Download className="w-8 h-8 text-blue-400 animate-pulse" />
                ) : (
                  <svg className="w-8 h-8 text-red-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-1">
                {isInstalling ? '正在安装' : '正在卸载'}
              </h3>
              <p className="text-slate-400 font-mono">
                {isInstalling ? installingVersion : uninstallingVersion}
              </p>
            </div>

            {/* 进度条 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">
                  {isInstalling ? installStatus : uninstallStatus}
                </span>
                <span className={`font-semibold ${isInstalling ? 'text-blue-400' : 'text-red-400'}`}>
                  {Math.min(100, Math.round(isInstalling ? installProgress : uninstallProgress))}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isInstalling
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, isInstalling ? installProgress : uninstallProgress)}%` }}
                />
              </div>
            </div>

            <p className="text-center text-xs text-slate-500">
              {isInstalling
                ? '请勿关闭应用，安装可能需要几分钟...'
                : '正在清理文件...'
              }
            </p>
          </div>
        </div>
      )}

      {/* 设置对话框 */}
      <Dialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="设置"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="bg-white/8 text-slate-300 border-white/12 hover:bg-white/12"
              onClick={() => setSettingsOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveSettings}
            >
              保存
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Node.js 镜像地址
            </label>
            <input
              type="text"
              value={tempNodeMirror}
              onChange={(e) => setTempNodeMirror(e.target.value)}
              placeholder="https://nodejs.org/dist/"
              className="w-full box-border px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-sm break-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              npm 镜像地址
            </label>
            <input
              type="text"
              value={tempNpmMirror}
              onChange={(e) => setTempNpmMirror(e.target.value)}
              placeholder="https://registry.npmmirror.com"
              className="w-full box-border px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-sm break-all"
            />
          </div>
          <div className="pt-2">
            <p className="text-xs text-slate-500 mb-2">常用镜像：</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setTempNodeMirror('https://npmmirror.com/mirrors/node/');
                  setTempNpmMirror('https://registry.npmmirror.com');
                }}
                className="px-3 py-1.5 text-xs bg-blue-500/15 text-blue-400 border border-blue-500/40 rounded hover:bg-blue-500/25 transition-colors"
              >
                淘宝镜像
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempNodeMirror('https://nodejs.org/dist/');
                  setTempNpmMirror('https://registry.npmjs.org');
                }}
                className="px-3 py-1.5 text-xs bg-slate-500/15 text-slate-400 border border-slate-500/40 rounded hover:bg-slate-500/25 transition-colors"
              >
                官方源
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default App;
