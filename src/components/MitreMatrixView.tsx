import React, { useState } from 'react';
import {
  Target,
  ShieldAlert,
  Crosshair,
  ExternalLink,
  Users,
  Compass,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { ThreatActorProfile, ForensicCase } from '../types/forensics';

interface MitreMatrixViewProps {
  forensicCase: ForensicCase;
}

interface TacticDefinition {
  id: string;
  name: string;
  nameTh: string;
  techniques: {
    id: string;
    name: string;
    detectedInCase: boolean;
    evidenceNote?: string;
  }[];
}

export const MitreMatrixView: React.FC<MitreMatrixViewProps> = ({ forensicCase }) => {
  const [selectedTechnique, setSelectedTechnique] = useState<{
    id: string;
    name: string;
    evidenceNote?: string;
    tactic: string;
  } | null>(null);

  // Extract techniques identified in the active case's artifacts & timeline
  const detectedIds = new Set<string>();
  const techniqueMap = new Map<string, string>();

  forensicCase.artifacts.forEach((art) => {
    if (art.mitreTechniqueId) {
      detectedIds.add(art.mitreTechniqueId);
      techniqueMap.set(art.mitreTechniqueId, art.summary);
    }
  });

  forensicCase.timeline.forEach((tl) => {
    if (tl.techniqueId) {
      detectedIds.add(tl.techniqueId);
      techniqueMap.set(tl.techniqueId, tl.description);
    }
  });

  // MITRE Enterprise Matrix Tactics Model
  const tactics: TacticDefinition[] = [
    {
      id: 'TA0001',
      name: 'Initial Access',
      nameTh: 'การเข้าถึงเบื้องต้น',
      techniques: [
        { id: 'T1078.002', name: 'Valid Accounts: Domain Accounts', detectedInCase: detectedIds.has('T1078.002'), evidenceNote: techniqueMap.get('T1078.002') },
        { id: 'T1190', name: 'Exploit Public-Facing App', detectedInCase: detectedIds.has('T1190'), evidenceNote: techniqueMap.get('T1190') },
        { id: 'T1566', name: 'Phishing: Spearphishing Link', detectedInCase: detectedIds.has('T1566') },
      ],
    },
    {
      id: 'TA0002',
      name: 'Execution',
      nameTh: 'การรันโค้ดคำสั่ง',
      techniques: [
        { id: 'T1059.001', name: 'PowerShell Interpreter', detectedInCase: detectedIds.has('T1059.001'), evidenceNote: techniqueMap.get('T1059.001') },
        { id: 'T1059.003', name: 'Windows Command Shell', detectedInCase: detectedIds.has('T1059.003'), evidenceNote: techniqueMap.get('T1059.003') },
        { id: 'T1047', name: 'Windows Management Instrumentation', detectedInCase: detectedIds.has('T1047') },
      ],
    },
    {
      id: 'TA0003',
      name: 'Persistence',
      nameTh: 'การฝังตัวถาวร',
      techniques: [
        { id: 'T1505.003', name: 'Web Shell Component', detectedInCase: detectedIds.has('T1505.003'), evidenceNote: techniqueMap.get('T1505.003') },
        { id: 'T1547.001', name: 'Registry Run Keys / Startup Folder', detectedInCase: detectedIds.has('T1547.001') },
        { id: 'T1053.005', name: 'Scheduled Task', detectedInCase: detectedIds.has('T1053.005') },
      ],
    },
    {
      id: 'TA0005',
      name: 'Defense Evasion',
      nameTh: 'การหลบเลี่ยงตรวจจับ',
      techniques: [
        { id: 'T1055.001', name: 'DLL Process Injection', detectedInCase: detectedIds.has('T1055.001'), evidenceNote: techniqueMap.get('T1055.001') },
        { id: 'T1574.002', name: 'DLL Side-Loading', detectedInCase: detectedIds.has('T1574.002'), evidenceNote: techniqueMap.get('T1574.002') },
        { id: 'T1027', name: 'Obfuscated / Encoded Files', detectedInCase: detectedIds.has('T1027') || detectedIds.has('T1059.001'), evidenceNote: 'EncodedCommand payload' },
      ],
    },
    {
      id: 'TA0006',
      name: 'Credential Access',
      nameTh: 'การขโมยข้อมูลระบุตัวตน',
      techniques: [
        { id: 'T1003.001', name: 'LSASS Memory Dumping', detectedInCase: detectedIds.has('T1003.001'), evidenceNote: techniqueMap.get('T1003.001') },
        { id: 'T1558.003', name: 'Kerberoasting', detectedInCase: detectedIds.has('T1558.003') },
        { id: 'T1056.001', name: 'Keylogging', detectedInCase: detectedIds.has('T1056.001') },
      ],
    },
    {
      id: 'TA0011',
      name: 'Command & Control',
      nameTh: 'การควบคุมระยะไกล',
      techniques: [
        { id: 'T1071.001', name: 'Web Protocols (HTTPS TLS Beacon)', detectedInCase: detectedIds.has('T1071.001'), evidenceNote: techniqueMap.get('T1071.001') },
        { id: 'T1071.004', name: 'DNS Tunneling', detectedInCase: detectedIds.has('T1071.004'), evidenceNote: techniqueMap.get('T1071.004') },
        { id: 'T1573.002', name: 'Asymmetric Encrypted Channel', detectedInCase: detectedIds.has('T1573.002') },
      ],
    },
    {
      id: 'TA0040',
      name: 'Impact',
      nameTh: 'ผลกระทบและการทำลาย',
      techniques: [
        { id: 'T1486', name: 'Data Encrypted for Impact (Ransomware)', detectedInCase: detectedIds.has('T1486'), evidenceNote: techniqueMap.get('T1486') },
        { id: 'T1490', name: 'Inhibit System Recovery (VSS Delete)', detectedInCase: detectedIds.has('T1490'), evidenceNote: techniqueMap.get('T1490') },
        { id: 'T1485', name: 'Data Destruction', detectedInCase: detectedIds.has('T1485') },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            แผนผังยุทธวิธี MITRE ATT&CK® MATRIX & การสืบหาตัวผู้โจมตี (THREAT ATTRIBUTION)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ตรวจพบ <span className="text-rose-400 font-bold">{detectedIds.size} Techniques</span> ที่เกี่ยวข้องในสำนวนคดีนี้
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-950 border border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
            <span className="text-slate-300">ตรวจพบในพยานหลักฐาน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
            <span className="text-slate-500">ยังไม่พบในหลักฐาน</span>
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Interactive Tactical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {tactics.map((tactic) => (
          <div
            key={tactic.id}
            className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col"
          >
            <div className="border-b border-slate-800 pb-2 mb-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block">{tactic.id}</span>
              <h4 className="text-xs font-bold text-white truncate">{tactic.name}</h4>
              <span className="text-[10px] text-slate-400 truncate block">{tactic.nameTh}</span>
            </div>

            <div className="space-y-2 flex-1">
              {tactic.techniques.map((tech) => (
                <div
                  key={tech.id}
                  onClick={() =>
                    setSelectedTechnique({
                      id: tech.id,
                      name: tech.name,
                      evidenceNote: tech.evidenceNote,
                      tactic: tactic.name,
                    })
                  }
                  className={`p-2 rounded-lg text-xs font-mono cursor-pointer transition-all border ${
                    tech.detectedInCase
                      ? 'bg-rose-950/70 border-rose-500/60 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.25)] hover:border-rose-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px]">{tech.id}</span>
                    {tech.detectedInCase && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    )}
                  </div>
                  <div className="text-[11px] font-sans font-medium line-clamp-2 mt-1">
                    {tech.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Technique Modal / Callout if selected */}
      {selectedTechnique && (
        <div className="bg-slate-900/90 border border-cyan-500/50 rounded-xl p-4.5 shadow-xl relative animate-in fade-in">
          <button
            onClick={() => setSelectedTechnique(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white"
          >
            ✕
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
              {selectedTechnique.id}
            </span>
            <span className="text-xs text-slate-400 font-mono">Tactic: {selectedTechnique.tactic}</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-1">{selectedTechnique.name}</h4>
          <div className="mt-2 text-xs font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
            <span className="text-slate-500 block text-[10px] mb-1">หลักฐานในสำนวนคดี (CASE EVIDENCE CORRELATION):</span>
            {selectedTechnique.evidenceNote ? (
              <span className="text-emerald-400">{selectedTechnique.evidenceNote}</span>
            ) : (
              <span className="text-slate-500">ไม่พบความเชื่อมโยงกับหลักฐานในสำนวนปัจจุบัน</span>
            )}
          </div>
        </div>
      )}

      {/* Threat Actor Attribution Cards */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-base font-bold text-white font-mono">
              การเทียบเคียงและสืบหาตัวกลุ่มผู้โจมตี (THREAT ACTOR PROFILING & ATTRIBUTION)
            </h3>
            <p className="text-xs text-slate-400">
              วิเคราะห์ความสอดคล้องของ TTPs, ลายเซ็นมัลแวร์, และพฤติกรรมโครงสร้างพื้นฐานกับกลุ่มภัยคุกคามสากล
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forensicCase.matchedActors.map((actor) => (
            <div
              key={actor.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 rounded-xl p-4.5 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-purple-400" />
                    {actor.name}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {actor.aliases.map((alias, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px]"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-bold font-mono text-purple-400">
                    {actor.matchScorePercent}%
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Confidence: {actor.confidence}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-purple-500 to-rose-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${actor.matchScorePercent}%` }}
                />
              </div>

              <div className="space-y-1.5 text-xs">
                {actor.originLikely && (
                  <div>
                    <span className="text-slate-500 font-medium">แหล่งกำเนิดที่คาดการณ์:</span>{' '}
                    <span className="text-slate-300 font-mono">{actor.originLikely}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 font-medium">แรงจูงใจ (Motivation):</span>{' '}
                  <span className="text-slate-300">{actor.motivation}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">กลุ่มเป้าหมาย (Target Sectors):</span>{' '}
                  <span className="text-slate-300">{actor.targetSectors.join(', ')}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono">
                <span className="text-purple-400 font-bold block mb-1">
                  เหตุผลความสอดคล้องทางนิติวิทยาศาสตร์ (Attribution Rationale):
                </span>
                {actor.attributionRationale}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
