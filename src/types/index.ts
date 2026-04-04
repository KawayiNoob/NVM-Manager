export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface VersionItemProps {
  version: string;
  isCurrent: boolean;
  isInstalled?: boolean;
  onUse?: (version: string) => void;
  onInstall?: (version: string) => void;
}
