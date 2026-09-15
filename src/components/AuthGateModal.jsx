import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';
import { signInWithDiscord, hasTrialOrAboveRole } from '../lib/supabase';

export function AuthGateModal({ onAuthenticate }) {
  const [step, setStep] = useState('password'); // 'password' | 'discord'
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [roleError, setRoleError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput.trim().toLowerCase() !== 'crabs') {
      setPasswordError('Incorrect beta password.');
      return;
    }
    setPasswordError('');
    setStep('discord');
  };

  const handleDiscordOAuth = async () => {
    setIsAuthenticating(true);
    setRoleError('');
    try {
      await signInWithDiscord();
    } catch (err) {
      console.error('Discord OAuth error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090c10]/95 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Banner Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#21262d] border border-[#30363d] text-indigo-400 mb-1">
            {step === 'password' ? <Lock className="w-6 h-6 text-indigo-400" /> : <ShieldCheck className="w-6 h-6 text-[#5865F2]" />}
          </div>
          <h2 className="text-xl font-bold text-slate-100 font-heading">
            Fake Fresh Beta testing
          </h2>
          <p className="text-xs text-slate-400">
            {step === 'password' 
              ? 'Authorized access only. Enter the password to unlock testing.'
              : 'Authorize your Discord account to verify Trial role or above.'}
          </p>
        </div>

        {/* Role Restriction Banner */}
        <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Requires <strong>Trial</strong>, <strong>Raider</strong>, or <strong>Officer</strong> Discord role.</span>
        </div>

        {/* Step 1: Password Gate */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Beta Access Password
              </label>
              <input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              {passwordError && (
                <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Pure Discord OAuth Authorization with Role Check */}
        {step === 'discord' && (
          <div className="space-y-4">
            
            {roleError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{roleError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleDiscordOAuth}
              disabled={isAuthenticating}
              className="w-full py-3.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-md border border-[#7983f5]/30 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-21.66-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.92,53.86,53,48.73,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.92,96.09,53,91,65.69,84.69,65.69Z"/>
              </svg>
              {isAuthenticating ? 'Connecting to Discord...' : 'Verify with Discord'}
            </button>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed font-sans pt-2">
              🔒 Mandatory OAuth verification. Access restricted to Trial role or above.
            </p>

          </div>
        )}

      </div>
    </div>
  );
}
