import React, { useState } from 'react';
import {
  Clock,
  ShieldAlert,
  Flag,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { TimelineEvent, ThreatSeverity } from '../types/forensics';
import { getSeverityBadgeClass } from '../utils/crypto';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  onAddEvent?: (event: Partial<TimelineEvent>) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline, onAddEvent }) => {
  const [filterMilestonesOnly, setFilterMilestonesOnly] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(timeline[0]?.id || null);

  const filteredTimeline = timeline.filter((event) => {
    const matchMilestone = !filterMilestonesOnly || event.isKeyMilestone;
    const matchPhase = selectedPhase === 'ALL' || event.phase === selectedPhase;
    return matchMilestone && matchPhase;
  });

  const getPhaseName = (phase: string) => {
    switch (phase) {
      case 'INITIAL_ACCESS':
        return 'จุดเริ่มต้นการเข้าถึง (Initial Access)';
      case 'EXECUTION':
        return 'การรันโค้ดและสคริปต์ (Execution)';
      case 'PERSISTENCE':
        return 'การฝังตัวถาวร (Persistence)';
      case 'PRIV_ESC':
        return 'การยกระดับสิทธิ์ (Privilege Escalation)';
      case 'DEFENSE_EVASION':
        return 'การอำพรางตัว (Defense Evasion)';
      case 'CREDENTIAL_ACCESS':
        return 'การขโมยข้อมูลระบุตัวตน (Credential Access)';
      case 'DISCOVERY':
        return 'การลาดตระเวนระบบ (Discovery)';
      case 'LATERAL_MOVE':
        return 'การแพร่กระจายแนวราบ (Lateral Movement)';
      case 'C2':
        return 'การติดต่อ C2 (Command & Control)';
      case 'EXFILTRATION':
        return 'การส่งออกข้อมูลลับ (Exfiltration)';
      case 'IMPACT':
        return 'การทำลาย/เข้ารหัสไฟล์ (Impact)';
      default:
        return phase;
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            ลำดับเหตุการณ์การโจมตีทางนิติวิทยาศาสตร์ (FORENSIC ATTACK TIMELINE)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={filterMilestonesOnly}
              onChange={(e) => setFilterMilestonesOnly(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>เฉพาะหมุดหมายสำคัญ (Key Milestones)</span>
          </label>

          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">ทุกขั้นตอนการโจมตี (All Phases)</option>
            <option value="INITIAL_ACCESS">Initial Access</option>
            <option value="EXECUTION">Execution</option>
            <option value="DEFENSE_EVASION">Defense Evasion</option>
            <option value="CREDENTIAL_ACCESS">Credential Access</option>
            <option value="C2">Command and Control</option>
            <option value="IMPACT">Impact / Ransomware</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-amber-500 before:to-rose-500">
        <div className="space-y-5">
          {filteredTimeline.map((event, index) => {
            const badge = getSeverityBadgeClass(event.severity);
            const isExpanded = expandedId === event.id;

            return (
              <div key={event.id} className="relative group">
                {/* Glowing Node Marker */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    event.severity === 'CRITICAL'
                      ? 'border-rose-500 bg-slate-950 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                      : 'border-cyan-500 bg-slate-950 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  {event.isKeyMilestone ? (
                    <Flag className="w-3 h-3 text-amber-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>

                {/* Event Card */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  className={`rounded-xl border p-4 sm:p-5 transition-all cursor-pointer ${
                    isExpanded
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                        {event.relativeTime}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {event.timestamp}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {event.severity}
                      </span>
                      {event.isKeyMilestone && (
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px] font-mono flex items-center gap-1">
                          <Flag className="w-2.5 h-2.5" /> MILESTONE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>{getPhaseName(event.phase)}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-white mt-2 font-mono">
                    {event.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px]">แหล่งพยานหลักฐานอ้างอิง:</span>
                        <span className="text-cyan-300">{event.evidenceSource}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">MITRE ATT&CK TECHNIQUE:</span>
                        <span className="text-emerald-400">
                          {event.techniqueId ? `${event.techniqueId} - ${event.techniqueName}` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
