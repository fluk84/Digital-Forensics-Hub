import React from 'react';
import { ShieldAlert, FolderGit2, Plus, FileText, Sparkles, RefreshCw, Clock, CheckCircle2, Search } from 'lucide-react';
import { ForensicCase } from '../types/forensics';

interface HeaderProps {
  cases: ForensicCase[];
  activeCase: ForensicCase;
  onSelectCase: (caseId: string) => void;
  onOpenNewCaseModal: () => void;
  onOpenReportModal: () => void;
  onTriggerAIAnalysis: () => void;
  onOpenGlobalSearch: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  cases,
  activeCase,
  onSelectCase,
  onOpenNewCaseModal,
  onOpenReportModal,
  onTriggerAIAnalysis,
  onOpenGlobalSearch,
  isAnalyzing,
}) => {
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Main Title */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-600/30 via-slate-900 to-rose-600/30 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <ShieldAlert className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                  <span>CYBER-FORENSICS</span>
                  <span className="text-cyan-400 text-xs px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40">
                    DFIR LAB
                  </span>
                </h1>
                <span className="hidden sm:inline-block text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 inline" /> NIST SP 800-86
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ระบบวิเคราะห์ภัยคุกคามทางนิติวิทยาศาสตร์ดิจิทัล & ตรวจสอบห่วงโซ่พยานหลักฐาน
              </p>
            </div>
          </div>

          {/* Global Search Trigger Bar in Header */}
          <div className="flex-1 max-w-xs sm:max-w-sm lg:max-w-md mx-0 md:mx-4">
            <button
              onClick={onOpenGlobalSearch}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 text-slate-400 hover:text-slate-100 text-xs font-mono transition-all group shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <div className="flex items-center gap-2 truncate mr-2">
                <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                <span className="truncate">ค้นหาหลักฐาน, Hashes, ไทม์ไลน์...</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono uiverse-keycap text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/40 transition-colors">
                  Ctrl+K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right Controls: Case Selector, Actions, Clock */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* UTC Clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 font-mono shadow-inner">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
            </div>

            {/* Case Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-lg p-1 transition-colors">
              <FolderGit2 className="w-4 h-4 text-cyan-400 ml-2" />
              <select
                value={activeCase.id}
                onChange={(e) => onSelectCase(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-mono font-medium focus:outline-none cursor-pointer pr-3 py-1"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                    [{c.caseNumber}] {c.title.slice(0, 32)}...
                  </option>
                ))}
              </select>

              <button
                onClick={onOpenNewCaseModal}
                title="เปิดสำนวนคดีใหม่ (Create New Forensic Case)"
                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* AI Forensic Analysis Trigger - Uiverse Primary */}
            <button
              onClick={onTriggerAIAnalysis}
              disabled={isAnalyzing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${
                isAnalyzing
                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 cursor-not-allowed'
                  : 'uiverse-btn-primary'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>AI กำลังวิเคราะห์...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>AI Correlation</span>
                </>
              )}
            </button>

            {/* Export Official Report - Uiverse Ghost */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium uiverse-btn-ghost font-mono"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>รายงานนิติวิทยาศาสตร์</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
