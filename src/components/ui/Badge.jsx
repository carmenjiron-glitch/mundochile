import { BADGE } from "../../design-system/tokens";

export default function Badge({ type }) {
  const t = BADGE[type] || { bg: '#F1F3F5', c: '#495057', b: '#ADB5BD' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 12px', borderRadius: '6px',
      fontSize: '12px', fontWeight: '600',
      color: t.c, background: t.bg,
      border: `1.5px solid ${t.b}`,
      whiteSpace: 'nowrap', lineHeight: 1.4,
    }}>
      {type}
    </span>
  );
}
