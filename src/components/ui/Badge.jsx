import { BADGE } from "../../design-system/tokens";

const BADGE_ICON = {
  'Simultánea':  '🎙️',
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
