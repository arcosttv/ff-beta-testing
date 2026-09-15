import React from 'react';
import { User, Bug, Video, MessageSquare, ArrowRight } from 'lucide-react';

export function TaskCard({ task, activeCharacter, onSelectTask, onClaimTask, onMoveTask }) {
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Quest Route':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50';
      case 'Leveling Speed':
      case 'Leveling Speed (X to Y)':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/50';
      case 'Racials':
      case 'Class / Race Combo':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50';
      case 'Dungeon':
        return 'bg-teal-950/60 text-teal-300 border-teal-800/50';
      case 'Class Balance':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50';
      case 'UI / Addon':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/50';
      default:
        return 'bg-[#21262d] text-slate-300 border-slate-700';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 uppercase">Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 uppercase">High</span>;
      case 'Normal':
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-[#21262d] text-slate-400 border border-[#30363d]">Normal</span>;
      default:
        return null;
    }
  };

  const openBugs = (task.bugs || []).filter(b => b.status === 'open');

  const handleClaim = (e) => {
    e.stopPropagation();
    if (activeCharacter) {
      onClaimTask(task.id, activeCharacter);
    }
  };

  return (
    <div
      onClick={() => onSelectTask(task)}
      className="card-minimal rounded-xl p-4 cursor-pointer shadow-sm hover:border-slate-600 flex flex-col justify-between gap-3 font-sans"
    >
      {/* Category & Priority */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`px-2 py-0.5 text-[11px] font-medium rounded border ${getCategoryBadge(task.category)}`}>
            {task.category}
          </span>
          {getPriorityBadge(task.priority)}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-sans">
            {task.description}
          </p>
        )}
      </div>

      {/* Media / Notes / Bugs metadata indicators */}
      {(task.feedback_notes || task.media_url || openBugs.length > 0) && (
        <div className="flex items-center gap-2.5 text-[11px] text-slate-400 pt-2 border-t border-[#21262d]">
          {task.feedback_notes && (
            <span className="flex items-center gap-1 text-slate-400" title="Has tester notes">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              Notes
            </span>
          )}

          {task.media_url && (
            <span className="flex items-center gap-1 text-slate-400" title="Has media link">
              <Video className="w-3 h-3 text-slate-400" />
              Media
            </span>
          )}

          {openBugs.length > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50 font-semibold text-[10px]">
              <Bug className="w-3 h-3 text-rose-400" />
              {openBugs.length} {openBugs.length === 1 ? 'Failed Bug' : 'Failed Bugs'}
            </span>
          )}
        </div>
      )}

      {/* Footer Assignment & Details */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#21262d] text-xs">
        {task.assigned_to ? (
          <div className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
            <div className="w-5 h-5 rounded-full bg-[#21262d] border border-[#30363d] text-indigo-400 flex items-center justify-center text-[10px] font-bold">
              {task.assigned_to.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-xs text-slate-300" title={`Claimed by ${task.assigned_to}`}>
              {task.assigned_to}
            </span>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-[11px] font-medium transition-colors"
            title={`Claim task as ${activeCharacter}`}
          >
            <User className="w-3 h-3 text-indigo-400" />
            Claim Task
          </button>
        )}

        <span className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5 transition-colors">
          Details
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
