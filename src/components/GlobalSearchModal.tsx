import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  HardDrive,
  FileCode,
  Clock,
  FolderGit2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sparkles,
  X,
  Check,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { ForensicCase, EvidenceItem, ForensicArtifact, TimelineEvent } from '../types/forensics';
import { getSeverityBadgeClass } from '../utils/crypto';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: ForensicCase[];
  onNavigateToResult: (caseId: string, tab: string, targetId?: string) => void;
}

interface ScienceArticle {
  id: string;
  title: string;
  authorString: string;
  journalTitle: string;
  pubYear: string;
  doi: string;
  pmid: string;
  abstractText: string;
  citationCount: number;
  isOpenAccess: boolean;
  url: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  cases,
  onNavigateToResult,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CASES' | 'EVIDENCE' | 'ARTIFACTS' | 'TIMELINE' | 'SCIENCE'>('ALL');
  const [scienceArticles, setScienceArticles] = useState<ScienceArticle[]>([]);
  const [isLoadingScience, setIsLoadingScience] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setScienceArticles([]);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Search Science Literature when query has at least 3 characters
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setScienceArticles([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingScience(true);
      try {
        const res = await fetch(`/api/science/literature?q=${encodeURIComponent(query)}&pageSize=5`);
        const data = await res.json();
        if (data.success && data.articles) {
          setScienceArticles(data.articles);
        }
      } catch (err) {
        console.error('Science search error:', err);
      } finally {
        setIsLoadingScience(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Search across Cases, Evidence, Artifacts, and Timeline in memory
  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        cases: [],
        evidence: [],
        artifacts: [],
        timeline: [],
        totalCount: 0,
      };
    }

    const q = query.toLowerCase();

    // 1. Cases
    const matchedCases = cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.organization.toLowerCase().includes(q)
    );

    // 2. Evidence across all cases
    const matchedEvidence: { caseItem: ForensicCase; evidence: EvidenceItem }[] = [];
    cases.forEach((c) => {
      c.evidenceItems.forEach((ev) => {
        if (
          ev.name.toLowerCase().includes(q) ||
          ev.evidenceNumber.toLowerCase().includes(q) ||
          ev.sha256Hash.toLowerCase().includes(q) ||
          ev.sourceDevice.toLowerCase().includes(q) ||
          ev.type.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q)
        ) {
          matchedEvidence.push({ caseItem: c, evidence: ev });
        }
      });
    });

    // 3. Artifacts across all cases
    const matchedArtifacts: { caseItem: ForensicCase; artifact: ForensicArtifact }[] = [];
    cases.forEach((c) => {
      c.artifacts.forEach((art) => {
        if (
          art.summary.toLowerCase().includes(q) ||
          art.source.toLowerCase().includes(q) ||
          art.rawContent.toLowerCase().includes(q) ||
          (art.processName && art.processName.toLowerCase().includes(q)) ||
          (art.mitreTechniqueId && art.mitreTechniqueId.toLowerCase().includes(q)) ||
          (art.mitreTechniqueName && art.mitreTechniqueName.toLowerCase().includes(q)) ||
          art.iocsDetected?.some((ioc) => ioc.toLowerCase().includes(q))
        ) {
          matchedArtifacts.push({ caseItem: c, artifact: art });
        }
      });
    });

    // 4. Timeline events across all cases
    const matchedTimeline: { caseItem: ForensicCase; event: TimelineEvent }[] = [];
    cases.forEach((c) => {
      c.timeline.forEach((tl) => {
        if (
          tl.title.toLowerCase().includes(q) ||
          tl.description.toLowerCase().includes(q) ||
          tl.evidenceSource.toLowerCase().includes(q) ||
          tl.phase.toLowerCase().includes(q) ||
          (tl.techniqueId && tl.techniqueId.toLowerCase().includes(q))
        ) {
          matchedTimeline.push({ caseItem: c, event: tl });
        }
      });
    });

