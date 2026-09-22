import { useState, useEffect, useCallback } from "react";

export default function InterpreterAvailability({ supabase, interpreteId }) {
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({fecha:"",hora_desde:"",hora_hasta:"",disponible:true,modalidad:"Ambas",observaciones:""});
  const [editing,setEditing]=useState(null);

  const load=useCallback(async()=>{
    if(!interpreteId){setLoading(false);return;}
    setLoading(true);
    const {data}=await supabase.from("disponibilidad_interpretes").select("*").eq("interprete_id",interpreteId).order("fecha",{ascending:true}).order("hora_desde",{ascending:true});
    setItems(data||[]);
    setLoading(false);
  },[supabase,interpreteId]);
  useEffect(()=>{load();},[load]);

  const reset=()=>{setEditing(null);setForm({fecha:"",hora_desde:"",hora_hasta:"",disponible:true,modalidad:"Ambas",observaciones:""});};
  const save=async()=>{
    if(!form.fecha||!interpreteId) return;
    const hasDesde=Boolean(form.hora_desde);
    const hasHasta=Boolean(form.hora_hasta);
    if(hasDesde!==hasHasta) return;
    if(hasDesde&&hasHasta&&form.hora_hasta<=form.hora_desde) return;
    setSaving(true);
    const payload={...form,interprete_id:interpreteId,hora_desde:form.hora_desde||null,hora_hasta:form.hora_hasta||null};
    const result=editing
      ? await supabase.from("disponibilidad_interpretes").update(payload).eq("id",editing).eq("interprete_id",interpreteId)
      : await supabase.from("disponibilidad_interpretes").insert(payload);
    setSaving(false);
    if(!result.error){reset();await load();}
  };
  const edit=item=>{setEditing(item.id);setForm({fecha:item.fecha||"",hora_desde:item.hora_desde?.slice(0,5)||"",hora_hasta:item.hora_hasta?.slice(0,5)||"",disponible:item.disponible,modalidad:item.modalidad||"Ambas",observaciones:item.observaciones||""});};
  const remove=async id=>{const {error}=await supabase.from("disponibilidad_interpretes").delete().eq("id",id).eq("interprete_id",interpreteId);if(!error)await load();};

  return <div style={{background:"#F5F7FB",minHeight:"calc(100vh - 78px)",padding:"28px 20px 60px"}}>
    <div style={{maxWidth:"1100px",margin:"0 auto"}}>
      <div style={{marginBottom:"22px"}}><div style={{fontSize:"28px",fontWeight:"650",color:"#162654"}}>Mi disponibilidad</div><div style={{fontSize:"14px",color:"#64748B",marginTop:"5px"}}>Indica los días y horarios en que estás disponible para recibir asignaciones.</div></div>
      <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"14px",padding:"18px",marginBottom:"18px"}}>
        <div style={{fontSize:"15px",fontWeight:"650",color:"#162654",marginBottom:"12px"}}>{editing?"Editar disponibilidad":"Agregar disponibilidad"}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:"10px"}}>
          <label>Fecha<input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/></label>
          <label>Desde<input type="time" value={form.hora_desde} onChange={e=>setForm({...form,hora_desde:e.target.value})}/></label>
          <label>Hasta<input type="time" value={form.hora_hasta} onChange={e=>setForm({...form,hora_hasta:e.target.value})}/></label>
          <label>Modalidad<select value={form.modalidad} onChange={e=>setForm({...form,modalidad:e.target.value})}><option>Ambas</option><option>Presencial</option><option>Remoto</option></select></label>
          <label>Estado<select value={form.disponible?"Disponible":"No disponible"} onChange={e=>setForm({...form,disponible:e.target.value==="Disponible"})}><option>Disponible</option><option>No disponible</option></select></label>
        </div>
        <label style={{display:"block",marginTop:"18px",fontSize:"14px",fontWeight:"600",color:"#334155"}}>Observaciones<textarea value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})} rows={2} style={{marginTop:"7px",display:"block",width:"100%",boxSizing:"border-box",padding:"9px 11px",border:"1px solid #CBD5E1",borderRadius:"8px",fontSize:"14px",fontFamily:"inherit",color:"#26384F"}}/></label>
        <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",marginTop:"12px"}}>{editing&&<button onClick={reset}>Cancelar</button>}<button onClick={save} disabled={saving||!form.fecha}>{saving?"Guardando…":editing?"Guardar cambios":"Agregar"}</button></div>
      </div>
      <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:"14px",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",fontWeight:"650",color:"#162654",borderBottom:"1px solid #EEF2F7"}}>Mis registros</div>
        {loading?<div style={{padding:"24px",color:"#64748B"}}>Cargando…</div>:items.length===0?<div style={{padding:"24px",color:"#64748B"}}>No has registrado disponibilidad todavía.</div>:items.map(item=><div key={item.id} style={{padding:"14px 18px",borderBottom:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}><div><b>{item.fecha}</b><div style={{fontSize:"13px",color:"#64748B"}}>{item.hora_desde&&item.hora_hasta?item.hora_desde.slice(0,5)+" – "+item.hora_hasta.slice(0,5):"Todo el día"} · {item.modalidad} · {item.disponible?"Disponible":"No disponible"}</div>{item.observaciones&&<div style={{fontSize:"12px",color:"#64748B"}}>{item.observaciones}</div>}</div><div><button onClick={()=>edit(item)}>Editar</button> <button onClick={()=>remove(item.id)}>Eliminar</button></div></div>)}
      </div>
    </div>
  </div>;
}