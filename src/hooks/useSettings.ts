import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';

interface NvmSettings {
  node_mirror?: string;
  npm_mirror?: string;
}

interface UseSettingsOptions {
  nvmSettings: NvmSettings;
  fetchNvmSettings: () => Promise<void>;
  saveNvmSettings: (settings: NvmSettings) => Promise<boolean>;
}

export function useSettings({ nvmSettings, fetchNvmSettings, saveNvmSettings }: UseSettingsOptions) {
  const { showToast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempNodeMirror, setTempNodeMirror] = useState('');
  const [tempNpmMirror, setTempNpmMirror] = useState('');

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

  const applyTaobaoMirror = useCallback(() => {
    setTempNodeMirror('https://npmmirror.com/mirrors/node/');
    setTempNpmMirror('https://registry.npmmirror.com');
  }, []);

  const applyOfficialMirror = useCallback(() => {
    setTempNodeMirror('https://nodejs.org/dist/');
    setTempNpmMirror('https://registry.npmjs.org');
  }, []);

  return {
    settingsOpen,
    setSettingsOpen,
    tempNodeMirror,
    setTempNodeMirror,
    tempNpmMirror,
    setTempNpmMirror,
    handleOpenSettings,
    handleSaveSettings,
    applyTaobaoMirror,
    applyOfficialMirror,
  };
}
