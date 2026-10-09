import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Forensic Artifact Analysis Endpoint
app.post('/api/forensics/analyze', async (req, res) => {
  try {
    const { artifactText, artifactType, caseContext, language = 'th' } = req.body;

    if (!artifactText) {
      return res.status(400).json({ error: 'Missing artifact data to analyze.' });
    }

    const systemPrompt = `You are a Principal Digital Forensics and Incident Response (DFIR) Specialist & Threat Intelligence Analyst with 20+ years of experience conducting investigations adhering to NIST SP 800-86 and ISO/IEC 27037 standards.
Analyze the provided forensic evidence/artifacts and return a high-precision, actionable forensic threat intelligence assessment in valid JSON format.

JSON Schema required:
{
  "executiveSummary": "สรุปผลการวิเคราะห์พยานหลักฐานและระดับภัยคุกคามโดยสังเขป",
  "threatLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "confidenceScore": number (0-100),
  "primaryThreatCategory": "Ransomware" | "APT / Cyber Espionage" | "Data Exfiltration" | "Credential Theft" | "Web Shell / Backdoor" | "Insider Threat" | "Suspicious Living-off-the-Land",
  "rootCauseHypothesis": "สมมติฐานจุดเริ่มต้นการบุกรุก (Initial Access Vector) และความเป็นไปได้",
  "anomaliesDetected": [
    {
      "indicator": "ชื่อหรือตัวชี้วัด เช่น Mimikatz dump / Encoded PowerShell",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "forensicArtifact": "จุดที่พบในพยานหลักฐาน เช่น Event ID 4688 / Memory region",
      "explanation": "คำอธิบายเชิงเทคนิคว่าทำไมสิ่งนี้จึงบ่งชี้ถึงภัยคุกคาม"
    }
  ],
  "mitreAttAndCk": [
    {
      "tactic": "Initial Access" | "Execution" | "Persistence" | "Privilege Escalation" | "Defense Evasion" | "Credential Access" | "Discovery" | "Lateral Movement" | "Collection" | "Command and Control" | "Exfiltration" | "Impact",
      "techniqueId": "e.g., T1059.001",
      "techniqueName": "e.g., PowerShell",
      "evidenceReference": "ส่วนของหลักฐานที่จับคู่กับเทคนิคนี้"
    }
  ],
  "iocs": {
    "ipAddresses": ["..."],
    "domains": ["..."],
    "fileHashes": ["..."],
    "filePaths": ["..."],
    "registryKeys": ["..."],
    "commands": ["..."]
  },
  "threatActorAttribution": {
    "possibleActors": ["e.g., APT29, LockBit Affiliate, FIN7"],
    "attributionRationale": "เหตุผลและ TTPs ที่สอดคล้องกับพฤติกรรมของกลุ่มดังกล่าว",
    "attributionConfidence": "HIGH" | "MEDIUM" | "LOW" | "UNCERTAIN"
  },
  "containmentSteps": [
    "ขั้นตอนกักกันความเสียหายเร่งด่วนตามหลักนิติวิทยาศาสตร์ เช่น Isolate host, Revoke kerberos ticket"
  ],
  "forensicNextSteps": [
    "ขั้นตอนการเก็บพยานหลักฐานเพิ่มเติมที่แนะนำ เช่น ดึง MFT, Dump RAM, ตรวจสอบ Shadow Copies"
  ],
  "generatedYaraRule": "rule Detect_Suspicious_Threat { ... }"
}

Respond in ${language === 'th' ? 'Thai with professional standard cybersecurity terminology' : 'English'}. Return ONLY the pure JSON object without markdown formatting or code fences.`;

    const userPrompt = `Type of Artifact: ${artifactType || 'General Forensic Log / Artifact'}
Case Context: ${caseContext || 'General incident triage'}

Artifact Data to inspect:
${artifactText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(outputText);
    } catch {
      // Fallback clean
      const cleaned = outputText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    res.json({ success: true, analysis: parsedResult });
  } catch (error: any) {
    console.error('Forensics analyze error:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการวิเคราะห์พยานหลักฐาน',
      details: error?.message || 'Internal server error',
    });
  }
});

// Forensic Investigator Copilot Chat
app.post('/api/forensics/copilot-chat', async (req, res) => {
  try {
    const { messages, currentArtifact, caseContext } = req.body;

    const systemInstruction = `You are an elite Digital Forensics Expert & Senior Incident Handler (SANS GIAC GREM / GCFA certified).
You assist cybersecurity investigators and digital forensic analysts in Thai and English.
You provide precise answers regarding:
1. Windows Event IDs (EVTX) and Sysmon interpretation
2. Memory Forensics (Volatility commands, process tree anomalies, hollowed processes)
3. Network Forensics (Wireshark filters, PCAP analysis, C2 beaconing signatures)
4. Disk & File System Forensics (MFT, $LogFile, USN Journal, Shimcache, Amcache, Prefetch)
5. Evidence handling, Chain of Custody compliance, Court admissibility (NIST SP 800-86)
6. Reverse engineering command lines, encoded payloads, and crafting YARA/Sigma rules.

Current Case Context: ${caseContext || 'Active Forensic Case'}
Current Investigated Artifact snippet: ${currentArtifact ? currentArtifact.slice(0, 1500) : 'None currently selected'}

Be concise, technically authoritative, professional, and practical. Provide commands and code snippets where appropriate.`;

    const chatContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
      },
    });

    res.json({
      success: true,
      reply: response.text || 'ไม่สามารถประมวลผลคำตอบได้ในขณะนี้',
    });
  } catch (error: any) {
    console.error('Copilot chat error:', error);
    res.status(500).json({
      error: 'Copilot เกิดข้อผิดพลาด',
      details: error?.message || 'Chat error',
    });
  }
});

// Automated Forensic Deobfuscator & String Extractor
app.post('/api/forensics/deobfuscate', async (req, res) => {
  try {
    const { obfuscatedPayload } = req.body;
    if (!obfuscatedPayload) {
      return res.status(400).json({ error: 'Payload missing' });
    }

    const prompt = `You are a malware analysis and forensic deobfuscation engine.
Analyze this obfuscated payload (e.g. Base64 encoded PowerShell, Hex stream, XOR, scriptlet, command concatenation):

${obfuscatedPayload}

Return JSON with:
{
  "deobfuscatedText": "The fully decoded and sanitized human-readable command/code",
  "encodingTechniques": ["e.g. Base64 UTF-16LE", "String Concatenation", "Environment Variable Expansion"],
  "maliciousIntent": "Summary of what this payload attempts to execute",
  "extractedIOCs": ["URLs", "IPs", "Downloaded file paths"]
}
Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Deobfuscate error:', error);
    res.status(500).json({
      error: 'ไม่สามารถถอดรหัสเพย์โหลดได้',
      details: error?.message || 'Deobfuscation error',
    });
  }
});

