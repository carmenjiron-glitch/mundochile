export default function MultiDayPill({ currentDay, totalDays }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '700',
      color: '#1971C2', background: '#E8F4FD', border: '1px solid #1971C2',
    }}>
      📅 Multidía · Día {currentDay} de {totalDays}
    </span>
  );
}
