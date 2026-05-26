import { BADGE } from "../../design-system/tokens";

const IconMicSm = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const BADGE_ICON = {
  'Simultánea':  <IconMicSm/>,
  'Consecutiva': <IconMicSm/>,
  'Whispering':  '🤫',
  'Presencial':  '📍',
  'Remoto':      '🖥️',
  'Híbrido':     '🔀',
};

export default function Badge({ type }) {
  const t = BADGE[type] || { bg: '#F1F3F5', c: '#495057', b: '#ADB5BD' };
  const icon = BADGE_ICON[type];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 12px', borderRadius: '6px',
      fontSize: '12px', fontWeight: '600',
      color: t.c, background: t.bg,
      border: `1.5px solid ${t.b}`,
      whiteSpace: 'nowrap', lineHeight: 1.4,
    }}>
      {icon}{type}
    </span>
  );
}
