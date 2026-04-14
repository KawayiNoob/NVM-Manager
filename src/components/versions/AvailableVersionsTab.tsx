import { VersionItem } from '@/components/VersionItem';
import { VersionSearch } from './VersionSearch';
import { VersionStatusLegend } from './VersionStatusLegend';
import { AvailableVersionsError } from './AvailableVersionsError';

interface AvailableVersionsTabProps {
  availableVersions: string[];
  filteredVersions: string[];
  currentVersion: string | null;
  installedVersions: string[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUse: (version: string) => void;
  onInstall: (version: string) => void;
  onUninstall: (version: string) => void;
}

export function AvailableVersionsTab({
  availableVersions,
  filteredVersions,
  currentVersion,
  installedVersions,
  loading,
  error,
  searchQuery,
  onSearchChange,
  onUse,
  onInstall,
  onUninstall,
}: AvailableVersionsTabProps) {
  return (
    <div className="h-full overflow-y-auto p-3 custom-scrollbar">
      <div className="pb-4">
        <VersionSearch searchQuery={searchQuery} onSearchChange={onSearchChange} />
        <VersionStatusLegend />

        {loading ? (
          <div className="text-center py-10 text-slate-500">加载中...</div>
        ) : error ? (
          <AvailableVersionsError error={error} />
        ) : availableVersions.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p className="mb-2">暂无可用版本</p>
            <p className="text-xs text-slate-600">点击刷新按钮重试</p>
          </div>
        ) : filteredVersions.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p className="mb-2">未找到匹配的版本</p>
            <p className="text-xs text-slate-600">请尝试其他搜索关键词</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredVersions.map((version) => (
              <VersionItem
                key={version}
                version={version}
                isCurrent={
                  version === currentVersion || version === currentVersion?.replace('v', '')
                }
                isInstalled={
                  installedVersions.includes(version) ||
                  installedVersions.includes(version.replace('v', ''))
                }
                onUse={onUse}
                onInstall={onInstall}
                onUninstall={onUninstall}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
