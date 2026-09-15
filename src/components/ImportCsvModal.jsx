import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseCSVToTasks } from '../lib/csvHelper';

export function ImportCsvModal({ onClose, onMassImportTasks }) {
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedTasks, setParsedTasks] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTextChange = (text) => {
    setCsvRawText(text);
    if (!text.trim()) {
      setParsedTasks([]);
      return;
    }
    const tasks = parseCSVToTasks(text);
    setParsedTasks(tasks);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result || '';
      setCsvRawText(text);
      handleTextChange(text);
    };
    reader.readAsText(file);
  };

  const sampleCsvTemplate = `Title,Description,Category,Priority
Baron Geddon Bomb Range,Test 15yd range alert,Raid Boss,High
Vaelastrasz DPS Burst,Measure 45s execution,Raid Boss,Urgent
Sanguine Puddle Healing,Verify 5% HP per sec,Dungeon,Normal`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ff_beta_tasks_import_template.csv';
    link.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parsedTasks.length === 0) {
      setErrorMsg('No valid task rows detected.');
      return;
    }

    setIsImporting(true);
    try {
      await onMassImportTasks(parsedTasks);
      onClose();
    } catch (err) {
      setErrorMsg('Failed to mass import tasks.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#090c10]/85 animate-fade-in font-sans">
      <div 
        className="w-full max-w-xl bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#21262d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-heading">
                Mass Add Tasks (Spreadsheet / CSV)
              </h2>
              <p className="text-xs text-slate-400">Import multiple playtest tasks at once from Excel or CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {/* File Upload or Template Download */}
          <div className="flex items-center justify-between gap-3 p-3 bg-[#0d1117] border border-[#21262d] rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium text-[11px]"
            >
              Download Sample Template
            </button>
          </div>

          {/* Paste CSV Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Or Paste CSV Data Below
            </label>
            <textarea
              rows={5}
              placeholder={`Title,Description,Category,Priority\nBaron Geddon Range,Test 15yd spread,Raid Boss,High`}
              value={csvRawText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Preview Badge */}
          {parsedTasks.length > 0 && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {parsedTasks.length} {parsedTasks.length === 1 ? 'task' : 'tasks'} ready to import!
              </span>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMsg}
            </p>
          )}

          {/* Footer */}
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
              disabled={isImporting || parsedTasks.length === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {isImporting ? 'Importing...' : `Import ${parsedTasks.length} Tasks`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
