/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  HardDrive,
  FileSearch,
  Clock,
  Target,
  Sparkles,
  Wrench,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import { Header } from './components/Header';
import { CaseOverview } from './components/CaseOverview';
import { EvidenceLocker } from './components/EvidenceLocker';
import { ArtifactAnalyzer } from './components/ArtifactAnalyzer';
import { TimelineView } from './components/TimelineView';
import { MitreMatrixView } from './components/MitreMatrixView';
import { AIForensicCopilot } from './components/AIForensicCopilot';
import { ForensicTools } from './components/ForensicTools';
import { QuantumHubView } from './components/quantum/QuantumHubView';
import { ForensicReportModal } from './components/ForensicReportModal';
import { NewCaseModal } from './components/NewCaseModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { INITIAL_CASES } from './data/mockCases';
import {
  ForensicCase,
  EvidenceItem,
  ChainOfCustodyRecord,
  ForensicArtifact,
  AIAnalysisResult,
} from './types/forensics';

export default function App() {
  const [cases, setCases] = useState<ForensicCase[]>(INITIAL_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>(INITIAL_CASES[0].id);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals & States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // Verify hash of an evidence item
  const handleVerifyHash = (evidenceId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          evidenceItems: c.evidenceItems.map((item) => {
            if (item.id === evidenceId) {
              return {
                ...item,
                integrityStatus: 'VERIFIED',
                lastVerifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
              };
            }
            return item;
          }),
        };
      })
    );
  };

  // Update integrity status based on hash comparison result (VERIFIED or TAMPERED)
  const handleUpdateIntegrityStatus = (evidenceId: string, status: 'VERIFIED' | 'TAMPERED') => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          evidenceItems: c.evidenceItems.map((item) => {
            if (item.id === evidenceId) {
              return {
                ...item,
                integrityStatus: status,
                lastVerifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
              };
            }
            return item;
          }),
        };
      })
    );
  };

  // Add new Evidence
  const handleAddEvidence = (itemData: Partial<EvidenceItem>) => {
    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      caseId: activeCase.id,
      evidenceNumber: `EVD-${activeCase.caseNumber}-${activeCase.evidenceItems.length + 1}`,
      name: itemData.name || 'Forensic_Evidence.raw',
      type: itemData.type || 'DISK_IMAGE',
      fileFormat: itemData.fileFormat || 'E01',
      fileSizeBytes: itemData.fileSizeBytes || 1073741824,
      sha256Hash: itemData.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      md5Hash: itemData.md5Hash || 'd41d8cd98f00b204e9800998ecf8427e',
      acquiredAt: itemData.acquiredAt || new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      acquiredBy: itemData.acquiredBy || 'Examiner',
      sourceDevice: itemData.sourceDevice || 'Target System',
      storageLocation: itemData.storageLocation || 'Vault A',
      integrityStatus: 'VERIFIED',
      lastVerifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      chainOfCustodyCount: 1,
      description: itemData.description || 'วัตถุพยานดิจิทัล',
    };

    const initialCustody: ChainOfCustodyRecord = {
      id: `coc-${Date.now()}`,
      evidenceId: newItem.id,
      timestamp: newItem.acquiredAt,
      action: 'ACQUISITION',
      custodian: newItem.acquiredBy,
      custodianRole: 'Forensic Officer',
      purpose: 'ยึดพยานหลักฐานและบันทึกค่าแฮช',
      location: newItem.storageLocation,
      digitalSignature: `SIG_RSA4096_${Math.random().toString(16).slice(2, 10).toUpperCase()}_OK`,
      notes: 'ลงบันทึกเข้าระบบอัตโนมัติ',
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          evidenceItems: [newItem, ...c.evidenceItems],
          chainOfCustody: [initialCustody, ...c.chainOfCustody],
        };
      })
    );
  };

  // Add Custody Record
  const handleAddCustodyRecord = (recordData: Partial<ChainOfCustodyRecord>) => {
    const newRecord: ChainOfCustodyRecord = {
      id: `coc-${Date.now()}`,
      evidenceId: recordData.evidenceId || activeCase.evidenceItems[0]?.id || 'EVD-001',
      timestamp: recordData.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      action: recordData.action || 'TRANSFER',
      custodian: recordData.custodian || 'Custodian',
      custodianRole: recordData.custodianRole || 'Analyst',
      purpose: recordData.purpose || 'การตรวจพิสูจน์ในห้องปฏิบัติการ',
      location: recordData.location || 'Forensic Lab',
      digitalSignature: recordData.digitalSignature || `SIG_RSA4096_${Math.random().toString(16).slice(2, 10).toUpperCase()}_OK`,
      notes: recordData.notes,
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          chainOfCustody: [newRecord, ...c.chainOfCustody],
        };
      })
    );
  };

  // Add Custom Artifact
  const handleAddArtifact = (artData: Partial<ForensicArtifact>) => {
    const newArt: ForensicArtifact = {
      id: `art-${Date.now()}`,
      caseId: activeCase.id,
      evidenceId: activeCase.evidenceItems[0]?.id || 'ev-custom',
      timestamp: artData.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      category: artData.category || 'COMMAND_LINE',
      severity: artData.severity || 'CRITICAL',
      source: artData.source || 'Manual Forensic Artifact Intake',
      summary: artData.summary || 'พยานหลักฐานที่นำเข้าเพิ่มเติม',
      rawContent: artData.rawContent || '',
      mitreTechniqueId: artData.mitreTechniqueId,
      mitreTechniqueName: artData.mitreTechniqueName,
      mitreTactic: artData.mitreTactic,
      flaggedSuspicious: true,
      iocsDetected: artData.iocsDetected || [],
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== activeCase.id) return c;
        return {
          ...c,
          artifacts: [newArt, ...c.artifacts],
        };
      })
    );
  };

  // Send artifact to copilot
  const handleSendToCopilot = (art: ForensicArtifact) => {
    setCopilotInitialPrompt(
      `ช่วยวิเคราะห์พยานหลักฐานนี้เชิงลึกอย่างละเอียด:
แหล่งที่มา: ${art.source}
ประเภท: ${art.category}
เนื้อหาข้อมูลดิบ:
${art.rawContent}`
    );
    setActiveTab('ai-copilot');
  };

  // Trigger Gemini AI Analysis for current case
  const handleTriggerAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const combinedArtifactText = activeCase.artifacts
        .map((a) => `[${a.category} - ${a.severity}] ${a.summary}\n${a.rawContent}`)
        .join('\n\n---\n\n');

      const res = await fetch('/api/forensics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifactText: combinedArtifactText,
          artifactType: 'Multi-Artifact Forensic Triage (Memory, EVTX, PCAP)',
          caseContext: `Case ${activeCase.caseNumber}: ${activeCase.title}. Organization: ${activeCase.organization}. Scope: ${activeCase.scopeOfCompromise}`,
          language: 'th',
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setCases((prev) =>
          prev.map((c) => {
            if (c.id !== activeCase.id) return c;
            return {
              ...c,
              aiAnalysis: data.analysis,
            };
          })
        );
        setActiveTab('ai-copilot');
      }
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Create new Case
  const handleCreateNewCase = (newCase: ForensicCase) => {
    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-950 cyber-grid text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Header */}
      <Header
        cases={cases}
        activeCase={activeCase}
        onSelectCase={setActiveCaseId}
        onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onTriggerAIAnalysis={handleTriggerAIAnalysis}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Tab Navigation Bar */}
      <div className="bg-slate-950/70 border-b border-slate-800/80 backdrop-blur-xl sticky top-[61px] z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2 no-scrollbar font-mono text-xs">
            {[
              { id: 'overview', label: 'ภาพรวมคดี (Dossier)', icon: LayoutDashboard },
              {
                id: 'evidence',
                label: `คลังพยาน (${activeCase.evidenceItems.length})`,
                icon: HardDrive,
              },
              {
                id: 'artifacts',
                label: `วิเคราะห์หลักฐาน (${activeCase.artifacts.length})`,
                icon: FileSearch,
              },
              {
                id: 'timeline',
                label: `ไทม์ไลน์ (${activeCase.timeline.length})`,
                icon: Clock,
              },
              { id: 'mitre', label: 'MITRE ATT&CK & ผู้โจมตี', icon: Target },
              {
                id: 'ai-copilot',
                label: 'AI Copilot & รายงาน',
                icon: Sparkles,
                highlight: true,
              },
              { id: 'tools', label: 'เครื่องมือถอดรหัส (Toolkit)', icon: Wrench },
              {
                id: 'quantum',
                label: 'Quantum Cyber Hub (ศูนย์ข่าวกรองควอนตัม)',
                icon: Radio,
                highlight: true,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold'
                      : tab.highlight
                      ? 'text-cyan-400/90 hover:text-cyan-200 hover:bg-slate-900 border border-transparent hover:border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : tab.highlight ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <CaseOverview
            forensicCase={activeCase}
            onNavigateTab={setActiveTab}
            onTriggerAI={handleTriggerAIAnalysis}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceLocker
            evidenceItems={activeCase.evidenceItems}
            chainOfCustody={activeCase.chainOfCustody}
            onVerifyHash={handleVerifyHash}
            onAddEvidence={handleAddEvidence}
            onAddCustodyRecord={handleAddCustodyRecord}
            onUpdateIntegrityStatus={handleUpdateIntegrityStatus}
            caseNumber={activeCase.caseNumber}
          />
        )}

        {activeTab === 'artifacts' && (
          <ArtifactAnalyzer
            artifacts={activeCase.artifacts}
            onAddArtifact={handleAddArtifact}
            onSendToCopilot={handleSendToCopilot}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView timeline={activeCase.timeline} />
        )}

        {activeTab === 'mitre' && (
          <MitreMatrixView forensicCase={activeCase} />
        )}

        {activeTab === 'ai-copilot' && (
          <AIForensicCopilot
            forensicCase={activeCase}
            onUpdateAnalysis={(analysis) => {
              setCases((prev) =>
                prev.map((c) => (c.id === activeCase.id ? { ...c, aiAnalysis: analysis } : c))
              );
            }}
            isAnalyzing={isAnalyzing}
            onTriggerAnalysis={handleTriggerAIAnalysis}
            initialChatPrompt={copilotInitialPrompt}
          />
        )}

        {activeTab === 'tools' && <ForensicTools />}

        {activeTab === 'quantum' && (
          <QuantumHubView
            onAddArtifact={handleAddArtifact}
            onAddEvidence={handleAddEvidence}
            caseNumber={activeCase.caseNumber}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs font-mono text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ระบบวิเคราะห์ภัยคุกคามทางนิติวิทยาศาสตร์ดิจิทัล (Cyber Forensics Threat Intelligence) • NIST SP 800-86
          </div>
          <div className="text-slate-600">
            Chain of Custody Cryptographically Verified • Powered by Gemini 3.8 Flash
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        cases={cases}
        onNavigateToResult={(caseId, tab, targetId) => {
          setActiveCaseId(caseId);
          setActiveTab(tab);
        }}
      />

      {isReportModalOpen && (
        <ForensicReportModal
          forensicCase={activeCase}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {isNewCaseModalOpen && (
        <NewCaseModal
          onClose={() => setIsNewCaseModalOpen(false)}
          onCreateCase={handleCreateNewCase}
        />
      )}
    </div>
  );
}
