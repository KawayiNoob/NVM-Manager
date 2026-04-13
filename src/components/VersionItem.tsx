import { Button } from '@/components/ui/button';
import type { VersionItemProps } from '@/types';
import { getNodeVersionStatus, getStatusStyleClasses } from '@/lib/nodeVersionStatus';

export const VersionItem: React.FC<VersionItemProps> = ({
  version,
  isCurrent,
  isInstalled = false,
  onUse,
  onInstall,
  onUninstall,
}) => {
  const statusInfo = getNodeVersionStatus(version);
  const statusStyle = getStatusStyleClasses(statusInfo.status);

  return (
    <div className={`version-item ${isCurrent ? 'version-item-current' : ''}`}>
      <div className="flex flex-col gap-0.5">
        <div className="text-base font-medium text-slate-200">{version}</div>
        <div className="flex gap-1 mt-1 flex-wrap">
          {isCurrent && <span className="badge badge-current">当前使用</span>}
          {isInstalled && !isCurrent && <span className="badge badge-installed">已安装</span>}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusStyle.badge}`}
            title={statusInfo.description}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        {!isInstalled && onInstall && (
          <Button variant="success" size="sm" onClick={() => onInstall(version)}>
            安装
          </Button>
        )}
        {isInstalled && !isCurrent && onUse && (
          <Button variant="primary" size="sm" onClick={() => onUse(version)}>
            使用
          </Button>
        )}
        {isInstalled && !isCurrent && onUninstall && (
          <Button variant="destructive" size="sm" onClick={() => onUninstall(version)}>
            卸载
          </Button>
        )}
      </div>
    </div>
  );
};
