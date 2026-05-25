const chipBase = {
  padding: '5px 14px', borderRadius: '20px', cursor: 'pointer',
  fontSize: '13px', fontWeight: '500', border: 'none', fontFamily: 'inherit',
};
const chipInactive = {
  ...chipBase,
  background: 'rgba(255,255,255,0.15)', color: '#FFFFFF',
  border: '1px solid rgba(255,255,255,0.25)',
};
const chipActive = () => ({
  ...chipBase,
  background: '#FFFBEB', color: '#92400E', border: '2px solid #EF4444', fontWeight: '700',
});

const ESTADO_OPTS = [
  ['', 'Todos', null, null],
  ['Pendiente de Facturación', 'Facturación Pendiente', '#FFF9DB', '#E67700'],
  ['Facturado', 'Facturado', '#E7F5FF', '#1971C2'],
];
const MODAL_OPTS = [
  ['', 'Todas', null, null],
  ['remoto', 'Remoto', '#E6FCF5', '#0CA678'],
  ['presencial', 'Presencial', '#FFF0F6', '#C2255C'],
  ['hibrido', 'Híbrido', '#FFF4E6', '#E67700'],
];
const TIPO_OPTS = [
  ['', 'Todos', null, null],
  ['Simultánea', 'Simultánea', '#EEF2FF', '#3B5BDB'],
  ['Consecutiva', 'Consecutiva', '#F0FFF4', '#2F9E44'],
  ['Whispering', 'Whispering', '#F5F3FF', '#9C36B5'],
];

const SEP = () => (
  <span style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 2px', flexShrink: 0 }} />
);

export default function FilterBar({ filters, onChange, interpreters }) {
  const set = (k, v) => onChange(f => ({ ...f, [k]: v }));

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px 16px',
      background: 'rgba(0,0,0,0.18)', borderRadius: '10px', marginBottom: '16px',
      alignItems: 'center',
    }}>
      <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado</span>
      {ESTADO_OPTS.map(([val, label, bg, text]) => (
        <button key={val} onClick={() => set('estado', val)}
          style={filters.estado === val && bg ? chipActive() : chipInactive}>
          {label}
        </button>
      ))}
      <SEP />
      <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Modalidad</span>
      {MODAL_OPTS.map(([val, label, bg, text]) => (
        <button key={val} onClick={() => set('modalidad', val)}
          style={filters.modalidad === val && (val === '' || bg) ? (bg ? chipActive() : chipInactive) : chipInactive}>
          {label}
        </button>
      ))}
      <SEP />
      <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tipo</span>
      {TIPO_OPTS.map(([val, label, bg, text]) => (
        <button key={val} onClick={() => set('tipo', val)}
          style={filters.tipo === val && (val === '' || bg) ? (bg ? chipActive() : chipInactive) : chipInactive}>
          {label}
        </button>
      ))}
      <SEP />
      <select
        value={filters.interprete_id || ''}
        onChange={e => set('interprete_id', e.target.value)}
        style={{ background: '#FFFFFF', color: '#0F172A', borderRadius: '8px', padding: '5px 10px', fontSize: '13px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <option value="">Todos los intérpretes</option>
        {(interpreters || []).filter(i => i.activo !== false).map(i => (
          <option key={i.id} value={i.id}>{i.nombre}{i.apellido ? " " + i.apellido : ""}</option>
        ))}
      </select>
      {Object.values(filters).some(Boolean) && (
        <button onClick={() => onChange({ estado: '', modalidad: '', tipo: '', interprete_id: '' })}
          style={{ ...chipInactive, color: '#FCA5A5', borderColor: 'rgba(239,68,68,0.4)' }}>
          ✕ Limpiar
        </button>
      )}
    </div>
  );
}
