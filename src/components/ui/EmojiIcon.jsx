export default function EmojiIcon({ emoji, bg, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
      fontSize: Math.round(size * 0.55),
      lineHeight: 1,
    }}>
      {emoji}
    </div>
  );
}
