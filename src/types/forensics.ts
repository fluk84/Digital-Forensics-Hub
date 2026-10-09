export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type ArtifactCategory = 
  | 'WINDOWS_EVTX' 
  | 'MEMORY_PROCESS' 
  | 'NETWORK_PCAP' 
  | 'DISK_MFT_PREFETCH' 
  | 'REGISTRY_PERSISTENCE' 
  | 'WEB_ACCESS_LOG'
  | 'COMMAND_LINE';

export interface ChainOfCustodyRecord {
  id: string;
  evidenceId: string;
  timestamp: string;
  action: 'ACQUISITION' | 'VERIFICATION' | 'TRANSFER' | 'ANALYSIS' | 'STORAGE_ARCHIVE';
  custodian: string;
  custodianRole: string;
  purpose: string;
  location: string;
  digitalSignature: string;
  notes?: string;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  evidenceNumber: string; // e.g. "ITEM-001"
  name: string;
  type: 'DISK_IMAGE' | 'MEMORY_DUMP' | 'PCAP_CAPTURE' | 'EVENT_LOGS' | 'TRIAGE_ARCHIVE';
  fileFormat: string; // E01, RAW, DMP, PCAP, EVTX, ZIP
  fileSizeBytes: number;
  sha256Hash: string;
  md5Hash: string;
  acquiredAt: string;
  acquiredBy: string;
  sourceDevice: string;
  storageLocation: string;
  integrityStatus: 'VERIFIED' | 'TAMPERED' | 'PENDING';
  lastVerifiedAt: string;
  chainOfCustodyCount: number;
  description: string;
}

export interface ForensicArtifact {
  id: string;
  caseId: string;
  evidenceId: string;
  timestamp: string;
  category: ArtifactCategory;
  severity: ThreatSeverity;
  source: string; // e.g., "EventLog: Security.evtx (EventID 4688)"
  processName?: string;
  pid?: number;
  userAccount?: string;
  summary: string;
  rawContent: string;
  mitreTactic?: string;
  mitreTechniqueId?: string;
  mitreTechniqueName?: string;
  iocsDetected?: string[];
  flaggedSuspicious: boolean;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string;
  relativeTime: string; // e.g. "T+00:00:00"
  phase: 'INITIAL_ACCESS' | 'EXECUTION' | 'PERSISTENCE' | 'PRIV_ESC' | 'DEFENSE_EVASION' | 'CREDENTIAL_ACCESS' | 'DISCOVERY' | 'LATERAL_MOVE' | 'COLLECTION' | 'C2' | 'EXFILTRATION' | 'IMPACT';
  severity: ThreatSeverity;
  title: string;
  description: string;
  evidenceSource: string;
  techniqueId?: string;
  techniqueName?: string;
  isKeyMilestone: boolean;
}

export interface ThreatActorProfile {
  id: string;
  name: string;
  aliases: string[];
  originLikely?: string;
  motivation: string;
  targetSectors: string[];
  knownTTPs: string[];
  matchScorePercent: number;
  attributionRationale: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AIAnalysisResult {
  executiveSummary: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  primaryThreatCategory: string;
  rootCauseHypothesis: string;
  anomaliesDetected: {
    indicator: string;
    severity: ThreatSeverity;
    forensicArtifact: string;
    explanation: string;
  }[];
  mitreAttAndCk: {
    tactic: string;
    techniqueId: string;
    techniqueName: string;
    evidenceReference: string;
  }[];
  iocs: {
    ipAddresses: string[];
    domains: string[];
    fileHashes: string[];
    filePaths: string[];
    registryKeys: string[];
    commands: string[];
  };
  threatActorAttribution: {
    possibleActors: string[];
    attributionRationale: string;
    attributionConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCERTAIN';
  };
  containmentSteps: string[];
  forensicNextSteps: string[];
  generatedYaraRule: string;
}

export interface ForensicCase {
  id: string;
  caseNumber: string; // e.g. "DFIR-2026-0891"
  title: string;
  classification: 'TOP SECRET / FORENSIC' | 'CONFIDENTIAL' | 'INTERNAL USE';
  status: 'ACTIVE_INVESTIGATION' | 'TRIAGE' | 'CONTAINED' | 'REPORT_READY' | 'ARCHIVED';
  incidentDate: string;
  leadInvestigator: string;
  organization: string;
  summary: string;
  scopeOfCompromise: string;
  evidenceItems: EvidenceItem[];
  chainOfCustody: ChainOfCustodyRecord[];
  artifacts: ForensicArtifact[];
  timeline: TimelineEvent[];
  matchedActors: ThreatActorProfile[];
  aiAnalysis?: AIAnalysisResult;
}
