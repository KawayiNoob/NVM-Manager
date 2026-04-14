import { Download } from 'lucide-react';

interface ProgressOverlayProps {
  isInstalling: boolean;
  isUninstalling: boolean;
  version: string;
  progress: number;
  status: string;
}

export function ProgressOverlay({
  isInstalling,
  isUninstalling,
  version,
  progress,
  status,
}: ProgressOverlayProps) {
  if (!isInstalling && !isUninstalling) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 w-80 border border-slate-700 shadow-2xl">
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isInstalling ? 'bg-blue-500/20' : 'bg-red-500/20'
            }`}
          >
            {isInstalling ? (
              <Download className="w-8 h-8 text-blue-400 animate-pulse" />
            ) : (
              <svg
                className="w-8 h-8 text-red-400 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-1">
            {isInstalling ? '正在安装' : '正在卸载'}
          </h3>
          <p className="text-slate-400 font-mono">{version}</p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">{status}</span>
            <span className={`font-semibold ${isInstalling ? 'text-blue-400' : 'text-red-400'}`}>
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isInstalling
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gradient-to-r from-red-500 to-orange-500'
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          {isInstalling
            ? '请勿关闭应用，安装可能需要几分钟...'
            : '正在清理文件...'}
        </p>
      </div>
    </div>
  );
}
