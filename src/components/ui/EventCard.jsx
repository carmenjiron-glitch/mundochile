// EventCard.jsx — MundoChile v3.0 — Diseño Trello
import { colorCliente, INTERP_LANG } from "../../design-system/tokens";
import PlatformChip from "./PlatformChip";

// ── Helpers ──────────────────────────────────────────────────────────────────
const desdeISO = s => { const [y,m,d] = s.split("-"); return new Date(+y,+m-1,+d); };
const LBL_MODAL = { remoto:"Remoto", presencial:"Presencial", hibrido:"Híbrido" };

const nombreCorto = (nombre, apellido) => {
  if (!apellido) return nombre;
  const full = `${nombre} ${apellido}`;
  return full.length <= 14 ? full : `${nombre} ${apellido.charAt(0)}.`;
};

// ── Íconos SVG nítidos ────────────────────────────────────────────────────────
const IconoSimultanea = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const IconAV = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

// ── Bandera ───────────────────────────────────────────────────────────────────
const Flag = ({ idioma }) => {
  const t = INTERP_LANG[idioma] || INTERP_LANG.default;
  if (!t.flag) return <span style={{ fontSize: 15 }}>🌐</span>;
  return (
    <img
      src={`https://flagcdn.com/28x21/${t.flag}.png`}
      style={{ width: 20, height: 15, objectFit: "cover", borderRadius: 2, flexShrink: 0 }}
      alt={idioma}
    />
  );
};

// ── Color pills intérpretes ───────────────────────────────────────────────────
const IDIOMA_PILL_CLR = {"Inglés":"#4A90D9","Francés":"#002395","Portugués":"#009C3B","Español":"#AA151B","Alemán":"#555555","Italiano":"#009246","Chino":"#DE2910","Japonés":"#BC002D"};

// ── Badge rectangular estilo Trello ──────────────────────────────────────────
const BADGE = {
  "Simultánea":            { bg:"#EEF2FF", c:"#3B5BDB", b:"#3B5BDB" },
  "Consecutiva":           { bg:"#FCE4EC", c:"#C2185B", b:"#C2185B" },
  "Whispering":            { bg:"#F3E5F5", c:"#7B1FA2", b:"#7B1FA2" },
  "Presencial":            { bg:"#E8F5E9", c:"#2E7D32", b:"#2E7D32" },
  "Remoto":                { bg:"#E0F7FA", c:"#00838F", b:"#00838F" },
  "Híbrido":               { bg:"#FBE9E7", c:"#BF360C", b:"#BF360C" },
  "Facturado":             { bg:"#E3F2FD", c:"#1565C0", b:"#1565C0" },
  "Facturación Pendiente": { bg:"#FFEB3B", c:"#B71C1C", b:"#F9A825" },
};

