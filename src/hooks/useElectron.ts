import { useEffect, useState, useCallback } from 'react';

// 类型声明
interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    require?: (module: string) => unknown;
  }
}

// 获取 ipcRenderer
const getIpcRenderer = () => {
  if (typeof window !== 'undefined' && window.require) {
    try {
      return window.require('electron').ipcRenderer;
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
  const [loading, setLoading] = useState({
    current: false,
    installed: false,
    available: false,
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

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchCurrentVersion(),
      fetchInstalledVersions(),
      fetchAvailableVersions(),
    ]);
  }, [fetchCurrentVersion, fetchInstalledVersions, fetchAvailableVersions]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    currentVersion,
    installedVersions,
    availableVersions,
    loading,
    fetchCurrentVersion,
    fetchInstalledVersions,
    fetchAvailableVersions,
    useVersion,
    installVersion,
    refreshAll,
    hasElectron: !!ipcRenderer,
  };
};
