import React, { useState } from 'react';
import { FolderPlus, ShieldAlert, Plus } from 'lucide-react';
import { ForensicCase } from '../types/forensics';

interface NewCaseModalProps {
  onClose: () => void;
  onCreateCase: (newCase: ForensicCase) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ onClose, onCreateCase }) => {
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [leadInvestigator, setLeadInvestigator] = useState('');
  const [classification, setClassification] = useState<ForensicCase['classification']>('TOP SECRET / FORENSIC');
  const [summary, setSummary] = useState('');
  const [scope, setScope] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const caseNumber = `DFIR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase: ForensicCase = {
      id: `case-${Date.now()}`,
      caseNumber,
      title,
      classification,
      status: 'TRIAGE',
      incidentDate: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      leadInvestigator: leadInvestigator || 'เจ้าหน้าที่ตรวจพิสูจน์พยานหลักฐาน',
      organization: organization || 'องค์กรที่ได้รับผลกระทบ',
      summary: summary || 'เริ่มเปิดสำนวนตรวจพิสูจน์พยานหลักฐานทางนิติวิทยาศาสตร์ดิจิทัล',
      scopeOfCompromise: scope || 'อยู่ระหว่างการสืบสวนและจำกัดวงความเสียหาย',
      evidenceItems: [],
      chainOfCustody: [],
      artifacts: [],
      timeline: [],
      matchedActors: [],
    };

    onCreateCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              เปิดสำนวนคดีนิติวิทยาศาสตร์ใหม่ (NEW FORENSIC CASE DOSSIER)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1 font-sans">ชื่อคดี / รหัสปฏิบัติการ (Operation / Incident Title)</label>
            <input
              type="text"
              required
              placeholder="e.g. ปฏิบัติการ CyberStrike: ตรวจจับมัลแวร์แฝงตัวในเซิร์ฟเวอร์หลัก"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-sans">ชั้นความลับ (Classification)</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="TOP SECRET / FORENSIC">TOP SECRET / FORENSIC</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="INTERNAL USE">INTERNAL USE</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-sans">หน่วยงานเป้าหมาย (Organization)</label>
              <input
                type="text"
                placeholder="e.g. ศูนย์ข้อมูลภาครัฐ / บริษัทโทรคมนาคม"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans">หัวหน้าผู้ตรวจพิสูจน์ (Lead Examiner)</label>
            <input
              type="text"
              placeholder="e.g. พ.ต.ต. ดร. นรินทร์ พิเศษวิทยา"
              value={leadInvestigator}
              onChange={(e) => setLeadInvestigator(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans">สรุปข้อเท็จจริงและพฤติการณ์แห่งคดี (Incident Brief)</label>
            <textarea
              rows={3}
              placeholder="บรรยายเหตุการณ์ที่ตรวจพบ อาการของระบบ หรือสิ่งบอกเหตุการบุกรุก..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans">ขอบเขตระบบที่ได้รับผลกระทบ (Scope of Compromise)</label>
            <input
              type="text"
              placeholder="e.g. Server DC01, Web Server DMZ, 5 เครื่องในแผนกบัญชี"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span>เปิดสำนวนคดี</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
