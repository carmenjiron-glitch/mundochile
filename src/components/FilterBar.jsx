// FilterBar.jsx — MundoChile v3.0 — Una línea, todos dropdowns

export default function FilterBar({ filters, onChange, interpreters = [], clientes = [], pares = [], proveedores = [] }) {
  const hayFiltro = filters.estado || filters.modalidad || filters.tipo || filters.interprete_id || filters.cliente_id || filters.par_id || filters.proveedor_av;
  const limpiar = { estado:"", modalidad:"", tipo:"", interprete_id:"", cliente_id:"", par_id:"", proveedor_av:"" };

  const lbl = {
    fontSize: "11px",
    fontWeight: "500",
    color: "#FFFFFF",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    flexShrink: 0,
    border: "1px solid #E53E3E",
    borderRadius: "12px",
    padding: "2px 9px",
    background: "transparent",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  };

  const sel = {
    fontSize: "12px",
    padding: "3px 7px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.1)",
    color: "#FFFFFF",
    cursor: "pointer",
    height: "26px",
    outline: "none",
    fontFamily: "inherit",
    maxWidth: 130,
  };

  const grp = { display: "inline-flex", alignItems: "center", gap: "4px", flexShrink: 0 };

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:"8px", flexWrap:"nowrap", width:"100%", overflow:"hidden" }}>

      <div style={grp}>
        <span style={lbl}>Estado</span>
        <select value={filters.estado || ""} onChange={e => onChange({ ...filters, estado: e.target.value })} style={sel}>
          <option value="" style={{ color:"#000" }}>Todos</option>
          <option value="Facturación Pendiente" style={{ color:"#000" }}>Pendiente</option>
          <option value="Facturado" style={{ color:"#000" }}>Facturado</option>
          <option value="no_incluir" style={{ color:"#000" }}>Sin estado</option>
        </select>
      </div>

      <div style={grp}>
        <span style={lbl}>Modalidad</span>
        <select value={filters.modalidad || ""} onChange={e => onChange({ ...filters, modalidad: e.target.value })} style={sel}>
          <option value="" style={{ color:"#000" }}>Todas</option>
          <option value="presencial" style={{ color:"#000" }}>Presencial</option>
          <option value="remoto" style={{ color:"#000" }}>Remoto</option>
          <option value="hibrido" style={{ color:"#000" }}>Híbrido</option>
        </select>
      </div>

      <div style={grp}>
        <span style={lbl}>Tipo</span>
        <select value={filters.tipo || ""} onChange={e => onChange({ ...filters, tipo: e.target.value })} style={sel}>
          <option value="" style={{ color:"#000" }}>Todos</option>
          <option value="Simultánea" style={{ color:"#000" }}>Simultánea</option>
          <option value="Consecutiva" style={{ color:"#000" }}>Consecutiva</option>
          <option value="Whispering" style={{ color:"#000" }}>Whispering</option>
        </select>
      </div>

      {clientes.length > 0 && (
        <div style={grp}>
          <span style={lbl}>Cliente</span>
          <select value={filters.cliente_id || ""} onChange={e => onChange({ ...filters, cliente_id: e.target.value })} style={sel}>
            <option value="" style={{ color:"#000" }}>Todos</option>
            {clientes.map(c => <option key={c.id} value={c.id} style={{ color:"#000" }}>{c.nombre_empresa}</option>)}
          </select>
        </div>
      )}

      {pares.length > 0 && (
        <div style={grp}>
          <span style={lbl}>Idiomas</span>
          <select value={filters.par_id || ""} onChange={e => onChange({ ...filters, par_id: e.target.value })} style={sel}>
            <option value="" style={{ color:"#000" }}>Todos</option>
            {pares.map(p => <option key={p.id} value={p.id} style={{ color:"#000" }}>{p.descripcion}</option>)}
          </select>
        </div>
      )}

      <div style={grp}>
        <span style={lbl}>Intérprete</span>
        <select value={filters.interprete_id || ""} onChange={e => onChange({ ...filters, interprete_id: e.target.value })} style={sel}>
          <option value="" style={{ color:"#000" }}>Todos</option>
          {interpreters.filter(i => i.activo !== false).map(i => (
            <option key={i.id} value={i.id} style={{ color:"#000" }}>{i.nombre}{i.apellido ? " " + i.apellido : ""}</option>
          ))}
        </select>
      </div>

      {proveedores.length > 0 && (
        <div style={grp}>
          <span style={lbl}>Proveedor AV</span>
          <select value={filters.proveedor_av || ""} onChange={e => onChange({ ...filters, proveedor_av: e.target.value })} style={sel}>
            <option value="" style={{ color:"#000" }}>Todos</option>
            <option value="sin_proveedor" style={{ color:"#000" }}>Sin proveedor</option>
            {proveedores.map(p => <option key={p.id} value={p.id} style={{ color:"#000" }}>{p.nombre}</option>)}
          </select>
        </div>
      )}

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
          }}
        >×</button>
      )}

    </div>
  );
}
