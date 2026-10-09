export async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getSeverityBadgeClass(severity: string): { bg: string; text: string; border: string; glow: string } {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-950/70',
        text: 'text-rose-400',
        border: 'border-rose-500/60',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
      };
    case 'HIGH':
      return {
        bg: 'bg-amber-950/70',
        text: 'text-amber-400',
        border: 'border-amber-500/60',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-yellow-950/60',
        text: 'text-yellow-400',
        border: 'border-yellow-500/50',
        glow: 'shadow-[0_0_8px_rgba(234,179,8,0.2)]',
      };
    case 'LOW':
      return {
        bg: 'bg-emerald-950/60',
        text: 'text-emerald-400',
        border: 'border-emerald-500/50',
        glow: 'shadow-[0_0_8px_rgba(16,185,129,0.2)]',
      };
    default:
      return {
        bg: 'bg-slate-900/80',
        text: 'text-slate-400',
        border: 'border-slate-700',
        glow: '',
      };
  }
}
