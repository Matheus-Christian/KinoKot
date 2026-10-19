export interface StreamingOption {
  id: string;
  name: string;
  shortName: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  defaultUrl: string;
}

export const STREAMING_SERVICES: StreamingOption[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    shortName: 'Netflix',
    bgColor: 'bg-red-700/80',
    textColor: 'text-red-100',
    borderColor: 'border-red-500',
    defaultUrl: 'https://www.netflix.com'
  },
  {
    id: 'prime',
    name: 'Prime Video',
    shortName: 'Prime',
    bgColor: 'bg-sky-700/80',
    textColor: 'text-sky-100',
    borderColor: 'border-sky-400',
    defaultUrl: 'https://www.primevideo.com'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    shortName: 'YouTube',
    bgColor: 'bg-red-600/80',
    textColor: 'text-white',
    borderColor: 'border-red-400',
    defaultUrl: 'https://www.youtube.com'
  },
  {
    id: 'max',
    name: 'Max (HBO)',
    shortName: 'Max',
    bgColor: 'bg-indigo-700/80',
    textColor: 'text-indigo-100',
    borderColor: 'border-indigo-400',
    defaultUrl: 'https://www.max.com'
  },
  {
    id: 'disney',
    name: 'Disney+',
    shortName: 'Disney+',
    bgColor: 'bg-blue-800/80',
    textColor: 'text-blue-100',
    borderColor: 'border-blue-400',
    defaultUrl: 'https://www.disneyplus.com'
  },
  {
    id: 'mubi',
    name: 'MUBI',
    shortName: 'MUBI',
    bgColor: 'bg-amber-700/80',
    textColor: 'text-amber-100',
    borderColor: 'border-amber-400',
    defaultUrl: 'https://mubi.com'
  },
  {
    id: 'appletv',
    name: 'Apple TV+',
    shortName: 'Apple TV',
    bgColor: 'bg-slate-800/80',
    textColor: 'text-slate-100',
    borderColor: 'border-slate-400',
    defaultUrl: 'https://tv.apple.com'
  },
  {
    id: 'other',
    name: 'Outro / Web Link',
    shortName: 'Web',
    bgColor: 'bg-soviet-800/80',
    textColor: 'text-gold-300',
    borderColor: 'border-gold-500/60',
    defaultUrl: ''
  }
];

export function getStreamingService(id?: string): StreamingOption | undefined {
  if (!id) return undefined;
  return STREAMING_SERVICES.find(s => s.id === id);
}
