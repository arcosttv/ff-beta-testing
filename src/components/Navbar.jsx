import React from 'react';
import { 
  Plus, Search, RefreshCw, LogOut, LayoutGrid, ListFilter, 
  Download, Upload, UserCheck, Shield, Crown 
} from 'lucide-react';
import { isOfficer } from '../lib/supabase';

export function Navbar({
  user,
  onDisconnectUser,
  onToggleOfficerRole,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onOpenCreateModal,
  onOpenImportModal,
  onExportCsv,
  tasksOpen,
  tasksInProgress,
  tasksFailed,
  onRefreshData,
  isRefreshing,
  viewMode,
  setViewMode,
  showOnlyMyTasks,
  setShowOnlyMyTasks
}) {
  const categories = [
    'All Categories',
    'Quest Route',
    'Leveling Speed',
    'Racials',
    'Dungeon',
    'Class Balance',
    'UI / Addon',
    'General'
  ];

  const userDisplayName = user ? (user.displayName || user.username) : 'Tester';
  const userIsOfficer = isOfficer(user);

  return (
    <header className="bg-[#161b22] border-b border-[#21262d] sticky top-0 z-30 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & View Mode Switcher */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-lg sm:text-xl font-extrabold text-slate-100 tracking-tight">
                  FF - Beta Testing
                </h1>
                
                {/* View Switcher: Board | List */}
                <div className="flex items-center bg-[#0d1117] p-0.5 border border-[#30363d] rounded-lg">
                  <button
                    onClick={() => setViewMode('board')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                      viewMode === 'board'
                        ? 'bg-[#21262d] text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Kanban Board View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Board
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#21262d] text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="List & Spreadsheet View"
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    List View
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Internal playtest & bug tracking protocol</p>
            </div>

            {/* Mobile New Task */}
            <button
              onClick={onOpenCreateModal}
              className="lg:hidden p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Controls: Search, Filters, Officer Import/Export, User */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Search Input ("Search test tasks") */}
            <div className="relative flex-1 sm:w-48 min-w-[130px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search test tasks"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#161b22] text-slate-200">
                  {cat}
                </option>
              ))}
            </select>

            {/* "My Tasks" Quick Filter Toggle */}
            <button
              onClick={() => setShowOnlyMyTasks(!showOnlyMyTasks)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                showOnlyMyTasks
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
                  : 'bg-[#0d1117] text-slate-400 border-[#30363d] hover:text-slate-200'
              }`}
              title="Show only tasks claimed by me"
            >
              <UserCheck className="w-3.5 h-3.5" />
              My Tasks
            </button>

            {/* OFFICER ONLY: Spreadsheet Import / Export Buttons */}
            {userIsOfficer && (
              <div className="flex items-center gap-1 border-l border-[#30363d] pl-2">
                <button
                  onClick={onExportCsv}
                  className="p-1.5 text-slate-300 hover:text-white bg-amber-950/40 border border-amber-800/50 rounded-lg transition-colors flex items-center gap-1 text-xs"
                  title="Officer Only: Export Tasks to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline text-[11px]">Export</span>
                </button>

                <button
                  onClick={onOpenImportModal}
                  className="p-1.5 text-slate-300 hover:text-white bg-amber-950/40 border border-amber-800/50 rounded-lg transition-colors flex items-center gap-1 text-xs"
                  title="Officer Only: Mass Import CSV"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline text-[11px]">Import</span>
                </button>
              </div>
            )}

            {/* Verified Discord User Pill */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                
                <span className="font-semibold text-slate-100" title={`Handle: ${user.username}`}>
                  {userDisplayName}
                </span>

                <button
                  type="button"
                  onClick={onToggleOfficerRole}
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold cursor-pointer transition-all hover:scale-105 ${
                    userIsOfficer 
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-sm'
                      : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                  }`}
                  title="Click to toggle Officer / Tester role permissions"
                >
                  {user.role || 'Trial'}
                </button>

                <button
                  onClick={onDisconnectUser}
                  className="p-0.5 text-slate-500 hover:text-rose-400 transition-colors ml-0.5"
                  title="Disconnect Discord"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-slate-600 transition-all disabled:opacity-50"
              title="Refresh board"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Desktop "+ New Task" Button */}
            <button
              onClick={onOpenCreateModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              + New Task
            </button>

          </div>
        </div>

        {/* Second bar: Stats Summary */}
        <div className="mt-2.5 pt-2 border-t border-[#21262d] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Tasks open: <strong className="text-cyan-400">{tasksOpen}</strong></span>
            <span>|</span>
            <span>Tasks in progress: <strong className="text-amber-400">{tasksInProgress}</strong></span>
            <span>|</span>
            <span>Tasks failed: <strong className="text-rose-400">{tasksFailed}</strong></span>
          </div>

          {showOnlyMyTasks && (
            <span className="text-indigo-400 text-[11px] font-medium">
              Showing tasks assigned to {userDisplayName}
            </span>
          )}
        </div>

      </div>
    </header>
  );
}
