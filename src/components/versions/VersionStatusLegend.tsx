export function VersionStatusLegend() {
  return (
    <div className="mb-4 flex flex-wrap gap-2 items-center text-xs">
      <span className="text-slate-500">版本状态：</span>
      <span className="inline-flex items-center px-2 py-0.5 rounded font-medium border bg-green-500/20 text-green-400 border-green-500/40">
        活跃 LTS
      </span>
      <span className="inline-flex items-center px-2 py-0.5 rounded font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
        维护 LTS
      </span>
      <span className="inline-flex items-center px-2 py-0.5 rounded font-medium border bg-purple-500/20 text-purple-400 border-purple-500/40">
        Current
      </span>
      <span className="inline-flex items-center px-2 py-0.5 rounded font-medium border bg-red-500/20 text-red-400 border-red-500/40">
        EoL
      </span>
    </div>
  );
}
