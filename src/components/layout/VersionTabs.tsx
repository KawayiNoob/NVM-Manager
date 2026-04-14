type TabType = 'installed' | 'available';

interface VersionTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function VersionTabs({ activeTab, onTabChange }: VersionTabsProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
          activeTab === 'installed'
            ? 'bg-blue-500/15 border border-blue-500/40 text-blue-400'
            : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
        }`}
        onClick={() => onTabChange('installed')}
      >
        已安装
      </button>
      <button
        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
          activeTab === 'available'
            ? 'bg-blue-500/15 border border-blue-500/40 text-blue-400'
            : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
        }`}
        onClick={() => onTabChange('available')}
      >
        可下载
      </button>
    </div>
  );
}
