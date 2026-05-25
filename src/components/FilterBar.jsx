export default function FilterBar({filters, onChange, interpreters=[]}) {
  const CHIP_ACTIVO = {
    padding:"6px 14px",borderRadius:"20px",cursor:"pointer",
    fontSize:"13px",fontWeight:"600",fontFamily:"inherit",
    background:"rgba(255,255,255,0.28)",color:"#FFFFFF",
    border:"1.5px solid rgba(255,255,255,0.70)",whiteSpace:"nowrap"
  };
  const CHIP_INACTIVO = {
    padding:"6px 14px",borderRadius:"20px",cursor:"pointer",
    fontSize:"13px",fontWeight:"400",fontFamily:"inherit",
    background:"rgba(255,255,255,0.10)",color:"rgba(255,255,255,0.60)",
    border:"1px solid rgba(255,255,255,0.22)",whiteSpace:"nowrap"
  };
  const LBL = {
    fontSize:"10px",fontWeight:"700",fontFamily:"inherit",
    textTransform:"uppercase",letterSpacing:"0.08em",
    color:"#FC8181",background:"#FFFFFF",
    border:"1.5px solid #FC8181",borderRadius:"6px",
    padding:"2px 7px",display:"inline-flex",alignItems:"center",
    whiteSpace:"nowrap",flexShrink:0
  };
  const hayFiltro = filters.estado||filters.modalidad||filters.tipo||filters.interprete_id;

  return (
    <div style={{
      display:"flex",flexWrap:"nowrap",gap:"6px",padding:"8px 16px",
      background:"rgba(0,0,0,0.15)",borderRadius:"10px",marginBottom:"16px",
      alignItems:"center",justifyContent:"space-between",overflowX:"auto"
    }}>

      <span style={LBL}>Estado</span>
      {[["","Todos"],["Facturación Pendiente","Pendiente"],["Facturado","Facturado"]].map(([v,l])=>(
        <button key={v} onClick={()=>onChange({...filters,estado:v})}
          style={filters.estado===v ? CHIP_ACTIVO : CHIP_INACTIVO}>{l}</button>
      ))}

      <span style={{...LBL,marginLeft:"4px"}}>Modalidad</span>
      {[["","Todas"],["presencial","Presencial"],["remoto","Remoto"],["hibrido","Híbrido"]].map(([v,l])=>(
        <button key={v} onClick={()=>onChange({...filters,modalidad:v})}
          style={filters.modalidad===v ? CHIP_ACTIVO : CHIP_INACTIVO}>{l}</button>
      ))}

      <span style={{...LBL,marginLeft:"4px"}}>Tipo</span>
      {[["","Todos"],["Simultánea","Simultánea"],["Consecutiva","Consecutiva"],["Whispering","Whispering"]].map(([v,l])=>(
        <button key={v} onClick={()=>onChange({...filters,tipo:v})}
          style={filters.tipo===v ? CHIP_ACTIVO : CHIP_INACTIVO}>{l}</button>
      ))}

      <span style={{...LBL,marginLeft:"4px"}}>Intérprete</span>
      <select value={filters.interprete_id||""}
        onChange={e=>onChange({...filters,interprete_id:e.target.value})}
        style={{
          background:"rgba(255,255,255,0.10)",color:"rgba(255,255,255,0.85)",
          border:"1px solid rgba(255,255,255,0.22)",borderRadius:"20px",
          padding:"3px 8px",fontSize:"12px",maxWidth:"120px",flexShrink:1,
          cursor:"pointer",outline:"none"
        }}>
        <option value="" style={{color:"#000"}}>Todos</option>
        {interpreters.filter(i=>i.activo!==false).map(i=>(
          <option key={i.id} value={i.id} style={{color:"#000"}}>
            {i.nombre}{i.apellido?" "+i.apellido:""}
          </option>
        ))}
      </select>

      {hayFiltro&&(
        <button onClick={()=>onChange({estado:"",modalidad:"",tipo:"",interprete_id:""})}
          style={{
            background:"#EF4444",color:"#FFFFFF",border:"none",borderRadius:"50%",
            width:"22px",height:"22px",display:"flex",alignItems:"center",
            justifyContent:"center",cursor:"pointer",fontSize:"14px",
            fontWeight:"700",flexShrink:0,padding:0,lineHeight:1
          }}>×</button>
      )}
    </div>
  );
}
