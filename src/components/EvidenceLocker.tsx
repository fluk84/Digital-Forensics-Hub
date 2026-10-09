import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  HardDrive,
  Activity,
  Layers,
  Search,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  User,
  MapPin,
  FileSignature,
  Download,
  ShieldAlert,
  AlertOctagon,
  ArrowLeftRight,
  XCircle,
  ClipboardPaste,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { EvidenceItem, ChainOfCustodyRecord } from '../types/forensics';
import { formatBytes } from '../utils/crypto';

interface EvidenceLockerProps {
  evidenceItems: EvidenceItem[];
  chainOfCustody: ChainOfCustodyRecord[];
  onVerifyHash: (evidenceId: string) => void;
  onAddEvidence: (item: Partial<EvidenceItem>) => void;
  onAddCustodyRecord: (record: Partial<ChainOfCustodyRecord>) => void;
  onUpdateIntegrityStatus?: (evidenceId: string, status: 'VERIFIED' | 'TAMPERED') => void;
  caseNumber?: string;
}

export const EvidenceLocker: React.FC<EvidenceLockerProps> = ({
  evidenceItems,
  chainOfCustody,
  onVerifyHash,
  onAddEvidence,
  onAddCustodyRecord,
  onUpdateIntegrityStatus,
  caseNumber,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'custody'>('evidence');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [isAddCustodyOpen, setIsAddCustodyOpen] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  // Hash comparison states
  const [openCompareIds, setOpenCompareIds] = useState<Record<string, boolean>>({});
  const [inputHashes, setInputHashes] = useState<Record<string, string>>({});
  const [hashAlgorithms, setHashAlgorithms] = useState<Record<string, 'SHA256' | 'MD5'>>({});
  const [comparisonNotices, setComparisonNotices] = useState<
    Record<string, { type: 'success' | 'danger'; text: string } | null>
  >({});

  // Global Quick Hash Inspector
  const [isGlobalMatcherOpen, setIsGlobalMatcherOpen] = useState(false);
  const [globalInputHash, setGlobalInputHash] = useState('');

  // Recharts Evidence File Type Distribution State
  const [isChartVisible, setIsChartVisible] = useState(true);
  const [chartMetric, setChartMetric] = useState<'count' | 'size'>('count');

  // Recharts Bar Chart Data: Distribution of evidence file types
  const evidenceTypeDistribution = useMemo(() => {
    const typeSummary: Record<
      string,
      {
        count: number;
        totalBytes: number;
        formats: Set<string>;
      }
    > = {};

    evidenceItems.forEach((item) => {
      const typeKey = item.type || 'OTHER';
      if (!typeSummary[typeKey]) {
        typeSummary[typeKey] = {
          count: 0,
          totalBytes: 0,
          formats: new Set<string>(),
        };
      }
      typeSummary[typeKey].count += 1;
      typeSummary[typeKey].totalBytes += item.fileSizeBytes || 0;
      if (item.fileFormat) typeSummary[typeKey].formats.add(item.fileFormat);
    });

    const typeMeta: Record<
      string,
      { label: string; labelEn: string; color: string; desc: string }
    > = {
      DISK_IMAGE: {
        label: 'อิมเมจดิสก์',
        labelEn: 'Disk Image',
        color: '#06b6d4',
        desc: 'สำเนาฮาร์ดดิสก์แบบบิตต่อบิต (E01, RAW, DD)',
      },
      MEMORY_DUMP: {
        label: 'แรม/หน่วยความจำ',
        labelEn: 'Memory Dump',
        color: '#a855f7',
        desc: 'พยานหลักฐานระเหยง่ายจากหน่วยความจำ RAM (RAW, DMP)',
      },
      PCAP_CAPTURE: {
        label: 'ทราฟฟิกเครือข่าย',
        labelEn: 'PCAP Capture',
        color: '#3b82f6',
        desc: 'ข้อมูลการรับส่งข้อมูลผ่านเครือข่าย (PCAP, PCAPNG)',
      },
      EVENT_LOGS: {
        label: 'บันทึกเหตุการณ์',
        labelEn: 'Event Logs',
        color: '#10b981',
        desc: 'บันทึกการทำงานของระบบและบัญชีผู้ใช้ (EVTX, Log)',
      },
      TRIAGE_ARCHIVE: {
        label: 'คลังรวบรวมด่วน',
        labelEn: 'Triage Archive',
        color: '#f59e0b',
        desc: 'ไฟล์และหลักฐานเร่งด่วนที่เก็บรวบรวม (ZIP, 7Z)',
      },
    };

    const totalCount = evidenceItems.length;

    return Object.entries(typeSummary)
      .map(([typeKey, data]) => {
        const meta = typeMeta[typeKey] || {
          label: typeKey,
          labelEn: typeKey,
          color: '#64748b',
          desc: 'วัตถุพยานประเภทอื่น ๆ',
        };
        const formatsList = Array.from(data.formats).join(', ');
        const percent = totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0;
        const sizeMB = Math.round((data.totalBytes / (1024 * 1024)) * 10) / 10;

        return {
          typeKey,
          name: meta.label,
          nameEn: meta.labelEn,
          fullName: `${meta.label} (${meta.labelEn})`,
          count: data.count,
          percentage: percent,
          totalBytes: data.totalBytes,
          formattedSize: formatBytes(data.totalBytes),
          sizeMB,
          formats: formatsList || 'N/A',
          color: meta.color,
          desc: meta.desc,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [evidenceItems]);

  const totalStorageBytes = useMemo(() => {
    return evidenceItems.reduce((acc, curr) => acc + (curr.fileSizeBytes || 0), 0);
  }, [evidenceItems]);

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1.5 z-50">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-white text-sm">{data.name}</span>
            <span className="text-[10px] text-slate-400">({data.nameEn})</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">จำนวนไฟล์หลักฐาน:</span>
              <span className="font-bold text-cyan-300">{data.count} รายการ ({data.percentage}%)</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">ขนาดความจุรวม:</span>
              <span className="text-emerald-300 font-bold">{data.formattedSize}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">รูปแบบไฟล์ (Formats):</span>
              <span className="text-amber-300 font-bold">{data.formats}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 font-sans">
            {data.desc}
          </div>
        </div>
      );
    }
    return null;
  };

  // New Evidence Form State
  const [newEvidenceName, setNewEvidenceName] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState<EvidenceItem['type']>('DISK_IMAGE');
  const [newEvidenceFormat, setNewEvidenceFormat] = useState('E01');
  const [newEvidenceDevice, setNewEvidenceDevice] = useState('');
  const [newEvidenceOfficer, setNewEvidenceOfficer] = useState('');
  const [newEvidenceDesc, setNewEvidenceDesc] = useState('');

  // New Custody Form State
  const [selectedEvidenceForCustody, setSelectedEvidenceForCustody] = useState(evidenceItems[0]?.id || '');
  const [custodyAction, setCustodyAction] = useState<ChainOfCustodyRecord['action']>('ANALYSIS');
  const [custodyOfficer, setCustodyOfficer] = useState('');
  const [custodyRole, setCustodyRole] = useState('');
  const [custodyPurpose, setCustodyPurpose] = useState('');
  const [custodyLocation, setCustodyLocation] = useState('Forensic Lab Room 2');

  const filteredEvidence = evidenceItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evidenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceDevice.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSimulateVerify = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      onVerifyHash(id);
      setVerifyingId(null);
    }, 1000);
  };

  const toggleCompare = (id: string) => {
    setOpenCompareIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSetInputHash = (id: string, hash: string) => {
    setInputHashes((prev) => ({
      ...prev,
      [id]: hash,
    }));
  };

  const handleSetAlgorithm = (id: string, algo: 'SHA256' | 'MD5') => {
    setHashAlgorithms((prev) => ({
      ...prev,
      [id]: algo,
    }));
  };

  const handlePasteClipboard = async (id: string) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleSetInputHash(id, text.trim());
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleTestMatchingHash = (item: EvidenceItem) => {
    const algo = hashAlgorithms[item.id] || 'SHA256';
    const target = algo === 'SHA256' ? item.sha256Hash : item.md5Hash;
    handleSetInputHash(item.id, target);
  };

  const handleTestTamperedHash = (item: EvidenceItem) => {
    const algo = hashAlgorithms[item.id] || 'SHA256';
    const target = algo === 'SHA256' ? item.sha256Hash : item.md5Hash;
    const tampered = target.slice(0, 8) + 'deadbeef' + target.slice(16);
    handleSetInputHash(item.id, tampered);
  };

  const handleConfirmVerified = (item: EvidenceItem) => {
    const algo = hashAlgorithms[item.id] || 'SHA256';
    if (onUpdateIntegrityStatus) {
      onUpdateIntegrityStatus(item.id, 'VERIFIED');
    } else {
      onVerifyHash(item.id);
    }

    onAddCustodyRecord({
      evidenceId: item.id,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      action: 'VERIFICATION',
      custodian: 'เจ้าหน้าที่ตรวจพิสูจน์ (DFIR Investigator)',
      custodianRole: 'Forensic Evidence Examiner',
      purpose: `ยืนยันความสมบูรณ์ของค่าแฮช (${algo}) ตรงกัน 100% (Cryptographic Match Validated)`,
      location: item.storageLocation,
      digitalSignature: `SIG_RSA4096_MATCH_VERIFIED_${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
      notes: 'ผลการเปรียบเทียบค่า Hash ตรงกับค่ามาตรฐานปฐมภูมิ พยานหลักฐานคงความน่าเชื่อถือตามมาตรฐาน ISO/IEC 27037',
    });

    setComparisonNotices((prev) => ({
      ...prev,
      [item.id]: {
        type: 'success',
        text: 'บันทึกผลตรวจสอบสถานะ: VERIFIED และบันทึกลงใน Chain of Custody เรียบร้อยแล้ว',
      },
    }));

    setTimeout(() => {
      setComparisonNotices((prev) => ({ ...prev, [item.id]: null }));
    }, 4500);
  };

  const handleConfirmTampered = (item: EvidenceItem) => {
    const algo = hashAlgorithms[item.id] || 'SHA256';
    if (onUpdateIntegrityStatus) {
      onUpdateIntegrityStatus(item.id, 'TAMPERED');
    }

    onAddCustodyRecord({
      evidenceId: item.id,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      action: 'VERIFICATION',
      custodian: 'เจ้าหน้าที่ตรวจพิสูจน์ (DFIR Investigator)',
      custodianRole: 'Forensic Quality Auditor',
      purpose: `แจ้งเตือนค่าแฮช (${algo}) ไม่ตรงกัน (Hash Mismatch - สงสัยการถูกดัดแปลงแก้ไข)`,
      location: item.storageLocation,
      digitalSignature: `SIG_RSA4096_TAMPER_ALERT_${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
      notes: 'คำเตือน: วัตถุพยานมีค่าแฮชไม่ตรงกับบันทึกเดิม แจ้งหัวหน้าทีม DFIR ดำเนินการอายัดและตรวจสอบซ้ำ',
    });

    setComparisonNotices((prev) => ({
      ...prev,
      [item.id]: {
        type: 'danger',
        text: 'บันทึกผลตรวจสถานะ: TAMPERED และส่งสัญญาณเตือนในระบบเรียบร้อยแล้ว',
      },
    }));

    setTimeout(() => {
      setComparisonNotices((prev) => ({ ...prev, [item.id]: null }));
    }, 4500);
  };

  const handleCreateEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceName) return;

    // Generate random simulated SHA-256 for demo
    const hex = '0123456789abcdef';
    let randHash = '';
    for (let i = 0; i < 64; i++) {
      randHash += hex[Math.floor(Math.random() * hex.length)];
    }

    onAddEvidence({
      name: newEvidenceName,
      type: newEvidenceType,
      fileFormat: newEvidenceFormat,
      fileSizeBytes: Math.floor(Math.random() * 5000000000) + 1000000,
      sha256Hash: randHash,
      md5Hash: randHash.slice(0, 32),
      acquiredAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      acquiredBy: newEvidenceOfficer || 'เจ้าหน้าที่ตรวจพิสูจน์พยานหลักฐาน',
      sourceDevice: newEvidenceDevice || 'Target Workstation / Server',
      storageLocation: 'Digital Evidence Locker (Secured)',
      integrityStatus: 'VERIFIED',
      description: newEvidenceDesc || 'วัตถุพยานดิจิทัลที่ยึดเพื่อประกอบสำนวนคดี',
    });

    setIsAddEvidenceOpen(false);
    setNewEvidenceName('');
    setNewEvidenceDevice('');
  };

  const handleCreateCustody = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custodyOfficer || !custodyPurpose) return;

    onAddCustodyRecord({
      evidenceId: selectedEvidenceForCustody || evidenceItems[0]?.id,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      action: custodyAction,
      custodian: custodyOfficer,
      custodianRole: custodyRole || 'Forensic Investigator',
      purpose: custodyPurpose,
      location: custodyLocation,
      digitalSignature: `SIG_RSA4096_${Math.random().toString(16).slice(2, 10).toUpperCase()}_OK`,
      notes: 'บันทึกการส่งมอบพยานหลักฐานตามมาตรฐาน ISO/IEC 27037',
    });

    setIsAddCustodyOpen(false);
    setCustodyOfficer('');
    setCustodyPurpose('');
  };

  const handleExportCSV = () => {
    setIsExportingCSV(true);
    try {
      const headers = [
        'Evidence Number',
        'Evidence Name',
        'Type',
        'Format',
        'Size (Bytes)',
        'Formatted Size',
        'SHA-256 Hash',
        'MD5 Hash',
        'Acquired Date (UTC)',
        'Acquired By',
        'Source Device',
        'Storage Location',
        'Integrity Status',
        'Last Verified Date (UTC)',
        'Chain of Custody Count',
        'Description',
      ];

      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return '""';
        const str = String(value);
        return `"${str.replace(/"/g, '""')}"`;
      };

      const rows = evidenceItems.map((item) => [
        escapeCSV(item.evidenceNumber),
        escapeCSV(item.name),
        escapeCSV(item.type),
        escapeCSV(item.fileFormat),
        escapeCSV(item.fileSizeBytes),
        escapeCSV(formatBytes(item.fileSizeBytes)),
        escapeCSV(item.sha256Hash),
        escapeCSV(item.md5Hash),
        escapeCSV(item.acquiredAt),
        escapeCSV(item.acquiredBy),
        escapeCSV(item.sourceDevice),
        escapeCSV(item.storageLocation),
        escapeCSV(item.integrityStatus),
        escapeCSV(item.lastVerifiedAt),
        escapeCSV(item.chainOfCustodyCount),
        escapeCSV(item.description),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\r\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeCaseNum = (caseNumber || 'CASE').replace(/[^a-zA-Z0-9_-]/g, '_');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `Evidence_Inventory_${safeCaseNum}_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setTimeout(() => setIsExportingCSV(false), 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono flex items-center gap-2 transition-colors ${
              activeTab === 'evidence'
                ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>คลังวัตถุพยาน ({evidenceItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custody')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono flex items-center gap-2 transition-colors ${
              activeTab === 'custody'
                ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>ห่วงโซ่การครอบครอง / Chain of Custody ({chainOfCustody.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'evidence' ? (
            <>
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อไฟล์, Hash, อุปกรณ์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Evidence Distribution Chart Toggle Button */}
              <button
                onClick={() => setIsChartVisible(!isChartVisible)}
                title="แสดง/ซ่อน แผนภูมิแท่ง Recharts สถิติสัดส่วนประเภทพยานหลักฐาน"
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm ${
                  isChartVisible
                    ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-purple-500/50 text-slate-200 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span>{isChartVisible ? 'สถิติประเภทไฟล์' : 'แสดงสถิติประเภทไฟล์'}</span>
              </button>

              {/* Quick Global Hash Matcher Button */}
              <button
                onClick={() => setIsGlobalMatcherOpen(!isGlobalMatcherOpen)}
                title="ค้นหาและตรวจทานความสมบูรณ์ด้วยค่า Hash ทั่วทั้งคลังวัตถุพยาน"
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm ${
                  isGlobalMatcherOpen
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isGlobalMatcherOpen ? 'ปิดตัวตรวจ Hash' : 'ค้นหาตาม Hash'}</span>
              </button>

              {/* Export CSV Button */}
              <button
                onClick={handleExportCSV}
                title="ส่งออกบัญชีรายการวัตถุพยานเป็นไฟล์ CSV สำหรับงานเอกสารและสำนวนคดี"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm group"
              >
                <Download className={`w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform ${isExportingCSV ? 'animate-bounce' : ''}`} />
                <span>{isExportingCSV ? 'กำลังสร้าง CSV...' : 'ส่งออก CSV'}</span>
              </button>

              <button
                onClick={() => setIsAddEvidenceOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.25)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มวัตถุพยาน</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleExportCSV}
                title="ส่งออกบัญชีรายการวัตถุพยานเป็นไฟล์ CSV"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>ส่งออก CSV</span>
              </button>

              <button
                onClick={() => setIsAddCustodyOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.25)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>บันทึกการส่งมอบ (Log Custody)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* View 1: Evidence Items Table */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          {/* Recharts Bar Chart: Distribution of Evidence File Types */}
          {isChartVisible && (
            <div className="uiverse-card p-4 sm:p-5 border border-slate-800/90 space-y-4">
              {/* Chart Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <span>การกระจายตัวของประเภทวัตถุพยานดิจิทัล (Evidence File Type Distribution)</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px]">
                        Recharts Visualizer
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      แผนภูมิแท่งแสดงการกระจายตัวและสัดส่วนของประเภทไฟล์หลักฐานในคดีปัจจุบัน
                    </p>
                  </div>
                </div>

                {/* Metric Selector & Toggle */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setChartMetric('count')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        chartMetric === 'count'
                          ? 'bg-cyan-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ตามจำนวนไฟล์ (Count)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMetric('size')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        chartMetric === 'size'
                          ? 'bg-cyan-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ตามขนาดความจุ (MB)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsChartVisible(false)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                    title="ย่อแผนภูมิ"
                  >
                    ✕ ย่อ
                  </button>
                </div>
              </div>

              {/* Metric Overview Mini-Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block font-sans">จำนวนพยานหลักฐานรวม</span>
                  <span className="text-lg font-bold text-cyan-400 font-mono">{evidenceItems.length}</span>
                  <span className="text-slate-400 text-[10px] block font-sans">ชิ้นในคลังวัตถุพยาน</span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block font-sans">ปริมาณข้อมูลรวม</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">{formatBytes(totalStorageBytes)}</span>
                  <span className="text-slate-400 text-[10px] block font-sans">พื้นที่จัดเก็บทั้งหมด</span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block font-sans">หมวดหมู่หลักที่มีมากสุด</span>
                  <span className="text-sm font-bold text-purple-400 font-mono truncate block">
                    {evidenceTypeDistribution[0]?.name || 'N/A'}
                  </span>
                  <span className="text-slate-400 text-[10px] block font-sans">
                    {evidenceTypeDistribution[0]
                      ? `${evidenceTypeDistribution[0].count} รายการ (${evidenceTypeDistribution[0].percentage}%)`
                      : ''}
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block font-sans">การคุ้มครองตามมาตรฐาน</span>
                  <span className="text-sm font-bold text-amber-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>NIST SP 800-86</span>
                  </span>
                  <span className="text-slate-400 text-[10px] block font-sans">บันทึกค่า Hash 100%</span>
                </div>
              </div>

              {/* The Recharts Bar Chart */}
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={evidenceTypeDistribution}
                    margin={{ top: 15, right: 20, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                      tickLine={{ stroke: '#334155' }}
                      interval={0}
                    />
                    <YAxis
                      stroke="#64748b"
                      allowDecimals={chartMetric === 'size'}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                      tickLine={{ stroke: '#334155' }}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar
                      dataKey={chartMetric === 'count' ? 'count' : 'sizeMB'}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={55}
                    >
                      {evidenceTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend and Distribution Breakdown Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 border-t border-slate-800/60 text-xs font-mono">
                {evidenceTypeDistribution.map((entry) => (
                  <div
                    key={entry.typeKey}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-[11px]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-200">{entry.name}:</span>
                    <span className="text-cyan-400 font-bold">
                      {chartMetric === 'count' ? `${entry.count} รายการ` : entry.formattedSize}
                    </span>
                    <span className="text-slate-500">({entry.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global Quick Hash Lookup Banner */}
          {isGlobalMatcherOpen && (
            <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-4 sm:p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">
                      ระบบตรวจทานและจับคู่ค่า HASH กลาง (Global Forensic Hash Matcher)
                    </h4>
                    <p className="text-xs text-slate-400">
                      วางค่า Hash (SHA-256 หรือ MD5) เพื่อค้นหาว่าตรงกับวัตถุพยานชิ้นใดในคดีนี้โดยอัตโนมัติ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => {
                      if (evidenceItems[0]) setGlobalInputHash(evidenceItems[0].sha256Hash);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 font-mono text-[11px]"
                  >
                    ใส่ค่าทดสอบตัวอย่าง (Sample)
                  </button>
                  <button
                    onClick={() => setGlobalInputHash('')}
                    className="px-2 py-1 text-slate-400 hover:text-white"
                  >
                    ล้างค่า
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="วางค่า Hash (SHA-256 64 หลัก หรือ MD5 32 หลัก) ที่นี่..."
                  value={globalInputHash}
                  onChange={(e) => setGlobalInputHash(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg text-slate-100 font-mono text-xs placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Global Result Display */}
              {globalInputHash.trim().length > 0 && (() => {
                const cleaned = globalInputHash.trim().toLowerCase();
                const matchedItem = evidenceItems.find(
                  (item) =>
                    item.sha256Hash.toLowerCase() === cleaned ||
                    item.md5Hash.toLowerCase() === cleaned
                );

                if (matchedItem) {
                  const isSha = matchedItem.sha256Hash.toLowerCase() === cleaned;
                  return (
                    <div className="uiverse-status-match p-3.5 rounded-lg flex items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-2.5 text-emerald-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <span>MATCH VERIFIED: พบวัตถุพยานที่ตรงกันสมบูรณ์!</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-[10px]">
                              {isSha ? 'SHA-256' : 'MD5'}
                            </span>
                          </div>
                          <div className="text-slate-300 text-[11px] mt-0.5">
                            รหัส: <span className="text-cyan-400 font-bold">{matchedItem.evidenceNumber}</span> — {matchedItem.name} ({matchedItem.sourceDevice})
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          toggleCompare(matchedItem.id);
                          handleSetInputHash(matchedItem.id, cleaned);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs whitespace-nowrap shadow-sm"
                      >
                        ดูผลเปรียบเทียบในรายการ
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="uiverse-status-mismatch p-3.5 rounded-lg flex items-center gap-3 text-xs font-mono">
                      <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                      <div>
                        <div className="font-bold text-rose-300">
                          MISMATCH ALERT: ไม่พบวัตถุพยานที่ตรงกับค่า Hash นี้ในคลัง
                        </div>
                        <div className="text-slate-300 text-[11px] mt-0.5">
                          ค่า Hash ที่ระบุไม่ตรงกับทั้ง SHA-256 และ MD5 ของหลักฐานใด ๆ ในคดีนี้ (Unregistered / Modified File)
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {filteredEvidence.map((item) => {
              const isCompareOpen = !!openCompareIds[item.id];
              const currentAlgo = hashAlgorithms[item.id] || 'SHA256';
              const targetHash = currentAlgo === 'SHA256' ? item.sha256Hash : item.md5Hash;
              const userHash = inputHashes[item.id] || '';
              const cleanedUserHash = userHash.trim().toLowerCase();
              const isProvided = cleanedUserHash.length > 0;
              const isMatch = isProvided && cleanedUserHash === targetHash.toLowerCase();
              const isMismatch = isProvided && !isMatch;
              const notice = comparisonNotices[item.id];

              return (
                <div
                  key={item.id}
                  className={`uiverse-card p-4 sm:p-5 transition-all ${
                    isMatch
                      ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : isMismatch
                      ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                      : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Item Identity */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-xs font-bold border border-slate-700">
                          {item.evidenceNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-[11px]">
                          {item.type} ({item.fileFormat})
                        </span>
                        
                        {/* Dynamic Integrity Badge */}
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[11px] flex items-center gap-1 border ${
                            item.integrityStatus === 'VERIFIED'
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : item.integrityStatus === 'TAMPERED'
                              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse'
                              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          {item.integrityStatus === 'VERIFIED' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : item.integrityStatus === 'TAMPERED' ? (
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                          ) : (
                            <Activity className="w-3 h-3 text-amber-400" />
                          )}
                          <span>ความสมบูรณ์: {item.integrityStatus}</span>
                        </span>

                        {isMatch && (
                          <span className="uiverse-pill-match text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>HASH MATCHED 100%</span>
                          </span>
                        )}

                        {isMismatch && (
                          <span className="uiverse-pill-mismatch text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            <AlertOctagon className="w-3 h-3 text-rose-400" />
                            <span>HASH MISMATCH ALERT</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        {item.name}
                        <span className="text-xs font-normal text-slate-400">
                          ({formatBytes(item.fileSizeBytes)})
                        </span>
                      </h3>

                      <p className="text-xs text-slate-300 max-w-3xl">
                        {item.description}
                      </p>
                    </div>

                    {/* Actions & Verification */}
                    <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-center gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        {/* Compare Hash Toggle Button */}
                        <button
                          onClick={() => toggleCompare(item.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm ${
                            isCompareOpen
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white'
                          }`}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-300" />
                          <span>{isCompareOpen ? 'ปิดตัวเทียบ Hash' : 'เปรียบเทียบค่า Hash'}</span>
                          {isProvided && (
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isMatch ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                          )}
                        </button>

                        {/* Re-verify SHA-256 button */}
                        <button
                          onClick={() => handleSimulateVerify(item.id)}
                          disabled={verifyingId === item.id}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-all"
                        >
                          {verifyingId === item.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                              <span>กำลังคำนวณ...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>ตรวจซ้ำ</span>
                            </>
                          )}
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono">
                        ตรวจล่าสุด: {item.lastVerifiedAt}
                      </span>
                    </div>
                  </div>

                  {/* Hashes & Acquisition Details */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                    {/* SHA-256 Box */}
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-slate-500 text-[10px] block font-sans">
                          SHA-256 BASELINE HASH:
                        </span>
                        <span className="text-emerald-400 text-[11px] truncate block">
                          {item.sha256Hash}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.sha256Hash)}
                        className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
                        title="คัดลอก SHA-256"
                      >
                        {copiedHash === item.sha256Hash ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* MD5 Box */}
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-slate-500 text-[10px] block font-sans">
                          MD5 BASELINE HASH:
                        </span>
                        <span className="text-cyan-400 text-[11px] truncate block">
                          {item.md5Hash}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.md5Hash)}
                        className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
                        title="คัดลอก MD5"
                      >
                        {copiedHash === item.md5Hash ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Acquisition Officer & Source */}
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 flex flex-col justify-center font-sans">
                      <div className="truncate">
                        <span className="text-slate-500">อุปกรณ์เป้าหมาย:</span>{' '}
                        <span className="text-slate-200 font-mono text-[10.5px]">{item.sourceDevice}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-slate-500">ผู้ยึดหลักฐาน:</span>{' '}
                        <span className="text-cyan-300">{item.acquiredBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Notification Banner */}
                  {notice && (
                    <div
                      className={`mt-3 p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                        notice.type === 'success'
                          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                          : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                      }`}
                    >
                      {notice.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{notice.text}</span>
                    </div>
                  )}

                  {/* NEW FEATURE: Dedicated Hash Integrity Comparator Console */}
                  {isCompareOpen && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-3.5">
                      {/* Comparator Header & Algorithm Switcher */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                          <div>
                            <span className="text-xs font-bold text-white font-mono block">
                              เครื่องมือเปรียบเทียบค่า HASH (Cryptographic Hash Integrity Verification)
                            </span>
                            <span className="text-[11px] text-slate-400">
                              เปรียบเทียบค่าแฮชที่ได้รับกับค่า Baseline เพื่อตรวจจับความผิดปกติหรือการดัดแปลงหลักฐาน
                            </span>
                          </div>
                        </div>

                        {/* Algorithm Selector Buttons */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          <span className="text-[11px] text-slate-400 font-mono mr-1">อัลกอริทึม:</span>
                          <button
                            type="button"
                            onClick={() => handleSetAlgorithm(item.id, 'SHA256')}
                            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                              currentAlgo === 'SHA256'
                                ? 'bg-cyan-600 text-white font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            SHA-256 (64 hex)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetAlgorithm(item.id, 'MD5')}
                            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                              currentAlgo === 'MD5'
                                ? 'bg-cyan-600 text-white font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            MD5 (32 hex)
                          </button>
                        </div>
                      </div>

                      {/* Baseline Reference Display */}
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs font-mono">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>ค่า {currentAlgo} มาตรฐานที่บันทึกไว้ (Stored Baseline):</span>
                          </span>
                          <span className="text-slate-500 font-sans">{targetHash.length} ตัวอักษร</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded border border-slate-800 text-slate-200 select-all break-all text-[11px]">
                          {targetHash}
                        </div>
                      </div>

                      {/* Provided Hash Input Box */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <label className="text-slate-300 font-medium flex items-center gap-1.5">
                            <FileSignature className="w-3.5 h-3.5 text-cyan-400" />
                            <span>ใส่ค่า Hash ที่ต้องการเปรียบเทียบ (Provided Hash to Validate):</span>
                          </label>

                          <div className="flex items-center gap-2 text-[11px] font-mono">
                            <span className="text-slate-400">
                              ความยาว: {userHash.trim().length} / {targetHash.length} ตัวอักษร
                            </span>
                          </div>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            value={userHash}
                            onChange={(e) => handleSetInputHash(item.id, e.target.value)}
                            placeholder={`วางหรือพิมพ์ค่า ${currentAlgo} ที่ตรวจวัดได้เพื่อเปรียบเทียบ...`}
                            className={`w-full px-3 py-2 text-xs font-mono bg-slate-950 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none transition-all border ${
                              isMatch
                                ? 'border-emerald-500 focus:border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : isMismatch
                                ? 'border-rose-500 focus:border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                                : 'border-slate-800 focus:border-cyan-500'
                            }`}
                          />
                        </div>

                        {/* Quick Action Helpers */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handlePasteClipboard(item.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-mono flex items-center gap-1 border border-slate-700"
                            title="วางค่า Hash จากคลิปบอร์ด"
                          >
                            <ClipboardPaste className="w-3 h-3 text-cyan-400" />
                            <span>วางจากคลิปบอร์ด</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTestMatchingHash(item)}
                            className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-[11px] font-mono flex items-center gap-1 border border-emerald-500/40"
                            title="ทดสอบใส่ค่า Hash ที่ถูกต้องตรงกัน 100%"
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>ทดสอบค่าตรงกัน (Sample Match)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTestTamperedHash(item)}
                            className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-[11px] font-mono flex items-center gap-1 border border-rose-500/40"
                            title="ทดสอบใส่ค่า Hash ที่ถูกดัดแปลงเพื่อดูการแจ้งเตือนสีแดง"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            <span>ทดสอบค่าดัดแปลง (Sample Tampered)</span>
                          </button>

                          {userHash && (
                            <button
                              type="button"
                              onClick={() => handleSetInputHash(item.id, '')}
                              className="px-2 py-1 text-slate-400 hover:text-white text-[11px] ml-auto"
                            >
                              ✕ ล้างค่า
                            </button>
                          )}
                        </div>
                      </div>

                      {/* CLEAR GREEN / RED STATUS INDICATOR DISPLAY */}
                      {isMatch ? (
                        /* CLEAR GREEN STATUS INDICATOR */
                        <div className="uiverse-status-match p-4 rounded-xl border border-emerald-500/70 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-emerald-200 font-mono flex items-center gap-2">
                                  <span>STATUS: MATCH (ค่า HASH ตรงกันสมบูรณ์ 100%)</span>
                                </div>
                                <div className="text-xs text-emerald-300/90 font-sans">
                                  Cryptographic Hash Verification: PASS — ความสมบูรณ์ของหลักฐานถูกต้องตามมาตรฐาน NIST SP 800-86
                                </div>
                              </div>
                            </div>

                            <span className="uiverse-pill-match px-3 py-1 rounded-full text-xs font-mono font-bold self-start sm:self-auto flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>INTEGRITY VERIFIED</span>
                            </span>
                          </div>

                          <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-500/30 text-xs font-mono space-y-1.5 text-slate-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-emerald-400">
                              <span>ผลการตรวจเปรียบเทียบระดับบิต: ไม่พบการเปลี่ยนแปลง (Bit-for-Bit Identical)</span>
                              <span>ตรงกัน {targetHash.length}/{targetHash.length} ตัวอักษร</span>
                            </div>
                            <div className="text-[11px] break-all bg-emerald-950/40 p-2 rounded border border-emerald-500/20 text-emerald-300">
                              {cleanedUserHash}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-500/30">
                            <p className="text-xs text-emerald-200/80 font-sans">
                              พยานหลักฐานชิ้นนี้คงสภาพเดิม สามารถใช้เป็นพยานหลักฐานในชั้นศาลได้ (Court Admissible)
                            </p>

                            <button
                              type="button"
                              onClick={() => handleConfirmVerified(item)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium font-mono flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>บันทึกยืนยันความสมบูรณ์ลง CoC</span>
                            </button>
                          </div>
                        </div>
                      ) : isMismatch ? (
                        /* CLEAR RED STATUS INDICATOR */
                        <div className="uiverse-status-mismatch p-4 rounded-xl border border-rose-500/80 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center shrink-0">
                                <AlertOctagon className="w-5 h-5 text-rose-400" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-rose-200 font-mono flex items-center gap-2">
                                  <span>STATUS: MISMATCH DETECTED (ตรวจพบค่า HASH ไม่ตรงกัน!)</span>
                                </div>
                                <div className="text-xs text-rose-300/90 font-sans">
                                  Cryptographic Hash Verification: FAILED — ตรวจพบความผิดปกติหรือการเปลี่ยนแปลงข้อมูล
                                </div>
                              </div>
                            </div>

                            <span className="uiverse-pill-mismatch px-3 py-1 rounded-full text-xs font-mono font-bold self-start sm:self-auto flex items-center gap-1 animate-pulse">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>TAMPER ALERT</span>
                            </span>
                          </div>

                          <div className="bg-slate-950/80 p-3 rounded-lg border border-rose-500/40 text-xs font-mono space-y-2">
                            <div className="text-[11px] text-rose-400 font-sans flex items-center justify-between">
                              <span>รายละเอียดความคลาดเคลื่อน:</span>
                              <span>
                                ความยาว: {cleanedUserHash.length} ตัวอักษร (เป้าหมาย {targetHash.length})
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <div>
                                <span className="text-[10px] text-slate-400 block">ค่ามาตรฐาน (Stored Baseline):</span>
                                <div className="text-[11px] text-cyan-300 bg-slate-900 p-1.5 rounded break-all border border-slate-800">
                                  {targetHash}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] text-rose-300 block">ค่าที่ระบุ (Provided Hash):</span>
                                <div className="text-[11px] text-rose-300 bg-rose-950/40 p-1.5 rounded break-all border border-rose-500/30">
                                  {cleanedUserHash}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-rose-500/30">
                            <p className="text-xs text-rose-200/90 font-sans">
                              คำเตือน: วัตถุพยานอาจถูกดัดแปลงแก้ไข เสียหาย หรือไฟล์ไม่ตรงรุ่น ต้องรายงานหัวหน้าชุดตรวจพิสูจน์ทันที
                            </p>

                            <button
                              type="button"
                              onClick={() => handleConfirmTampered(item)}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              <span>ปรับสถานะเป็น TAMPERED และแจ้งเตือน</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* NEUTRAL AWAITING STATE */
                        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-slate-500" />
                            <span>กรุณากรอกหรือวางค่า Hash เพื่อเริ่มการเปรียบเทียบความสมบูรณ์ทางนิติวิทยาศาสตร์</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            เป้าหมาย: {targetHash.length} หลัก
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: Chain of Custody (NIST SP 800-86 standard) */}
      {activeTab === 'custody' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                บันทึกประวัติห่วงโซ่การครอบครองพยานหลักฐาน (CHAIN OF CUSTODY LOG)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                มาตรฐาน NIST SP 800-86 และ ISO/IEC 27037 การรับมอบและวิเคราะห์วัตถุพยานในชั้นศาล
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded">
              Digital Signature Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">วันและเวลา (UTC)</th>
                  <th className="py-2.5 px-3">รหัสพยานหลักฐาน</th>
                  <th className="py-2.5 px-3">การปฏิบัติการ (Action)</th>
                  <th className="py-2.5 px-3">ผู้ครอบครอง (Custodian)</th>
                  <th className="py-2.5 px-3">วัตถุประสงค์ (Purpose)</th>
                  <th className="py-2.5 px-3">สถานที่จัดเก็บ</th>
                  <th className="py-2.5 px-3">Digital Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {chainOfCustody.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {record.timestamp}
                    </td>
                    <td className="py-3 px-3 text-cyan-400 font-bold whitespace-nowrap">
                      {record.evidenceId}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        {record.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white">
                      <div>{record.custodian}</div>
                      <div className="text-[10px] text-slate-500">{record.custodianRole}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs">
                      {record.purpose}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {record.location}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-mono text-[10px]">
                      {record.digitalSignature}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New Evidence */}
      {isAddEvidenceOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                ลงทะเบียนวัตถุพยานใหม่ (Evidence Registration)
              </h3>
              <button
                onClick={() => setIsAddEvidenceOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvidence} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  ชื่อไฟล์วัตถุพยาน (Evidence File Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Target_Physical_Memory.raw, Disk_Triage.E01"
                  value={newEvidenceName}
                  onChange={(e) => setNewEvidenceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ประเภทพยานหลักฐาน (Type)
                  </label>
                  <select
                    value={newEvidenceType}
                    onChange={(e) => setNewEvidenceType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="DISK_IMAGE">DISK_IMAGE (E01 / DD)</option>
                    <option value="MEMORY_DUMP">MEMORY_DUMP (RAW / DMP)</option>
                    <option value="PCAP_CAPTURE">PCAP_CAPTURE (PCAP / PCAPNG)</option>
                    <option value="EVENT_LOGS">EVENT_LOGS (EVTX / LOG)</option>
                    <option value="TRIAGE_ARCHIVE">TRIAGE_ARCHIVE (ZIP / 7Z)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ฟอร์แมตไฟล์ (Format)
                  </label>
                  <input
                    type="text"
                    value={newEvidenceFormat}
                    onChange={(e) => setNewEvidenceFormat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  อุปกรณ์หรือที่มา (Source Device / Location)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Domain Controller SRV-DC01 (IP: 10.100.4.15)"
                  value={newEvidenceDevice}
                  onChange={(e) => setNewEvidenceDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  เจ้าหน้าที่ผู้ยึดหลักฐาน (Forensic Examiner)
                </label>
                <input
                  type="text"
                  placeholder="e.g. เจ้าหน้าที่นิติวิทยาศาสตร์ ดร. นรินทร์ พิเศษวิทยา"
                  value={newEvidenceOfficer}
                  onChange={(e) => setNewEvidenceOfficer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  คำอธิบายวัตถุพยานเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  placeholder="ระบุข้อเท็จจริง สภาพทางกายภาพ หรือวิธีการได้มาซึ่งพยานหลักฐาน..."
                  value={newEvidenceDesc}
                  onChange={(e) => setNewEvidenceDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEvidenceOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  บันทึกวัตถุพยาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Custody Record */}
      {isAddCustodyOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-cyan-400" />
                บันทึกการส่งมอบ/วิเคราะห์พยานหลักฐาน (Custody Log Entry)
              </h3>
              <button
                onClick={() => setIsAddCustodyOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustody} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  เลือกวัตถุพยาน
                </label>
                <select
                  value={selectedEvidenceForCustody}
                  onChange={(e) => setSelectedEvidenceForCustody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {evidenceItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.evidenceNumber}] {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    การดำเนินการ (Action)
                  </label>
                  <select
                    value={custodyAction}
                    onChange={(e) => setCustodyAction(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="ACQUISITION">ACQUISITION (ยึดพยานหลักฐาน)</option>
                    <option value="TRANSFER">TRANSFER (ส่งมอบ/เคลื่อนย้าย)</option>
                    <option value="ANALYSIS">ANALYSIS (นำเข้าวิเคราะห์)</option>
                    <option value="VERIFICATION">VERIFICATION (ตรวจนับและคำนวณแฮช)</option>
                    <option value="STORAGE_ARCHIVE">STORAGE_ARCHIVE (เก็บเข้าคลังปิดผนึก)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    สถานที่จัดเก็บ/ห้องปฏิบัติการ
                  </label>
                  <input
                    type="text"
                    value={custodyLocation}
                    onChange={(e) => setCustodyLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ชื่อผู้ครอบครอง (Custodian Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ดร. นรินทร์ พิเศษวิทยา"
                    value={custodyOfficer}
                    onChange={(e) => setCustodyOfficer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ตำแหน่ง / บทบาทหน้าที่
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น Senior DFIR Analyst"
                    value={custodyRole}
                    onChange={(e) => setCustodyRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  วัตถุประสงค์ในการครอบครอง/การตรวจวิเคราะห์ (Purpose)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="ระบุเหตุผลในการเบิกพยานหลักฐาน หรือขั้นตอนการทดสอบทางนิติวิทยาศาสตร์..."
                  value={custodyPurpose}
                  onChange={(e) => setCustodyPurpose(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustodyOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  ลงลายมือชื่อและบันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
