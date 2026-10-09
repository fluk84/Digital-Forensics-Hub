import React from 'react';
import {
  ShieldAlert,
  Server,
  UserCheck,
  Building2,
  Calendar,
  AlertTriangle,
  Fingerprint,
  Cpu,
  Target,
  ArrowRight,
  Lock,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { ForensicCase } from '../types/forensics';
import { getSeverityBadgeClass } from '../utils/crypto';

interface CaseOverviewProps {
  forensicCase: ForensicCase;
  onNavigateTab: (tabId: string) => void;
  onTriggerAI: () => void;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({
  forensicCase,
  onNavigateTab,
  onTriggerAI,
}) => {
  const criticalArtifactsCount = forensicCase.artifacts.filter(
    (a) => a.severity === 'CRITICAL' || a.severity === 'HIGH'
  ).length;

  const topActor = forensicCase.matchedActors[0];
  const threatLevel = forensicCase.aiAnalysis?.threatLevel || 'CRITICAL';
  const threatBadge = getSeverityBadgeClass(threatLevel);

  return (
    <div className="space-y-6">
      {/* Primary Dossier Banner with Uiverse Glow */}
      <div className="uiverse-card p-5 sm:p-6 shadow-2xl relative overflow-hidden border border-slate-800/90 hover:border-cyan-500/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 relative z-10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 font-mono text-[11px] font-bold tracking-wider shadow-[0_0_8px_rgba(244,63,94,0.2)]">
                {forensicCase.classification}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-700/80 text-cyan-400 font-mono text-xs font-semibold">
                CASE: {forensicCase.caseNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                STATUS: {forensicCase.status}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
              {forensicCase.title}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {forensicCase.summary}
            </p>

            {/* Metadata pills */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-medium">หน่วยงาน:</span> {forensicCase.organization}
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-medium">หัวหน้าผู้ตรวจพิสูจน์:</span> {forensicCase.leadInvestigator}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 font-medium">ตรวจพบเหตุการณ์:</span> {forensicCase.incidentDate}
              </div>
            </div>
          </div>

          {/* Threat Gauge / Quick Status Block with Uiverse Glass */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-end justify-between gap-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 min-w-[240px] shadow-lg">
            <div className="text-center sm:text-left lg:text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-medium">
                ระดับการคุกคามทางนิติวิทยาศาสตร์
              </div>
              <div className="flex items-center gap-2 mt-1.5 justify-center sm:justify-start lg:justify-end">
                <span className={`px-3 py-1 text-xs font-bold font-mono rounded border ${threatBadge.bg} ${threatBadge.text} ${threatBadge.border} ${threatBadge.glow}`}>
                  {threatLevel}
                </span>
                <span className="text-xs text-cyan-400 font-mono font-bold">
                  (AI Score: {forensicCase.aiAnalysis?.confidenceScore || 95}%)
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 text-center sm:text-left lg:text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">หมวดหมู่ภัยคุกคามหลัก</span>
              <span className="text-amber-400 font-bold font-mono text-sm">
                {forensicCase.aiAnalysis?.primaryThreatCategory || 'Ransomware / Advanced Threat'}
              </span>
            </div>

            <button
              onClick={onTriggerAI}
              className="w-full text-center text-xs text-cyan-300 hover:text-white py-1.5 px-3 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/40 rounded-lg font-mono font-medium transition-all flex items-center justify-center gap-1.5 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <span>รีเฟรชการวิเคราะห์ AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scope of Compromise Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Server className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-slate-400">ขอบเขตความเสียหาย (Scope of Compromise):</span>
            <span className="text-rose-200 font-mono font-medium">{forensicCase.scopeOfCompromise}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Chain of Custody: ปิดผนึกและบันทึกแฮชครบถ้วน</span>
          </div>
        </div>
      </div>

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Evidence Items */}
        <div
          onClick={() => onNavigateTab('evidence')}
          className="uiverse-card p-4.5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Fingerprint className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
              Verified 100%
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {forensicCase.evidenceItems.length} <span className="text-xs text-slate-400 font-normal">ชิ้นพยานหลักฐาน</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-sans">
              คลังวัตถุพยาน & บันทึกห่วงโซ่การครอบครอง (Chain of Custody)
            </p>
          </div>
        </div>

        {/* Tile 2: Artifacts & Anomalies */}
        <div
          onClick={() => onNavigateTab('artifacts')}
          className="uiverse-card p-4.5 cursor-pointer transition-all group hover:border-rose-500/40"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-rose-950/70 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(244,63,94,0.2)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded font-semibold">
              {criticalArtifactsCount} Critical
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {forensicCase.artifacts.length} <span className="text-xs text-slate-400 font-normal">Artifacts</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-sans">
              ตรวจพบ EVTX, Memory Injection, PCAP Flows, Prefetch
            </p>
          </div>
        </div>

        {/* Tile 3: Attack Timeline */}
        <div
          onClick={() => onNavigateTab('timeline')}
          className="uiverse-card p-4.5 cursor-pointer transition-all group hover:border-amber-500/40"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded font-semibold">
              {forensicCase.timeline.filter((t) => t.isKeyMilestone).length} Milestones
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {forensicCase.timeline.length} <span className="text-xs text-slate-400 font-normal">ขั้นตอนการโจมตี</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-sans">
              ไทม์ไลน์นิติวิทยาศาสตร์เรียงตามวินาทีเกิดเหตุ (Micro-chronology)
            </p>
          </div>
        </div>

        {/* Tile 4: Threat Actor Attribution */}
        <div
          onClick={() => onNavigateTab('mitre')}
          className="uiverse-card p-4.5 cursor-pointer transition-all group hover:border-purple-500/40"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded font-semibold">
              {topActor?.matchScorePercent || 90}% Match
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-sm font-bold font-mono text-white truncate">
              {topActor?.name || 'LockBit 3.0 Affiliate'}
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-sans">
              การจับคู่กลุ่มแฮกเกอร์ & แผนผัง MITRE ATT&CK Matrix
            </p>
          </div>
        </div>

        {/* Tile 5: Quantum Super Cyber Intelligence Hub Integration Banner */}
        <div
          onClick={() => onNavigateTab('quantum')}
          className="col-span-1 sm:col-span-2 lg:col-span-4 p-4 rounded-xl bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-indigo-950/40 border border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
              <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-orbitron font-bold text-white uppercase tracking-wider glow-cyan">
                  Quantum Super Cyber Intelligence Hub
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE • PQC-77
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ศูนย์ข่าวกรองความมั่นคงไซเบอร์และเครือข่ายควอนตัม (Threat Map • Satellite Uplink • AI Command • PQC Diagnostics)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 group-hover:text-white transition-colors shrink-0">
            <span>เข้าสู่ศูนย์บัญชาการ</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Root Cause & Forensic Insight Highlights */}
      {forensicCase.aiAnalysis && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              สมมติฐานจุดเริ่มต้นการบุกรุก (Root Cause Forensic Hypothesis)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 font-mono">
            {forensicCase.aiAnalysis.rootCauseHypothesis}
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs font-semibold text-rose-400 block mb-1">
                พฤติกรรมผิดปกติร้ายแรงหลัก (Primary Anomaly):
              </span>
              <p className="text-xs text-slate-300">
                {forensicCase.aiAnalysis.anomaliesDetected[0]?.explanation || 'พบการแทรกโค้ดในหน่วยความจำระดับระบบ'}
              </p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
              <span className="text-xs font-semibold text-cyan-400 block mb-1">
                มาตรการกักกันเร่งด่วนที่แนะนำ (Immediate Containment):
              </span>
              <p className="text-xs text-slate-300">
                {forensicCase.aiAnalysis.containmentSteps[0] || 'ตัดการเชื่อมต่อเครือข่ายของเซิร์ฟเวอร์ทันที'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
