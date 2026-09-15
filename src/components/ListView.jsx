import React, { useState } from 'react';
import { Bug, Video, MessageSquare, ExternalLink, Filter, Shield, CheckCircle2, Clock, XCircle } from 'lucide-react';

export function ListView({ tasks, activeCharacter, onSelectTask, selectedCategory, searchQuery }) {
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'To Test' | 'In Progress' | 'Result' | 'Failed' | 'Open Bugs'

  const filteredTasks = tasks.filter(task => {
    // Tab Filter
    if (filterTab === 'Open Bugs') {
      const openBugs = (task.bugs || []).filter(b => b.status === 'open');
      if (openBugs.length === 0) return false;
    } else if (filterTab !== 'All' && task.status !== filterTab) {
      return false;
    }

    // Category Filter
    if (selectedCategory !== 'All Categories' && task.category !== selectedCategory) {
      return false;
    }

    // Search Query
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchTitle = task.title?.toLowerCase().includes(query);
      const matchDesc = task.description?.toLowerCase().includes(query);
      const matchAssignee = task.assigned_to?.toLowerCase().includes(query);
      const matchNotes = task.feedback_notes?.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchAssignee && !matchNotes) return false;
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'To Test':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">To Test</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/50">In Progress</span>;
      case 'Result':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">Result</span>;
      case 'Failed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/50">Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans space-y-4">
      
      {/* Tab Filter Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161b22] p-2 rounded-xl border border-[#21262d]">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'To Test', 'In Progress', 'Result', 'Failed', 'Open Bugs'].map((tab) => {
            const count = tab === 'All' 
              ? tasks.length 
              : tab === 'Open Bugs'
              ? tasks.filter(t => (t.bugs || []).some(b => b.status === 'open')).length
              : tasks.filter(t => t.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  filterTab === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#21262d]'
                }`}
              >
                {tab}
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${filterTab === tab ? 'bg-indigo-700 text-white' : 'bg-[#0d1117] text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 hidden md:block">
          Click any row to open test results or record bugs
        </p>
      </div>

      {/* Clean Tasks Table */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0d1117] border-b border-[#21262d] uppercase text-[11px] font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Tester</th>
                <th className="py-3 px-4">Feedback / Test Results</th>
                <th className="py-3 px-4">Bugs</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                    No test tasks match your current filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const openBugs = (task.bugs || []).filter(b => b.status === 'open');

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="hover:bg-[#1f2430] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(task.status)}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-100 max-w-xs truncate">
                        {task.title}
                        {task.priority === 'Urgent' && (
                          <span className="ml-2 px-1.5 py-0.2 text-[9px] font-bold text-rose-400 bg-rose-950/80 rounded border border-rose-800/60 uppercase">
                            Urgent
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#0d1117] border border-[#30363d] text-slate-300">
                          {task.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {task.assigned_to ? (
                          <span className="text-slate-200 font-medium">@{task.assigned_to}</span>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-sm truncate text-slate-400">
                        {task.feedback_notes ? (
                          <span className="text-slate-300">{task.feedback_notes}</span>
                        ) : (
                          <span className="text-slate-600 italic">No notes recorded yet</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {openBugs.length > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50 text-[10px] font-semibold flex items-center gap-1 w-fit">
                            <Bug className="w-3 h-3 text-rose-400" />
                            {openBugs.length} Open
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-indigo-400 hover:text-indigo-300 font-medium">
                          View Details &rarr;
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
