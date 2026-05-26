import { colorCliente } from "../../design-system/tokens";
import Badge from "./Badge";
import MultiDayPill from "./MultiDayPill";
import PlatformChip from "./PlatformChip";
import InterpreterRow from "./InterpreterRow";

const LBL_MODAL = { remoto: "Remoto", presencial: "Presencial", hibrido: "Híbrido" };
const desdeISO = (s) => { const [y,m,d] = s.split("-"); return new Date(+y,+m-1,+d); };

export default function EventCard({ ev, diaDe, clientes, interpretes, pares, proveedores=[], onClick }) {
  const cliente = clientes.find(c => c.id === ev.cliente_id);
  const borderColor = colorCliente(ev.cliente_id);
  const esPresencial = ev.modalidad === "presencial" || ev.modalidad === "hibrido";
  const esZoomMC = ev.plataforma === "Zoom MundoChile";

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

  const interpRows = (ev.asignaciones || []).reduce((acc, a) => {
    const interp = interpretes.find(x => x.id === a.interprete_id);
    const par = pares.find(p => p.id === a.par_id);
    if (!interp) return acc;
    acc.push({
      name: `${interp.nombre}${interp.apellido ? " " + interp.apellido : ""}`,
      language: par?.idioma_origen || "",
      isHost: !!a.es_host_zoom,
      languagePair: par?.descripcion || "",
    });
    return acc;
  }, []);

  const estadoLabel = ev.estado === "Facturado" ? "Facturado" : "Facturación Pendiente";
  const modalLabel = LBL_MODAL[ev.modalidad] || ev.modalidad;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        borderLeft: `7px solid ${borderColor}`,
        borderRadius: '0 10px 10px 0',
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
        <div style={{ fontSize: '14px', color: '#6B7280', fontStyle: 'italic', fontWeight: '500', marginTop: '2px' }}>
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
        <Badge type={estadoLabel} />
      </div>
      {!esPresencial && ev.plataforma && (
        <div style={{ marginTop: '6px' }}>
          <PlatformChip platform={ev.plataforma} isMundoChile={esZoomMC} extra={esZoomMC ? ev.zoom_administrador : ''} />
        </div>
      )}
      {esPresencial && ev.lugar && (
        <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>📍 {ev.lugar}</div>
      )}
      {interpRows.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <InterpreterRow interpreters={interpRows} />
        </div>
      )}
      {tieneEquipos && (
        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
          🔧 {provNombreEq || "Equipos AV"}
        </div>
      )}
    </div>
  );
}
