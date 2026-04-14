import { Search, X } from 'lucide-react';

interface VersionSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function VersionSearch({ searchQuery, onSearchChange }: VersionSearchProps) {
  return (
    <div className="mb-4 relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-500" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="搜索 Node.js 版本 (如: 18, v20, 16.14)..."
        className="w-full box-border pl-11 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-sm"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          className="absolute inset-y-0 right-0 !pr-2 flex items-center"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            boxShadow: 'none',
            outline: 'none',
          }}
        >
          <div className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-200" />
          </div>
        </button>
      )}
    </div>
  );
}
