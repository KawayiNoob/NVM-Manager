import { useEffect, useState, useCallback } from 'react';

// 类型声明
interface IpcRenderer {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
}

interface ElectronAPI {
  ipcRenderer: IpcRenderer;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    require?: (module: string) => unknown;
  }
}

// 获取 ipcRenderer
const getIpcRenderer = (): IpcRenderer | null => {
  if (typeof window !== 'undefined' && window.require) {
    try {
      const electron = window.require('electron') as ElectronAPI;
      return electron.ipcRenderer;
    } catch {
      return null;
    }
  }
  return null;
};

export const useElectron = () => {
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [installedVersions, setInstalledVersions] = useState<string[]>([]);
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [nvmInstalled, setNvmInstalled] = useState<boolean>(false);
  const [loading, setLoading] = useState({
    current: false,
    installed: false,
    available: false,
    nvm: false,
  });

  const ipcRenderer = getIpcRenderer();

  const fetchCurrentVersion = useCallback(async () => {
    if (!ipcRenderer) return;
    setLoading((prev) => ({ ...prev, current: true }));
    try {
      const version = await ipcRenderer.invoke('get-current-version');
      setCurrentVersion(version as string);
    } catch (error) {
      console.error('Failed to get current version:', error);
    } finally {
      setLoading((prev) => ({ ...prev, current: false }));
    }
  }, [ipcRenderer]);

  const fetchInstalledVersions = useCallback(async () => {
    if (!ipcRenderer) return;
    setLoading((prev) => ({ ...prev, installed: true }));
    try {
      const versions = await ipcRenderer.invoke('get-installed-versions');
      setInstalledVersions(versions as string[]);
    } catch (error) {
      console.error('Failed to get installed versions:', error);
    } finally {
      setLoading((prev) => ({ ...prev, installed: false }));
    }
  }, [ipcRenderer]);

  const fetchAvailableVersions = useCallback(async () => {
    if (!ipcRenderer) return;
    setLoading((prev) => ({ ...prev, available: true }));
    try {
      const versions = await ipcRenderer.invoke('get-available-versions');
      setAvailableVersions(versions as string[]);
    } catch (error) {
      console.error('Failed to get available versions:', error);
    } finally {
      setLoading((prev) => ({ ...prev, available: false }));
    }
  }, [ipcRenderer]);

  const useVersion = useCallback(
    async (version: string) => {
      if (!ipcRenderer) return '';
      return ipcRenderer.invoke('use-version', version) as Promise<string>;
    },
    [ipcRenderer]
  );

  const installVersion = useCallback(
    async (version: string) => {
      if (!ipcRenderer) return '';
      return ipcRenderer.invoke('install-version', version) as Promise<string>;
    },
    [ipcRenderer]
  );

  const minimizeWindow = useCallback(() => {
    if (!ipcRenderer) return;
    ipcRenderer.invoke('window-minimize');
  }, [ipcRenderer]);

  const maximizeWindow = useCallback(() => {
    if (!ipcRenderer) return;
    ipcRenderer.invoke('window-maximize');
  }, [ipcRenderer]);

  const closeWindow = useCallback(() => {
    if (!ipcRenderer) return;
    ipcRenderer.invoke('window-close');
  }, [ipcRenderer]);

  const checkNvmInstalled = useCallback(async () => {
    if (!ipcRenderer) return;
    setLoading((prev) => ({ ...prev, nvm: true }));
    try {
      const installed = await ipcRenderer.invoke('check-nvm-installed');
      setNvmInstalled(installed as boolean);
    } catch (error) {
      console.error('Failed to check nvm installed:', error);
      setNvmInstalled(false);
    } finally {
      setLoading((prev) => ({ ...prev, nvm: false }));
    }
  }, [ipcRenderer]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchCurrentVersion(),
      fetchInstalledVersions(),
      fetchAvailableVersions(),
    ]);
  }, [fetchCurrentVersion, fetchInstalledVersions, fetchAvailableVersions]);

  useEffect(() => {
    refreshAll();
    if (ipcRenderer) {
      (async () => {
        setLoading((prev) => ({ ...prev, nvm: true }));
        try {
          const installed = await ipcRenderer.invoke('check-nvm-installed');
          setNvmInstalled(installed as boolean);
        } catch (error) {
          console.error('Failed to check nvm installed:', error);
          setNvmInstalled(false);
        } finally {
          setLoading((prev) => ({ ...prev, nvm: false }));
        }
      })();
    }
  }, [refreshAll, ipcRenderer]);

  return {
    currentVersion,
    installedVersions,
    availableVersions,
    nvmInstalled,
    loading,
    fetchCurrentVersion,
    fetchInstalledVersions,
    fetchAvailableVersions,
    useVersion,
    installVersion,
    refreshAll,
    checkNvmInstalled,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    hasElectron: !!ipcRenderer,
  };
};
