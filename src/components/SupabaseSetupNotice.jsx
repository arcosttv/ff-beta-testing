import React, { useState } from 'react';
import { Database, ShieldAlert, CheckCircle2, ChevronRight, X, ExternalLink, Copy, Check } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export function SupabaseSetupNotice() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const envSample = `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-2.5 text-sm font-sans transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isSupabaseConfigured ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-neon-emerald">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Supabase Live Realtime Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-neon-amber">
              <ShieldAlert className="w-3.5 h-3.5" />
              Demo Mode (LocalStorage Active)
            </span>
          )}
          <span className="text-slate-400 text-xs hidden sm:inline">
            {isSupabaseConfigured 
              ? 'Multi-user changes will synchronize instantly across all guild members.'
              : 'Add Supabase keys to enable live real-time sync for your 40-person guild.'}
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
        >
          {isSupabaseConfigured ? 'Database Info' : 'Connect Supabase Instructions'}
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
              <h4 className="font-semibold text-cyan-400 flex items-center gap-1.5 mb-2 font-gaming text-xs tracking-wider">
                <Database className="w-4 h-4 text-cyan-400" />
                1. CREATE .ENV.LOCAL FILE
              </h4>
              <p className="text-slate-400 mb-2">
                Create a <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">.env.local</code> file in the project root:
              </p>
              <div className="relative font-mono bg-slate-900/90 p-2.5 rounded text-[11px] text-slate-300 border border-slate-800">
                <pre>{envSample}</pre>
                <button
                  onClick={copyEnv}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded"
                  title="Copy sample env"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
              <h4 className="font-semibold text-purple-400 flex items-center gap-1.5 mb-2 font-gaming text-xs tracking-wider">
                <ExternalLink className="w-4 h-4 text-purple-400" />
                2. SUPABASE SQL SCHEMA SETUP
              </h4>
              <p className="text-slate-400 mb-2">
                Copy and run the provided <code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded font-mono">supabase-schema.sql</code> file in your Supabase SQL Editor.
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                <li>Creates <code className="text-cyan-300 font-mono">tasks</code> table with real-time replication</li>
                <li>Enables Postgres Row Level Security (RLS) public policy</li>
                <li>Configures real-time subscriptions for 40 simultaneous guild members</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
