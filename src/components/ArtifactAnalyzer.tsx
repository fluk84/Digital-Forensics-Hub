import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Terminal,
  Activity,
  Layers,
  Search,
  Filter,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Plus,
  Shield,
  FileCode,
  Code2,
} from 'lucide-react';
import { ForensicArtifact, ArtifactCategory, ThreatSeverity } from '../types/forensics';
import { getSeverityBadgeClass } from '../utils/crypto';

interface ArtifactAnalyzerProps {
  artifacts: ForensicArtifact[];
  onAddArtifact: (artifact: Partial<ForensicArtifact>) => void;
  onSendToCopilot: (artifact: ForensicArtifact) => void;
}

export const ArtifactAnalyzer: React.FC<ArtifactAnalyzerProps> = ({
  artifacts,
  onAddArtifact,
  onSendToCopilot,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(artifacts[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New artifact modal form state
  const [newCategory, setNewCategory] = useState<ArtifactCategory>('COMMAND_LINE');
  const [newSeverity, setNewSeverity] = useState<ThreatSeverity>('CRITICAL');
  const [newSource, setNewSource] = useState('PowerShell / Sysmon EventID 1');
  const [newSummary, setNewSummary] = useState('');
  const [newRawContent, setNewRawContent] = useState('');
  const [newMitreId, setNewMitreId] = useState('T1059.001');
  const [newMitreName, setNewMitreName] = useState('Command and Scripting Interpreter');

  const filteredArtifacts = artifacts.filter((art) => {
    const matchCategory = selectedCategory === 'ALL' || art.category === selectedCategory;
    const matchSeverity = selectedSeverity === 'ALL' || art.severity === selectedSeverity;
    const matchSearch =
      searchQuery === '' ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.rawContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.processName && art.processName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (art.mitreTechniqueId && art.mitreTechniqueId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchSeverity && matchSearch;
  });

  const selectedArtifact = artifacts.find((a) => a.id === selectedArtifactId) || artifacts[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateArtifact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary || !newRawContent) return;

    onAddArtifact({
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      category: newCategory,
      severity: newSeverity,
      source: newSource,
      summary: newSummary,
      rawContent: newRawContent,
      mitreTechniqueId: newMitreId,
      mitreTechniqueName: newMitreName,
      mitreTactic: 'Execution',
      flaggedSuspicious: true,
      iocsDetected: [],
    });

    setIsAddModalOpen(false);
    setNewSummary('');
    setNewRawContent('');
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'WINDOWS_EVTX', label: 'Windows EVTX' },
            { id: 'MEMORY_PROCESS', label: 'Memory / Processes' },
            { id: 'NETWORK_PCAP', label: 'Network PCAP / C2' },
            { id: 'COMMAND_LINE', label: 'Command Lines' },
            { id: 'DISK_MFT_PREFETCH', label: 'MFT / Prefetch' },
            { id: 'WEB_ACCESS_LOG', label: 'Web Logs' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Severity & Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">ทุกระดับความรุนแรง</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
          </select>

          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหา Artifacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.25)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>วางหลักฐานใหม่</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Pane: Artifact Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          {filteredArtifacts.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              ไม่พบพยานหลักฐานตามเงื่อนไขที่ค้นหา
            </div>
          ) : (
            filteredArtifacts.map((art) => {
              const badge = getSeverityBadgeClass(art.severity);
              const isSelected = selectedArtifact?.id === art.id;

              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArtifactId(art.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {art.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {art.timestamp.replace('UTC', '')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-2 leading-snug line-clamp-2">
                    {art.summary}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {art.source}
                    </span>
                    {art.mitreTechniqueId && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                        {art.mitreTechniqueId}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Pane: Deep Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedArtifact ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                        getSeverityBadgeClass(selectedArtifact.severity).bg
                      } ${getSeverityBadgeClass(selectedArtifact.severity).text} ${
                        getSeverityBadgeClass(selectedArtifact.severity).border
                      }`}
                    >
                      {selectedArtifact.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs">
                      {selectedArtifact.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedArtifact.timestamp}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-2 leading-relaxed">
                    {selectedArtifact.summary}
                  </h3>
                </div>

                <button
                  onClick={() => onSendToCopilot(selectedArtifact)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0 self-start"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>ส่งให้ AI Copilot วินิจฉัย</span>
                </button>
              </div>

              {/* Forensic Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">แหล่งที่มา (SOURCE)</span>
                  <span className="text-slate-200 truncate block">{selectedArtifact.source}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">โพรเซส / บัญชี</span>
                  <span className="text-cyan-300 truncate block">
                    {selectedArtifact.processName || selectedArtifact.userAccount || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">MITRE TACTIC</span>
                  <span className="text-amber-400 truncate block">
                    {selectedArtifact.mitreTactic || 'Execution'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TECHNIQUE ID</span>
                  <span className="text-emerald-400 truncate block">
                    {selectedArtifact.mitreTechniqueId ? `${selectedArtifact.mitreTechniqueId} (${selectedArtifact.mitreTechniqueName?.slice(0, 14)}...)` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Raw Forensic Artifact Code/Hex Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    RAW FORENSIC ARTIFACT DUMP
                  </span>
                  <button
                    onClick={() => handleCopy(selectedArtifact.rawContent, selectedArtifact.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    {copiedId === selectedArtifact.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก Raw Data</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-slate-200 max-h-96 overflow-y-auto overflow-x-auto whitespace-pre leading-relaxed select-text">
                  {selectedArtifact.rawContent}
                </div>
              </div>

              {/* Extracted IOCs */}
              {selectedArtifact.iocsDetected && selectedArtifact.iocsDetected.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    ตัวชี้วัดการประนีประนอมที่ตรวจพบในพยานหลักฐานนี้ (EXTRACTED IOCs):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtifact.iocsDetected.map((ioc, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-rose-950/70 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        {ioc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              เลือกพยานหลักฐานจากแถบด้านซ้ายเพื่อดูรายละเอียดเชิงลึก
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add New Custom Artifact */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                นำเข้าพยานหลักฐาน / Log ต้องสงสัย (Custom Artifact Intake)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateArtifact} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    หมวดหมู่หลักฐาน (Category)
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="COMMAND_LINE">COMMAND_LINE (PowerShell / Bash)</option>
                    <option value="WINDOWS_EVTX">WINDOWS_EVTX (Security / Sysmon)</option>
                    <option value="MEMORY_PROCESS">MEMORY_PROCESS (Volatility / RAM)</option>
                    <option value="NETWORK_PCAP">NETWORK_PCAP (Wireshark / Zeek)</option>
                    <option value="DISK_MFT_PREFETCH">DISK_MFT_PREFETCH (MFT / Prefetch)</option>
                    <option value="WEB_ACCESS_LOG">WEB_ACCESS_LOG (IIS / Nginx / Apache)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ระดับความรุนแรง (Severity)
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  แหล่งที่มา (Source Reference)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sysmon EventID 1, Memory Address 0x7ffe000, IIS Access Log"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  หัวข้อสรุปข้อค้นพบ (Summary Finding)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. พบการเรียกใช้งาน PowerShell แบบ EncodedCommand ดาวน์โหลดเพย์โหลด"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  ข้อมูลดิบของพยานหลักฐาน (Raw Artifact Dump / Log Lines / Script)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="วางคำสั่ง, XML Log, Hex Dump, หรือ Payload ที่ต้องการวิเคราะห์ที่นี่..."
                  value={newRawContent}
                  onChange={(e) => setNewRawContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    MITRE Technique ID
                  </label>
                  <input
                    type="text"
                    value={newMitreId}
                    onChange={(e) => setNewMitreId(e.target.value)}
                    placeholder="e.g. T1059.001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Technique Name
                  </label>
                  <input
                    type="text"
                    value={newMitreName}
                    onChange={(e) => setNewMitreName(e.target.value)}
                    placeholder="e.g. PowerShell"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  เพิ่มหลักฐานลงสำนวน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
