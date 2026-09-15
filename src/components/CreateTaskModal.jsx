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
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadTesters() {
      const list = await fetchGuildTesters();
      setTesters(list);
    }
    loadTesters();
  }, []);

  const filteredTesters = testers.filter(t => 
    t.displayName.toLowerCase().includes((assignedTo || '').toLowerCase()) &&
    t.displayName.toLowerCase() !== (activeCharacter || '').toLowerCase()
  );

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

          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Assigned Tester (Optional)
              </label>
              {assignedDiscordId && (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ✓ Discord ID Linked
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Select guild member or type character name..."
                value={assignedTo}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  const val = e.target.value;
                  setAssignedTo(val);
                  setShowDropdown(true);
                  // Check if matching registered tester
                  const match = filteredTesters.find(t => t.displayName.toLowerCase() === val.toLowerCase());
                  if (match) {
                    setAssignedDiscordId(match.discordId || '');
                  } else if (user && user.displayName?.toLowerCase() === val.toLowerCase()) {
                    setAssignedDiscordId(user.discordId || '');
                  } else {
                    setAssignedDiscordId('');
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />

              {showDropdown && (
                <div 
                  className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-[#21262d]"
                  onMouseDown={(e) => e.preventDefault()} // prevent input blur on click
                >
                  {/* Option for Current User (Me) */}
                  {activeCharacter && (
                    <button
                      type="button"
                      onClick={() => {
                        setAssignedTo(activeCharacter);
                        setAssignedDiscordId(user?.discordId || '');
                        setShowDropdown(false);
                      }}
                      className="w-full px-3.5 py-2 text-left flex items-center justify-between text-xs hover:bg-[#21262d] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-slate-100 font-medium">{activeCharacter}</span>
                      </div>
                      <span className="text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-1.5 py-0.5 rounded font-medium">
                        Assign to Me
                      </span>
                    </button>
                  )}

                  {/* Registered Testers List */}
                  {filteredTesters.map((t) => (
                    <button
                      key={t.displayName}
                      type="button"
                      onClick={() => {
                        setAssignedTo(t.displayName);
                        setAssignedDiscordId(t.discordId || '');
                        setShowDropdown(false);
                      }}
                      className="w-full px-3.5 py-2 text-left flex items-center justify-between text-xs hover:bg-[#21262d] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        <span className="text-slate-200">{t.displayName}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-800/30">
                        Verified Member
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
