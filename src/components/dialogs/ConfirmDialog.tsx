import { Dialog } from '@/components/Dialog';
import { Button } from '@/components/ui/button';

type PendingAction = {
  type: 'install' | 'uninstall' | 'use';
  version: string;
} | null;

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAction: PendingAction;
  getActionText: (type: 'install' | 'uninstall' | 'use') => string;
  onConfirm: () => void;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  pendingAction,
  getActionText,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="操作确认"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="bg-white/8 text-slate-300 border-white/12 hover:bg-white/12"
            onClick={onClose}
          >
            取消
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            继续
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <svg
            className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="text-sm">
            <p className="text-yellow-200 font-medium mb-1">温馨提示</p>
            <p className="text-slate-300 leading-relaxed">
              即将 {pendingAction ? getActionText(pendingAction.type) : ''} Node.js 版本
              <span className="font-mono text-blue-400 ml-1">{pendingAction?.version}</span>
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-400 space-y-2">
          <p>
            <span className="text-slate-300 font-medium">操作前请关闭：</span>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>正在运行的 Node.js 应用程序</li>
            <li>使用 Node.js 的开发工具（如 VS Code、WebStorm 等）</li>
            <li>终端或命令行窗口</li>
          </ul>
          <p className="pt-2 text-slate-500 text-xs">
            此操作可能会影响依赖 Node.js 的其他程序，建议保存工作后再继续。
          </p>
        </div>
      </div>
    </Dialog>
  );
}
