import React from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  UserCheck,
  Lock,
} from 'lucide-react';
import { ForensicCase } from '../types/forensics';

interface ForensicReportModalProps {
  forensicCase: ForensicCase;
  onClose: () => void;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({
  forensicCase,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(forensicCase, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${forensicCase.caseNumber}_Forensic_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const analysis = forensicCase.aiAnalysis;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-slate-900 print:bg-white text-slate-100 print:text-black border border-slate-700 print:border-none rounded-2xl w-full max-w-4xl max-h-[92vh] print:max-h-none overflow-y-auto shadow-2xl flex flex-col">
        {/* Top Modal Action Bar (Hidden when printing) */}
        <div className="p-4 border-b border-slate-800 print:hidden flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              รายงานผลการตรวจพิสูจน์พยานหลักฐานทางนิติวิทยาศาสตร์ (NIST SP 800-86 REPORT)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>พิมพ์ / ส่งออก PDF</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดข้อมูล (JSON)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-mono"
            >
              ปิด
            </button>
          </div>
        </div>

        {/* Printable Formal Report Document Content */}
        <div className="p-6 sm:p-10 space-y-8 font-sans print:text-black">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-700 print:border-black pb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 print:text-blue-800 uppercase">
                NATIONAL CYBER FORENSICS & THREAT INVESTIGATION LABORATORY
              </div>
              <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white print:text-black tracking-tight">
                รายงานผลการตรวจพิสูจน์พยานหลักฐานทางดิจิทัลและภัยคุกคามไซเบอร์
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1 font-mono">
                ตามระเบียบปฏิบัติมาตรฐาน NIST SP 800-86 & ISO/IEC 27037: Digital Evidence Handling
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-1">
              <div className="px-2.5 py-0.5 rounded bg-rose-950/80 print:bg-red-100 text-rose-300 print:text-red-700 border border-rose-500/40 print:border-red-400 inline-block font-bold">
                {forensicCase.classification}
              </div>
              <div className="text-slate-300 print:text-gray-800 font-bold">
                เลขที่สำนวน: {forensicCase.caseNumber}
              </div>
              <div className="text-slate-400 print:text-gray-600">
                วันที่ออกรายงาน: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Section 1: Case Dossier Information */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase font-mono text-cyan-400 print:text-blue-900 border-b border-slate-800 print:border-gray-300 pb-1">
              หมวดที่ 1: ข้อมูลทั่วไปของสำนวนคดี (Case Dossier & Incident Scope)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-slate-950/60 print:bg-gray-50 p-4 rounded-xl border border-slate-800 print:border-gray-200">
              <div>
                <span className="text-slate-500 print:text-gray-600 block">ชื่อเหตุการณ์:</span>
                <span className="font-bold text-white print:text-black">{forensicCase.title}</span>
              </div>
              <div>
                <span className="text-slate-500 print:text-gray-600 block">หน่วยงานเป้าหมาย:</span>
                <span className="text-slate-200 print:text-gray-900">{forensicCase.organization}</span>
              </div>
              <div>
                <span className="text-slate-500 print:text-gray-600 block">หัวหน้าผู้ตรวจพิสูจน์ (Lead Examiner):</span>
                <span className="text-slate-200 print:text-gray-900">{forensicCase.leadInvestigator}</span>
              </div>
              <div>
                <span className="text-slate-500 print:text-gray-600 block">ขอบเขตความเสียหาย (Compromise Scope):</span>
                <span className="text-rose-300 print:text-red-700">{forensicCase.scopeOfCompromise}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Executive Summary & Root Cause */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase font-mono text-cyan-400 print:text-blue-900 border-b border-slate-800 print:border-gray-300 pb-1">
              หมวดที่ 2: บทสรุปผลการตรวจพิสูจน์ (Executive Summary & Root Cause)
            </h2>
            <div className="text-xs sm:text-sm leading-relaxed text-slate-300 print:text-gray-800 bg-slate-950/40 print:bg-transparent p-4 rounded-xl border border-slate-800/80 print:border-none">
              <p>{analysis?.executiveSummary || forensicCase.summary}</p>
              
              <div className="mt-4 pt-3 border-t border-slate-800 print:border-gray-300 font-mono text-xs">
                <span className="font-bold text-amber-400 print:text-amber-800 block mb-1">
                  สมมติฐานจุดเริ่มต้นการบุกรุก (Root Cause Hypothesis):
                </span>
                <p className="text-slate-300 print:text-gray-700">
                  {analysis?.rootCauseHypothesis || 'ขาดการยืนยันตัวตนหลายปัจจัยบนเซิร์ฟเวอร์ควบคุม'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Evidence Inventory & Chain of Custody */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase font-mono text-cyan-400 print:text-blue-900 border-b border-slate-800 print:border-gray-300 pb-1">
              หมวดที่ 3: บัญชีวัตถุพยานและการตรวจสอบความถูกต้อง (Evidence Inventory & Hash Integrity)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-slate-800 print:border-gray-300">
                <thead className="bg-slate-950 print:bg-gray-100 text-slate-300 print:text-gray-700">
                  <tr>
                    <th className="p-2 border border-slate-800 print:border-gray-300">รหัสวัตถุพยาน</th>
                    <th className="p-2 border border-slate-800 print:border-gray-300">ชื่อไฟล์พยานหลักฐาน</th>
                    <th className="p-2 border border-slate-800 print:border-gray-300">ประเภท</th>
                    <th className="p-2 border border-slate-800 print:border-gray-300">SHA-256 HASH (Baseline)</th>
                    <th className="p-2 border border-slate-800 print:border-gray-300">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {forensicCase.evidenceItems.map((item) => (
                    <tr key={item.id} className="print:text-black">
                      <td className="p-2 font-bold border border-slate-800 print:border-gray-300">{item.evidenceNumber}</td>
                      <td className="p-2 border border-slate-800 print:border-gray-300">{item.name}</td>
                      <td className="p-2 border border-slate-800 print:border-gray-300">{item.type}</td>
                      <td className="p-2 text-[10px] truncate max-w-xs border border-slate-800 print:border-gray-300">{item.sha256Hash}</td>
                      <td className="p-2 text-emerald-400 print:text-green-700 font-bold border border-slate-800 print:border-gray-300">
                        {item.integrityStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Key Incident Timeline & MITRE Techniques */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase font-mono text-cyan-400 print:text-blue-900 border-b border-slate-800 print:border-gray-300 pb-1">
              หมวดที่ 4: ลำดับเหตุการณ์และเทคนิคการโจมตี (Attack Sequence & TTPs)
            </h2>
            <div className="space-y-2 text-xs font-mono">
              {forensicCase.timeline.map((event) => (
                <div
                  key={event.id}
                  className="bg-slate-950/60 print:bg-gray-50 p-2.5 rounded-lg border border-slate-800 print:border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-cyan-400 print:text-blue-700 font-bold mr-2">[{event.relativeTime}]</span>
                    <span className="font-bold text-white print:text-black mr-2">{event.title}:</span>
                    <span className="text-slate-300 print:text-gray-700 font-sans">{event.description}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-gray-600 shrink-0">
                    {event.techniqueId || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Extracted Indicators of Compromise */}
          {analysis?.iocs && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase font-mono text-cyan-400 print:text-blue-900 border-b border-slate-800 print:border-gray-300 pb-1">
                หมวดที่ 5: ตารางตัวชี้วัดการประนีประนอม (Indicators of Compromise - IOCs)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950/60 print:bg-gray-50 rounded-lg border border-slate-800 print:border-gray-200">
                  <span className="font-bold text-slate-400 print:text-gray-700 block mb-1">IP Addresses:</span>
                  <div className="text-slate-200 print:text-black">{analysis.iocs.ipAddresses?.join(', ') || 'N/A'}</div>
                </div>
                <div className="p-3 bg-slate-950/60 print:bg-gray-50 rounded-lg border border-slate-800 print:border-gray-200">
                  <span className="font-bold text-slate-400 print:text-gray-700 block mb-1">Malicious Domains:</span>
                  <div className="text-slate-200 print:text-black">{analysis.iocs.domains?.join(', ') || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Official Sign-off and Certification Block */}
          <div className="pt-6 border-t-2 border-slate-700 print:border-black space-y-6">
            <p className="text-xs text-slate-400 print:text-gray-600 leading-relaxed font-serif italic text-center">
              "ข้าพเจ้าขอรับรองว่าการตรวจพิสูจน์พยานหลักฐานดิจิทัลข้างต้น ได้กระทำตามมาตรฐานทางนิติวิทยาศาสตร์สากล โดยใช้เครื่องมือและกระบวนการที่ได้รับการยอมรับ พยานหลักฐานไม่ถูกแก้ไขหรือปนเปื้อนในระหว่างการตรวจพิสูจน์"
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-8 pt-4">
              <div className="text-center font-mono text-xs">
                <div className="w-48 border-b border-slate-500 print:border-black mx-auto mb-2 pb-6" />
                <div className="font-bold text-white print:text-black">{forensicCase.leadInvestigator}</div>
                <div className="text-slate-400 print:text-gray-600">หัวหน้าผู้ตรวจพิสูจน์พยานหลักฐานดิจิทัล</div>
              </div>

              <div className="text-center font-mono text-xs">
                <div className="w-48 border-b border-slate-500 print:border-black mx-auto mb-2 pb-6" />
                <div className="font-bold text-white print:text-black">พ.ต.อ. ประสิทธิ์ เกียรติเกรียงไกร</div>
                <div className="text-slate-400 print:text-gray-600">ผู้กำกับการศูนย์นิติวิทยาศาสตร์ไซเบอร์</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
