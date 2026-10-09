import React, { useState, useEffect } from 'react';
import { ThreatMap } from './ThreatMap';
import { SatelliteUplink } from './SatelliteUplink';
import { QuantumEncryptionDiagnostics } from './QuantumEncryptionDiagnostics';
import { NetworkWaveform } from './NetworkWaveform';
import { CyberTerminal } from './CyberTerminal';
import { AICommandCenter } from './AICommandCenter';
import { NewsGrounding } from './NewsGrounding';
import { VoiceLink } from './VoiceLink';
import { MetricChart } from './MetricChart';
import { SystemMetrics } from '../../types/quantum';
import {
  Cpu,
  Activity,
  Radio,
  Shield,
  Globe,
  Terminal,
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X,
  Server,
} from 'lucide-react';
import { EvidenceItem, ForensicArtifact } from '../../types/forensics';

interface QuantumHubViewProps {
  onAddArtifact?: (artifact: Omit<ForensicArtifact, 'id' | 'timelineMatches'>) => void;
  onAddEvidence?: (evidence: Omit<EvidenceItem, 'id' | 'chainOfCustodyCount'>) => void;
  caseNumber?: string;
}

export const QuantumHubView: React.FC<QuantumHubViewProps> = ({
  onAddArtifact,
  onAddEvidence,
  caseNumber,
}) => {
  // Lock screen gateway state (from https://github.com/fluk84/Quantum-Super-Cyber-Intelligence-Hub.git)
  const [isLocked, setIsLocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [lockError, setLockError] = useState('');

  // Live Metrics
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics>({
    cpu: 28,
    memory: 64,
    network: 42,
    quantumStability: 99.982,
  });

  // Historical Streaming Metrics for MetricChart
  const [cpuHistory, setCpuHistory] = useState<any[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<any[]>([]);
  const [networkHistory, setNetworkHistory] = useState<any[]>([]);
  const [stabilityHistory, setStabilityHistory] = useState<any[]>([]);

  // View toggles
  const [showChartsDrawer, setShowChartsDrawer] = useState(false);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Generate real-time telemetry stream
  useEffect(() => {
    if (isLocked) return;

    // Initial seed history
    const now = new Date();
    const initCpu = [];
    const initMem = [];
    const initNet = [];
    const initStab = [];
    for (let i = 15; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 2000).toLocaleTimeString();
      initCpu.push({ time: t, value: Math.floor(20 + Math.random() * 25) });
      initMem.push({ time: t, value: Math.floor(60 + Math.random() * 12) });
      initNet.push({ time: t, value: Math.floor(30 + Math.random() * 30) });
      initStab.push({ time: t, value: parseFloat((99.85 + Math.random() * 0.14).toFixed(3)) });
    }
    setCpuHistory(initCpu);
    setMemoryHistory(initMem);
    setNetworkHistory(initNet);
    setStabilityHistory(initStab);

    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString();
      const newCpu = Math.floor(20 + Math.random() * 25);
      const newMem = Math.floor(63 + Math.random() * 10);
      const newNet = Math.floor(35 + Math.random() * 28);
      const newStab = parseFloat((99.85 + Math.random() * 0.14).toFixed(3));

      setCurrentMetrics({
        cpu: newCpu,
        memory: newMem,
        network: newNet,
        quantumStability: newStab,
      });

      setCpuHistory((prev) => [...prev.slice(-19), { time: timeStr, value: newCpu }]);
      setMemoryHistory((prev) => [...prev.slice(-19), { time: timeStr, value: newMem }]);
      setNetworkHistory((prev) => [...prev.slice(-19), { time: timeStr, value: newNet }]);
      setStabilityHistory((prev) => [...prev.slice(-19), { time: timeStr, value: newStab }]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLocked]);

  // Handle gateway unlock
  const handleUnlockGateway = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLockError('');
    setIsLocked(false);
  };

  // Export current quantum telemetry as an artifact into the forensic case
  const handleExportToCase = () => {
    if (!onAddArtifact) {
      setExportSuccessMessage('ข้อมูลข่าวกรองควอนตัมพร้อมบันทึก (โหมดดูข้อมูล)');
      setTimeout(() => setExportSuccessMessage(null), 3000);
      return;
    }

    const reportContent = `[QUANTUM SUPER CYBER INTELLIGENCE HUB TELEMETRY SNAPSHOT]
Timestamp: ${new Date().toISOString()}
System Uptime: 1,422:12:44 | Region: SUB_SECTOR_7G
Quantum Stability: ${currentMetrics.quantumStability}%
CPU Core Load: ${currentMetrics.cpu}%
Neural Mesh Allocation: ${currentMetrics.memory}%
Network Ingress Bandwidth: ${currentMetrics.network} Gbps
Active Protocol: Post-Quantum Cryptography Protocol 77 (ML-KEM / ML-DSA NIST FIPS 203)
Active Threats: 0 in Primary Vector (Heuristic Coherence: Optimal)
Identified Cluster Nodes: 60 Online, 2 Warning (Node 24, 59), 2 Alert (Node 13, 46)
Signatures: IBM_QISKIT_ENGINE / Neural Mesh Synced`;

    onAddArtifact({
      caseId: 'ACTIVE',
      evidenceId: 'EVD-001',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      category: 'MEMORY_PROCESS',
      severity: 'INFO',
      source: 'Quantum-Super-Cyber-Intelligence-Hub Telemetry Relay',
      summary: 'ภาพรวมโทรมาตรวัดความมั่นคงปลอดภัยเครือข่ายควอนตัม (Quantum Hub Telemetry Snapshot)',
      rawContent: reportContent,
      flaggedSuspicious: false,
    });

    setExportSuccessMessage('บันทึกข่าวกรองควอนตัมเข้าสู่สำนวนคดีสำเร็จแล้ว!');
    setTimeout(() => setExportSuccessMessage(null), 3500);
  };

  // Node details generator
  const getNodeDetails = (index: number) => {
    const isAlert = index === 12 || index === 45;
    const isWarning = index === 23 || index === 58;
    return {
      index: index + 1,
      uid: `NODE-Q${(index + 1).toString(16).padStart(3, '0').toUpperCase()}`,
      sector: `Sub-Sector 7G: Cluster ${Math.floor(index / 8) + 1}`,
      status: isAlert ? 'CRITICAL_ANOMALY' : isWarning ? 'PHASE_WARNING' : 'STABLE_OPTIMAL',
      qubitCount: 128,
      decoherenceRate: isAlert ? '4.82% / sec' : isWarning ? '0.78% / sec' : '0.012% / sec',
      phaseAngle: isAlert ? '142.8° (DRIFT)' : isWarning ? '48.2°' : '0.00°',
      entropyReserve: isAlert ? '18.4%' : isWarning ? '64.2%' : '99.4%',
      bellStateParity: isAlert ? 'FAIL' : 'PASS',
    };
  };

  // 1. Quantum Secure Gateway Lock Screen (Original Hub Design)
  if (isLocked) {
    return (
      <div className="h-[750px] bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden rounded-2xl border border-cyan-500/20 shadow-2xl">
        <div className="cyber-grid absolute inset-0 opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-transparent to-indigo-500/5 pointer-events-none" />

        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 flex flex-col items-center gap-6 sm:gap-8 shadow-[0_0_100px_rgba(34,211,238,0.15)] relative z-10 max-w-md w-full animate-in fade-in zoom-in duration-500 backdrop-blur-2xl">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.3)]">
              <Shield className="w-10 h-10 animate-pulse text-cyan-400" />
            </div>
            <div className="absolute -inset-1 bg-cyan-500/20 blur-xl -z-10 rounded-full animate-pulse" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-orbitron font-black tracking-widest text-white glow-cyan uppercase">
              Quantum Secure Gateway
            </h1>
            <p className="text-xs font-mono text-cyan-300/80">
              Clearance Level: TOP_SECRET // EYES ONLY
            </p>
            <p className="text-[11px] text-slate-400 font-sans">
              ศูนย์ข่าวกรองความมั่นคงปลอดภัยเครือข่ายควอนตัม (Quantum-Super Cyber Hub)
            </p>
          </div>

          <form onSubmit={handleUnlockGateway} className="w-full space-y-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="ป้อนรหัสผ่าน หรือ คลิกเชื่อมต่อทันที..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              />
            </div>

            {lockError && (
              <p className="text-rose-400 text-xs font-mono text-center">{lockError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right rounded-xl font-orbitron font-bold text-xs uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>INITIALIZE SECURE LINK</span>
            </button>

            <div className="text-[10px] text-center font-mono text-slate-500 flex items-center justify-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>POST-QUANTUM PROTOCOL 77 ONLINE</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Main Quantum Super Cyber Intelligence Hub Dashboard
  return (
    <div className="space-y-4">
      {/* Toast Alert for Case Export */}
      {exportSuccessMessage && (
        <div className="bg-emerald-950/90 border border-emerald-400/60 p-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-between text-xs font-mono text-emerald-200 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{exportSuccessMessage}</span>
          </div>
          <button
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quantum Intelligence Top Telemetry & Control Bar */}
      <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-widest uppercase glow-cyan">
                Quantum Super Cyber Intelligence Hub
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-[10px] font-mono text-cyan-300">
                v8.6.4-LTS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                POST-QUANTUM PQC-77
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              ศูนย์ข่าวกรองภัยคุกคามทางไซเบอร์ควอนตัม (Quantum Coherence & Neural Mesh Network)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5 font-mono text-xs">
          {/* Stability Metric */}
          <div className="text-right">
            <div className="text-[9px] text-slate-500 tracking-[0.2em] uppercase font-sans">
              STABILITY ARRAY
            </div>
            <div className="text-xl sm:text-2xl font-orbitron text-cyan-300 glow-cyan leading-none">
              {currentMetrics.quantumStability.toFixed(3)}
              <span className="text-xs opacity-50">%</span>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Controls: Charts Toggle, Export to Case, Lock Gateway */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChartsDrawer(!showChartsDrawer)}
              title="แสดงกราฟพื้นที่วิเคราะห์สถิติโทรมาตรย้อนหลังแบบเรียลไทม์ (MetricChart Recharts)"
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm ${
                showChartsDrawer
                  ? 'bg-purple-950/70 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span>{showChartsDrawer ? 'ซ่อนกราฟ' : 'กราฟสถิติ'}</span>
              {showChartsDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={handleExportToCase}
              title="บันทึกข้อมูลข่าวกรองและโทรมาตรควอนตัมเข้าสู่สำนวนคดีนิติวิทยาศาสตร์"
              className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>ส่งข้อมูลเข้าคดี</span>
            </button>

            <button
              onClick={() => setIsLocked(true)}
              title="ล็อคหน้าจอระบบควอนตัม (Quantum Secure Gateway Lock Screen)"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ล็อคระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Historical Real-Time Telemetry Trend Charts (MetricChart Component) */}
      {showChartsDrawer && (
        <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-4 backdrop-blur-xl animate-in slide-in-from-top duration-300 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-orbitron font-bold uppercase tracking-widest text-purple-200">
                Live Quantum Telemetry Historical Streams (Recharts)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Sampling interval: 2500ms • Window: 20 data points
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricChart title="CPU CORE LOAD (%)" data={cpuHistory} color="#06b6d4" />
            <MetricChart title="NEURAL MESH ALLOC (%)" data={memoryHistory} color="#6366f1" />
            <MetricChart title="NETWORK INGRESS (GBPS)" data={networkHistory} color="#10b981" />
            <MetricChart title="QUANTUM STABILITY (%)" data={stabilityHistory} color="#d946ef" />
          </div>
        </div>
      )}

      {/* Main 3-Column Cyber War Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (3/12): Telemetry, VoiceLink, Waveform & CyberTerminal */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <VoiceLink />

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/40 border border-cyan-500/20 p-3.5 rounded-xl backdrop-blur-md group hover:border-cyan-500/40 transition-all">
              <div className="text-[9px] text-slate-500 mb-1 tracking-widest uppercase font-mono">
                CPU_CORE_LOAD
              </div>
              <div className="text-2xl font-orbitron text-cyan-50">
                {currentMetrics.cpu}
                <span className="text-xs opacity-40">%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 mt-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 shadow-[0_0_8px_#22d3ee] transition-all duration-700"
                  style={{ width: `${currentMetrics.cpu}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-indigo-500/20 p-3.5 rounded-xl backdrop-blur-md group hover:border-indigo-500/40 transition-all">
              <div className="text-[9px] text-slate-500 mb-1 tracking-widest uppercase font-mono">
                NEURAL_ALLOC
              </div>
              <div className="text-2xl font-orbitron text-indigo-100">
                {currentMetrics.memory}
                <span className="text-xs opacity-40">%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 mt-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 shadow-[0_0_8px_#6366f1] transition-all duration-700"
                  style={{ width: `${currentMetrics.memory}%` }}
                />
              </div>
            </div>
          </div>

          <NetworkWaveform />

          <div className="min-h-[280px] flex-1">
            <CyberTerminal />
          </div>
        </div>

        {/* Center Column (6/12): Global Topology, Orbital Intercept & Diagnostics */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* ThreatMap & SatelliteUplink Split View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThreatMap />
            <SatelliteUplink />
          </div>

          {/* Node Matrix and Quantum Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interactive 64-Node Status Matrix */}
            <div className="bg-slate-900/40 border border-indigo-500/20 rounded-xl p-4 relative overflow-hidden group min-h-[380px] backdrop-blur-md shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-indigo-500/10 pb-2.5">
                <div>
                  <h4 className="text-xs font-orbitron font-bold uppercase tracking-[0.2em] text-indigo-300">
                    Node Status Matrix
                  </h4>
                  <p className="text-[9px] text-slate-500 font-mono uppercase mt-0.5">
                    Phase_Heuristic_Cluster_v0.9 • คลิกเพื่อตรวจสอบโหนด
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-cyan-400/40 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-cyan-400/20 rounded-full" />
                </div>
              </div>

              {/* 64 Interactive Nodes Grid */}
              <div className="grid grid-cols-8 gap-1.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {Array.from({ length: 64 }).map((_, i) => {
                  const isAlert = i === 12 || i === 45;
                  const isWarning = i === 23 || i === 58;
                  const isSelected = selectedNodeIndex === i;

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedNodeIndex(isSelected ? null : i)}
                      className={`aspect-square rounded-md border flex flex-col items-center justify-center gap-0.5 transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 scale-105 z-10'
                          : ''
                      } ${
                        isAlert
                          ? 'bg-rose-500/20 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.25)] hover:bg-rose-500/30'
                          : isWarning
                          ? 'bg-amber-500/15 border-amber-500/40 hover:bg-amber-500/25'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-cyan-500/40 hover:bg-slate-750'
                      }`}
                      title={`Cluster Node #${i + 1} (${
                        isAlert ? 'ANOMALY DETECTED' : isWarning ? 'WARNING' : 'HEALTHY'
                      })`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAlert
                            ? 'bg-rose-400 animate-ping'
                            : isWarning
                            ? 'bg-amber-400'
                            : 'bg-cyan-400 animate-pulse'
                        }`}
                      />
                      <span className="text-[7px] font-mono text-slate-400">{i + 1}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Node Details Drawer */}
              {selectedNodeIndex !== null && (
                <div className="mt-3 p-3 bg-slate-950/90 border border-cyan-500/30 rounded-lg text-xs font-mono space-y-2 animate-in fade-in duration-200">
                  {(() => {
                    const node = getNodeDetails(selectedNodeIndex);
                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-cyan-300 font-bold">{node.uid}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              node.status === 'CRITICAL_ANOMALY'
                                ? 'bg-rose-950 border border-rose-500/50 text-rose-300'
                                : node.status === 'PHASE_WARNING'
                                ? 'bg-amber-950 border border-amber-500/50 text-amber-300'
                                : 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                            }`}
                          >
                            {node.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                          <div>Sector: <span className="text-slate-200">{node.sector}</span></div>
                          <div>Decoherence: <span className="text-amber-400">{node.decoherenceRate}</span></div>
                          <div>Bell Parity: <span className={node.bellStateParity === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}>{node.bellStateParity}</span></div>
                          <div>Entropy: <span className="text-cyan-400">{node.entropyReserve}</span></div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              alert(`Node ${node.uid} isolated from primary neural mesh.`);
                              setSelectedNodeIndex(null);
                            }}
                            className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] uppercase border border-slate-700"
                          >
                            Isolate Node
                          </button>
                          <button
                            onClick={() => {
                              alert(`Entanglement cache flushed for ${node.uid}. Parity restored.`);
                              setSelectedNodeIndex(null);
                            }}
                            className="flex-1 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded text-[9px] uppercase border border-cyan-500/40"
                          >
                            Flush Cache
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/80 text-[9px] font-mono text-slate-500 mt-2">
                <span>ONLINE: 60/64</span>
                <span className="text-amber-400">WARNING: 2</span>
                <span className="text-rose-400">ALERT: 2</span>
              </div>
            </div>

            {/* Quantum Diagnostics */}
            <div className="min-h-[380px]">
              <QuantumEncryptionDiagnostics />
            </div>
          </div>

          {/* Legacy Bridge & Runtime Specs Bar (from repo) */}
          <div className="bg-slate-900/60 border border-indigo-500/15 p-3.5 rounded-xl flex flex-wrap justify-around items-center font-mono text-[10px] backdrop-blur-sm gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold uppercase">Legacy Bridge:</span>
              <span className="text-amber-400 font-bold">bridge.php v1.0</span>
            </div>
            <div className="h-3.5 w-[1px] bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold uppercase">Logic Kernel:</span>
              <span className="text-indigo-400 font-bold">pattern_analysis.py</span>
            </div>
            <div className="h-3.5 w-[1px] bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold uppercase">Runtime:</span>
              <span className="text-cyan-400 font-bold">IBM_QISKIT_ENGINE</span>
            </div>
          </div>
        </div>

        {/* Right Column (3/12): AI Command Center & News Grounding */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="h-[480px]">
            <AICommandCenter metrics={currentMetrics} />
          </div>

          <div className="h-[300px]">
            <NewsGrounding />
          </div>
        </div>
      </div>

      {/* Cyber Intelligence Footer Bar */}
      <footer className="h-10 flex items-center justify-between px-6 bg-slate-900/60 border border-cyan-500/15 rounded-xl text-[9px] font-mono tracking-[0.2em] text-slate-500 shadow-xl backdrop-blur-md">
        <div className="flex gap-6 uppercase items-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]" />
            REGION: SUB_SECTOR_7G
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_5px_#6366f1]" />
            UPTIME: 1,422:12:44
          </div>
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_#f43f5e]" />
            THREATS_DETECTED: 0
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <span className="text-cyan-400/80 uppercase font-bold tracking-[0.3em] hidden sm:inline">
            Quantum_Kernel_Sync_Stable
          </span>
          <div className="flex gap-1 h-3.5 items-end">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="w-1 bg-cyan-400/50 rounded-t-sm animate-pulse"
                style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
