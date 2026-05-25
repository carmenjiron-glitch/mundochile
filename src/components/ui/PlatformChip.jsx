export default function PlatformChip({ platform, isMundoChile, extra }) {
  if (isMundoChile) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '8px',
      fontSize: '13px', fontWeight: '700',
      color: '#92400E', background: '#FFF3CD', border: '2px solid #F59E0B',
    }}>
      💻 {platform}{extra ? ` · ${extra}` : ''}
    </span>
  );
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '8px',
      fontSize: '13px', fontWeight: '600',
      color: '#1971C2', background: '#E8F4FD', border: '1.5px solid #74C0FC',
    }}>
      💻 {platform}
    </span>
  );
}
