import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useElectron } from '@/hooks/useElectron';
import { useToast } from '@/hooks/useToast';
import { VersionItem } from '@/components/VersionItem';
import { Toast } from '@/components/Toast';
import { Button } from '@/components/ui/button';

type TabType = 'installed' | 'available';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('installed');
  const {
    currentVersion,
    installedVersions,
    availableVersions,
    loading,
    useVersion,
    installVersion,
    refreshAll,
  } = useElectron();
  const { toasts, showToast } = useToast();

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
    showToast(`正在下载并安装 ${version}，这可能需要几分钟...`, 'info');
    try {
      const message = await installVersion(version);
      // 如果返回的是提示信息，显示 info 级别
      if (message.includes('Please run') || message.includes('terminal')) {
        showToast(message, 'info');
      } else {
        showToast(message, 'success');
      }
      // 等待一下让 nvm 完成安装，然后刷新
      setTimeout(async () => {
        await refreshAll();
      }, 1000);
    } catch (error) {
      const errorMsg = (error as Error).message;
      // 如果是版本不存在的错误，显示更友好的提示
      if (errorMsg.includes('not yet released') || errorMsg.includes('not available')) {
        showToast(`${version} 暂不可用，请选择其他版本`, 'error');
      } else {
        showToast(`安装失败: ${errorMsg}`, 'error');
      }
    }
  };

  const handleRefresh = async () => {
    showToast('正在刷新...', 'info');
    await refreshAll();
    showToast('刷新完成', 'success');
  };

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
      `}</style>
      <div className="flex flex-col h-full p-5">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
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
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Available Tab */}
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                activeTab === 'available' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="h-full overflow-y-auto p-3 custom-scrollbar">
                {loading.available ? (
                  <div className="text-center py-10 text-slate-500">加载中...</div>
                ) : availableVersions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <p className="mb-2">无法获取版本列表</p>
                    <p className="text-xs text-slate-600">请检查网络连接后点击刷新</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {availableVersions.map((version) => (
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
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex justify-center pt-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/8 text-slate-300 border border-white/12 hover:bg-white/12 hover:text-slate-100"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </Button>
        </footer>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}

export default App;
