import { useEffect, useState, useCallback } from 'react';
import type { NvmSettings } from '@/types';

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
  const [nvmSettings, setNvmSettings] = useState<NvmSettings>({});
  const [loading, setLoading] = useState({
    current: false,
    installed: false,
    available: false,
    nvm: false,
    settings: false,
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

  const uninstallVersion = useCallback(
    async (version: string) => {
      if (!ipcRenderer) return '';
      return ipcRenderer.invoke('uninstall-version', version) as Promise<string>;
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

  const openExternalUrl = useCallback((url: string) => {
    if (!ipcRenderer) {
      window.open(url, '_blank');
      return;
    }
    ipcRenderer.invoke('open-external-url', url);
  }, [ipcRenderer]);

  const copyToClipboard = useCallback(async (text: string) => {
    if (!ipcRenderer) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    }
    return ipcRenderer.invoke('copy-to-clipboard', text) as Promise<boolean>;
  }, [ipcRenderer]);

  const isMaximized = useCallback(async () => {
    if (!ipcRenderer) return false;
    return ipcRenderer.invoke('window-is-maximized') as Promise<boolean>;
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

  const fetchNvmSettings = useCallback(async () => {
    if (!ipcRenderer) return;
    setLoading((prev) => ({ ...prev, settings: true }));
    try {
      const settings = await ipcRenderer.invoke('get-nvm-settings');
      setNvmSettings(settings as NvmSettings);
    } catch (error) {
      console.error('Failed to fetch nvm settings:', error);
      setNvmSettings({});
    } finally {
      setLoading((prev) => ({ ...prev, settings: false }));
    }
  }, [ipcRenderer]);

  const saveNvmSettings = useCallback(
    async (settings: NvmSettings) => {
      if (!ipcRenderer) return false;
      try {
        await ipcRenderer.invoke('set-nvm-settings', settings);
        setNvmSettings((prev) => ({ ...prev, ...settings }));
        return true;
      } catch (error) {
        console.error('Failed to save nvm settings:', error);
        return false;
      }
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
    nvmSettings,
    loading,
    fetchCurrentVersion,
    fetchInstalledVersions,
    fetchAvailableVersions,
    useVersion,
    installVersion,
    uninstallVersion,
    refreshAll,
    checkNvmInstalled,
    fetchNvmSettings,
    saveNvmSettings,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    openExternalUrl,
    copyToClipboard,
    isMaximized,
    hasElectron: !!ipcRenderer,
  };
};
