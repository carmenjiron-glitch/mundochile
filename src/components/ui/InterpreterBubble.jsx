import { INTERP_LANG } from "../../design-system/tokens";

export default function InterpreterBubble({ name, language, isHost, languagePair }) {
  const t = INTERP_LANG[language] || INTERP_LANG.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '5px 12px', borderRadius: '20px',
      fontSize: '13px', fontWeight: '500',
      color: '#FFFFFF', background: t.bg,
      border: `2px solid ${isHost ? '#E03131' : t.border}`,
    }}>
      {isHost && <span style={{ fontSize: '12px' }}>🔑</span>}
      {t.flag
        ? <img src={`https://flagcdn.com/28x21/${t.flag}.png`} style={{ width: '20px', height: '15px', borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }} alt={language} />
        : <span style={{ fontSize: '14px' }}>🌐</span>
      }
      {name}
      {languagePair && <span style={{ opacity: 0.8 }}>· {languagePair}</span>}
    </span>
  );
}
