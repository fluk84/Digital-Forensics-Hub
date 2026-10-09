import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Bookmark,
} from 'lucide-react';
import { ForensicCase, AIAnalysisResult } from '../types/forensics';
import { getSeverityBadgeClass } from '../utils/crypto';

interface AIForensicCopilotProps {
  forensicCase: ForensicCase;
  onUpdateAnalysis: (analysis: AIAnalysisResult) => void;
  isAnalyzing: boolean;
  onTriggerAnalysis: () => void;
  initialChatPrompt?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const AIForensicCopilot: React.FC<AIForensicCopilotProps> = ({
  forensicCase,
  onUpdateAnalysis,
  isAnalyzing,
  onTriggerAnalysis,
  initialChatPrompt,
}) => {
  const [subTab, setSubTab] = useState<'assessment' | 'chat'>('assessment');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      role: 'model',
      content: `สวัสดีครับ ผมคือ AI Forensic Copilot ผู้เชี่ยวชาญด้านนิติวิทยาศาสตร์ดิจิทัลและการตอบสนองต่อภัยคุกคามไซเบอร์ (DFIR) ยินดีช่วยสนับสนุนการวิเคราะห์หลักฐานในคดี **${forensicCase.caseNumber} - ${forensicCase.title}**

ท่านสามารถสอบถามการตีความ Event Logs (EVTX), คำสั่ง Volatility สำหรับตรวจ Memory, การวิเคราะห์ C2 Network PCAP, การถอดรหัสเพย์โหลด หรือขั้นตอนการควบคุมห่วงโซ่พยานหลักฐาน (Chain of Custody) ได้ทันทีครับ`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialChatPrompt) {
      setSubTab('chat');
      setChatInput(initialChatPrompt);
    }
  }, [initialChatPrompt]);

  useEffect(() => {
    if (subTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, subTab]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/forensics/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          caseContext: `Case ${forensicCase.caseNumber}: ${forensicCase.title}. Threat Category: ${forensicCase.aiAnalysis?.primaryThreatCategory}. Affected: ${forensicCase.scopeOfCompromise}`,
          currentArtifact: forensicCase.artifacts[0]?.rawContent || '',
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            role: 'model',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error(data.error || 'No reply');
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'model',
          content: `ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับ Copilot Engine: ${err.message || 'โปรดตรวจสอบการเชื่อมต่อ'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const analysis = forensicCase.aiAnalysis;

  return (
    <div className="space-y-5">
      {/* Sub navigation bar */}
      <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('assessment')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              subTab === 'assessment'
                ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-cyan-200" />
            <span>ผลการวิเคราะห์ภัยคุกคาม (AI Threat Assessment)</span>
          </button>

          <button
            onClick={() => setSubTab('chat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              subTab === 'chat'
                ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-200" />
            <span>สนทนากับผู้ช่วยนิติวิทยาศาสตร์ (Forensic Copilot Chat)</span>
          </button>
        </div>

        {subTab === 'assessment' && (
          <button
            onClick={onTriggerAnalysis}
            disabled={isAnalyzing}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'กำลังประมวลผล Gemini 3.8...' : 'รันการวิเคราะห์ใหม่ (AI Deep Scan)'}</span>
          </button>
        )}
      </div>

      {/* Sub-Tab 1: AI Threat Assessment View */}
      {subTab === 'assessment' && (
        <div className="space-y-5">
          {analysis ? (
            <>
              {/* Executive Summary Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-mono">
                        บทสรุปสำหรับผู้บริหาร (EXECUTIVE FORENSIC SUMMARY)
                      </h3>
                      <p className="text-xs text-slate-400">
                        วิเคราะห์ตามมาตรฐาน NIST SP 800-86 โดยแบบจำลอง Gemini 3.8 Flash
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded text-xs font-mono font-bold border ${
                        getSeverityBadgeClass(analysis.threatLevel).bg
                      } ${getSeverityBadgeClass(analysis.threatLevel).text} ${
                        getSeverityBadgeClass(analysis.threatLevel).border
                      } ${getSeverityBadgeClass(analysis.threatLevel).glow}`}
                    >
                      ระดับภัย: {analysis.threatLevel}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-1 rounded">
                      ความเชื่อมั่น: {analysis.confidenceScore}%
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-sans">
                  {analysis.executiveSummary}
                </p>

                {/* Root Cause Hypothesis */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-amber-400 font-mono block">
                    สมมติฐานจุดเริ่มต้นการบุกรุก (ROOT CAUSE HYPOTHESIS):
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
                    {analysis.rootCauseHypothesis}
                  </p>
                </div>
              </div>

              {/* Anomalies Detected Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  พฤติกรรมผิดปกติและหลักฐานที่พบ (DETECTED FORENSIC ANOMALIES)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.anomaliesDetected.map((anom, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              getSeverityBadgeClass(anom.severity).bg
                            } ${getSeverityBadgeClass(anom.severity).text} ${
                              getSeverityBadgeClass(anom.severity).border
                            }`}
                          >
                            {anom.severity}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white leading-tight">
                          {anom.indicator}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          {anom.explanation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-400 truncate">
                        พยานหลักฐาน: {anom.forensicArtifact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Indicators of Compromise (IOCs) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    ตัวชี้วัดการประนีประนอม (INDICATORS OF COMPROMISE - IOCs)
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    พร้อมส่งออกไปยัง SIEM / EDR Blocklist
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                  {/* IP Addresses */}
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-slate-400 font-bold block text-[11px]">
                      IP ADDRESSES ({analysis.iocs.ipAddresses?.length || 0}):
                    </span>
                    <div className="space-y-1">
                      {analysis.iocs.ipAddresses?.map((ip, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded text-cyan-300"
                        >
                          <span>{ip}</span>
                          <button
                            onClick={() => handleCopy(ip, `ip-${i}`)}
                            className="text-slate-500 hover:text-white"
                          >
                            {copiedKey === `ip-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Domains */}
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-slate-400 font-bold block text-[11px]">
                      DOMAINS / HOSTNAMES ({analysis.iocs.domains?.length || 0}):
                    </span>
                    <div className="space-y-1">
                      {analysis.iocs.domains?.map((dom, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded text-rose-300"
                        >
                          <span className="truncate mr-2">{dom}</span>
                          <button
                            onClick={() => handleCopy(dom, `dom-${i}`)}
                            className="text-slate-500 hover:text-white shrink-0"
                          >
                            {copiedKey === `dom-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* File Hashes */}
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-slate-400 font-bold block text-[11px]">
                      FILE HASHES ({analysis.iocs.fileHashes?.length || 0}):
                    </span>
                    <div className="space-y-1">
                      {analysis.iocs.fileHashes?.map((hash, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded text-emerald-300"
                        >
                          <span className="truncate mr-2 text-[10px]">{hash}</span>
                          <button
                            onClick={() => handleCopy(hash, `hash-${i}`)}
                            className="text-slate-500 hover:text-white shrink-0"
                          >
                            {copiedKey === `hash-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Containment & Forensic Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 space-y-2.5">
                  <h4 className="text-xs font-bold text-rose-400 font-mono uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    ขั้นตอนกักกันความเสียหายเร่งด่วน (IMMEDIATE CONTAINMENT):
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {analysis.containmentSteps?.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-400 border border-rose-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 space-y-2.5">
                  <h4 className="text-xs font-bold text-cyan-400 font-mono uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    แนวทางรวบรวมพยานหลักฐานเพิ่มเติม (NEXT FORENSIC STEPS):
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {analysis.forensicNextSteps?.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Generated YARA Rule */}
              {analysis.generatedYaraRule && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      กฎตรวจจับอัตโนมัติ (AUTO-GENERATED YARA RULE FOR SWEEPING)
                    </h4>
                    <button
                      onClick={() => handleCopy(analysis.generatedYaraRule, 'yara-rule')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
                    >
                      {copiedKey === 'yara-rule' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>คัดลอกกฎแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอก YARA Rule</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                    {analysis.generatedYaraRule}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-white font-mono">
                ยังไม่มีข้อมูลการวิเคราะห์ AI สำหรับสำนวนนี้
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                กดปุ่ม "รันการวิเคราะห์ใหม่ (AI Deep Scan)" เพื่อให้ Gemini 3.8 Flash สังเคราะห์พยานหลักฐานและสร้างรายงานความมั่นคงปลอดภัย
              </p>
              <button
                onClick={onTriggerAnalysis}
                className="mt-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono"
              >
                เริ่มการวิเคราะห์ทันที
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Interactive DFIR Copilot Chat */}
      {subTab === 'chat' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col h-[650px] shadow-xl">
          {/* Quick Prompt Chips */}
          <div className="mb-3 pb-3 border-b border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
              คำถามแนะนำสำหรับผู้ตรวจพิสูจน์ (FORENSIC QUICK QUERIES):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'วิเคราะห์คำสั่ง PowerShell -enc ที่พบในเคสนี้ว่าทำอะไร',
                'แนะนำคำสั่ง Volatility 3 ตรวจสอบ Process Injection',
                'อธิบายรหัส Event ID 4624 Logon Type 10 และระดับความเสี่ยง',
                'ช่วยร่างขั้นตอนกักกันระบบตาม NIST SP 800-86',
              ].map((query, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(query)}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[11px] text-cyan-300 hover:text-white transition-colors font-mono"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-3.5 text-xs leading-relaxed space-y-1.5 font-sans ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white font-medium ml-12'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap select-text">
                    {msg.content}
                  </div>
                  <div
                    className={`text-[10px] text-right font-mono ${
                      msg.role === 'user' ? 'text-cyan-200' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex gap-3 items-center text-xs text-cyan-400 font-mono">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <span>Copilot กำลังวิเคราะห์หลักฐานและร่างคำตอบ...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="พิมพ์คำถามหรือวางข้อความ Log ที่ต้องการให้วิเคราะห์ เช่น 'ช่วยถอดรหัสเพย์โหลดนี้'..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSending || !chatInput.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(6,182,212,0.3)] font-mono"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่ง</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
