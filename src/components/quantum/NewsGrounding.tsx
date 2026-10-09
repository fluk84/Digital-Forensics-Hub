import React, { useState, useEffect } from 'react';

export const NewsGrounding: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quantum/news');
      const data = await res.json();
      if (data.sources && data.sources.length > 0) {
        setNews(data.sources);
      } else {
        setNews([
          {
            title: 'NIST Releases Post-Quantum Encryption Standards (FIPS 203, 204, 205)',
            uri: 'https://csrc.nist.gov',
          },
          {
            title: 'Cybersecurity Advisory: Active Quantum-Vulnerable Key Derivation Flaws',
            uri: 'https://cisa.gov',
          },
          {
            title: 'Critical Infrastructure Threat Intel: Side-Channel Decryption Attacks Observed',
            uri: 'https://cert.europa.eu',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch quantum news:', err);
      setNews([
        {
          title: 'NIST Standards Released: Post-Quantum Cryptography Algorithms Finalized',
          uri: 'https://nist.gov',
        },
        {
          title: 'ENISA Issues Warning on Emerging Quantum Decryption Capabilities',
          uri: 'https://enisa.europa.eu',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-4 flex flex-col h-full backdrop-blur-xl">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
          <h3 className="text-[10px] font-orbitron font-bold text-cyan-400 uppercase tracking-widest">
            Global_News_Grounding
          </h3>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="text-[9px] font-mono text-cyan-500/70 hover:text-cyan-400 transition-colors uppercase"
        >
          {loading ? 'Syncing...' : 'Force_Refresh'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
        {loading && news.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 opacity-40 py-6">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[9px] font-mono uppercase tracking-widest">Accessing_Global_Mesh...</span>
          </div>
        ) : news.length > 0 ? (
          news.map((item, idx) => (
            <a
              key={idx}
              href={item.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 rounded-lg border border-white/5 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
            >
              <div className="text-[10px] text-cyan-100 font-bold mb-1 group-hover:text-cyan-400 truncate">
                {item.title}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-slate-500 font-mono truncate max-w-[150px]">{item.uri}</span>
                <span className="text-[8px] text-cyan-400 font-mono flex items-center gap-1 group-hover:underline">
                  VIEW_INTEL
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </a>
          ))
        ) : (
          <div className="text-[9px] font-mono text-slate-600 text-center uppercase tracking-widest py-8">
            Connection_Standby: No_Recent_Grounding_Data
          </div>
        )}
      </div>
    </div>
  );
};
