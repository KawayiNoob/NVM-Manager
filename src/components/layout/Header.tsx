interface HeaderProps {
  currentVersion: string | null;
  loading: boolean;
}

export function Header({ currentVersion, loading }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-4 pt-5">
      <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        NVM Manager
      </h1>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-slate-400 uppercase tracking-wide">当前版本</span>
        <span className="text-xl font-semibold text-green-400">
          {loading ? '加载中...' : currentVersion || '未安装'}
        </span>
      </div>
    </header>
  );
}
