import { VersionItem } from '@/components/VersionItem';

interface InstalledVersionsTabProps {
  installedVersions: string[];
  currentVersion: string | null;
  loading: boolean;
  onUse: (version: string) => void;
  onUninstall: (version: string) => void;
}

export function InstalledVersionsTab({
  installedVersions,
  currentVersion,
  loading,
  onUse,
  onUninstall,
}: InstalledVersionsTabProps) {
  return (
    <div className="h-full overflow-y-auto p-3 custom-scrollbar">
      <div className="pb-4">
        {loading ? (
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
                  version === currentVersion || version === currentVersion?.replace('v', '')
                }
                isInstalled={true}
                onUse={onUse}
                onUninstall={onUninstall}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
