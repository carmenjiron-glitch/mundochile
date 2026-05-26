const BADGE_MAP = {
  "Facturación Pendiente": {bg:"#FFEB3B",c:"#C62828",b:"#F9A825"},
  "Facturado":             {bg:"#E3F2FD",c:"#1565C0",b:"#1565C0"},
  "presencial":            {bg:"#E8F5E9",c:"#2E7D32",b:"#2E7D32"},
  "remoto":                {bg:"#E0F7FA",c:"#00838F",b:"#00838F"},
  "hibrido":               {bg:"#FBE9E7",c:"#BF360C",b:"#BF360C"},
  "Simultánea":            {bg:"#EEF2FF",c:"#3B5BDB",b:"#3B5BDB"},
  "Consecutiva":           {bg:"#FCE4EC",c:"#C2185B",b:"#C2185B"},
  "Whispering":            {bg:"#F3E5F5",c:"#7B1FA2",b:"#7B1FA2"},
};

export default function FilterBar({filters, onChange, interpreters=[]}) {
  const BASE = {padding:"4px 11px",borderRadius:"20px",cursor:"pointer",fontSize:"12px",fontFamily:"inherit",whiteSpace:"nowrap"};
  const CHIP_INACTIVO = {...BASE,fontWeight:"400",background:"rgba(255,255,255,0.10)",color:"rgba(255,255,255,0.65)",border:"1px solid rgba(255,255,255,0.22)"};
  const CHIP_ACTIVO_GENERICO = {...BASE,fontWeight:"600",background:"rgba(255,255,255,0.28)",color:"#FFFFFF",border:"1.5px solid rgba(255,255,255,0.70)"};
  const chipActivo = (v) => {
    const bd = BADGE_MAP[v];
    if (!bd) return CHIP_ACTIVO_GENERICO;
    return {...BASE,fontWeight:"700",background:bd.bg,color:bd.c,border:`1.5px solid ${bd.b}`};
  };
  const LBL = {
    padding:"4px 11px",borderRadius:"20px",
    fontSize:"12px",fontWeight:"700",fontFamily:"inherit",
    textTransform:"uppercase",letterSpacing:"0.04em",
    color:"#E53E3E",background:"#FFFFFF",
    border:"1.5px solid #E53E3E",
    display:"inline-flex",alignItems:"center",
    whiteSpace:"nowrap",flexShrink:0
  };
  const hayFiltro = filters.estado||filters.modalidad||filters.tipo||filters.interprete_id;

  return (
    <div style={{
      display:"flex",flexWrap:"nowrap",gap:"4px",
      padding:"4px 0",
      background:"transparent",borderRadius:"0",
      marginBottom:"0",alignItems:"center",
      justifyContent:"space-between",overflowX:"auto",width:"100%"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
        <span style={LBL}>Estado</span>
        {[["","Todos"],["Facturación Pendiente","Pendiente"],["Facturado","Facturado"]].map(([v,l])=>(
          <button key={v} onClick={()=>onChange({...filters,estado:v})}
            style={filters.estado===v ? chipActivo(v) : CHIP_INACTIVO}>{l}</button>
        ))}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
        <span style={LBL}>Modalidad</span>
        {[["","Todas"],["presencial","Presencial"],["remoto","Remoto"],["hibrido","Híbrido"]].map(([v,l])=>(
          <button key={v} onClick={()=>onChange({...filters,modalidad:v})}
            style={filters.modalidad===v ? chipActivo(v) : CHIP_INACTIVO}>{l}</button>
        ))}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
        <span style={LBL}>Tipo</span>
        {[["","Todos"],["Simultánea","Simultánea"],["Consecutiva","Consecutiva"],["Whispering","Whispering"]].map(([v,l])=>(
          <button key={v} onClick={()=>onChange({...filters,tipo:v})}
            style={filters.tipo===v ? chipActivo(v) : CHIP_INACTIVO}>{l}</button>
        ))}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
        <span style={LBL}>Intérprete</span>
        <select value={filters.interprete_id||""}
          onChange={e=>onChange({...filters,interprete_id:e.target.value})}
          style={{
            background:"rgba(255,255,255,0.10)",color:"rgba(255,255,255,0.85)",
            border:"1px solid rgba(255,255,255,0.22)",borderRadius:"20px",
            padding:"3px 8px",fontSize:"12px",maxWidth:"120px",
            flexShrink:1,cursor:"pointer",outline:"none"
          }}>
          <option value="" style={{color:"#000"}}>Todos</option>
          {interpreters.filter(i=>i.activo!==false).map(i=>(
            <option key={i.id} value={i.id} style={{color:"#000"}}>
              {i.nombre}{i.apellido?" "+i.apellido:""}
            </option>
          ))}
        </select>
      </div>

      {hayFiltro&&(
        <button onClick={()=>onChange({estado:"",modalidad:"",tipo:"",interprete_id:""})}
          style={{
            background:"#EF4444",color:"#FFFFFF",border:"none",borderRadius:"50%",
            width:"22px",height:"22px",display:"flex",alignItems:"center",
            justifyContent:"center",cursor:"pointer",fontSize:"14px",
            fontWeight:"700",flexShrink:0,padding:0,lineHeight:1,marginLeft:"4px"
          }}>×</button>
      )}
    </div>
  );
}
