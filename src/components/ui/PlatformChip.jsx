export default function PlatformChip({ platform, isMundoChile, extra, agendaScale=false }) {
  if (isMundoChile) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: agendaScale ? '5px 16px' : '4px 12px', borderRadius: '6px',
      fontSize: agendaScale ? '16px' : '12px', fontWeight: '700',
      color: '#92400E', background: '#FFF3CD', border: '2px solid #F59E0B',
    }}>
      💻 {platform}{extra ? ` · ${extra}` : ''}
    </span>
  );
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: agendaScale ? '5px 13px' : '4px 10px', borderRadius: '8px',
      fontSize: agendaScale ? '17px' : '13px', fontWeight: '600',
      color: '#1971C2', background: '#E8F4FD', border: '1.5px solid #74C0FC',
    }}>
      💻 {platform}
    </span>
  );
}
