import { Bell, Command, Search, GitBranch } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-[#0A0E17] border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center flex-1 max-w-2xl bg-[#141C2F] rounded-lg border border-gray-800 px-3 py-2">
        <Search className="w-4 h-4 text-gray-500 mr-2" />
        <input 
          type="text" 
          placeholder="Search repos, teams, judges, reports..."
          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
        />
        <div className="flex items-center gap-1 text-xs text-gray-500 bg-[#0A0E17] px-1.5 py-0.5 rounded border border-gray-800">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 text-emerald-400 border border-emerald-900/50">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs">Pipelines healthy</span>
        </div>

        <button className="hover:text-white relative">
          <Bell className="w-5 h-5" />
          <div className="absolute 0 top-0 right-0 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0A0E17]" />
        </button>

        <button className="flex items-center gap-2 hover:text-white px-3 py-1.5 border border-gray-800 rounded-md">
          <GitBranch className="w-4 h-4" />
          Connect
        </button>

        <div className="w-8 h-8 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
          PS
        </div>
      </div>
    </header>
  );
}
