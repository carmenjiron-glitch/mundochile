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
  "Simultánea":            { bg:"#FFFFFF", c:"#0057FF", b:"#0057FF" },
  "Consecutiva":           { bg:"#FCE4EC", c:"#C2185B", b:"#C2185B" },
  "Whispering":            { bg:"#F3E5F5", c:"#7B1FA2", b:"#7B1FA2" },
  "Presencial":            { bg:"#E6FFF2", c:"#00AF57", b:"#00AF57" },
  "Remoto":                { bg:"#E0F7FA", c:"#00838F", b:"#00838F" },
  "Híbrido":               { bg:"#FBE9E7", c:"#BF360C", b:"#BF360C" },
  "Facturado":             { bg:"#FFFFFF", c:"#1A1A1A", b:"#E57373", bw:"2px", fw:400 },
  "Facturación Pendiente": { bg:"#FFFFFF", c:"#1A1A1A", b:"#E57373", bw:"2px", fw:400 },
};

const Chip = ({ label, emoji, fontSize=12, padding="4px 10px", dark=false }) => {
  const s0 = BADGE[label] || { bg:"#F1F5F9", c:"#475569", b:"#CBD5E1" };
  const s = dark ? { ...s0, bg:darken(s0.bg,0.9), c:darken(s0.c,0.9), b:darken(s0.b,0.9) } : s0;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding, borderRadius:20,
      fontSize, fontWeight:s.fw||700,
      color:s.c, background:s.bg, border:`${s.bw||"1.5px"} solid ${s.b}`,
      whiteSpace:"nowrap", lineHeight:1.4,
    }}>
      {emoji}{label}
    </span>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function EventCard({ ev, diaDe, clientes, interpretes, pares, proveedores=[], onClick, onNavegar, onVerMultidia=null, solidPill=false, pillsHalf=false, agendaSmall=false }) {
  const cliente     = clientes.find(c => c.id === ev.cliente_id);
  const borderColor = colorCliente(ev.cliente_id);
  const esPresencial = ev.modalidad === "presencial" || ev.modalidad === "hibrido";
  const esZoomMC    = ev.plataforma === "Zoom MundoChile" || ev.plataforma === "Zoom";
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

  // Agrupar intérpretes por par de idiomas
  const grupos = {};
  (ev.asignaciones || []).forEach(a => {
    const par    = pares.find(p => p.id === a.par_id);
    const interp = interpretes.find(x => x.id === a.interprete_id);
    if (!interp) return;
    const key    = par?.descripcion || "Sin par";
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

  // Dot hoy/mañana
  const dotHoyD = new Date();
  const dotMan = new Date();
  dotMan.setDate(dotHoyD.getDate() + 1);
  const dotFecha = desdeISO(ev.fecha_inicio);
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
        {!agendaSmall && ev.comentarios && (
          <div style={{position:"absolute",bottom:"-5px",right:"-9px",width:"10px",height:"10px",borderRadius:"50%",background:"#F472B6",boxShadow:"0 0 6px #F472B6",zIndex:11}}/>
        )}
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
        borderRadius: "0 8px 8px 0",
        padding:      "16px",
        marginBottom: "10px",
        boxShadow:    "0 1px 4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
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
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Indicador hoy/mañana + comentarios — solo absoluto en vistas semana/día */}
      {!agendaSmall && (dotVisible || (!diaXdeY && ev.comentarios)) && (
        <div style={{
          position:"absolute", top:"8px", right:"8px",
          display:"flex", alignItems:"center", gap:"5px",
          zIndex:10,
        }}>
          {!diaXdeY && ev.comentarios && (
            <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#F472B6",boxShadow:"0 0 6px #F472B6"}}/>
          )}
          {dotVisible && (
            <div style={{width:"13px",height:"13px",borderRadius:"50%",background:dotEsHoy?"#22C55E":"#EAB308",boxShadow:dotEsHoy?"0 0 6px #22C55E":"0 0 6px #EAB308",animation:dotEsHoy?"flash 1.2s ease-in-out infinite":"flashYellow 1.8s ease-in-out infinite"}}/>
          )}
        </div>
      )}

      {agendaSmall ? (
        /* ── AGENDA: layout dos columnas ─────────────────────────────────── */
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", alignItems:"start" }}>

          {/* COLUMNA IZQUIERDA — info del evento */}
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", flexWrap:"nowrap", gap:8, marginBottom:4 }}>
              <div style={{ fontSize:25, fontWeight:600, color:"#0F172A", lineHeight:1.2, letterSpacing:"-0.01em" }}>
                {cliente?.nombre_empresa || "—"}
              </div>
              {dotVisible && <div style={{ width:"13px", height:"13px", borderRadius:"50%", background:dotEsHoy?"#22C55E":"#EAB308", boxShadow:dotEsHoy?"0 0 6px #22C55E":"0 0 6px #EAB308", flexShrink:0, marginLeft:"16px", animation:dotEsHoy?"flash 1.2s ease-in-out infinite":"flashYellow 1.8s ease-in-out infinite" }}/>}
              {ev.comentarios && <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#F472B6", boxShadow:"0 0 6px #F472B6", flexShrink:0 }}/>}
              {pillMultidia}
            </div>

            {cliente?.nombre_contacto && (
              <div style={{ fontSize:16, color:"#3E4349", fontStyle:"italic", marginTop:2 }}>
                Contacto: {cliente.nombre_contacto}
              </div>
            )}

            {ev.nombre_evento && (
              <div style={{ fontSize:14, color:"#565B66", marginTop:2 }}>
                <span style={{ fontWeight:600 }}>Nombre del evento:</span>{" "}
                <span style={{ fontWeight:400 }}>{ev.nombre_evento}</span>
              </div>
            )}

            <div style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginTop:10, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
              🕐 {ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)} hrs
            </div>

            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              {(Array.isArray(ev.tipo)?ev.tipo:[ev.tipo||"Simultánea"]).map(t=><Chip key={t} label={t} emoji={t==="Simultánea"?<IconoSimultanea/>:t==="Consecutiva"?"🎤 ":"🤫 "} fontSize={14} padding="5px 12px" />)}
              <Chip label={modalLabel} emoji={ev.modalidad==="presencial"?<IconoPresencial/>:ev.modalidad==="hibrido"?"🔀 ":"💻 "} fontSize={14} padding="5px 12px" />
            </div>

            {!esPresencial && ev.plataforma && (
              <div style={{ marginTop:6 }}>
                <PlatformChip
                  platform={ev.plataforma === "Zoom" ? "Zoom MundoChile" : ev.plataforma}
                  isMundoChile={esZoomMC}
                  extra={esZoomMC ? ev.zoom_administrador : ""}
                  agendaScale={true}
                />
              </div>
            )}
            {esPresencial && ev.lugar && (
              <div>
                <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"5px 12px", borderRadius:6, fontSize:14, fontWeight:700, lineHeight:1.4, color:"#8F2424", background:"#FEF2F2", border:"2px solid #CE3434", whiteSpace:"nowrap" }}>📍 {ev.lugar}</span>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"6px", flexWrap:"wrap" }}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.lugar)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e=>e.stopPropagation()}
                    style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontSize:"13px", fontWeight:"500", color:"#1566AE", padding:"5px 11px", borderRadius:"8px", border:"1px solid #84B1E4", background:"#EFF6FF", textDecoration:"none", cursor:"pointer" }}
                  >
                    📍 Ver en Maps
                  </a>
                  <button
                    onClick={e=>{e.stopPropagation();const u=ev.lugar;if(navigator.clipboard){navigator.clipboard.writeText(u).catch(()=>{const t=document.createElement("textarea");t.value=u;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t);});}else{const t=document.createElement("textarea");t.value=u;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t);}}}
                    title="Copiar dirección"
                    style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"5px 11px", borderRadius:"8px", border:"1px solid #84B1E4", background:"#EFF6FF", cursor:"pointer", color:"#1566AE", fontFamily:"inherit" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div>
              <Chip label={estadoLabel} emoji={estadoLabel==="Facturado"?"✓ ":"🟠 "} fontSize={14} padding="5px 12px" />
            </div>

            {tieneEquipos && (
              <div style={{ fontSize:11, color:"#6B7280", marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
                <IconAV size={13} /> {provNombre || "Equipos AV"}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA — intérpretes */}
          <div>
            <div style={{ textAlign:"center", fontSize:18, fontWeight:"500", marginBottom:"8px", textTransform:"uppercase", color:"#0F172A", WebkitFontSmoothing:"antialiased", MozOsxFontSmoothing:"grayscale", letterSpacing:"0.05em" }}>
              INTÉRPRETES
            </div>
            {Object.keys(grupos).length === 0 ? (
              <div style={{ color:"#848B95", fontSize:14, textAlign:"center" }}>Sin intérpretes asignados</div>
            ) : (
              Object.entries(grupos).map(([key, grupo]) => {
                const pillClr  = IDIOMA_PILL_CLR[grupo.idioma] || "#4C6EF5";
                const hp       = grupo.items.find(i => i.hora)?.hora;
                const soloUno  = grupo.items.length === 1;
                return (
                  <div key={key} style={{ marginTop:10 }}>
                    <div style={{ position:"relative", marginBottom:5 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:"#1256A3", textTransform:"uppercase", letterSpacing:"0.07em", WebkitFontSmoothing:"antialiased", MozOsxFontSmoothing:"grayscale", opacity:0.9, whiteSpace:"nowrap", textAlign:"center", width:"100%", display:"block" }}>
                        {key}
                      </div>
                      {hp && (
                        <div style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"#4A5768", display:"inline-flex", alignItems:"center", gap:4 }}>
                          🕐 {hp.slice(0,5)} hrs
                        </div>
                      )}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                      {grupo.items.map((interp, i) => (
                        <span key={i}
                          title={`${interp.nombre}${interp.apellido ? " " + interp.apellido : ""}`}
                          style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:5, padding:"4px 5px", borderRadius:20, fontSize:14, fontWeight:500, lineHeight:1.4, color:"#1A1A1A", background:"#FFFFFF", border:`2px solid ${pillClr}`, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor:"default", WebkitFontSmoothing:"antialiased" }}>
                          {interp.isHost && <span style={{ fontSize:11 }}>🔑</span>}
                          <Flag idioma={grupo.idioma} size={14} />
                          <span style={{ overflow:"hidden", textOverflow:"ellipsis", color:"#1A1A1A" }}>
                            {nombreCorto(interp.nombre, interp.apellido)}
                          </span>
                        </span>
                      ))}
                      {soloUno && (
                        <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:5, padding:"4px 5px", borderRadius:20, fontSize:13, fontWeight:500, lineHeight:1.4, color:"#858B95", background:"#D4D5D5", border:"1px dashed #B2B5BA", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor:"default", fontStyle:"italic", WebkitFontSmoothing:"antialiased" }}>
                          SIN PARTNER
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ── SEMANA / DÍA: layout original ──────────────────────────────── */
        <>
          {/* Nombre cliente + pill multidía */}
          {pillMultidia && <div style={{ position:"absolute", top:"8px", right:"8px" }}>{pillMultidia}</div>}
          <div style={{ marginBottom:4 }}>
            <div style={{ fontSize:21, fontWeight:600, color:"#0F172A", lineHeight:1.2, letterSpacing:"-0.01em", flex:1, minWidth:0, paddingRight:"90px" }}>
              {cliente?.nombre_empresa || "—"}
            </div>
          </div>

          {/* Contacto */}
          {cliente?.nombre_contacto && (
            <div style={{ fontSize:14, color:"#565D68", fontStyle:"italic", marginTop:2 }}>
              Contacto: {cliente.nombre_contacto}
            </div>
          )}

          {/* Nombre evento */}
          {ev.nombre_evento && (
            <div style={{ fontSize:14, color:"#6B7280", marginTop:2 }}>
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
            {(Array.isArray(ev.tipo)?ev.tipo:[ev.tipo||"Simultánea"]).map(t=><Chip key={t} label={t} emoji={t==="Simultánea"?<IconoSimultanea size={14}/>:t==="Consecutiva"?"🎤 ":"🤫 "} fontSize={13} padding="4px 11px" dark={true} />)}
            <Chip label={modalLabel} emoji={ev.modalidad==="presencial"?<IconoPresencial size={13}/>:ev.modalidad==="hibrido"?"🔀 ":"💻 "} fontSize={13} padding="4px 11px" dark={true} />
          </div>

          {/* Plataforma / Lugar */}
          {!esPresencial && ev.plataforma && (
            <div style={{ marginTop:10 }}>
              <PlatformChip
                platform={ev.plataforma === "Zoom" ? "Zoom MundoChile" : ev.plataforma}
                isMundoChile={esZoomMC}
                extra={esZoomMC ? ev.zoom_administrador : ""}
                agendaScale={false}
              />
            </div>
          )}
          {esPresencial && ev.lugar && (
            <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:6, fontSize:12, fontWeight:700, lineHeight:1.4, color:"#8F2424", background:"#FEF2F2", border:"2px solid #CE3434", whiteSpace:"nowrap", marginTop:10 }}>📍 {ev.lugar}</span>
          )}

          {/* Intérpretes agrupados */}
          {Object.entries(grupos).map(([key, grupo]) => {
            const pillClr = IDIOMA_PILL_CLR[grupo.idioma] || "#4C6EF5";
            const border  = solidPill ? `2px solid ${pillClr}` : `3px solid ${pillClr}`;
            const hp      = grupo.items.find(i => i.hora)?.hora;
            const pillPad = solidPill ? "1px 4px" : "4px 10px";
            const pillFs  = solidPill ? 12 : 12;
            const flagSz  = solidPill ? 19 : 14;
            return (
              <div key={key} style={{ marginTop:14 }}>
                <div style={{ fontSize:solidPill?12:14, fontWeight:600, color:"#1256A3", textTransform:"uppercase", letterSpacing:"0.07em", WebkitFontSmoothing:"antialiased", MozOsxFontSmoothing:"grayscale", marginBottom:5, opacity:0.9, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", textAlign:"center", width:"100%", display:"block" }}>
                  {key}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, ...(pillsHalf?{maxWidth:"50%"}:{}) }}>
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
                </div>
                {hp && (
                  <div style={{ fontSize:11, color:"#64748B", marginTop:4, display:"inline-flex", alignItems:"center", gap:4 }}>
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
            <Chip label={estadoLabel} emoji={estadoLabel==="Facturado"?"✓ ":"🟠 "} fontSize={12} padding="4px 10px" />
          </div>
        </>
      )}
    </div>
  );
}
