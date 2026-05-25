import { tokens } from "../../design-system/tokens";

export default function Badge({ type }) {
  const t = tokens.badge[type] || { bg: '#F1F3F5', text: '#495057', border: '#ADB5BD' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      color: t.text,
      background: t.bg,
      border: `1.5px solid ${t.border}`,
      whiteSpace: 'nowrap',
      lineHeight: 1.4,
    }}>
      {type}
    </span>
  );
}
