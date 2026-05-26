import { colorCliente, INTERP_LANG } from "../../design-system/tokens";
import Badge from "./Badge";
import MultiDayPill from "./MultiDayPill";
import PlatformChip from "./PlatformChip";

const nombreCorto = (nombre, apellido) => {
  if (!apellido) return nombre;
  const completo = `${nombre} ${apellido}`;
  if (completo.length <= 12) return completo;
  return `${nombre} ${apellido.charAt(0)}.`;
};

const IconAV = ({size=24}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)

const LBL_MODAL = { remoto: "Remoto", presencial: "Presencial", hibrido: "Híbrido" };
const desdeISO = (s) => { const [y,m,d] = s.split("-"); return new Date(+y,+m-1,+d); };

function FlagImg({ idioma }) {
  const t = INTERP_LANG[idioma] || INTERP_LANG.default;
  if (!t.flag) return <span style={{ fontSize: '13px' }}>🌐</span>;
  return <img src={`https://flagcdn.com/28x21/${t.flag}.png`} style={{ width: '18px', height: '13px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} alt={idioma} />;
}

export default function EventCard({ ev, diaDe, clientes, interpretes, pares, proveedores=[], onClick }) {
  const cliente = clientes.find(c => c.id === ev.cliente_id);
  const borderColor = colorCliente(ev.cliente_id);
  const esPresencial = ev.modalidad === "presencial" || ev.modalidad === "hibrido";
  const esZoomMC = (ev.plataforma === "Zoom MundoChile" || ev.plataforma === "Zoom");

  const todosEquipos = (ev.evento_dias || []).flatMap(d => d.equipos_dia || []);
  const tieneEquipos = todosEquipos.length > 0;
  const provNombreEq = tieneEquipos
    ? (todosEquipos[0].proveedor_nombre || proveedores.find(p => p.id === todosEquipos[0].proveedor_id)?.nombre || "")
    : "";

  let diaXdeY = null;
  if (diaDe && ev.fecha_inicio !== ev.fecha_termino) {
    const ini = desdeISO(ev.fecha_inicio);
    const diaCol = desdeISO(diaDe);
    const x = Math.round((diaCol - ini) / 86400000) + 1;
    const y = Math.round((desdeISO(ev.fecha_termino) - ini) / 86400000) + 1;
    diaXdeY = { x, y };
  }

  // Agrupar intérpretes por par de idiomas
  const grupos = {};
  (ev.asignaciones || []).forEach(a => {
    const par = pares.find(p => p.id === a.par_id);
    const interp = interpretes.find(x => x.id === a.interprete_id);
    if (!interp) return;
    const key = par?.descripcion || "Sin par";
    const idioma = par?.idioma_origen || "";
    if (!grupos[key]) grupos[key] = { idioma, interpretes: [] };
    grupos[key].interpretes.push({ ...interp, isHost: !!a.es_host_zoom, hora_presentacion: a.hora_presentacion || null });
  });
  const gruposEntries = Object.entries(grupos);

  const estadoLabel = ev.estado === "Facturado" ? "Facturado" : "Facturación Pendiente";
  const modalLabel = LBL_MODAL[ev.modalidad] || ev.modalidad;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        borderLeft: `14px solid ${borderColor}`,
        borderTop: `4px solid ${borderColor}`,
        borderRadius: '0 10px 4px 0',
        padding: '18px 20px',
        marginBottom: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.22)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', lineHeight: 1.2 }}>
        {cliente?.nombre_empresa || "—"}
      </div>
      {ev.nombre_evento && (
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginTop: '2px' }}>
          {ev.nombre_evento}
        </div>
      )}
      {cliente?.nombre_contacto && (
        <div style={{ fontSize: '14px', color: '#6B7280', fontStyle: 'italic', fontWeight: '700', marginTop: '2px' }}>
          Contacto: {cliente.nombre_contacto}
        </div>
      )}
      <div style={{ margin: '8px 0' }} />
      <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
        {ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)} hrs
      </div>
      {diaXdeY && (
        <div style={{ marginTop: '4px' }}>
          <MultiDayPill currentDay={diaXdeY.x} totalDays={diaXdeY.y} />
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px' }}>
        <Badge type={ev.tipo} />
        <Badge type={modalLabel} />
      </div>
      {!esPresencial && ev.plataforma && (
        <div style={{ marginTop: '6px' }}>
          <PlatformChip platform={ev.plataforma === "Zoom" ? "Zoom MundoChile" : ev.plataforma} isMundoChile={esZoomMC} extra={esZoomMC ? ev.zoom_administrador : ''} />
        </div>
      )}
      {esPresencial && ev.lugar && (
        <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>📍 {ev.lugar}</div>
      )}
      <div style={{ marginTop: '6px' }}>
        <Badge type={estadoLabel} />
      </div>
      {gruposEntries.map(([key, grupo]) => {
        const t = INTERP_LANG[grupo.idioma] || INTERP_LANG.default;
        const esPort = grupo.idioma === 'Portugués';
        const bubbleBg = esPort ? '#FFFFFF' : t.bg;
        const bubbleColor = esPort ? '#0F3311' : '#FFFFFF';
        const bubbleBorder = esPort ? '2px solid #0F3311' : `2px solid ${t.border}`;
        const titleColor = esPort ? '#0F3311' : t.bg;
        return (
          <div key={key} style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '900', color: titleColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px', filter: 'brightness(0.65)' }}>{key}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              {grupo.interpretes.map((interp, i) => (
                <span key={i} title={`${interp.nombre}${interp.apellido ? ' ' + interp.apellido : ''}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '4px 7px', borderRadius: '20px', fontSize: '14px', fontWeight: '500', color: bubbleColor, background: bubbleBg, border: bubbleBorder, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default' }}>
                  {interp.isHost && <span style={{ fontSize: '11px' }}>🔑</span>}
                  <FlagImg idioma={grupo.idioma} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', color: bubbleColor }}>{nombreCorto(interp.nombre, interp.apellido)}</span>
                </span>
              ))}
            </div>
            {(()=>{const hp=grupo.interpretes.find(i=>i.hora_presentacion)?.hora_presentacion;return hp?<div style={{fontSize:'9px',fontWeight:'500',color:'#475569',marginTop:'4px',display:'inline-flex',alignItems:'center',gap:'4px'}}>🕐 Presentación intérpretes: {hp.slice(0,5)} hrs</div>:null;})()}
          </div>
        );
      })}
      {tieneEquipos && (
        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <IconAV size={16}/> {provNombreEq || "Equipos AV"}
        </div>
      )}
    </div>
  );
}
