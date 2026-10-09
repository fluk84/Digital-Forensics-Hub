import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

export const VoiceLink: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('OFFLINE');
  const [isMuted, setIsMuted] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Speak tactical system message using SpeechSynthesis
  const speakVoice = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.9;
      utterance.rate = 1.05;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  };

  const startSession = () => {
    setIsActive(true);
    setStatus('ENCRYPTED_LINK_ACTIVE');
    setTranscription('Neural voice link established. Awaiting tactical directive...');
    speakVoice('Neural link active. Post quantum encryption verified.');

    // Attempt Web Speech API recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          if (text) {
            setTranscription(`Tactical Input: "${text}"`);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e);
          fallbackSimulation();
        };

        recognition.start();
        recognitionRef.current = recognition;
        return;
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }

    fallbackSimulation();
  };

  const fallbackSimulation = () => {
    const samplePhrases = [
      'Telemetry Report: Sector 7G coherence at 99.98%. All relays stable.',
      'Cryptographic Parity: Bell-state entanglement intact across nodes.',
      'Heuristic Scan: Zero intrusion signatures found in current sector.',
      'Orbital Uplink: Alpha Tango 9 tracking 12 satellite intercepts.',
      'Quantum Kernel: Protocol 77 posture nominal. Ready for command.',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (!isActive) {
        clearInterval(interval);
        return;
      }
      const msg = samplePhrases[idx % samplePhrases.length];
      setTranscription(msg);
      idx++;
    }, 6000);
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('OFFLINE');
    setTranscription('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="bg-slate-950/60 border border-indigo-500/30 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group h-32 backdrop-blur-md shadow-lg">
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              isActive ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'
            }`}
          />
          <span className="text-[10px] font-orbitron font-bold text-indigo-300 uppercase tracking-widest">
            Neural_Voice_Link
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'เปิดเสียงสังเคราะห์ (Unmute Audio)' : 'ปิดเสียงสังเคราะห์ (Mute Audio)'}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
          </button>
          <span className="text-[8px] font-mono text-slate-500">{status}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-4 z-10">
        <button
          onClick={isActive ? stopSession : startSession}
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            isActive
              ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:bg-rose-500/20'
              : 'border-indigo-500 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:scale-105'
          }`}
          title={isActive ? 'ตัดการเชื่อมต่อสัญญาณเสียง (Disconnect)' : 'เริ่มสัญญาณเสียงนิวรอน (Initialize Voice Link)'}
        >
          {isActive ? (
            <MicOff className="w-5 h-5 text-rose-400" />
          ) : (
            <Mic className="w-5 h-5 text-indigo-300" />
          )}
        </button>

        <div className="flex-1 h-full flex flex-col justify-center gap-1.5 overflow-hidden">
          {/* Dynamic Audio Visualizer Bars */}
          <div className="h-4 flex items-end gap-1">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-t-sm transition-all duration-75 ${
                  isActive ? 'bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.5)]' : 'bg-slate-800'
                }`}
                style={{
                  height: isActive ? `${25 + Math.random() * 75}%` : '4px',
                }}
              />
            ))}
          </div>
          <p className="text-[9px] font-mono text-indigo-300/80 truncate italic">
            {transcription || 'Click microphone to initialize neural voice stream...'}
          </p>
        </div>
      </div>

      {/* Background visualizer aesthetic */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_50%_50%,#818cf8,transparent)]" />
    </div>
  );
};
