export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface VersionItemProps {
  version: string;
  isCurrent: boolean;
  isInstalled?: boolean;
  onUse?: (version: string) => void;
  onInstall?: (version: string) => void;
  onUninstall?: (version: string) => void;
}

export interface NvmSettings {
  node_mirror?: string;
  npm_mirror?: string;
  root?: string;
  path?: string;
  nodejs?: string;
}
