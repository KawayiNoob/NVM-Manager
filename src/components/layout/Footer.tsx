import { RefreshCw, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterProps {
  nvmInstalled: boolean;
  isRefreshing: boolean;
  onInstallNvm: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
}

export function Footer({
  nvmInstalled,
  isRefreshing,
  onInstallNvm,
  onOpenSettings,
  onRefresh,
}: FooterProps) {
  return (
    <footer className="flex justify-between items-center py-4 mt-4">
      <div className="flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${nvmInstalled ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className={nvmInstalled ? 'text-green-400' : 'text-red-400'}>
          NVM {nvmInstalled ? '已安装' : '未安装'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!nvmInstalled && (
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-500/15 text-green-400 border border-green-500/40 hover:bg-green-500/25 hover:text-green-300"
            onClick={onInstallNvm}
          >
            <Download className="w-4 h-4" />
            安装NVM
          </Button>
        )}
        <div className="relative group">
          <Button
            variant="outline"
            className="flex items-center gap-2 px-3 py-2.5 bg-white/8 text-slate-300 border border-white/12 hover:bg-white/12 hover:text-slate-100"
            onClick={onOpenSettings}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            设置
          </div>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/8 text-slate-300 border border-white/12 hover:bg-white/12 hover:text-slate-100"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>
    </footer>
  );
}
