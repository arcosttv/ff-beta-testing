import React, { useState, useEffect } from 'react';
import { X, Plus, User } from 'lucide-react';
import { fetchGuildTesters } from '../lib/supabase';

export function CreateTaskModal({ activeCharacter, onClose, onCreateTask, user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Quest Route');
  const [priority, setPriority] = useState('Normal');
  const [assignedTo, setAssignedTo] = useState(activeCharacter || '');
  const [assignedDiscordId, setAssignedDiscordId] = useState(user?.discordId || '');
  const [testers, setTesters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadTesters() {
      const list = await fetchGuildTesters();
      setTesters(list);
    }
    loadTesters();
  }, []);

  const categories = [
    'Quest Route',
    'Leveling Speed',
    'Racials',
    'Dungeon',
    'Class Balance',
    'UI / Addon',
    'General'
  ];
  const priorities = ['Urgent', 'High', 'Normal', 'Low'];

  const handleSelectTester = (e) => {
    const selectedValue = e.target.value;
    setAssignedTo(selectedValue);
    
    // Find matching numeric Discord ID from registered testers
    const found = testers.find(t => t.displayName.toLowerCase() === selectedValue.toLowerCase());
    if (found) {
      setAssignedDiscordId(found.discordId || '');
    } else if (user && user.displayName?.toLowerCase() === selectedValue.toLowerCase()) {
      setAssignedDiscordId(user.discordId || '');
    } else if (/^\d+$/.test(selectedValue.replace(/[<@!&>]/g, ''))) {
      setAssignedDiscordId(selectedValue.replace(/[<@!&>]/g, ''));
    } else {
      setAssignedDiscordId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateTask({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        assigned_to: assignedTo.trim(),
        assigned_discord_id: assignedDiscordId || (user?.discordId || ''),
        created_by: activeCharacter || 'Tester'
      });
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090c10]/85 backdrop-blur-sm animate-fade-in font-sans">
      <div 
        className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#21262d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-heading">
                New Test Task
              </h2>
              <p className="text-xs text-slate-400">Add a quest route, leveling speed, or racial skill task to queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Redridge Mountains Lvl 15-20 Quest Route Speed Run"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#161b22] text-slate-200">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {priorities.map((p) => (
                  <option key={p} value={p} className="bg-[#161b22] text-slate-200">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Assigned Tester (Optional)
              </label>
              {assignedDiscordId && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  ✓ Discord ID Linked (<code className="text-emerald-300">{assignedDiscordId}</code>)
                </span>
              )}
            </div>
            <input
              type="text"
              list="tester-suggestions"
              placeholder="Select guild member or type character name..."
              value={assignedTo}
              onChange={handleSelectTester}
              className="w-full px-3.5 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <datalist id="tester-suggestions">
              {activeCharacter && <option value={activeCharacter}>{activeCharacter} (Me)</option>}
              {testers.map((t) => (
                <option key={t.displayName} value={t.displayName}>
                  {t.displayName} ({t.discordId})
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Test Objectives & Details
            </label>
            <textarea
              rows={3}
              placeholder="Record start/end level, questing route details, or racial skill testing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#21262d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-[#21262d] hover:bg-[#30363d] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
