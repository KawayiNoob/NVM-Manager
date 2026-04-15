import { VersionItem } from '@/components/VersionItem';
import { VersionSearch } from './VersionSearch';

interface InstalledVersionsTabProps {
  installedVersions: string[];
  filteredVersions?: string[];
  currentVersion: string | null;
  loading: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onUse: (version: string) => void;
  onUninstall: (version: string) => void;
}

export function InstalledVersionsTab({
  installedVersions,
  filteredVersions,
  currentVersion,
  loading,
  searchQuery = '',
  onSearchChange,
  onUse,
  onUninstall,
}: InstalledVersionsTabProps) {
  const displayVersions = filteredVersions ?? installedVersions;

  return (
    <div className="h-full overflow-y-auto p-3 custom-scrollbar">
      <div className="pb-4">
        {onSearchChange && (
          <VersionSearch searchQuery={searchQuery} onSearchChange={onSearchChange} />
        )}
        {loading ? (
          <div className="text-center py-10 text-slate-500">加载中...</div>
        ) : installedVersions.length === 0 ? (
          <div className="text-center py-10 text-slate-500">暂无已安装版本</div>
        ) : displayVersions.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p className="mb-2">未找到匹配的版本</p>
            <p className="text-xs text-slate-600">请尝试其他搜索关键词</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayVersions.map((version) => (
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
