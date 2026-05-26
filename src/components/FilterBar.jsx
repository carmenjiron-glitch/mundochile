// FilterBar.jsx — MundoChile v3.0 — Diseño Trello
// Una sola línea, proporcional, grupos bien separados

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

export default function FilterBar({ filters, onChange, interpreters = [] }) {
  const hayFiltro = filters.estado || filters.modalidad || filters.tipo || filters.interprete_id;

  // Estilos base reutilizables
  const chipBase = {
    padding: "4px 12px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 12,
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

  // Label de grupo: pill blanco con texto rojo
  const labelStyle = {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
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

  const group = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      width: "100%",
      overflowX: "auto",
      padding: "2px 0",
    }}>
      {/* ESTADO */}
      <div style={group}>
        <span style={labelStyle}>Estado</span>
        {[["", "Todos"], ["Facturación Pendiente", "Pendiente"], ["Facturado", "Facturado"]].map(([v, l]) => (
          <button key={v}
            onClick={() => onChange({ ...filters, estado: v })}
            style={filters.estado === v ? active(v) : inactive}>
            {l}
          </button>
        ))}
      </div>

      {/* MODALIDAD */}
      <div style={group}>
        <span style={labelStyle}>Modalidad</span>
        {[["", "Todas"], ["presencial", "Presencial"], ["remoto", "Remoto"], ["hibrido", "Híbrido"]].map(([v, l]) => (
          <button key={v}
            onClick={() => onChange({ ...filters, modalidad: v })}
            style={filters.modalidad === v ? active(v) : inactive}>
            {l}
          </button>
        ))}
      </div>

      {/* TIPO */}
      <div style={group}>
        <span style={labelStyle}>Tipo</span>
        {[["", "Todos"], ["Simultánea", "Simultánea"], ["Consecutiva", "Consecutiva"], ["Whispering", "Whispering"]].map(([v, l]) => (
          <button key={v}
            onClick={() => onChange({ ...filters, tipo: v })}
            style={filters.tipo === v ? active(v) : inactive}>
            {l}
          </button>
        ))}
      </div>

      {/* INTÉRPRETE */}
      <div style={group}>
        <span style={labelStyle}>Intérprete</span>
        <select
          value={filters.interprete_id || ""}
          onChange={e => onChange({ ...filters, interprete_id: e.target.value })}
          style={{
            background: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 20,
            padding: "4px 10px",
            fontSize: 12,
            maxWidth: 130,
            cursor: "pointer",
            outline: "none",
            fontFamily: "inherit",
          }}
        >
          <option value="" style={{ color: "#000" }}>Todos</option>
          {interpreters.filter(i => i.activo !== false).map(i => (
            <option key={i.id} value={i.id} style={{ color: "#000" }}>
              {i.nombre}{i.apellido ? " " + i.apellido : ""}
            </option>
          ))}
        </select>
      </div>

      {/* LIMPIAR */}
      {hayFiltro && (
        <button
          onClick={() => onChange({ estado: "", modalidad: "", tipo: "", interprete_id: "" })}
          title="Limpiar filtros"
          style={{
            background: "#EF4444",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
            padding: 0,
            lineHeight: 1,
          }}
        >×</button>
      )}
    </div>
  );
}