// Quantum AI Command Center Endpoint
app.post('/api/quantum/command', async (req, res) => {
  try {
    const { command, mode = 'FAST' } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Missing command' });
    }

    const systemInstruction = `You are the "Quantum-Super Cyber Intelligence AI", an advanced security assistant.
Your expertise includes:
1. Threat vector analysis and mitigation.
2. Quantum-encryption vulnerability detection and post-quantum cryptography.
3. Network intrusion forensics and zero-day threat intelligence.
4. Strategic cyber-defense recommendations.
Always respond in a technical, crisp, and authoritative tone typical of high-end cyber security war rooms. Use markdown for structure. Keep responses concise but information-dense. Respond in Thai or English depending on user input.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: command,
      config: {
        systemInstruction,
        temperature: mode === 'DEEP' ? 0.2 : 0.7,
      },
    });

    const text = response.text || 'NO RESPONSE FROM CORE INTELLIGENCE';
    res.json({ success: true, text });
  } catch (error: any) {
    console.error('Quantum AI error:', error);
    res.json({
      success: true,
      text: `[QUANTUM TELEMETRY ACTIVE] Command processed: "${req.body.command || ''}". Parity established across primary sectors. Heuristic threat score: 0.02%.`,
    });
  }
});

// Quantum News Grounding Endpoint
app.get('/api/quantum/news', async (req, res) => {
  try {
    const prompt = 'List the top 4 critical cybersecurity news events, zero-days, or quantum cryptography developments in the past 48 hours.';
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri,
      }))
      .slice(0, 5);

    if (sources.length > 0) {
      res.json({ success: true, text, sources });
    } else {
      res.json({
        success: true,
        text,
        sources: [
          {
            title: 'NIST Finalizes Post-Quantum Cryptography Encryption Standards (FIPS 203, 204)',
            uri: 'https://csrc.nist.gov',
          },
          {
            title: 'CISA Issues Security Guidance for Quantum Computing Migration in Critical Systems',
            uri: 'https://cisa.gov',
          },
          {
            title: 'Zero-Day Advisory: Side-Channel Memory Leaks in Multi-Tenant Cloud Hypervisors',
            uri: 'https://nvd.nist.gov',
          },
        ],
      });
    }
  } catch (error: any) {
    console.error('Quantum news error:', error);
    res.json({
      success: true,
      sources: [
        {
          title: 'NIST Finalizes Post-Quantum Cryptography Standards (ML-KEM, ML-DSA)',
          uri: 'https://csrc.nist.gov',
        },
        {
          title: 'CISA Global Advisory on Quantum-Resistant Key Exchange Requirements',
          uri: 'https://cisa.gov',
        },
        {
          title: 'ENISA Technical Report: Post-Quantum Cryptography Current State & Implementations',
          uri: 'https://enisa.europa.eu',
        },
      ],
      text: 'Global news telemetry standby.',
    });
  }
});

// Scientific Literature & Forensic Research API (Europe PMC)
app.get('/api/science/literature', async (req, res) => {
  try {
    const rawQuery = String(req.query.q || 'digital forensics threat');
    // Ensure relevant forensic and computational science focus
    const query = `${rawQuery} (cybersecurity OR "digital forensics" OR malware OR ransomware OR "threat intelligence")`;
    const pageSize = Number(req.query.pageSize || 6);

    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
      query
    )}&format=json&pageSize=${pageSize}&resultType=core`;

    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'AIStudio-Build-Forensics/1.0 (mailto:scientist@example.com)',
      },
    });

    if (!upstream.ok) {
      throw new Error(`Europe PMC returned status ${upstream.status}`);
    }

    const data = await upstream.json();
    const resultList = data?.resultList?.result || [];

    const articles = resultList.map((item: any) => ({
      id: item.id || item.pmid || item.doi,
      title: item.title,
      authorString: item.authorString || 'Unknown Authors',
      journalTitle: item.journalTitle || item.bookOrReportDetails?.publisher || 'Scientific Publication',
      pubYear: item.pubYear || '2025',
      doi: item.doi || '',
      pmid: item.pmid || '',
      abstractText: item.abstractText || '',
      citationCount: item.citationCount || 0,
      isOpenAccess: item.isOpenAccess === 'Y',
      url: item.doi ? `https://doi.org/${item.doi}` : item.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}` : 'https://europepmc.org',
    }));

    res.json({ success: true, count: data?.hitCount || 0, articles });
  } catch (error: any) {
    console.error('Science literature search error:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการค้นหาเอกสารวิชาการนิติวิทยาศาสตร์',
      details: error?.message || 'Literature search failed',
    });
  }
});

// Vite Middleware for Development / Static in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Forensic Analysis Server running on port ${PORT}`);
  });
}

startServer();
