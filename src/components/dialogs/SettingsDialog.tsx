import { Dialog } from '@/components/Dialog';
import { Button } from '@/components/ui/button';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tempNodeMirror: string;
  tempNpmMirror: string;
  onNodeMirrorChange: (value: string) => void;
  onNpmMirrorChange: (value: string) => void;
  onSave: () => void;
  onApplyTaobaoMirror: () => void;
  onApplyOfficialMirror: () => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  tempNodeMirror,
  tempNpmMirror,
  onNodeMirrorChange,
  onNpmMirrorChange,
  onSave,
  onApplyTaobaoMirror,
  onApplyOfficialMirror,
}: SettingsDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="设置"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="bg-white/8 text-slate-300 border-white/12 hover:bg-white/12"
            onClick={onClose}
          >
            取消
          </Button>
          <Button variant="primary" onClick={onSave}>
            保存
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Node.js 镜像地址
          </label>
          <input
            type="text"
            value={tempNodeMirror}
            onChange={(e) => onNodeMirrorChange(e.target.value)}
            placeholder="https://nodejs.org/dist/"
            className="w-full box-border px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-sm break-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            npm 镜像地址
          </label>
          <input
            type="text"
            value={tempNpmMirror}
            onChange={(e) => onNpmMirrorChange(e.target.value)}
            placeholder="https://registry.npmmirror.com"
            className="w-full box-border px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-sm break-all"
          />
        </div>
        <div className="pt-2">
          <p className="text-xs text-slate-500 mb-2">常用镜像：</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onApplyTaobaoMirror}
              className="px-3 py-1.5 text-xs bg-blue-500/15 text-blue-400 border border-blue-500/40 rounded hover:bg-blue-500/25 transition-colors"
            >
              淘宝镜像
            </button>
            <button
              type="button"
              onClick={onApplyOfficialMirror}
              className="px-3 py-1.5 text-xs bg-slate-500/15 text-slate-400 border border-slate-500/40 rounded hover:bg-slate-500/25 transition-colors"
            >
              官方源
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