const Chip = ({ label, emoji }) => {
  const s = BADGE[label] || { bg:"#F1F5F9", c:"#475569", b:"#CBD5E1" };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"4px 10px", borderRadius:20,
      fontSize:12, fontWeight:700,
      color:s.c, background:s.bg, border:`1.5px solid ${s.b}`,
      whiteSpace:"nowrap", lineHeight:1.4,
    }}>
      {emoji}{label}
    </span>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function EventCard({ ev, diaDe, clientes, interpretes, pares, proveedores=[], onClick, onNavegar }) {
  const cliente    = clientes.find(c => c.id === ev.cliente_id);
  const borderColor = colorCliente(ev.cliente_id);
  const esPresencial = ev.modalidad === "presencial" || ev.modalidad === "hibrido";
  const esZoomMC   = ev.plataforma === "Zoom MundoChile" || ev.plataforma === "Zoom";
  const modalLabel = LBL_MODAL[ev.modalidad] || ev.modalidad;
  const estadoLabel = ev.estado === "Facturado" ? "Facturado" : "Facturación Pendiente";

  // Multidía
  let diaXdeY = null;
  if (diaDe && ev.fecha_inicio !== ev.fecha_termino) {
    const ini = desdeISO(ev.fecha_inicio);
    const col = desdeISO(diaDe);
    diaXdeY = {
      x: Math.round((col - ini) / 86400000) + 1,
      y: Math.round((desdeISO(ev.fecha_termino) - ini) / 86400000) + 1,
    };
  }

  // Equipos AV
  const todosEquipos = (ev.evento_dias || []).flatMap(d => d.equipos_dia || []);
  const tieneEquipos = todosEquipos.length > 0;
  const provNombre   = tieneEquipos
    ? (todosEquipos[0].proveedor_nombre || proveedores.find(p => p.id === todosEquipos[0].proveedor_id)?.nombre || "")
    : "";

  // Agrupar intérpretes por par de idiomas
  const grupos = {};
  (ev.asignaciones || []).forEach(a => {
    const par   = pares.find(p => p.id === a.par_id);
    const interp = interpretes.find(x => x.id === a.interprete_id);
    if (!interp) return;
    const key   = par?.descripcion || "Sin par";
    const idioma = par?.idioma_origen || "";
    if (!grupos[key]) grupos[key] = { idioma, items: [] };
    grupos[key].items.push({
      nombre: interp.nombre,
      apellido: interp.apellido,
      isHost: !!a.es_host_zoom,
      hora: a.hora_presentacion || null,
    });
  });

  const handleIrDiaSiguiente = (e) => {
    e.stopPropagation();
    if (!onNavegar || !diaXdeY) return;
    const ini = desdeISO(ev.fecha_inicio);
    const sig = new Date(ini.getTime() + diaXdeY.x * 86400000);
    const iso = `${sig.getFullYear()}-${String(sig.getMonth()+1).padStart(2,"0")}-${String(sig.getDate()).padStart(2,"0")}`;
    onNavegar(iso);
  };

  return (
    <div
      onClick={onClick}
      style={{
        background:     "#FFFFFF",
        borderLeft:     `16px solid ${borderColor}`,
        borderTop:      `6px solid ${borderColor}`,
        borderRadius:   "0 8px 8px 0",
        padding:        "14px 16px",
        marginBottom:   "10px",
        boxShadow:      "0 1px 4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        cursor:         "pointer",
        width:          "100%",
        boxSizing:      "border-box",
        transition:     "box-shadow 0.15s, transform 0.12s",
        userSelect:     "none",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow  = "0 4px 16px rgba(0,0,0,0.18)";
        e.currentTarget.style.transform  = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow  = "0 1px 4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform  = "translateY(0)";
      }}
    >
      {/* Nombre cliente + pill multidía */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:4 }}>
        <div style={{ fontSize:29, fontWeight:600, color:"#0F172A", lineHeight:1.2, letterSpacing:"-0.01em", flex:1 }}>
          {cliente?.nombre_empresa || "—"}
        </div>
        {diaXdeY && (() => {
          const esUltimo = diaXdeY.x === diaXdeY.y;
          return (
            <div
              onClick={esUltimo ? undefined : handleIrDiaSiguiente}
              title={esUltimo ? "Último día del evento" : "Ver día siguiente →"}
              style={{
                display:"inline-flex", alignItems:"center", gap:4,
                padding:"3px 8px", borderRadius:20,
                background:"#E8F4FD", color:"#1971C2",
                fontSize:12, fontWeight:700, lineHeight:1.4,
                cursor: esUltimo ? "default" : "pointer",
                border:"1px solid #BAD7F0",
                whiteSpace:"nowrap", flexShrink:0,
                userSelect:"none",
              }}
            >
              📅 Día {diaXdeY.x} de {diaXdeY.y}{!esUltimo && " ›"}
            </div>
          );
        })()}
      </div>

      {/* Nombre evento */}
      {ev.nombre_evento && (
        <div style={{ fontSize:12, fontWeight:500, color:"#374151", marginTop:2 }}>
          {ev.nombre_evento}
        </div>
      )}

      {/* Contacto */}
      {cliente?.nombre_contacto && (
        <div style={{ fontSize:19, color:"#6B7280", fontStyle:"italic", marginTop:2 }}>
          Contacto: {cliente.nombre_contacto}
        </div>
      )}

      {/* Horario */}
      <div style={{
        fontSize:14, fontWeight:600, color:"#0F172A",
        marginTop:10, marginBottom:8,
        display:"flex", alignItems:"center", gap:6,
      }}>
        🕐 {ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)} hrs
      </div>

      {/* Badges tipo + modalidad */}
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
        <Chip label={ev.tipo} emoji={ev.tipo==="Simultánea"?<IconoSimultanea/>:ev.tipo==="Consecutiva"?"🎤 ":"🤫 "} />
        <Chip label={modalLabel} emoji={ev.modalidad==="presencial"?"📍 ":ev.modalidad==="hibrido"?"🔀 ":"💻 "} />
      </div>

      {/* Plataforma / Lugar */}
      {!esPresencial && ev.plataforma && (
        <div style={{ marginTop:6 }}>
          <PlatformChip
            platform={ev.plataforma === "Zoom" ? "Zoom MundoChile" : ev.plataforma}
            isMundoChile={esZoomMC}
            extra={esZoomMC ? ev.zoom_administrador : ""}
          />
        </div>
      )}
      {esPresencial && ev.lugar && (
        <div style={{ fontSize:12, color:"#475569", marginTop:6 }}>📍 {ev.lugar}</div>
      )}

      {/* Estado */}
      <div style={{ marginTop:6 }}>
        <Chip label={estadoLabel} emoji={estadoLabel==="Facturado"?"✓ ":"🟠 "} />
      </div>

      {/* Intérpretes agrupados */}
      {Object.entries(grupos).map(([key, grupo]) => {
        const pillClr = IDIOMA_PILL_CLR[grupo.idioma] || "#4C6EF5";
        const bg      = "#FFFFFF";
        const color   = pillClr;
        const border  = `3px solid ${pillClr}`;
        const titleC  = pillClr;
        const hp      = grupo.items.find(i => i.hora)?.hora;

        return (
          <div key={key} style={{ marginTop:10 }}>
            {/* Título del par */}
            <div style={{
              fontSize:11, fontWeight:600, color:titleC,
              textTransform:"uppercase", letterSpacing:"0.07em",
              marginBottom:5, opacity:0.85,
            }}>
              {key}
            </div>

            {/* Pills intérpretes — 2 columnas */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
              {grupo.items.map((interp, i) => (
                <span
                  key={i}
                  title={`${interp.nombre}${interp.apellido ? " " + interp.apellido : ""}`}
                  style={{
                    display:"inline-flex", alignItems:"center", justifyContent:"center",
                    gap:5, padding:"4px 10px", borderRadius:20,
                    fontSize:15, fontWeight:700, lineHeight:1.4,
                    color, background:bg, border,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                    cursor:"default",
                  }}
                >
                  {interp.isHost && <span style={{ fontSize:11 }}>🔑</span>}
                  <Flag idioma={grupo.idioma} />
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", color }}>
                    {nombreCorto(interp.nombre, interp.apellido)}
                  </span>
                </span>
              ))}
            </div>

            {/* Hora de presentación */}
            {hp && (
              <div style={{
                fontSize:11, color:"#64748B", marginTop:4,
                display:"inline-flex", alignItems:"center", gap:4,
              }}>
                🕐 Presentación: {hp.slice(0,5)} hrs
              </div>
            )}
          </div>
        );
      })}

      {/* Equipos AV */}
      {tieneEquipos && (
        <div style={{
          fontSize:11, color:"#6B7280", marginTop:8,
          display:"flex", alignItems:"center", gap:5,
        }}>
          <IconAV size={13} /> {provNombre || "Equipos AV"}
        </div>
      )}
    </div>
  );
}
