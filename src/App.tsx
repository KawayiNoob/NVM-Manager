import { useState, useCallback } from 'react';
import { useElectron } from '@/hooks/useElectron';
import { useToast } from '@/hooks/useToast';
import { useWindowControls } from '@/hooks/useWindowControls';
import { useVersionActions } from '@/hooks/useVersionActions';
import { useSettings } from '@/hooks/useSettings';
import { useVersionSearch } from '@/hooks/useVersionSearch';
import { Toast } from '@/components/Toast';
import { GlobalStyles } from '@/components/layout/GlobalStyles';
import { TitleBar } from '@/components/layout/TitleBar';
import { Header } from '@/components/layout/Header';
import { VersionTabs } from '@/components/layout/VersionTabs';
import { Footer } from '@/components/layout/Footer';
import { InstalledVersionsTab } from '@/components/versions/InstalledVersionsTab';
import { AvailableVersionsTab } from '@/components/versions/AvailableVersionsTab';
import { SettingsDialog } from '@/components/dialogs/SettingsDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { ProgressOverlay } from '@/components/dialogs/ProgressOverlay';

type TabType = 'installed' | 'available';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('installed');

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

  const { toasts } = useToast();

  const windowControls = useWindowControls({
    hasElectron,
    checkIsMaximized,
    maximizeWindow,
    minimizeWindow,
    closeWindow,
  });

  const versionActions = useVersionActions({
    useVersion,
    installVersion,
    uninstallVersion,
    refreshAll,
    copyToClipboard,
  });

  const settings = useSettings({
    nvmSettings,
    fetchNvmSettings,
    saveNvmSettings,
  });

  const versionSearch = useVersionSearch(availableVersions);

  const handleRefresh = useCallback(() => {
    versionActions.handleRefresh(isRefreshing);
  }, [versionActions, isRefreshing]);

  const handleInstallNvm = useCallback(() => {
    openExternalUrl('https://github.com/coreybutler/nvm-windows');
  }, [openExternalUrl]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 flex flex-col">
      <GlobalStyles />

      <TitleBar
        isMaximized={windowControls.isMaximized}
        onMinimize={windowControls.minimizeWindow}
        onMaximize={windowControls.handleMaximize}
        onClose={windowControls.closeWindow}
      />

      <div className="flex flex-col flex-1 px-5 pt-0">
        <Header currentVersion={currentVersion} loading={loading.current} />

        <VersionTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-hidden bg-white/3 rounded-xl border border-white/8 min-h-0">
          <div className="relative h-full">
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                activeTab === 'installed' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <InstalledVersionsTab
                installedVersions={installedVersions}
                currentVersion={currentVersion}
                loading={loading.installed}
                onUse={versionActions.handleUseVersion}
                onUninstall={versionActions.handleUninstallVersion}
              />
            </div>

            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                activeTab === 'available' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <AvailableVersionsTab
                availableVersions={availableVersions}
                filteredVersions={versionSearch.filteredAvailableVersions}
                currentVersion={currentVersion}
                installedVersions={installedVersions}
                loading={loading.available}
                error={availableVersionsError}
                searchQuery={versionSearch.searchQuery}
                onSearchChange={versionSearch.setSearchQuery}
                onUse={versionActions.handleUseVersion}
                onInstall={versionActions.handleInstallVersion}
                onUninstall={versionActions.handleUninstallVersion}
              />
            </div>
          </div>
        </div>

        <Footer
          nvmInstalled={nvmInstalled}
          isRefreshing={isRefreshing}
          onInstallNvm={handleInstallNvm}
          onOpenSettings={settings.handleOpenSettings}
          onRefresh={handleRefresh}
        />
      </div>

      <Toast toasts={toasts} />

      <ProgressOverlay
        isInstalling={versionActions.isInstalling}
        isUninstalling={versionActions.isUninstalling}
        version={versionActions.isInstalling ? versionActions.installingVersion : versionActions.uninstallingVersion}
        progress={versionActions.isInstalling ? versionActions.installProgress : versionActions.uninstallProgress}
        status={versionActions.isInstalling ? versionActions.installStatus : versionActions.uninstallStatus}
      />

      <SettingsDialog
        isOpen={settings.settingsOpen}
        onClose={() => settings.setSettingsOpen(false)}
        tempNodeMirror={settings.tempNodeMirror}
        tempNpmMirror={settings.tempNpmMirror}
        onNodeMirrorChange={settings.setTempNodeMirror}
        onNpmMirrorChange={settings.setTempNpmMirror}
        onSave={settings.handleSaveSettings}
        onApplyTaobaoMirror={settings.applyTaobaoMirror}
        onApplyOfficialMirror={settings.applyOfficialMirror}
      />

      <ConfirmDialog
        isOpen={versionActions.confirmDialogOpen}
        onClose={() => versionActions.setConfirmDialogOpen(false)}
        pendingAction={versionActions.pendingAction}
        getActionText={versionActions.getActionText}
        onConfirm={versionActions.handleConfirmAction}
      />
    </div>
  );
}

export default App;
