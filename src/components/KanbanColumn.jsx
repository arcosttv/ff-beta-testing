import React from 'react';
import { TaskCard } from './TaskCard';
import { Shield, CheckCircle2, Clock, XCircle, Plus } from 'lucide-react';

export function KanbanColumn({
  title,
  tasks,
  activeCharacter,
  onSelectTask,
  onClaimTask,
  onMoveTask,
  onOpenCreateModal
}) {
  const getColumnIcon = (columnTitle) => {
    switch (columnTitle) {
      case 'To Test':
        return <Clock className="w-4 h-4 text-cyan-400" />;
      case 'In Progress':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'Result':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="panel-minimal rounded-xl flex flex-col h-full overflow-hidden shadow-sm min-w-[280px] flex-1">
      
      {/* Column Header */}
      <div className="p-3.5 border-b border-[#21262d] bg-[#161b22] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {getColumnIcon(title)}
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xs font-bold tracking-wide text-slate-100 uppercase">
              {title}
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-[#0d1117] text-slate-300 border border-[#30363d]">
              {tasks.length}
            </span>
          </div>
        </div>

        {title === 'To Test' && (
          <button
            onClick={onOpenCreateModal}
            className="p-1 rounded bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white transition-colors"
            title="Add task"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tasks Stack */}
      <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[400px] max-h-[calc(100vh-230px)] custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center p-4 text-center border border-dashed border-[#21262d] rounded-lg">
            <p className="text-xs text-slate-500 font-sans mb-2">No tasks in {title}</p>
            {title === 'To Test' && (
              <button
                onClick={onOpenCreateModal}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Task
              </button>
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              activeCharacter={activeCharacter}
              onSelectTask={onSelectTask}
              onClaimTask={onClaimTask}
              onMoveTask={onMoveTask}
            />
          ))
        )}
      </div>

    </div>
  );
}
