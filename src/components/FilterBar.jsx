export default function FilterBar({filters, onChange, interpreters=[]}) {
  const CHIP_ACTIVO = {
    padding:"5px 14px",borderRadius:"20px",cursor:"pointer",
    fontSize:"14px",fontWeight:"600",fontFamily:"inherit",
    background:"#3a7bd5",color:"#FFFFFF",
    border:"1.5px solid #FFFFFF"
  };
  const CHIP_INACTIVO = {
    padding:"5px 14px",borderRadius:"20px",cursor:"pointer",
    fontSize:"14px",fontWeight:"500",fontFamily:"inherit",
    background:"rgba(255,255,255,0.12)",color:"#FDE68A",
    border:"1.5px solid rgba(255,255,255,0.35)"
  };
  const LBL = {
    fontSize:"11px",fontWeight:"800",color:"rgba(255,255,255,0.60)",
    textTransform:"uppercase",letterSpacing:"0.10em",marginLeft:"4px"
  };
  const hayFiltro = filters.estado||filters.modalidad||filters.tipo||filters.interprete_id;

  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:"6px",padding:"10px 16px",
      background:"rgba(0,0,0,0.15)",borderRadius:"10px",marginBottom:"16px",
      alignItems:"center",justifyContent:"center"}}>

      <span style={LBL}>Estado</span>
      {[["","Todos"],["Facturación Pendiente","Pendiente"],["Facturado","Facturado"]].map(([v,l])=>(
        <button key={v} onClick={()=>onChange({...filters,estado:v})}
          style={filters.estado===v ? CHIP_ACTIVO : CHIP_INACTIVO}>{l}</button>
      ))}

      <span style={{...LBL,marginLeft:"8px"}}>Modalidad</span>
      {[["","Todas"],["presencial","Presencial"],["remoto","Remoto"],["hibrido","Híbrido"]].map(([v,l])=>(
        <button key={v} onClick={()=>onChange({...filters,modalidad:v})}
          style={filters.modalidad===v ? CHIP_ACTIVO : CHIP_INACTIVO}>{l}</button>
      ))}

      <span style={{...LBL,marginLeft:"8px"}}>Tipo</span>
      {[["","Todos"],["Simultánea","Simultánea"],["Consecutiva","Consecutiva"],["Whispering","Whispering"]].map(([v,l])=>(
        <button key={v} onClick={()=>onChange({...filters,tipo:v})}
          style={filters.tipo===v ? CHIP_ACTIVO : CHIP_INACTIVO}>{l}</button>
      ))}

      <select value={filters.interprete_id||""}
        onChange={e=>onChange({...filters,interprete_id:e.target.value})}
        style={{background:"rgba(255,255,255,0.15)",color:"#FDE68A",
          border:"1px solid rgba(255,255,255,0.30)",borderRadius:"20px",
          padding:"4px 10px",fontSize:"13px",maxWidth:"160px",
          flexShrink:1,cursor:"pointer",outline:"none",marginLeft:"8px"}}>
        <option value="" style={{color:"#000"}}>Intérprete</option>
        {interpreters.filter(i=>i.activo!==false).map(i=>(
          <option key={i.id} value={i.id} style={{color:"#000"}}>
            {i.nombre}{i.apellido?" "+i.apellido:""}
          </option>
        ))}
      </select>

      {hayFiltro&&(
        <button onClick={()=>onChange({estado:"",modalidad:"",tipo:"",interprete_id:""})}
          style={{background:"#EF4444",color:"#FFFFFF",border:"none",borderRadius:"50%",
            width:"24px",height:"24px",display:"flex",alignItems:"center",
            justifyContent:"center",cursor:"pointer",fontSize:"16px",
            fontWeight:"700",flexShrink:0,padding:0,lineHeight:1}}>
          ×
        </button>
      )}
    </div>
  );
}
