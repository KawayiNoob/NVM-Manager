import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';

type PendingAction = {
  type: 'install' | 'uninstall' | 'use';
  version: string;
} | null;

interface UseVersionActionsOptions {
  useVersion: (version: string) => Promise<string>;
  installVersion: (version: string) => Promise<string>;
  uninstallVersion: (version: string) => Promise<string>;
  refreshAll: () => Promise<void>;
  copyToClipboard: (text: string) => Promise<boolean>;
}

export function useVersionActions({
  useVersion,
  installVersion,
  uninstallVersion,
  refreshAll,
  copyToClipboard,
}: UseVersionActionsOptions) {
  const { showToast, clearToastsByMessage } = useToast();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installingVersion, setInstallingVersion] = useState('');
  const [installProgress, setInstallProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState('');
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [uninstallingVersion, setUninstallingVersion] = useState('');
  const [uninstallProgress, setUninstallProgress] = useState(0);
  const [uninstallStatus, setUninstallStatus] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const getActionText = (type: 'install' | 'uninstall' | 'use') => {
    switch (type) {
      case 'install':
        return '安装';
      case 'uninstall':
        return '卸载';
      case 'use':
        return '切换';
    }
  };

  const doUseVersion = useCallback(
    async (version: string) => {
      showToast(`正在切换到 ${version}...`, 'info');
      try {
        await useVersion(version);
        await refreshAll();
        showToast(`已切换到 ${version}`, 'success');
      } catch (error) {
        showToast(`切换失败: ${(error as Error).message}`, 'error');
      }
    },
    [useVersion, refreshAll, showToast]
  );

  const doInstallVersion = useCallback(
    async (version: string) => {
      setIsInstalling(true);
      setInstallingVersion(version);
      setInstallProgress(0);
      setInstallStatus('准备安装...');

      try {
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

        const cmdMatch = message.match(/nvm install [^\s]+/);
        if (cmdMatch) {
          const cmd = cmdMatch[0];
          showToast(message, 'info', {
            label: '复制命令',
            onClick: async () => {
              const success = await copyToClipboard(cmd);
              if (success) {
                showToast('命令已复制到剪贴板', 'success');
              }
            },
          });
        } else {
          showToast(message, 'success');
        }

        setTimeout(async () => {
          setIsInstalling(false);
          await refreshAll();
        }, 800);
      } catch (error) {
        setIsInstalling(false);
        const errorMsg = (error as Error).message;
        if (errorMsg.includes('not yet released') || errorMsg.includes('not available')) {
          showToast(`${version} 暂不可用，请选择其他版本`, 'error');
        } else {
          showToast(`安装失败: ${errorMsg}`, 'error');
        }
      }
    },
    [installVersion, refreshAll, copyToClipboard, showToast]
  );

  const doUninstallVersion = useCallback(
    async (version: string) => {
      setIsUninstalling(true);
      setUninstallingVersion(version);
      setUninstallProgress(0);
      setUninstallStatus('准备卸载...');

      try {
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

        const cmdMatch = message.match(/nvm uninstall [^\s]+/);
        if (cmdMatch) {
          const cmd = cmdMatch[0];
          showToast(message, 'info', {
            label: '复制命令',
            onClick: async () => {
              const success = await copyToClipboard(cmd);
              if (success) {
                showToast('命令已复制到剪贴板', 'success');
              }
            },
          });
        } else {
          showToast(message, 'success');
        }

        setTimeout(async () => {
          setIsUninstalling(false);
          await refreshAll();
        }, 600);
      } catch (error) {
        setIsUninstalling(false);
        showToast(`卸载失败: ${(error as Error).message}`, 'error');
      }
    },
    [uninstallVersion, refreshAll, copyToClipboard, showToast]
  );

  const handleConfirmAction = useCallback(() => {
    if (!pendingAction) return;
    setConfirmDialogOpen(false);

    switch (pendingAction.type) {
      case 'install':
        doInstallVersion(pendingAction.version);
        break;
      case 'uninstall':
        doUninstallVersion(pendingAction.version);
        break;
      case 'use':
        doUseVersion(pendingAction.version);
        break;
    }
  }, [pendingAction, doInstallVersion, doUninstallVersion, doUseVersion]);

  const handleUseVersion = useCallback(
    async (version: string) => {
      setPendingAction({ type: 'use', version });
      setConfirmDialogOpen(true);
    },
    []
  );

  const handleInstallVersion = useCallback(
    async (version: string) => {
      setPendingAction({ type: 'install', version });
      setConfirmDialogOpen(true);
    },
    []
  );

  const handleUninstallVersion = useCallback(
    async (version: string) => {
      setPendingAction({ type: 'uninstall', version });
      setConfirmDialogOpen(true);
    },
    []
  );

  const handleRefresh = useCallback(
    async (isRefreshing: boolean) => {
      if (isRefreshing) return;
      clearToastsByMessage(['正在刷新...', '刷新完成']);
      showToast('正在刷新...', 'info');
      await refreshAll();
      clearToastsByMessage(['正在刷新...']);
      showToast('刷新完成', 'success');
    },
    [refreshAll, showToast, clearToastsByMessage]
  );

  return {
    isInstalling,
    installingVersion,
    installProgress,
    installStatus,
    isUninstalling,
    uninstallingVersion,
    uninstallProgress,
    uninstallStatus,
    confirmDialogOpen,
    setConfirmDialogOpen,
    pendingAction,
    getActionText,
    handleConfirmAction,
    handleUseVersion,
    handleInstallVersion,
    handleUninstallVersion,
    handleRefresh,
  };
}
