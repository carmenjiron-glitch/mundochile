// FilterBar.jsx — MundoChile v3.0 — Dos filas compactas

const BADGE_COLORS = {
  "Facturación Pendiente": { bg:"#FFEB3B", c:"#B71C1C", b:"#F9A825" },
  "Facturado":             { bg:"#E3F2FD", c:"#1565C0", b:"#1565C0" },
  "presencial":            { bg:"#E8F5E9", c:"#2E7D32", b:"#2E7D32" },
  "remoto":                { bg:"#E0F7FA", c:"#00838F", b:"#00838F" },
  "hibrido":               { bg:"#FBE9E7", c:"#BF360C", b:"#BF360C" },
  "Simultánea":            { bg:"#EEF2FF", c:"#3B5BDB", b:"#3B5BDB" },
  "Consecutiva":           { bg:"#FCE4EC", c:"#C2185B", b:"#C2185B" },
  "Whispering":            { bg:"#F3E5F5", c:"#7B1FA2", b:"#7B1FA2" },
};

export default function FilterBar({ filters, onChange, interpreters = [], clientes = [], pares = [], proveedores = [] }) {
  const hayFiltro = filters.estado || filters.modalidad || filters.tipo || filters.interprete_id || filters.cliente_id || filters.par_id || filters.proveedor_av;

  const chipBase = {
    padding: "3px 8px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 500,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    lineHeight: 1.4,
    transition: "all 0.1s",
  };

  const inactive = {
    ...chipBase,
    background: "rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.70)",
    border: "1px solid rgba(255,255,255,0.20)",
  };

  const active = (v) => {
    const bd = BADGE_COLORS[v];
    if (!bd) return {
      ...chipBase,
      background: "rgba(255,255,255,0.30)",
      color: "#FFFFFF",
      border: "1.5px solid rgba(255,255,255,0.80)",
      fontWeight: 700,
    };
    return {
      ...chipBase,
      background: bd.bg,
      color: bd.c,
      border: `1.5px solid ${bd.b}`,
      fontWeight: 700,
    };
  };

  const labelStyle = {
    padding: "2px 6px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "inherit",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#E53E3E",
    background: "#FFFFFF",
    border: "1.5px solid #FC8181",
    whiteSpace: "nowrap",
    flexShrink: 0,
    lineHeight: 1.4,
  };

  const selStyle = {
    background: "rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: 20,
    padding: "3px 8px",
    fontSize: 11,
    height: 26,
    maxWidth: 130,
    cursor: "pointer",
    outline: "none",
    fontFamily: "inherit",
  };

  const sep = {
    borderLeft: "1px solid rgba(255,255,255,0.2)",
    height: 16,
    margin: "0 4px",
    flexShrink: 0,
    alignSelf: "center",
  };

  const row = { display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" };
  const grp = { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 };
  const limpiar = { estado:"", modalidad:"", tipo:"", interprete_id:"", cliente_id:"", par_id:"", proveedor_av:"" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>

      {/* FILA 1: ESTADO · MODALIDAD · TIPO */}
      <div style={row}>
        <div style={grp}>
          <span style={labelStyle}>Estado</span>
          {[["", "Todos"], ["Facturación Pendiente", "Pendiente"], ["Facturado", "Facturado"]].map(([v, l]) => (
            <button key={v} onClick={() => onChange({ ...filters, estado: v })} style={filters.estado === v ? active(v) : inactive}>{l}</button>
          ))}
        </div>
        <div style={sep}/>
        <div style={grp}>
          <span style={labelStyle}>Modalidad</span>
          {[["", "Todas"], ["presencial", "Presencial"], ["remoto", "Remoto"], ["hibrido", "Híbrido"]].map(([v, l]) => (
            <button key={v} onClick={() => onChange({ ...filters, modalidad: v })} style={filters.modalidad === v ? active(v) : inactive}>{l}</button>
          ))}
        </div>
        <div style={sep}/>
        <div style={grp}>
          <span style={labelStyle}>Tipo</span>
          {[["", "Todos"], ["Simultánea", "Simultánea"], ["Consecutiva", "Consecutiva"], ["Whispering", "Whispering"]].map(([v, l]) => (
            <button key={v} onClick={() => onChange({ ...filters, tipo: v })} style={filters.tipo === v ? active(v) : inactive}>{l}</button>
          ))}
        </div>
      </div>

      {/* FILA 2: CLIENTE · IDIOMAS · INTÉRPRETE · PROVEEDOR AV · LIMPIAR */}
      <div style={row}>
        {clientes.length > 0 && <>
          <div style={grp}>
            <span style={labelStyle}>Cliente</span>
            <select value={filters.cliente_id || ""} onChange={e => onChange({ ...filters, cliente_id: e.target.value })} style={selStyle}>
              <option value="" style={{ color: "#000" }}>Todos</option>
              {clientes.map(c => <option key={c.id} value={c.id} style={{ color: "#000" }}>{c.nombre_empresa}</option>)}
            </select>
          </div>
          <div style={sep}/>
        </>}

        {pares.length > 0 && <>
          <div style={grp}>
            <span style={labelStyle}>Idiomas</span>
            <select value={filters.par_id || ""} onChange={e => onChange({ ...filters, par_id: e.target.value })} style={selStyle}>
              <option value="" style={{ color: "#000" }}>Todos</option>
              {pares.map(p => <option key={p.id} value={p.id} style={{ color: "#000" }}>{p.descripcion}</option>)}
            </select>
          </div>
          <div style={sep}/>
        </>}

        <div style={grp}>
          <span style={labelStyle}>Intérprete</span>
          <select value={filters.interprete_id || ""} onChange={e => onChange({ ...filters, interprete_id: e.target.value })} style={selStyle}>
            <option value="" style={{ color: "#000" }}>Todos</option>
            {interpreters.filter(i => i.activo !== false).map(i => (
              <option key={i.id} value={i.id} style={{ color: "#000" }}>{i.nombre}{i.apellido ? " " + i.apellido : ""}</option>
            ))}
          </select>
        </div>

        {proveedores.length > 0 && <>
          <div style={sep}/>
          <div style={grp}>
            <span style={labelStyle}>Proveedor AV</span>
            <select value={filters.proveedor_av || ""} onChange={e => onChange({ ...filters, proveedor_av: e.target.value })} style={selStyle}>
              <option value="" style={{ color: "#000" }}>Todos</option>
              <option value="sin_proveedor" style={{ color: "#000" }}>Sin proveedor</option>
              {proveedores.map(p => <option key={p.id} value={p.id} style={{ color: "#000" }}>{p.nombre}</option>)}
            </select>
          </div>
        </>}

        {hayFiltro && (
          <button
            onClick={() => onChange(limpiar)}
            title="Limpiar filtros"
            style={{
              background: "#EF4444",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "50%",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              padding: 0,
              lineHeight: 1,
              marginLeft: 4,
            }}
          >×</button>
        )}
      </div>

    </div>
  );
}
