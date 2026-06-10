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
const IconoSimultanea = ({ size=12.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const IconoPresencial = ({ size=12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <path d="M9 22V12h6v10"/>
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

const IconHeadphones = ({ size=13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);
const IconMicOutline = ({ size=13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const IconChatBubble = ({ size=13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconArrowsExchange = ({ size=13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <path d="M7 23l-4-4 4-4"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

// ── Bandera ───────────────────────────────────────────────────────────────────
const Flag = ({ idioma, size = 20 }) => {
  const h = Math.round(size * 0.75);
  const t = INTERP_LANG[idioma] || INTERP_LANG.default;
  if (!t.flag) return <span style={{ fontSize: h }}>🌐</span>;
  return (
    <img
      src={`https://flagcdn.com/28x21/${t.flag}.png`}
      style={{ width: size, height: h, objectFit: "cover", borderRadius: 2, flexShrink: 0 }}
      alt={idioma}
    />
  );
};

// ── Color pills intérpretes ───────────────────────────────────────────────────
const IDIOMA_PILL_CLR = {"Inglés":"#4A90D9","Francés":"#002395","Portugués":"#009C3B","Español":"#AA151B","Alemán":"#555555","Italiano":"#009246","Chino":"#DE2910","Japonés":"#BC002D"};
const darken = (hex, f) => { const n = hex.replace("#",""); const r=Math.round(parseInt(n.slice(0,2),16)*f); const g=Math.round(parseInt(n.slice(2,4),16)*f); const b=Math.round(parseInt(n.slice(4,6),16)*f); return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`; };

// ── Badge rectangular estilo Trello ──────────────────────────────────────────
const BADGE = {
  "Simultánea":            { bg:"#1D4ED8", c:"#FFFFFF", b:"#1D4ED8" },
  "Consecutiva":           { bg:"#9B1349", c:"#FFFFFF", b:"#9B1349" },
  "Whispering":            { bg:"#6D28D9", c:"#FFFFFF", b:"#6D28D9" },
  "Presencial":            { bg:"#00AF57", c:"#FFFFFF", b:"#00AF57" },
  "Remoto":                { bg:"#0E7490", c:"#FFFFFF", b:"#0E7490" },
  "Híbrido":               { bg:"#D97706", c:"#FFFFFF", b:"#D97706" },
  "Facturado":             { bg:"#FFF7ED", c:"#181818", b:"#FB923C", bw:"2px", fw:400 },
  "Facturación Pendiente": { bg:"#FFFFFF", c:"#1A1A1A", b:"#E57373", bw:"2px", fw:400 },
};

const Chip = ({ label, emoji, fontSize=12, padding="4px 10px", dark=false, fw:fwOverride }) => {
  const s0 = BADGE[label] || { bg:"#F1F5F9", c:"#475569", b:"#CBD5E1" };
  const s = dark ? { ...s0, bg:darken(s0.bg,0.9), c:darken(s0.c,0.9), b:darken(s0.b,0.9) } : s0;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding, borderRadius:20,
      fontSize, fontWeight:fwOverride||s.fw||700,
      color:s.c, background:s.bg, border:`${s.bw||"1.5px"} solid ${s.b}`,
      whiteSpace:"nowrap", lineHeight:1.4,
    }}>
      {emoji}{label}
    </span>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function EventCard({ ev, diaDe, clientes, contactos=[], interpretes, pares, proveedores=[], lugares=[], onClick, onNavegar, onVerMultidia=null, solidPill=false, pillsHalf=false, agendaSmall=false, hideDots=false }) {
  const cliente       = clientes.find(c => c.id === ev.cliente_id);
  const nombreContacto = contactos.find(c => c.id === ev.contacto_id)?.nombre || cliente?.nombre_contacto || "";
  const borderColor = colorCliente(ev.cliente_id);
  const esPresencial = ev.modalidad === "presencial" || ev.modalidad === "hibrido";
  const esZoomMC    = ev.plataforma === "Zoom MundoChile" || ev.plataforma === "Zoom";
  const _TL         = {hotel:"Hotel",centro_eventos:"Centro de eventos",universidad:"Universidad",edificio_corporativo:"Edificio corporativo",oficina_cliente:"Oficina del cliente",planta_produccion:"Planta de producción",faena_minera:"Faena minera",ministerio:"Ministerio",edificio_gobierno:"Edificio de gobierno",otro:"Otro"};
  const _lr         = esPresencial && ev.lugar ? lugares.find(l => ev.lugar === l.nombre || (l.tipo && _TL[l.tipo] && ev.lugar === _TL[l.tipo] + " – " + l.nombre)) : null;
  const lugarDisp   = _lr ? (_lr.tipo && _TL[_lr.tipo] ? _TL[_lr.tipo] + " " + _lr.nombre : _lr.nombre) : (ev.lugar || "");
  const lugarDir    = _lr?.direccion || "";
  const modalLabel  = LBL_MODAL[ev.modalidad] || ev.modalidad;
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

  // Agrupar intérpretes por par de idiomas (asignaciones directas + por día)
  const todasAsigs = [
    ...(ev.asignaciones || []),
    ...(ev.evento_dias || []).flatMap(d => d.asignaciones_dia || []),
  ];
  const vistos = new Set();
  const grupos = {};
  todasAsigs.forEach(a => {
    const key2 = `${a.interprete_id}-${a.par_id}`;
    if (vistos.has(key2)) return;
    vistos.add(key2);
    const par    = pares.find(p => p.id === a.par_id);
    const interp = interpretes.find(x => x.id === a.interprete_id);
    if (!interp) return;
    const key    = par?.descripcion || (par?.idioma_origen&&par?.idioma_destino?`${par.idioma_origen} – ${par.idioma_destino}`:"Sin par");
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

  // Dot hoy/mañana — usa la fecha de la columna (diaDe) para multidía
  const dotHoyD = new Date();
  const dotMan = new Date();
  dotMan.setDate(dotHoyD.getDate() + 1);
  const dotFecha = diaDe ? desdeISO(diaDe) : desdeISO(ev.fecha_inicio);
  const dotEsHoy = dotFecha.toDateString() === dotHoyD.toDateString();
  const dotEsMan = dotFecha.toDateString() === dotMan.toDateString();
  const dotVisible = dotEsHoy || dotEsMan;

  const pillMultidia = diaXdeY && (() => {
    return (
      <div
        onClick={e => { e.stopPropagation(); if (onVerMultidia) onVerMultidia(ev.id); }}
        title="Ver todos los días del evento"
        style={{
          display:"inline-flex", alignItems:"center", gap:4,
          padding:agendaSmall?"3px 8px":"3px 7px", borderRadius:20,
          background:"#E8F4FD", color:"#1971C2",
          fontSize:agendaSmall?14:13, fontWeight:700, lineHeight:1.4,
          cursor: onVerMultidia ? "pointer" : "default",
          border:"1px solid #BAD7F0",
          whiteSpace:"nowrap", flexShrink:0,
          userSelect:"none",
          position:"relative",
        }}
      >
        📅 Día {diaXdeY.x} de {diaXdeY.y} ›
      </div>
    );
  })();

  return (
    <div
      onClick={onClick}
      style={{
        background:   "#FFFFFF",
        borderLeft:   `16px solid ${borderColor}`,
        borderTop:    `6px solid ${borderColor}`,
        borderRadius: agendaSmall ? "0 12px 12px 0" : "0 8px 8px 0",
        padding:      agendaSmall ? "20px 29px" : "16px",
        marginBottom: "10px",
        boxShadow:    agendaSmall ? "0 2px 12px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        cursor:       "pointer",
        width:        "100%",
        boxSizing:    "border-box",
        transition:   "box-shadow 0.15s, transform 0.12s",
        userSelect:   "none",
        position:     "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = agendaSmall ? "0 2px 12px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >

      {agendaSmall ? (
        /* ── AGENDA: layout dos columnas (idéntico a modoMultidia) ──────── */
        <>
          {/* HEADER FULL-WIDTH solo para eventos multidía */}
          {diaXdeY && (
            <div style={{ display:"flex", alignItems:"center", flexWrap:"nowrap", marginBottom:"12px" }}>
              <div style={{ fontSize:"34px", fontWeight:"600", color:"#0F172A", lineHeight:1.2 }}>{cliente?.nombre_empresa || "—"}</div>
              {dotVisible && <div style={{ width:"12px", height:"12px", borderRadius:"50%", background:dotEsHoy?"#22C55E":"#EAB308", boxShadow:dotEsHoy?"0 0 8px #22C55E":"0 0 8px #EAB308", marginLeft:"16px", flexShrink:0 }}/>}
              {ev.comentarios && <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#F472B6", boxShadow:"0 0 6px #F472B6", marginLeft:"8px", flexShrink:0 }}/>}
              <div style={{ marginLeft:"8px", flexShrink:0 }}>{pillMultidia}</div>
            </div>
          )}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", alignItems:"start" }}>

          {/* COLUMNA IZQUIERDA */}
          <div>
            {!diaXdeY && (
            <div style={{ display:"flex", alignItems:"center", flexWrap:"nowrap" }}>
              <div style={{ fontSize:"34px", fontWeight:"600", color:"#0F172A", lineHeight:1.2 }}>{cliente?.nombre_empresa || "—"}</div>
              {dotVisible && <div style={{ width:"12px", height:"12px", borderRadius:"50%", background:dotEsHoy?"#22C55E":"#EAB308", boxShadow:dotEsHoy?"0 0 8px #22C55E":"0 0 8px #EAB308", marginLeft:"16px", flexShrink:0 }}/>}
              {ev.comentarios && <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#F472B6", boxShadow:"0 0 6px #F472B6", marginLeft:"8px", flexShrink:0 }}/>}
            </div>
            )}
            {nombreContacto && <div style={{ fontSize:"16px", fontWeight:"500", color:"#6B7280", fontStyle:"italic", marginBottom:4, marginTop:4 }}>Contacto: {nombreContacto}</div>}
            {ev.nombre_evento && <div style={{ fontSize:"16px", fontWeight:"500", color:"#111827", marginTop:2 }}><span style={{ fontWeight:"600", color:"#6B7280" }}>Nombre del evento: </span>{ev.nombre_evento}</div>}

            <hr style={{ border:"none", borderTop:"1px solid #E5E7EB", margin:"14px 0" }}/>

            <div style={{ fontSize:"16px", fontWeight:"500", color:"#0F172A", marginBottom:"6px" }}>
              🕐 {ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)} hrs
              {ev.jornada && <span style={{ fontWeight:"400", color:"#6B7280", fontSize:"14px" }}> · {ev.jornada}</span>}
            </div>

            <hr style={{ border:"none", borderTop:"1px solid #E5E7EB", margin:"14px 0" }}/>

            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center", marginBottom:"4px" }}>
              {(Array.isArray(ev.tipo)?ev.tipo:[ev.tipo||"Simultánea"]).map(t=><Chip key={t} label={t} emoji={t==="Simultánea"?<IconHeadphones size={14}/>:t==="Consecutiva"?<IconMicOutline size={14}/>:<IconChatBubble size={14}/>} fontSize={14} padding="5px 12px" />)}
              <Chip label={modalLabel} emoji={ev.modalidad==="presencial"?<IconoPresencial size={14}/>:ev.modalidad==="hibrido"?<IconArrowsExchange size={14}/>:<IconAV size={14}/>} fontSize={14} padding="5px 12px" />
            </div>

            {((esPresencial && ev.lugar) || (!esPresencial && ev.plataforma)) && <hr style={{ border:"none", borderTop:"1px solid #E5E7EB", margin:"14px 0" }}/>}

            {esPresencial && ev.lugar && (
              <div style={{ marginBottom:"8px" }}>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"5px 11px", borderRadius:6, fontSize:13, fontWeight:700, color:"#9A3A3A", background:"#FEF2F2", border:"2px solid #D34848", whiteSpace:"nowrap" }}>📍 {lugarDisp}</span>
                  {ev.lugar_detalle && <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"5px 11px", borderRadius:6, fontSize:13, fontWeight:700, color:"#9A3A3A", background:"#FEF2F2", border:"2px solid #D34848", whiteSpace:"nowrap" }}>📍 {ev.lugar_detalle}</span>}
                </div>
                {lugarDir && <div style={{ marginTop:"5px", fontSize:"12px", fontWeight:"500", color:"#7A2929" }}>📌 {lugarDir}</div>}
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"6px", flexWrap:"wrap" }}>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.lugar)}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontSize:"13px", fontWeight:"500", color:"#1566AE", padding:"5px 11px", borderRadius:"8px", border:"1px solid #84B1E4", background:"#EFF6FF", textDecoration:"none", cursor:"pointer" }}>📍 Ver en Maps</a>
                  <button onClick={e=>{e.stopPropagation();const u=ev.lugar;if(navigator.clipboard){navigator.clipboard.writeText(u).catch(()=>{const ta=document.createElement("textarea");ta.value=u;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);});}else{const ta=document.createElement("textarea");ta.value=u;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);}}} title="Copiar dirección" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"5px 11px", borderRadius:"8px", border:"1px solid #84B1E4", background:"#EFF6FF", cursor:"pointer", color:"#1566AE", fontFamily:"inherit" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
              </div>
            )}
            {!esPresencial && ev.plataforma && (
              <div style={{ marginBottom:"8px" }}>
                <PlatformChip platform={ev.plataforma==="Zoom"?"Zoom MundoChile":ev.plataforma} isMundoChile={esZoomMC} extra={esZoomMC?ev.zoom_administrador:""} agendaScale={true}/>
              </div>
            )}

            <hr style={{ border:"none", borderTop:"1px solid #E5E7EB", margin:"14px 0" }}/>

            <div>
              <div style={{ fontSize:"13px", fontWeight:"600", color:"#0F172A", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:"6px" }}>Información Contable</div>
              <Chip label={estadoLabel} emoji={estadoLabel==="Facturado"?"✓ ":"🟠 "} fontSize={12} padding="4px 10px" />
            </div>

            {tieneEquipos && (
              <div style={{ fontSize:11, color:"#6B7280", marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
                <IconAV size={13} /> {provNombre || "Equipos AV"}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA — intérpretes */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"10px", padding:"5px 13px", background:"#FFF1F2", border:"1.5px solid #FECDD3", borderRadius:"10px", width:"fit-content", color:"#B91C1C" }}><IconMicOutline size={17}/><span style={{ fontSize:"14px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.05em" }}>Intérpretes</span></div>
            {Object.keys(grupos).length === 0 ? (
              <div style={{ color:"#374151", fontSize:13, fontStyle:"italic" }}>Sin intérpretes asignados</div>
            ) : (
              Object.entries(grupos).map(([key, grupo]) => {
                const pillClr = IDIOMA_PILL_CLR[grupo.idioma] || "#4C6EF5";
                const hp = grupo.items.find(i => i.hora)?.hora;
                return (
                  <div key={key} style={{ marginBottom:"12px" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
                      <span style={{ fontSize:"11px", fontWeight:700, color:"#92400E", textTransform:"uppercase", letterSpacing:"0.06em", background:"#FFFBEB", border:"1.5px solid #FCD34D", borderRadius:"7px", padding:"2px 8px" }}>{key}</span>
                      {hp && <span style={{ fontSize:"14px", color:"#4F5663", display:"flex", alignItems:"center", gap:"4px" }}>🕐 {hp.slice(0,5)} hrs</span>}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px" }}>
                      {grupo.items.map((interp, i) => (
                        <span key={i} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"5px", padding:"3px 8px", borderRadius:"20px", fontSize:"13px", fontWeight:"600", lineHeight:"1.4", color:"#1A1A1A", background:"#FFFFFF", border:`3px solid ${pillClr}`, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {interp.isHost && <span style={{ fontSize:"11px" }}>🔑</span>}
                          <Flag idioma={grupo.idioma} size={14} />
                          <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        </>
      ) : (
        /* ── SEMANA / DÍA: layout original ──────────────────────────────── */
        <>
          {/* Evento multidía: fila dots+pill, luego nombre y contacto full width */}
          {diaXdeY ? (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                  {!hideDots && dotEsHoy && <div style={{ width:"12.5px", height:"12.5px", borderRadius:"50%", background:"#22C55E", boxShadow:"0 0 8px #22C55E", animation:"flash 1.2s ease-in-out infinite" }}/>}
                  {!hideDots && dotEsMan && !dotEsHoy && <div style={{ width:"12.5px", height:"12.5px", borderRadius:"50%", background:"#EAB308", boxShadow:"0 0 8px #EAB308", animation:"flashYellow 1.8s ease-in-out infinite" }}/>}
                  {ev.comentarios && <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#F472B6", boxShadow:"0 0 6px #F472B6" }}/>}
                </div>
                {pillMultidia}
              </div>
              <div style={{ fontSize:21, fontWeight:600, color:"#0F172A", lineHeight:1.2, letterSpacing:"-0.01em", minWidth:0, marginBottom:4 }}>
                {cliente?.nombre_empresa || "—"}
              </div>
              {nombreContacto && (
                <div style={{ fontSize:16, color:"#373B42", fontStyle:"italic", marginTop:2 }}>
                  Contacto: {nombreContacto}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Evento un día: dots absolute top-right */}
              {((!hideDots&&(dotEsHoy||dotEsMan))||ev.comentarios) && (
                <div style={{ position:"absolute", top:"8px", right:"8px", zIndex:15, display:"flex", alignItems:"center", gap:"5px" }}>
                  {!hideDots && dotEsHoy && <div style={{ width:"12.5px", height:"12.5px", borderRadius:"50%", background:"#22C55E", boxShadow:"0 0 8px #22C55E", animation:"flash 1.2s ease-in-out infinite" }}/>}
                  {!hideDots && dotEsMan && !dotEsHoy && <div style={{ width:"12.5px", height:"12.5px", borderRadius:"50%", background:"#EAB308", boxShadow:"0 0 8px #EAB308", animation:"flashYellow 1.8s ease-in-out infinite" }}/>}
                  {ev.comentarios && <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#F472B6", boxShadow:"0 0 6px #F472B6" }}/>}
                </div>
              )}
              <div style={{ marginBottom:4 }}>
                <div style={{ fontSize:21, fontWeight:600, color:"#0F172A", lineHeight:1.2, letterSpacing:"-0.01em", minWidth:0, paddingRight:((!hideDots&&(dotEsHoy||dotEsMan))||ev.comentarios)?"44px":0 }}>
                  {cliente?.nombre_empresa || "—"}
                </div>
              </div>
              {nombreContacto && (
                <div style={{ fontSize:16, color:"#373B42", fontStyle:"italic", marginTop:2 }}>
                  Contacto: {nombreContacto}
                </div>
              )}
            </>
          )}

          {/* Nombre evento */}
          {ev.nombre_evento && (
            <div style={{ fontSize:14, color:"#565B66", marginTop:2 }}>
              <span style={{ fontWeight:600 }}>Nombre del evento:</span>{" "}
              <span style={{ fontWeight:400 }}>{ev.nombre_evento}</span>
            </div>
          )}

          {/* Horario */}
          <div style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginTop:10, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
            🕐 {ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)} hrs
          </div>

          {/* Badges tipo + modalidad */}
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
            {(Array.isArray(ev.tipo)?ev.tipo:[ev.tipo||"Simultánea"]).map(t=><Chip key={t} label={t} emoji={t==="Simultánea"?<IconHeadphones size={13}/>:t==="Consecutiva"?<IconMicOutline size={13}/>:<IconChatBubble size={13}/>} fontSize={13} padding="4px 11px" dark={false} fw={500} />)}
            <Chip label={modalLabel} emoji={ev.modalidad==="presencial"?<IconoPresencial size={13}/>:ev.modalidad==="hibrido"?<IconArrowsExchange size={13}/>:<IconAV size={13}/>} fontSize={13} padding="4px 11px" dark={false} fw={500} />
          </div>

          {/* Plataforma / Lugar */}
          {!esPresencial && ev.plataforma && (
            <div style={{ marginTop:14 }}>
              <PlatformChip
                platform={ev.plataforma === "Zoom" ? "Zoom MundoChile" : ev.plataforma}
                isMundoChile={esZoomMC}
                extra={esZoomMC ? ev.zoom_administrador : ""}
                agendaScale={false}
              />
            </div>
          )}
          {esPresencial && ev.lugar && (
            <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:6, fontSize:12, fontWeight:700, lineHeight:1.4, color:"#8F2424", background:"#FEF2F2", border:"2px solid #CE3434", flexWrap:"wrap", maxWidth:"100%", wordBreak:"break-word", marginTop:10 }}>📍 {lugarDisp}</span>
          )}

          {/* Intérpretes agrupados */}
          {Object.entries(grupos).map(([key, grupo]) => {
            const pillClr = IDIOMA_PILL_CLR[grupo.idioma] || "#4C6EF5";
            const border  = solidPill ? `2px solid ${pillClr}` : `3px solid ${pillClr}`;
            const hp      = grupo.items.find(i => i.hora)?.hora;
            const pillPad = solidPill ? "1px 4px" : "4px 10px";
            const pillFs  = solidPill ? 12 : 12;
            const flagSz  = solidPill ? 13 : 14;
            return (
              <div key={key} style={{ marginTop:14 }}>
                <div style={{ fontSize:solidPill?11:12, fontWeight:700, color:"#92400E", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6, textAlign:"center", background:"#FFFBEB", border:"1.5px solid #FCD34D", borderRadius:"8px", padding:"3px 10px", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {key}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:solidPill?"1fr":"1fr 1fr", gap:6, ...(pillsHalf?{maxWidth:"50%"}:{}) }}>
                  {grupo.items.map((interp, i) => (
                    <span key={i}
                      title={`${interp.nombre}${interp.apellido ? " " + interp.apellido : ""}`}
                      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:5, padding:pillPad, borderRadius:20, fontSize:pillFs, fontWeight:solidPill?600:400, lineHeight:1.4, color:"#333333", background:"#FFFFFF", border, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor:"default", WebkitFontSmoothing:"antialiased", MozOsxFontSmoothing:"grayscale", textRendering:"optimizeLegibility", letterSpacing:"0.01em" }}>
                      {interp.isHost && <span style={{ fontSize:11 }}>🔑</span>}
                      <Flag idioma={grupo.idioma} size={flagSz} />
                      <span style={{ overflow:"hidden", textOverflow:"ellipsis", color:"#333333" }}>
                        {nombreCorto(interp.nombre, interp.apellido)}
                      </span>
                    </span>
                  ))}
                  {grupo.items.length===1&&<span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", padding:pillPad, borderRadius:20, fontSize:pillFs, fontWeight:400, lineHeight:1.4, color:"#40454D", background:"#F3F4F6", border:"1px dashed #757A83", fontStyle:"italic", cursor:"default" }}>Sin partner</span>}
                </div>
                {hp && (
                  <div style={{ fontSize:13, color:"#363E4B", marginTop:4, display:"inline-flex", alignItems:"center", gap:4 }}>
                    🕐 Presentación: {hp.slice(0,5)} hrs
                  </div>
                )}
              </div>
            );
          })}

          {/* Equipos AV */}
          {tieneEquipos && (
            <div style={{ fontSize:11, color:"#6B7280", marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
              <IconAV size={13} /> {provNombre || "Equipos AV"}
            </div>
          )}

          {/* Estado — siempre al final */}
          <div style={{ marginTop:10 }}>
            <Chip label={estadoLabel} emoji={estadoLabel==="Facturado"?<span style={{color:"#F97316",fontWeight:900}}>✔ </span>:"🟠 "} fontSize={11} padding="4px 11px" />
          </div>
        </>
      )}
    </div>
  );
}