    const totalCount =
      matchedCases.length +
      matchedEvidence.length +
      matchedArtifacts.length +
      matchedTimeline.length +
      scienceArticles.length;

    return {
      cases: matchedCases,
      evidence: matchedEvidence,
      artifacts: matchedArtifacts,
      timeline: matchedTimeline,
      totalCount,
    };
  }, [cases, query, scienceArticles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-10 sm:pt-16 px-3 sm:px-6">
      <div className="bg-slate-950/95 border border-cyan-500/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-slate-950/90">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            placeholder="ค้นหาวัตถุพยาน, Logs, Hash, คำสั่ง PowerShell, ไทม์ไลน์, หรือเอกสารวิจัยวิชาการ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono uiverse-keycap text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-mono">
          {[
            { id: 'ALL', label: `ทั้งหมด (${results.totalCount})` },
            { id: 'CASES', label: `สำนวนคดี (${results.cases.length})` },
            { id: 'EVIDENCE', label: `วัตถุพยาน (${results.evidence.length})` },
            { id: 'ARTIFACTS', label: `พยานหลักฐาน (${results.artifacts.length})` },
            { id: 'TIMELINE', label: `ไทม์ไลน์ (${results.timeline.length})` },
            { id: 'SCIENCE', label: `วิชาการ/Science (${scienceArticles.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                selectedFilter === tab.id
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Results Container */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1 text-xs">
          {!query.trim() ? (
            <div className="text-center py-10 space-y-3">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 font-mono">
                พิมพ์คำค้นหาเพื่อค้นหาพยานหลักฐานข้ามทุกสำนวนคดี (Cross-Case Global Search)
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                <span className="text-[11px] text-slate-500 font-mono self-center mr-1">ตัวอย่างคำค้น:</span>
                {['RAM Dump', 'LockBit', 'PowerShell', '4624', 'LSASS', 'DNS Tunnel', 'SHA-256'].map(
                  (tag, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(tag)}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 hover:border-cyan-500 text-[11px] font-mono"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.totalCount === 0 && !isLoadingScience ? (
            <div className="text-center py-12 text-slate-400 font-mono">
              ไม่พบข้อมูลที่ตรงกับคำค้น "{query}"
            </div>
          ) : (
            <>
              {/* Group 1: Cases */}
              {(selectedFilter === 'ALL' || selectedFilter === 'CASES') && results.cases.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                    <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>สำนวนคดีที่ตรงกัน (CASES)</span>
                  </div>
                  <div className="space-y-2">
                    {results.cases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigateToResult(c.id, 'overview');
                          onClose();
                        }}
                        className="bg-slate-950/70 hover:bg-slate-850 p-3 rounded-xl border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-400">{c.caseNumber}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                              {c.classification}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                            {c.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{c.summary}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0 mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 2: Evidence Items */}
              {(selectedFilter === 'ALL' || selectedFilter === 'EVIDENCE') && results.evidence.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    <span>วัตถุพยานในคลัง (EVIDENCE ITEMS)</span>
                  </div>
                  <div className="space-y-2">
                    {results.evidence.map(({ caseItem, evidence }) => (
                      <div
                        key={evidence.id}
                        onClick={() => {
                          onNavigateToResult(caseItem.id, 'evidence', evidence.id);
                          onClose();
                        }}
                        className="bg-slate-950/70 hover:bg-slate-850 p-3 rounded-xl border border-slate-800 hover:border-emerald-500/60 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-400 font-bold">{evidence.evidenceNumber}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                              {evidence.type}
                            </span>
                            <span className="text-[10px] text-cyan-400 font-mono">
                              [คดี: {caseItem.caseNumber}]
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white font-mono group-hover:text-emerald-300 transition-colors">
                            {evidence.name}
                          </h4>
                          <p className="text-[11px] font-mono text-slate-400 truncate">
                            SHA-256: {evidence.sha256Hash}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0 mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 3: Artifacts */}
              {(selectedFilter === 'ALL' || selectedFilter === 'ARTIFACTS') && results.artifacts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                    <FileCode className="w-3.5 h-3.5 text-rose-400" />
                    <span>พยานหลักฐาน & Log Dumps (ARTIFACTS)</span>
                  </div>
                  <div className="space-y-2">
                    {results.artifacts.map(({ caseItem, artifact }) => {
                      const badge = getSeverityBadgeClass(artifact.severity);
                      return (
                        <div
                          key={artifact.id}
                          onClick={() => {
                            onNavigateToResult(caseItem.id, 'artifacts', artifact.id);
                            onClose();
                          }}
                          className="bg-slate-950/70 hover:bg-slate-850 p-3 rounded-xl border border-slate-800 hover:border-rose-500/60 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {artifact.severity}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {artifact.source}
                              </span>
                              <span className="text-[10px] text-cyan-400 font-mono">
                                [คดี: {caseItem.caseNumber}]
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                              {artifact.summary}
                            </h4>
                            <p className="text-[11px] font-mono text-slate-400 line-clamp-1">
                              {artifact.rawContent.slice(0, 150)}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition-colors shrink-0 mt-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 4: Timeline Events */}
              {(selectedFilter === 'ALL' || selectedFilter === 'TIMELINE') && results.timeline.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>เหตุการณ์ในไทม์ไลน์ (TIMELINE EVENTS)</span>
                  </div>
                  <div className="space-y-2">
                    {results.timeline.map(({ caseItem, event }) => (
                      <div
                        key={event.id}
                        onClick={() => {
                          onNavigateToResult(caseItem.id, 'timeline', event.id);
                          onClose();
                        }}
                        className="bg-slate-950/70 hover:bg-slate-850 p-3 rounded-xl border border-slate-800 hover:border-amber-500/60 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-cyan-400 font-bold">{event.relativeTime}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{event.phase}</span>
                            <span className="text-[10px] text-cyan-400 font-mono">
                              [คดี: {caseItem.caseNumber}]
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                            {event.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{event.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0 mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 5: Forensic Science Literature (Europe PMC / Science Skill) */}
              {(selectedFilter === 'ALL' || selectedFilter === 'SCIENCE') && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center justify-between uppercase">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      <span>งานวิจัยและเอกสารวิชาการนิติวิทยาศาสตร์ (PEER-REVIEWED FORENSIC SCIENCE PAPERS)</span>
                    </div>
                    {isLoadingScience && (
                      <span className="text-[10px] text-purple-400 animate-pulse">กำลังสืบค้น Europe PMC...</span>
                    )}
                  </div>

                  {scienceArticles.length > 0 ? (
                    <div className="space-y-2">
                      {scienceArticles.map((art) => (
                        <a
                          key={art.id}
                          href={art.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-slate-950/80 hover:bg-slate-850 p-3 rounded-xl border border-slate-800 hover:border-purple-500/60 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors leading-snug">
                              {art.title}
                            </h4>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0 mt-0.5" />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                            <span>{art.authorString.slice(0, 45)}...</span>
                            <span>•</span>
                            <span className="text-cyan-400">{art.journalTitle} ({art.pubYear})</span>
                            {art.doi && <span>• DOI: {art.doi}</span>}
                            {art.citationCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-950 border border-purple-500/40 text-purple-300">
                                {art.citationCount} Citations
                              </span>
                            )}
                          </div>
                          {art.abstractText && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              {art.abstractText}
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-mono italic">
                      พิมพ์คำค้นเพื่อดึงงานวิจัยทางนิติวิทยาศาสตร์ไซเบอร์ที่เกี่ยวข้องจากฐานข้อมูล Europe PMC
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div>ผลการค้นหาข้ามทุกสำนวนคดี & เอกสารวิจัยทางวิทยาศาสตร์</div>
          <div className="flex items-center gap-2">
            <span>กด</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">ESC</kbd>
            <span>เพื่อปิด</span>
          </div>
        </div>
      </div>
    </div>
  );
};
