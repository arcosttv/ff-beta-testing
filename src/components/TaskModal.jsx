import React, { useState } from 'react';
import { 
  X, User, Bug, MessageSquare, Video, Trash2, Save, ExternalLink, Plus, Check 
} from 'lucide-react';

export function TaskModal({ 
  task, 
  activeCharacter, 
  isOfficer,
  onClose, 
  onUpdateTask, 
  onDeleteTask, 
  onAddBug, 
  onToggleBugStatus 
}) {
  if (!task) return null;

  const [status, setStatus] = useState(task?.status || 'To Test');
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || '');
  const [feedbackNotes, setFeedbackNotes] = useState(task?.feedback_notes || '');
  const [mediaUrl, setMediaUrl] = useState(task?.media_url || '');
  const [isSaving, setIsSaving] = useState(false);

  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState('Major');
  const [isAddingBug, setIsAddingBug] = useState(false);

  const statuses = [
    { name: 'To Test', color: 'border-cyan-700/60 text-cyan-300 bg-cyan-950/40' },
    { name: 'In Progress', color: 'border-amber-700/60 text-amber-300 bg-amber-950/40' },
    { name: 'Result', color: 'border-emerald-700/60 text-emerald-300 bg-emerald-950/40' },
    { name: 'Failed', color: 'border-rose-700/60 text-rose-300 bg-rose-950/40' }
  ];

  const handleSaveDetails = async () => {
    setIsSaving(true);
    try {
      await onUpdateTask(task.id, {
        status,
        assigned_to: assignedTo,
        feedback_notes: feedbackNotes,
        media_url: mediaUrl
      });
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClaimActive = () => {
    setAssignedTo(activeCharacter);
  };

  const handleCreateBug = async (e) => {
    e.preventDefault();
    if (!newBugTitle.trim()) return;

    await onAddBug(task.id, {
      title: newBugTitle.trim(),
      severity: newBugSeverity,
      reported_by: activeCharacter || 'Tester'
    });

    setNewBugTitle('');
    setIsAddingBug(false);
  };

  const getEmbedType = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes('unsplash.com') || url.includes('imgur.com')) return 'image';
    return 'link';
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const bugsList = (Array.isArray(task?.bugs)
    ? task.bugs
    : typeof task?.bugs === 'string'
    ? (() => { try { const p = JSON.parse(task.bugs); return Array.isArray(p) ? p : []; } catch(e) { return []; } })()
    : []
  ).filter(b => b && typeof b === 'object');

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl h-[85vh] max-h-[800px] bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-[#21262d] flex items-start justify-between gap-4 bg-[#0d1117]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#21262d] text-slate-300 border border-[#30363d]">
                {task?.category || 'General'}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#21262d] text-slate-400">
                Priority: {task?.priority || 'Normal'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              {task?.title || 'Untitled Task'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Status & Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0d1117] p-4 rounded-xl border border-[#21262d]">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Column Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setStatus(s.name)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                      status === s.name
                        ? `${s.color} ring-1 ring-slate-600 shadow-sm`
                        : 'border-[#21262d] text-slate-400 bg-[#161b22] hover:border-slate-700'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Assigned Tester
                </label>
                {activeCharacter && assignedTo !== activeCharacter && (
                  <button
                    type="button"
                    onClick={handleClaimActive}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline"
                  >
                    Claim as {activeCharacter}
                  </button>
                )}
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tester character / name"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Task Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Task Details
            </h4>
            <div className="bg-[#0d1117] p-4 rounded-xl border border-[#21262d] text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </div>
          </div>

          {/* Tester Feedback Notes */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Tester Feedback & Notes
            </h4>
            <textarea
              rows={4}
              placeholder="Record test results, logs, issues encountered..."
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Screenshots & Media Video Link */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-400" />
              Screenshot / Video Clip Link
            </h4>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste screenshot or video URL..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {mediaUrl && (
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-[#21262d] hover:bg-[#30363d] border border-slate-700 rounded-xl text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Link
                </a>
              )}
            </div>

            {mediaUrl && getEmbedType(mediaUrl) === 'youtube' && getYouTubeEmbedUrl(mediaUrl) && (
              <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-[#21262d] bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(mediaUrl)}
                  title="Test Clip"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {mediaUrl && getEmbedType(mediaUrl) === 'image' && (
              <div className="mt-3 rounded-xl overflow-hidden border border-[#21262d] bg-[#0d1117] max-h-60 flex items-center justify-center">
                <img src={mediaUrl} alt="Test Screenshot" className="max-h-60 object-contain" />
              </div>
            )}
          </div>

          {/* Bug Tracker Section */}
          <div className="bg-[#0d1117] p-4 rounded-xl border border-[#21262d] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-400" />
                Recorded Bugs ({bugsList.length})
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingBug(!isAddingBug)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Report Bug
              </button>
            </div>

            {isAddingBug && (
              <form onSubmit={handleCreateBug} className="p-3 bg-[#161b22] rounded-lg border border-[#30363d] space-y-3 animate-fade-in">
                <input
                  type="text"
                  placeholder="Bug description..."
                  value={newBugTitle}
                  onChange={(e) => setNewBugTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Severity:</span>
                    <select
                      value={newBugSeverity}
                      onChange={(e) => setNewBugSeverity(e.target.value)}
                      className="bg-[#0d1117] border border-[#30363d] text-xs text-slate-200 rounded px-2 py-1"
                    >
                      <option value="Critical">Critical</option>
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingBug(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded"
                    >
                      Add Bug
                    </button>
                  </div>
                </div>
              </form>
            )}

            {bugsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-2">
                No bugs recorded for this test task yet.
              </p>
            ) : (
              <div className="space-y-2">
                {bugsList.map((b) => (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors ${
                      b.status === 'fixed'
                        ? 'bg-[#161b22] border-[#21262d] opacity-60'
                        : 'bg-[#161b22] border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onToggleBugStatus(task.id, b.id)}
                        className={`p-1 rounded transition-colors ${
                          b.status === 'fixed'
                            ? 'text-emerald-400 bg-emerald-950/40'
                            : 'text-rose-400 bg-rose-950/40 hover:bg-rose-900/60'
                        }`}
                        title={b.status === 'fixed' ? 'Mark Bug as Open' : 'Mark Bug as Resolved'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <span className={`font-medium ${b.status === 'fixed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {b.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        b.severity === 'Critical'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          : b.severity === 'Major'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-[#21262d] text-slate-400'
                      }`}>
                        {b.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        by {b.reported_by}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#21262d] bg-[#0d1117] flex items-center justify-between gap-3">
          {isOfficer ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this test task?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete Task
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-[#21262d] hover:bg-[#30363d] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDetails}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
