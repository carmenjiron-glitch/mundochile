import { BADGE } from "../../design-system/tokens";

const IconoSimultanea = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const BADGE_ICON = {
  'Simultánea':  <IconoSimultanea/>,
  'Consecutiva': '🎤',
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
