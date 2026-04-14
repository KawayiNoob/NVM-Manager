import { Minus, Square, Copy, X } from 'lucide-react';

interface TitleBarProps {
  isMaximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export function TitleBar({ isMaximized, onMinimize, onMaximize, onClose }: TitleBarProps) {
  return (
    <div className="drag-region h-10 flex items-center justify-between px-3 select-none">
      <div className="flex-1" />
      <div className="no-drag flex items-center gap-1">
        <button
          onClick={onMinimize}
          className="w-8 h-8 flex items-center justify-center rounded transition-opacity text-white border-none outline-none hover:opacity-80"
          style={{ backgroundColor: '#192336' }}
          title="最小化"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onMaximize}
          className="w-8 h-8 flex items-center justify-center rounded transition-opacity text-white border-none outline-none hover:opacity-80"
          style={{ backgroundColor: '#192336' }}
          title={isMaximized ? '还原' : '最大化'}
        >
          {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded transition-opacity text-white border-none outline-none hover:opacity-80"
          style={{ backgroundColor: '#192336' }}
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
