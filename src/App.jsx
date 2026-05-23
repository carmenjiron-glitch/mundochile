// MundoChile v2.0 — Gestión de Interpretaciones
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_KEY;
const sb = createClient(SB_URL, SB_KEY);

// ─── PALETA ──────────────────────────────────────────────────────────────────
const C = {
  azul:"#3a7bd5", azulOsc:"#2563a8", azulClaro:"#eef4fd", azulBorde:"#b3d0f5",
  rojo:"#e63946", rojoClaro:"#fdeef0", rojoBorde:"#f5b8bc",
  verde:"#16a34a", verdeClaro:"#f0fdf4", verdeBorde:"#86efac",
  amarillo:"#f59e0b", amarilloVivo:"#fef08a", amarilloFondo:"#fffbeb",
  gris:"#f8fafc", grisMed:"#f1f5f9", grisBorde:"#e2e8f0",
  texto:"#0f172a", textoMed:"#475569", textoSuave:"#94a3b8", blanco:"#ffffff",
};
const PALETA_EVS = [
  {borde:"#3a7bd5",fondo:"#eef4fd"},{borde:"#16a34a",fondo:"#f0fdf4"},
  {borde:"#7c3aed",fondo:"#f5f3ff"},{borde:"#d97706",fondo:"#fffbeb"},
  {borde:"#db2777",fondo:"#fdf2f8"},{borde:"#0891b2",fondo:"#ecfeff"},
  {borde:"#ea580c",fondo:"#fff7ed"},{borde:"#65a30d",fondo:"#f7fee7"},
];
const colorEv = (id) => PALETA_EVS[(id||0)%8];

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const TIPOS      = ["Simultánea","Consecutiva","Whispering"];
const MODALIDADES= ["remoto","presencial","hibrido"];
const LBL_MODAL  = {remoto:"Remoto",presencial:"Presencial",hibrido:"Híbrido"};
const PLATAFORMAS= ["Zoom MundoChile","Zoom Cliente","Teams","Webex","Meet","Otro"];
const ZOOM_ADMIN = ["Magix","RLA","El mismo cliente","Otro audiovisual"];
const JORNADAS   = ["Media Jornada","Jornada Completa","1 hora","2 horas",
                    "Media Jornada + 1 hora adicional","Jornada Completa + 1 hora adicional",
                    "Otro horario personalizado"];
const ESTADOS    = ["Pendiente","Facturado","Cancelado"];
const DIAS_SEM   = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MESES_L    = ["enero","febrero","marzo","abril","mayo","junio",
                    "julio","agosto","septiembre","octubre","noviembre","diciembre"];
const MESES_C    = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ─── FECHAS ──────────────────────────────────────────────────────────────────
const hoy = () => toISO(new Date());
const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const desdeISO = (s) => { const [y,m,d]=s.split("-"); return new Date(+y,+m-1,+d); };
const diasNombres = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const formatLargo = (iso) => { if(!iso) return ""; const d=desdeISO(iso); return `${diasNombres[d.getDay()]}, ${d.getDate()} de ${MESES_L[d.getMonth()]} de ${d.getFullYear()}`; };
const formatCorto = (iso) => { if(!iso) return ""; const d=desdeISO(iso); return `${d.getDate()} ${MESES_C[d.getMonth()]} ${d.getFullYear()}`; };
const semanaDesde = (off) => {
  const d=new Date(), dow=d.getDay()===0?6:d.getDay()-1;
  d.setDate(d.getDate()-dow+off*7);
  return Array.from({length:7},(_,i)=>{ const x=new Date(d); x.setDate(d.getDate()+i); return x; });
};
const HORAS = (() => { const h=[]; for(let x=6;x<=22;x++) for(let m of [0,15,30,45]) h.push(`${String(x).padStart(2,"0")}:${String(m).padStart(2,"0")}`); return h; })();

// ─── ESTILOS BASE ─────────────────────────────────────────────────────────────
const S = {
  inp: {width:"100%",padding:"9px 12px",border:`1.5px solid ${C.grisBorde}`,borderRadius:"8px",fontSize:"14px",color:C.texto,background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"},
  sel: {width:"100%",padding:"9px 12px",border:`1.5px solid ${C.grisBorde}`,borderRadius:"8px",fontSize:"14px",color:C.texto,background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit",cursor:"pointer"},
  lbl: {fontSize:"12px",fontWeight:"700",color:C.textoMed,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"5px",display:"block"},
  fila:{display:"flex",gap:"12px",flexWrap:"wrap"},
  camp:{flex:"1",minWidth:"140px"},
  btnA:{padding:"10px 20px",background:C.azul,color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"14px",fontFamily:"inherit"},
  btnR:{padding:"10px 20px",background:C.rojo,color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"14px",fontFamily:"inherit"},
  btnV:{padding:"10px 20px",background:C.verde,color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"14px",fontFamily:"inherit"},
  btnG:{padding:"10px 20px",background:"#fff",color:C.textoMed,border:`1.5px solid ${C.grisBorde}`,borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px",fontFamily:"inherit"},
  btnP:{padding:"6px 12px",background:C.azulClaro,color:C.azul,border:`1px solid ${C.azulBorde}`,borderRadius:"6px",cursor:"pointer",fontWeight:"700",fontSize:"12px",fontFamily:"inherit"},
};

// ─── ESTADO VACÍO ─────────────────────────────────────────────────────────────
const evVacio = () => ({
  id:null, cliente_id:"", nro_oc:"", nombre_evento:"", tipo:"Simultánea",
  fecha_inicio:hoy(), fecha_termino:hoy(), hora_inicio:"09:00", hora_termino:"13:00",
  jornada:"Media Jornada", jornada_personalizada:"", lugar:"", lugar_detalle:"",
  modalidad:"remoto", plataforma:"Zoom MundoChile", zoom_owner:"mundochile",
  zoom_administrador:"", estado:"Pendiente", comentarios:"",
  asignaciones:[], dias:[],
});
const asigVacia = () => ({interprete_id:"",par_id:"",nro_ot:"",nro_boleta:"",es_boleta_adicional:false,es_host_zoom:false,rol:"Principal",hora_presentacion:"",estado_pago:"Pendiente"});
const diaVacio  = (fecha) => ({fecha,hora_inicio:"09:00",hora_termino:"13:00",jornada:"Media Jornada",jornada_personalizada:"",asignaciones:[],equipos:[]});
const eqVacio   = () => ({tipo_equipo:"fijo",proveedor_id:"",proveedor_nombre:"",proveedor_contacto:"",proveedor_telefono:"",num_receptores:0,num_cabinas:0,num_asistentes:0,asistentes_origen:"mismo_proveedor",asistentes_otro_proveedor:"",asistentes_mundochile_nombres:"",portatiles_origen:"mundochile",proveedor_portatiles:"",dia_montaje:"",hora_montaje:"",contacto_in_situ:"",instrucciones:""});

// ─── COMPONENTES PEQUEÑOS ────────────────────────────────────────────────────
function Logo({size=32}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor={C.azul}/><stop offset="1" stopColor={C.azulOsc}/></linearGradient></defs>
      <circle cx="20" cy="20" r="20" fill="url(#lg)"/>
      <text x="20" y="26" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" fontFamily="system-ui">MC</text>
    </svg>
  );
}

function Badge({texto,color=C.azul,fondo=C.azulClaro,icono=""}) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"3px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"700",color,background:fondo,border:`1px solid ${color}33`}}>{icono}{texto}</span>;
}

function CampoCopia({valor}) {
  const [ok,setOk]=useState(false);
  if(!valor) return <span style={{color:C.textoSuave}}>—</span>;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
      <span>{valor}</span>
      <button onClick={()=>{navigator.clipboard.writeText(valor);setOk(true);setTimeout(()=>setOk(false),1500);}}
        style={{background:"none",border:"none",cursor:"pointer",color:ok?C.verde:C.textoSuave,fontSize:"13px",padding:0}}>
        {ok?"✓":"⧉"}
      </button>
    </span>
  );
}

function SelHora({value,onChange,placeholder="Hora"}) {
  return (
    <select style={S.sel} value={value||""} onChange={e=>onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {HORAS.map(h=><option key={h} value={h}>{h} hrs</option>)}
    </select>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function PantallaLogin({onLogin}) {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState("");
  const [ver,setVer]=useState(false); const [carg,setCarg]=useState(false); const [err,setErr]=useState("");
  const ingresar = async() => {
    if(!email||!pass){setErr("Completa email y contraseña");return;}
    setCarg(true);setErr("");
    const {data,error}=await sb.auth.signInWithPassword({email,password:pass});
    if(error){setErr("Email o contraseña incorrectos");setCarg(false);return;}
    onLogin(data.user);
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.azulClaro} 0%,#fff 50%,${C.rojoClaro} 100%)`}}>
      <div style={{background:"#fff",borderRadius:"20px",padding:"48px 40px",width:"100%",maxWidth:"400px",boxShadow:"0 20px 60px rgba(58,123,213,0.15)"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <Logo size={56}/>
          <div style={{marginTop:"12px",fontSize:"24px",fontWeight:"900",color:C.texto}}>MUNDO<span style={{color:C.rojo}}>CHILE</span></div>
          <div style={{color:C.textoSuave,fontSize:"14px",marginTop:"4px"}}>Gestión de Interpretaciones</div>
        </div>
        {err&&<div style={{background:C.rojoClaro,color:C.rojo,padding:"10px 14px",borderRadius:"8px",marginBottom:"16px",fontSize:"14px",fontWeight:"600"}}>{err}</div>}
        <div style={{marginBottom:"16px"}}>
          <label style={S.lbl}>📧 Email</label>
          <input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ingresar()} placeholder="tu@email.com"/>
        </div>
        <div style={{marginBottom:"24px"}}>
          <label style={S.lbl}>🔒 Contraseña</label>
          <div style={{position:"relative"}}>
            <input style={{...S.inp,paddingRight:"42px"}} type={ver?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ingresar()} placeholder="••••••••"/>
            <button onClick={()=>setVer(v=>!v)} style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"18px",color:C.textoSuave}}>{ver?"🙈":"👁"}</button>
          </div>
        </div>
        <button onClick={ingresar} disabled={carg} style={{...S.btnA,width:"100%",padding:"14px",fontSize:"16px",opacity:carg?0.7:1}}>{carg?"Ingresando…":"Ingresar"}</button>
      </div>
    </div>
  );
}

// ─── TARJETA EVENTO ───────────────────────────────────────────────────────────
function TarjetaEvento({ev,clientes,pares,interpretes,onClick}) {
  const col=colorEv(ev.id), cliente=clientes.find(c=>c.id===ev.cliente_id), esZoomMC=ev.plataforma==="Zoom MundoChile";
  return (
    <div onClick={onClick} style={{borderRadius:"10px",padding:"12px",border:`2px solid ${col.borde}`,background:col.fondo,cursor:"pointer",marginBottom:"8px",borderLeft:`5px solid ${col.borde}`,transition:"transform 0.1s"}}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
      <div style={{fontSize:"13px",fontWeight:"900",color:C.rojo,marginBottom:"4px"}}>🏢 {cliente?.nombre_empresa||"—"}</div>
      {ev.nombre_evento&&<div style={{fontSize:"13px",fontWeight:"700",color:C.texto,marginBottom:"4px"}}>{ev.nombre_evento}</div>}
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap",alignItems:"center",marginBottom:"6px"}}>
        <span style={{fontSize:"12px",fontWeight:"700",color:C.textoMed}}>{ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)}</span>
        <Badge texto={ev.tipo} icono="🎙 " color={ev.tipo==="Simultánea"?C.azul:ev.tipo==="Consecutiva"?C.verde:"#7c3aed"} fondo={ev.tipo==="Simultánea"?C.azulClaro:ev.tipo==="Consecutiva"?C.verdeClaro:"#f5f3ff"}/>
      </div>
      {esZoomMC&&<div style={{background:C.amarilloVivo,color:"#1a1a1a",fontSize:"12px",fontWeight:"800",padding:"3px 10px",borderRadius:"20px",display:"inline-block",marginBottom:"6px"}}>🎛 Zoom MundoChile</div>}
      {(ev.asignaciones||[]).slice(0,3).map((a,i)=>{
        const interp=interpretes.find(x=>x.id===a.interprete_id), par=pares.find(p=>p.id===a.par_id);
        return <div key={i} style={{marginBottom:"4px"}}>
          {interp&&<div style={{fontSize:"13px",fontWeight:"800",color:C.texto}}>👤 {interp.nombre}{interp.apellido?" "+interp.apellido:""}</div>}
          <div style={{fontSize:"13px",fontWeight:"700",color:C.azulOsc}}>🌐 {par?.descripcion||"—"}</div>
        </div>;
      })}
      {(ev.asignaciones||[]).length>3&&<div style={{fontSize:"12px",color:C.textoSuave}}>+{(ev.asignaciones||[]).length-3} más</div>}
      {ev.estado==="Facturado"&&<div style={{marginTop:"6px"}}><Badge texto="Facturado" color={C.azulOsc} fondo={C.azulClaro} icono="✅ "/></div>}
    </div>
  );
}

// ─── MODAL EVENTO ─────────────────────────────────────────────────────────────
function ModalEvento({eventoInicial,clientes,interpretes,pares,proveedores,todos_eventos,perfil,onGuardar,onCerrar,onNuevoCliente,onNuevoInterprete}) {
  const [form,setForm]=useState(()=>eventoInicial?JSON.parse(JSON.stringify(eventoInicial)):evVacio());
  const [tab,setTab]=useState("general");
  const [guardando,setGuardando]=useState(false);
  const [error,setError]=useState("");
  const setF=useCallback((k,v)=>setForm(f=>({...f,[k]:v})),[]);

  useEffect(()=>{
    if(!form.fecha_inicio||!form.fecha_termino) return;
    const ini=desdeISO(form.fecha_inicio), fin=desdeISO(form.fecha_termino);
    if(fin<ini) return;
    const diff=Math.round((fin-ini)/86400000);
    if(diff===0){setForm(f=>({...f,dias:[]}));return;}
    const nuevos=[];
    for(let i=0;i<=diff;i++){const d=new Date(ini);d.setDate(ini.getDate()+i);const iso=toISO(d);nuevos.push(form.dias.find(x=>x.fecha===iso)||diaVacio(iso));}
    setForm(f=>({...f,dias:nuevos}));
  },[form.fecha_inicio,form.fecha_termino]);

  const esMultidia=form.dias.length>1;

  const conflicto=(interp_id)=>{
    if(!interp_id) return null;
    return todos_eventos.find(ev=>{
      if(ev.id===form.id) return false;
      if(!(ev.fecha_inicio<=form.fecha_termino&&ev.fecha_termino>=form.fecha_inicio)) return false;
      return (ev.asignaciones||[]).some(a=>a.interprete_id===interp_id);
    });
  };

  const guardar=async()=>{
    if(!form.cliente_id){setError("Selecciona un cliente");return;}
    setGuardando(true);setError("");
    try {
      const payload={
        cliente_id:form.cliente_id||null, nro_oc:form.nro_oc||"", nombre_evento:form.nombre_evento||"",
        tipo:form.tipo||"Simultánea", fecha_inicio:form.fecha_inicio, fecha_termino:form.fecha_termino,
        hora_inicio:form.hora_inicio||"09:00", hora_termino:form.hora_termino||"13:00",
        jornada:form.jornada||"Media Jornada", jornada_personalizada:form.jornada_personalizada||"",
        lugar:form.lugar||"", lugar_detalle:form.lugar_detalle||"", modalidad:form.modalidad||"remoto",
        plataforma:form.plataforma||"", zoom_owner:form.zoom_owner||"mundochile",
        zoom_administrador:form.zoom_administrador||"", estado:form.estado||"Pendiente",
        comentarios:form.comentarios||"", edited_by:perfil?.id||null, edited_by_nombre:perfil?.nombre||"",
      };
      let eventoId=form.id;
      if(form.id){const{error:e}=await sb.from("eventos").update(payload).eq("id",form.id);if(e)throw e;}
      else {
        payload.created_by=perfil?.id||null; payload.created_by_nombre=perfil?.nombre||"";
        const{data,error:e}=await sb.from("eventos").insert(payload).select().single();
        if(e)throw e; eventoId=data.id;
      }
      // Limpiar
      await sb.from("asignaciones").delete().eq("evento_id",eventoId);
      const {data:diasExist}=await sb.from("evento_dias").select("id").eq("evento_id",eventoId);
      const dIds=(diasExist||[]).map(d=>d.id);
      if(dIds.length>0){
        await sb.from("asignaciones_dia").delete().in("evento_dia_id",dIds);
        await sb.from("equipos_dia").delete().in("evento_dia_id",dIds);
      }
      await sb.from("evento_dias").delete().eq("evento_id",eventoId);
      // Insertar asignaciones (un día)
      if(!esMultidia&&form.asignaciones.length>0){
        const asigs=form.asignaciones.filter(a=>a.interprete_id&&a.par_id).map(a=>({
          evento_id:eventoId, interprete_id:a.interprete_id, par_id:a.par_id,
          nro_ot:a.nro_ot||"", nro_boleta:a.nro_boleta||"",
          es_boleta_adicional:!!a.es_boleta_adicional, es_host_zoom:!!a.es_host_zoom,
          rol:a.rol||"Principal", hora_presentacion:a.hora_presentacion||null, estado_pago:a.estado_pago||"Pendiente",
        }));
        if(asigs.length>0){const{error:e}=await sb.from("asignaciones").insert(asigs);if(e)throw e;}
      }
      // Insertar días
      if(esMultidia){
        for(let i=0;i<form.dias.length;i++){
          const dia=form.dias[i];
          const{data:dD,error:eD}=await sb.from("evento_dias").insert({
            evento_id:eventoId, fecha:dia.fecha, orden:i+1,
            hora_inicio:dia.hora_inicio||"09:00", hora_termino:dia.hora_termino||"13:00",
            jornada:dia.jornada||"Media Jornada", jornada_personalizada:dia.jornada_personalizada||"",
          }).select().single();
          if(eD)throw eD;
          const asigsDia=(dia.asignaciones||[]).filter(a=>a.interprete_id&&a.par_id).map(a=>({
            evento_dia_id:dD.id, interprete_id:a.interprete_id, par_id:a.par_id,
            nro_ot:a.nro_ot||"", nro_boleta:a.nro_boleta||"",
            es_boleta_adicional:!!a.es_boleta_adicional, es_host_zoom:!!a.es_host_zoom,
            rol:a.rol||"Principal", hora_presentacion:a.hora_presentacion||null, estado_pago:a.estado_pago||"Pendiente",
          }));
          if(asigsDia.length>0){const{error:eA}=await sb.from("asignaciones_dia").insert(asigsDia);if(eA)throw eA;}
          if(form.modalidad!=="remoto"&&(dia.equipos||[]).length>0){
            const eqs=dia.equipos.map(eq=>({
              evento_dia_id:dD.id, tipo_equipo:eq.tipo_equipo||"fijo",
              proveedor_id:eq.proveedor_id||null, proveedor_nombre:eq.proveedor_nombre||"",
              proveedor_contacto:eq.proveedor_contacto||"", proveedor_telefono:eq.proveedor_telefono||"",
              num_receptores:Number(eq.num_receptores)||0, num_cabinas:Number(eq.num_cabinas)||0,
              num_asistentes:Number(eq.num_asistentes)||0, asistentes_origen:eq.asistentes_origen||"mismo_proveedor",
              asistentes_otro_proveedor:eq.asistentes_otro_proveedor||"",
              asistentes_mundochile_nombres:eq.asistentes_mundochile_nombres||"",
              portatiles_origen:eq.portatiles_origen||"mundochile", proveedor_portatiles:eq.proveedor_portatiles||"",
              dia_montaje:eq.dia_montaje||null, hora_montaje:eq.hora_montaje||null,
              contacto_in_situ:eq.contacto_in_situ||"", instrucciones:eq.instrucciones||"",
            }));
            const{error:eE}=await sb.from("equipos_dia").insert(eqs);if(eE)throw eE;
          }
        }
      }
      onGuardar();
    } catch(e){setError("Error al guardar: "+(e.message||JSON.stringify(e)));}
    finally{setGuardando(false);}
  };

  // Fila de asignación
  const FilaAsig=({a,idx,dIdx=null})=>{
    const [alerta,setAlerta]=useState(null);
    const edit=(k,v)=>{
      if(dIdx===null) setForm(f=>{const asigs=[...f.asignaciones];asigs[idx]={...asigs[idx],[k]:v};return{...f,asignaciones:asigs};});
      else setForm(f=>{const dias=[...f.dias],asigs=[...dias[dIdx].asignaciones];asigs[idx]={...asigs[idx],[k]:v};dias[dIdx]={...dias[dIdx],asignaciones:asigs};return{...f,dias};});
      if(k==="interprete_id"&&v) setAlerta(conflicto(v));
    };
    const rem=()=>{
      if(dIdx===null) setForm(f=>{const asigs=[...f.asignaciones];asigs.splice(idx,1);return{...f,asignaciones:asigs};});
      else setForm(f=>{const dias=[...f.dias],asigs=[...dias[dIdx].asignaciones];asigs.splice(idx,1);dias[dIdx]={...dias[dIdx],asignaciones:asigs};return{...f,dias};});
    };
    const interp=interpretes.find(x=>x.id===a.interprete_id);
    return (
      <div style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"10px",padding:"14px",marginBottom:"10px",background:C.gris}}>
        {alerta&&<div style={{background:"#fef3c7",border:"1px solid #f59e0b",borderRadius:"8px",padding:"8px 12px",marginBottom:"10px",fontSize:"13px",color:"#92400e",fontWeight:"600"}}>
          ⚠️ Este intérprete ya tiene asignación en "{alerta.nombre_evento||alerta.clientes?.nombre_empresa||"otro evento"}"
          <button onClick={()=>setAlerta(null)} style={{marginLeft:"8px",background:"none",border:"none",cursor:"pointer",color:"#92400e",fontWeight:"800"}}>✕</button>
        </div>}
        <div style={S.fila}>
          <div style={{...S.camp,minWidth:"200px"}}>
            <label style={S.lbl}>👤 Intérprete</label>
            <div style={{display:"flex",gap:"6px"}}>
              <select style={S.sel} value={a.interprete_id||""} onChange={e=>edit("interprete_id",e.target.value?Number(e.target.value):"")}>
                <option value="">Seleccionar…</option>
                {interpretes.filter(i=>i.activo).map(i=><option key={i.id} value={i.id}>{i.nombre}{i.apellido?" "+i.apellido:""}{i.es_host_zoom?" 🎛":""}{i.ciudad?` · ${i.ciudad}`:""}</option>)}
              </select>
              <button onClick={()=>onNuevoInterprete(idx,dIdx)} style={S.btnP}>+</button>
            </div>
            {interp&&<div style={{fontSize:"11px",color:C.textoSuave,marginTop:"4px",display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {interp.ciudad&&<span>📍 {interp.ciudad}</span>}
              {interp.modalidad_trabajo&&<span>{interp.modalidad_trabajo==="ambas"?"💻📍":interp.modalidad_trabajo==="online"?"💻":"📍"}</span>}
              {interp.es_host_zoom&&<span style={{color:C.rojo,fontWeight:"700"}}>🎛 Host Zoom MundoChile</span>}
            </div>}
          </div>
          <div style={S.camp}>
            <label style={S.lbl}>🌐 Par de idiomas</label>
            <select style={{...S.sel,fontWeight:"700"}} value={a.par_id||""} onChange={e=>edit("par_id",e.target.value?Number(e.target.value):"")}>
              <option value="">Seleccionar…</option>
              {[...["Inglés","Portugués","Francés"].reduce((acc,pr)=>{const p=pares.filter(x=>x.activo!==false&&x.idioma_origen===pr).sort((a,b)=>["Inglés","Portugués","Francés"].indexOf(a.idioma_origen)-["Inglés","Portugués","Francés"].indexOf(b.idioma_origen));acc.push(...p);return acc;},[]),...pares.filter(p=>p.activo!==false&&!["Inglés","Portugués","Francés"].includes(p.idioma_origen)).sort((a,b)=>a.descripcion?.localeCompare(b.descripcion||""))].map(p=><option key={p.id} value={p.id}>{p.descripcion}</option>)}
            </select>
          </div>
        </div>
        <div style={{...S.fila,marginTop:"10px"}}>
          <div style={S.camp}><label style={S.lbl}>N° OT</label><input style={S.inp} defaultValue={a.nro_ot} onBlur={e=>edit("nro_ot",e.target.value)} placeholder="OT-0000"/></div>
          <div style={S.camp}><label style={S.lbl}>N° Boleta</label><input style={S.inp} defaultValue={a.nro_boleta} onBlur={e=>edit("nro_boleta",e.target.value)} placeholder="628"/></div>
          <div style={S.camp}><label style={S.lbl}>🕐 Hora presentación</label><SelHora value={a.hora_presentacion} onChange={v=>edit("hora_presentacion",v)} placeholder="Misma del evento"/></div>
        </div>
        <div style={{display:"flex",gap:"16px",marginTop:"10px",flexWrap:"wrap",alignItems:"center"}}>
          <label style={{display:"flex",gap:"6px",alignItems:"center",cursor:"pointer",fontSize:"13px",color:C.textoMed}}>
            <input type="checkbox" checked={!!a.es_boleta_adicional} onChange={e=>edit("es_boleta_adicional",e.target.checked)}/> Boleta adicional (B#)
          </label>
          {form.plataforma==="Zoom MundoChile"&&<label style={{display:"flex",gap:"6px",alignItems:"center",cursor:"pointer",fontSize:"13px",color:C.rojo,fontWeight:"700"}}>
            <input type="checkbox" checked={!!a.es_host_zoom} onChange={e=>edit("es_host_zoom",e.target.checked)}/> 🎛 Host alternativo Zoom MundoChile
          </label>}
          <div style={{marginLeft:"auto"}}><button onClick={rem} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontWeight:"700",fontSize:"13px"}}>✕ Quitar</button></div>
        </div>
      </div>
    );
  };

  const addAsig=(dIdx=null)=>{
    if(dIdx===null) setForm(f=>({...f,asignaciones:[...f.asignaciones,asigVacia()]}));
    else setForm(f=>{const dias=[...f.dias];dias[dIdx]={...dias[dIdx],asignaciones:[...dias[dIdx].asignaciones,asigVacia()]};return{...f,dias};});
    setTimeout(()=>{const m=document.querySelector("[data-modal-scroll]");if(m)m.scrollTop=m.scrollHeight;},80);
  };

  const addEq=(dIdx)=>setForm(f=>{const dias=[...f.dias];dias[dIdx]={...dias[dIdx],equipos:[...(dias[dIdx].equipos||[]),eqVacio()]};return{...f,dias};});
  const editEq=(dIdx,eIdx,k,v)=>setForm(f=>{const dias=[...f.dias],eqs=[...(dias[dIdx].equipos||[])];eqs[eIdx]={...eqs[eIdx],[k]:v};dias[dIdx]={...dias[dIdx],equipos:eqs};return{...f,dias};});

  const TABS=esMultidia
    ?[{id:"general",lbl:"📋 Detalles"},{id:"dias",lbl:"📅 Por Día"}]
    :[{id:"general",lbl:"📋 Detalles"},{id:"interpretes",lbl:"🎙 Intérpretes"}];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"20px",width:"100%",maxWidth:"800px",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.25)"}}>
        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.azulBorde}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,background:C.azul,borderRadius:"20px 20px 0 0"}}>
          <div>
            <div style={{fontSize:"18px",fontWeight:"900",color:"#fff"}}>{form.id?"✏️ Editar evento":"➕ Nuevo evento"}</div>
            {form.id&&<div style={{fontSize:"12px",color:"rgba(255,255,255,0.7)",marginTop:"2px"}}>ID #{form.id}</div>}
          </div>
          <button onClick={onCerrar} style={{background:"none",border:"none",cursor:"pointer",fontSize:"24px",color:"#fff",lineHeight:1}}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.grisBorde}`,flexShrink:0}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"12px 20px",background:"none",border:"none",cursor:"pointer",borderBottom:tab===t.id?`3px solid ${C.azul}`:"3px solid transparent",color:tab===t.id?C.azul:C.textoSuave,fontWeight:tab===t.id?"800":"600",fontSize:"14px",fontFamily:"inherit"}}>{t.lbl}</button>)}
        </div>
        {/* Cuerpo */}
        <div data-modal-scroll style={{overflowY:"auto",flex:1,padding:"20px 24px"}}>
          {error&&<div style={{background:C.rojoClaro,color:C.rojo,padding:"10px 14px",borderRadius:"8px",marginBottom:"14px",fontSize:"14px",fontWeight:"600"}}>{error}</div>}

          {/* ── TAB GENERAL ── */}
          {tab==="general"&&<>
            {/* Cliente */}
            <div style={{marginBottom:"14px"}}>
              <label style={S.lbl}>🏢 Cliente *</label>
              <div style={{display:"flex",gap:"8px"}}>
                <select style={S.sel} value={form.cliente_id||""} onChange={e=>setF("cliente_id",e.target.value?Number(e.target.value):"")}>
                  <option value="">Seleccionar cliente…</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre_empresa}</option>)}
                </select>
                <button onClick={onNuevoCliente} style={S.btnP}>+ Nuevo</button>
              </div>
            </div>
            {/* Nombre y OC */}
            <div style={{...S.fila,marginBottom:"14px"}}>
              <div style={{...S.camp,flex:2}}><label style={S.lbl}>Nombre del evento</label><input style={S.inp} value={form.nombre_evento} onChange={e=>setF("nombre_evento",e.target.value)} placeholder="Conferencia anual…"/></div>
              <div style={S.camp}><label style={S.lbl}>N° OC</label><input style={S.inp} value={form.nro_oc} onChange={e=>setF("nro_oc",e.target.value)} placeholder="OC-0000"/></div>
            </div>
            {/* Tipo + Modalidad */}
            <div style={{...S.fila,marginBottom:"14px"}}>
              <div style={S.camp}><label style={S.lbl}>🎙 Tipo de interpretación</label>
                <select style={S.sel} value={form.tipo} onChange={e=>setF("tipo",e.target.value)}>{TIPOS.map(t=><option key={t}>{t}</option>)}</select></div>
              <div style={S.camp}><label style={S.lbl}>🔄 Modalidad</label>
                <select style={S.sel} value={form.modalidad} onChange={e=>setF("modalidad",e.target.value)}>{MODALIDADES.map(m=><option key={m} value={m}>{LBL_MODAL[m]}</option>)}</select></div>
            </div>
            {/* Fechas */}
            <div style={{...S.fila,marginBottom:"14px"}}>
              <div style={S.camp}><label style={S.lbl}>📅 Fecha inicio</label><input style={S.inp} type="date" value={form.fecha_inicio} onChange={e=>setF("fecha_inicio",e.target.value)}/></div>
              <div style={S.camp}><label style={S.lbl}>📅 Fecha término</label><input style={S.inp} type="date" value={form.fecha_termino} onChange={e=>setF("fecha_termino",e.target.value)}/></div>
            </div>
            {/* Horas + Jornada */}
            {!esMultidia&&<div style={{...S.fila,marginBottom:"14px"}}>
              <div style={S.camp}><label style={S.lbl}>🕐 Hora inicio</label><SelHora value={form.hora_inicio} onChange={v=>setF("hora_inicio",v)}/></div>
              <div style={S.camp}><label style={S.lbl}>🕐 Hora término</label><SelHora value={form.hora_termino} onChange={v=>setF("hora_termino",v)}/></div>
              <div style={S.camp}><label style={S.lbl}>⏱ Jornada</label>
                <select style={S.sel} value={form.jornada} onChange={e=>setF("jornada",e.target.value)}>{JORNADAS.map(j=><option key={j}>{j}</option>)}</select></div>
            </div>}
            {form.jornada==="Otro horario personalizado"&&!esMultidia&&<div style={{marginBottom:"14px"}}><label style={S.lbl}>✍️ Horario personalizado</label><input style={S.inp} value={form.jornada_personalizada} onChange={e=>setF("jornada_personalizada",e.target.value)}/></div>}
            {/* Plataforma (remoto/híbrido) */}
            {(form.modalidad==="remoto"||form.modalidad==="hibrido")&&<>
              <div style={{...S.fila,marginBottom:"14px"}}>
                <div style={S.camp}><label style={S.lbl}>💻 Plataforma</label>
                  <select style={S.sel} value={form.plataforma} onChange={e=>setF("plataforma",e.target.value)}>{PLATAFORMAS.map(p=><option key={p}>{p}</option>)}</select></div>
                {form.plataforma==="Zoom MundoChile"&&<div style={S.camp}><label style={S.lbl}>🎛 Administrador Zoom</label>
                  <select style={S.sel} value={form.zoom_administrador} onChange={e=>setF("zoom_administrador",e.target.value)}>
                    <option value="">Sin asignar</option>{ZOOM_ADMIN.map(z=><option key={z}>{z}</option>)}
                  </select></div>}
              </div>
            </>}
            {/* Lugar (presencial/híbrido) */}
            {(form.modalidad==="presencial"||form.modalidad==="hibrido")&&<>
              <div style={{marginBottom:"10px"}}><label style={S.lbl}>📍 Lugar</label><input style={S.inp} value={form.lugar} onChange={e=>setF("lugar",e.target.value)} placeholder="Hotel Intercontinental, Santiago…"/></div>
              <div style={{marginBottom:"14px"}}><label style={S.lbl}>Detalles del lugar</label><input style={S.inp} value={form.lugar_detalle} onChange={e=>setF("lugar_detalle",e.target.value)} placeholder="Sala Andes, piso 3…"/></div>
            </>}
            {/* Estado + Comentarios */}
            <div style={{...S.fila,marginBottom:"14px"}}>
              <div style={S.camp}><label style={S.lbl}>Estado</label>
                <select style={S.sel} value={form.estado} onChange={e=>setF("estado",e.target.value)}>{ESTADOS.map(e=><option key={e}>{e}</option>)}</select></div>
            </div>
            <div style={{marginBottom:"4px"}}><label style={S.lbl}>💬 Comentarios</label><textarea style={{...S.inp,minHeight:"80px",resize:"vertical"}} value={form.comentarios} onChange={e=>setF("comentarios",e.target.value)}/></div>
          </>}

          {/* ── TAB INTÉRPRETES (un día) ── */}
          {tab==="interpretes"&&!esMultidia&&<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
              <div style={{fontWeight:"800",color:C.rojo,fontSize:"17px"}}>🎙 Intérpretes asignados</div>
              <button onClick={()=>addAsig()} style={S.btnA}>+ Agregar intérprete</button>
            </div>
            {form.asignaciones.length===0&&<div style={{textAlign:"center",color:C.textoSuave,padding:"40px 20px",border:`2px dashed ${C.grisBorde}`,borderRadius:"12px"}}>Sin intérpretes — Agrega uno arriba</div>}
            {form.asignaciones.map((a,idx)=><FilaAsig key={idx} a={a} idx={idx}/>)}
            {form.asignaciones.length>0&&<button onClick={()=>addAsig()} style={{...S.btnP,width:"100%",padding:"9px"}}>+ Agregar otro intérprete</button>}
          </>}

          {/* ── TAB POR DÍA ── */}
          {tab==="dias"&&esMultidia&&form.dias.map((dia,dIdx)=>(
            <div key={dia.fecha} style={{border:`2px solid ${C.grisBorde}`,borderRadius:"14px",marginBottom:"16px",overflow:"hidden"}}>
              <div style={{background:C.grisMed,padding:"12px 16px",fontWeight:"800",color:C.azul,fontSize:"14px"}}>
                📅 Día {dIdx+1} de {form.dias.length} — {formatLargo(dia.fecha)}
              </div>
              <div style={{padding:"16px"}}>
                <div style={{...S.fila,marginBottom:"12px"}}>
                  <div style={S.camp}><label style={S.lbl}>🕐 Hora inicio</label><SelHora value={dia.hora_inicio} onChange={v=>setForm(f=>{const ds=[...f.dias];ds[dIdx]={...ds[dIdx],hora_inicio:v};return{...f,dias:ds};})}/></div>
                  <div style={S.camp}><label style={S.lbl}>🕐 Hora término</label><SelHora value={dia.hora_termino} onChange={v=>setForm(f=>{const ds=[...f.dias];ds[dIdx]={...ds[dIdx],hora_termino:v};return{...f,dias:ds};})}/></div>
                  <div style={S.camp}><label style={S.lbl}>⏱ Jornada</label>
                    <select style={S.sel} value={dia.jornada||"Media Jornada"} onChange={e=>setForm(f=>{const ds=[...f.dias];ds[dIdx]={...ds[dIdx],jornada:e.target.value};return{...f,dias:ds};})}>
                      {JORNADAS.map(j=><option key={j}>{j}</option>)}
                    </select></div>
                </div>
                {/* Intérpretes del día */}
                <div style={{marginTop:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <div style={{fontWeight:"700",color:C.rojo}}>🎙 Intérpretes de este día</div>
                    <button onClick={()=>addAsig(dIdx)} style={S.btnP}>+ Agregar</button>
                  </div>
                  {(dia.asignaciones||[]).length===0&&<div style={{color:C.textoSuave,fontSize:"13px",textAlign:"center",padding:"12px",border:`1.5px dashed ${C.grisBorde}`,borderRadius:"8px"}}>Sin intérpretes para este día</div>}
                  {(dia.asignaciones||[]).map((a,aIdx)=><FilaAsig key={aIdx} a={a} idx={aIdx} dIdx={dIdx}/>)}
                </div>
                {/* Equipos AV */}
                {form.modalidad!=="remoto"&&<div style={{marginTop:"14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <div style={{fontWeight:"700",color:C.verde}}>🔧 Equipos AV de este día</div>
                    <button onClick={()=>addEq(dIdx)} style={S.btnP}>+ Agregar equipos</button>
                  </div>
                  {(dia.equipos||[]).map((eq,eIdx)=>(
                    <div key={eIdx} style={{border:`1px solid ${C.grisBorde}`,borderRadius:"10px",padding:"14px",marginBottom:"10px",background:"#fff"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                        <div style={{fontWeight:"700",color:C.azul,fontSize:"13px"}}>Equipo #{eIdx+1}</div>
                        <button onClick={()=>setForm(f=>{const ds=[...f.dias],eqs=[...(ds[dIdx].equipos||[])];eqs.splice(eIdx,1);ds[dIdx]={...ds[dIdx],equipos:eqs};return{...f,dias:ds};})} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontWeight:"700"}}>✕</button>
                      </div>
                      <div style={S.fila}>
                        <div style={S.camp}><label style={S.lbl}>Tipo de sistema</label>
                          <select style={S.sel} value={eq.tipo_equipo} onChange={e=>editEq(dIdx,eIdx,"tipo_equipo",e.target.value)}>
                            <option value="fijo">Sistema fijo (cabina y receptores)</option>
                            <option value="portatil">Sistema portátil</option>
                            <option value="cabina_portatil">Cabina portátil</option>
                          </select></div>
                        <div style={S.camp}><label style={S.lbl}>Proveedor AV</label>
                          <select style={S.sel} value={eq.proveedor_id||""} onChange={e=>editEq(dIdx,eIdx,"proveedor_id",e.target.value?Number(e.target.value):null)}>
                            <option value="">Sin proveedor / otro</option>
                            {proveedores.filter(p=>p.activo!==false).map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                          </select></div>
                      </div>
                      <div style={{...S.fila,marginTop:"10px"}}>
                        <div style={S.camp}><label style={S.lbl}>N° receptores</label><input style={S.inp} type="number" value={eq.num_receptores} onChange={e=>editEq(dIdx,eIdx,"num_receptores",e.target.value)}/></div>
                        <div style={S.camp}><label style={S.lbl}>N° cabinas</label><input style={S.inp} type="number" value={eq.num_cabinas} onChange={e=>editEq(dIdx,eIdx,"num_cabinas",e.target.value)}/></div>
                        <div style={S.camp}><label style={S.lbl}>N° asistentes</label><input style={S.inp} type="number" value={eq.num_asistentes} onChange={e=>editEq(dIdx,eIdx,"num_asistentes",e.target.value)}/></div>
                      </div>
                      <div style={{...S.fila,marginTop:"10px"}}>
                        <div style={S.camp}><label style={S.lbl}>Contacto proveedor</label><input style={S.inp} defaultValue={eq.proveedor_contacto} onBlur={e=>editEq(dIdx,eIdx,"proveedor_contacto",e.target.value)}/></div>
                        <div style={S.camp}><label style={S.lbl}>Teléfono proveedor</label><input style={S.inp} defaultValue={eq.proveedor_telefono} onBlur={e=>editEq(dIdx,eIdx,"proveedor_telefono",e.target.value)}/></div>
                      </div>
                      <div style={{marginTop:"12px",paddingTop:"12px",borderTop:`1px solid ${C.grisBorde}`}}>
                        <div style={{fontWeight:"700",color:C.textoMed,fontSize:"12px",marginBottom:"10px",textTransform:"uppercase"}}>🔩 Montaje</div>
                        <div style={S.fila}>
                          <div style={S.camp}><label style={S.lbl}>Día de montaje</label><input style={S.inp} type="date" value={eq.dia_montaje||""} onChange={e=>editEq(dIdx,eIdx,"dia_montaje",e.target.value)}/></div>
                          <div style={S.camp}><label style={S.lbl}>Hora de montaje</label><SelHora value={eq.hora_montaje} onChange={v=>editEq(dIdx,eIdx,"hora_montaje",v)}/></div>
                          <div style={S.camp}><label style={S.lbl}>Contacto in situ</label><input style={S.inp} defaultValue={eq.contacto_in_situ} onBlur={e=>editEq(dIdx,eIdx,"contacto_in_situ",e.target.value)}/></div>
                        </div>
                        <div style={{marginTop:"10px"}}><label style={S.lbl}>Instrucciones de montaje</label><textarea style={{...S.inp,minHeight:"60px",resize:"vertical"}} defaultValue={eq.instrucciones} onBlur={e=>editEq(dIdx,eIdx,"instrucciones",e.target.value)}/></div>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{padding:"16px 24px",borderTop:`1px solid ${C.grisBorde}`,flexShrink:0,display:"flex",gap:"10px",justifyContent:"flex-end",background:C.gris,borderRadius:"0 0 20px 20px"}}>
          <button onClick={onCerrar} style={S.btnG}>Cancelar</button>
          <button onClick={guardar} disabled={guardando} style={{...S.btnA,opacity:guardando?0.7:1,minWidth:"140px"}}>{guardando?"Guardando…":"💾 Guardar cambios"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL DETALLE ────────────────────────────────────────────────────────────
function ModalDetalle({evento,clientes,interpretes,pares,perfil,onEditar,onEliminar,onCerrar,onVerFicha}) {
  if(!evento) return null;
  const cliente=clientes.find(c=>c.id===evento.cliente_id);
  const col=colorEv(evento.id);
  const esZoomMC=evento.plataforma==="Zoom MundoChile";
  const esMultidia=evento.fecha_inicio!==evento.fecha_termino;
  const nI=(id)=>{const i=interpretes.find(x=>x.id===id);return i?`${i.nombre}${i.apellido?" "+i.apellido:""}`:""};
  const nP=(id)=>pares.find(p=>p.id===id)?.descripcion||"—";
  const dias=((evento.evento_dias||evento.dias||[]).sort((a,b)=>(a.orden||0)-(b.orden||0)));

  const BotonesAccion=()=>(
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
      <button onClick={onVerFicha} style={S.btnP}>📄 Ver ficha</button>
      <button onClick={onEditar} style={{...S.btnP,background:C.amarilloFondo,color:C.amarillo,borderColor:C.amarillo}}>✏️ Editar</button>
      <button onClick={onEliminar} style={{...S.btnP,background:C.rojoClaro,color:C.rojo,borderColor:C.rojo}}>🗑 Eliminar</button>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"20px",width:"100%",maxWidth:"760px",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.25)",borderTop:`5px solid ${col.borde}`}}>
        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.grisBorde}`,display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexShrink:0}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:"20px",fontWeight:"900",color:C.rojo,marginBottom:"4px"}}>🏢 {cliente?.nombre_empresa||"—"}</div>
            {evento.nombre_evento&&<div style={{fontSize:"16px",fontWeight:"700",color:C.texto}}>{evento.nombre_evento}</div>}
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginTop:"8px"}}>
              <Badge texto={evento.tipo} color={evento.tipo==="Simultánea"?C.azul:evento.tipo==="Consecutiva"?C.verde:"#7c3aed"} fondo={evento.tipo==="Simultánea"?C.azulClaro:evento.tipo==="Consecutiva"?C.verdeClaro:"#f5f3ff"} icono="🎙 "/>
              <Badge texto={LBL_MODAL[evento.modalidad]||evento.modalidad} color={evento.modalidad==="presencial"?C.verde:evento.modalidad==="hibrido"?"#7c3aed":C.azul} fondo={evento.modalidad==="presencial"?C.verdeClaro:evento.modalidad==="hibrido"?"#f5f3ff":C.azulClaro} icono={evento.modalidad==="presencial"?"📍 ":evento.modalidad==="hibrido"?"🔀 ":"💻 "}/>
              {evento.estado==="Facturado"&&<Badge texto="Facturado" color={C.azulOsc} fondo={C.azulClaro} icono="✅ "/>}
              {evento.estado==="Cancelado"&&<Badge texto="Cancelado" color={C.rojo} fondo={C.rojoClaro} icono="❌ "/>}
              {evento.estado==="Pendiente"&&<Badge texto="Pendiente" color="#d97706" fondo="#fffbeb" icono="⏳ "/>}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px",marginLeft:"16px",flexShrink:0}}>
            <BotonesAccion/>
            <button onClick={onCerrar} style={{alignSelf:"flex-end",background:"none",border:"none",cursor:"pointer",fontSize:"22px",color:C.textoSuave}}>✕</button>
          </div>
        </div>
        {/* Cuerpo */}
        <div style={{overflowY:"auto",flex:1,padding:"20px 24px"}}>
          {/* Fechas */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
            <div style={{background:C.gris,borderRadius:"10px",padding:"12px 16px"}}>
              <div style={{fontSize:"11px",color:C.textoSuave,fontWeight:"700",textTransform:"uppercase"}}>📅 Fecha</div>
              <div style={{fontSize:"14px",fontWeight:"700",color:C.texto,marginTop:"4px"}}>{esMultidia?`${formatCorto(evento.fecha_inicio)} → ${formatCorto(evento.fecha_termino)}`:formatLargo(evento.fecha_inicio)}</div>
            </div>
            <div style={{background:C.gris,borderRadius:"10px",padding:"12px 16px"}}>
              <div style={{fontSize:"11px",color:C.textoSuave,fontWeight:"700",textTransform:"uppercase"}}>🕐 Horario</div>
              <div style={{fontSize:"14px",fontWeight:"700",color:C.texto,marginTop:"4px"}}>{evento.hora_inicio?.slice(0,5)} – {evento.hora_termino?.slice(0,5)} hrs{evento.jornada&&<span style={{fontWeight:"400",color:C.textoMed}}> · {evento.jornada}</span>}</div>
            </div>
          </div>
          {/* Plataforma */}
          {(evento.modalidad==="remoto"||evento.modalidad==="hibrido")&&<div style={{marginBottom:"16px"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:"10px",padding:"10px 16px",borderRadius:"10px",background:esZoomMC?C.amarilloVivo:C.grisMed,color:esZoomMC?"#1a1a1a":C.texto,fontWeight:"800",fontSize:"14px",border:esZoomMC?`2px solid ${C.amarillo}`:`1px solid ${C.grisBorde}`}}>
              💻 {evento.plataforma}{evento.zoom_administrador&&` — Administra: ${evento.zoom_administrador}`}
            </div>
          </div>}
          {/* Lugar */}
          {(evento.modalidad==="presencial"||evento.modalidad==="hibrido")&&evento.lugar&&<div style={{marginBottom:"16px",background:C.gris,borderRadius:"10px",padding:"12px 16px"}}>
            <div style={{fontSize:"11px",color:C.textoSuave,fontWeight:"700",textTransform:"uppercase",marginBottom:"6px"}}>📍 Lugar</div>
            <div style={{fontWeight:"800",fontSize:"15px",color:C.texto}}>{evento.lugar}</div>
            {evento.lugar_detalle&&<div style={{color:C.textoMed,fontSize:"13px",marginTop:"4px"}}>{evento.lugar_detalle}</div>}
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((evento.lugar||"")+" "+(evento.lugar_detalle||""))}`} target="_blank" rel="noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:"5px",marginTop:"8px",fontSize:"12px",fontWeight:"700",color:C.azul,textDecoration:"none",padding:"4px 10px",border:`1px solid ${C.azulBorde}`,borderRadius:"6px",background:C.azulClaro}}>
              📍 Ver en Google Maps
            </a>
          </div>}
          {/* Asignaciones generales */}
          {(evento.asignaciones||[]).length>0&&<div style={{marginBottom:"16px"}}>
            <div style={{fontSize:"13px",fontWeight:"700",color:C.textoMed,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"10px"}}>🎙 Intérpretes</div>
            {evento.asignaciones.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:"12px",alignItems:"flex-start",padding:"12px",border:`1.5px solid ${C.grisBorde}`,borderRadius:"10px",marginBottom:"8px",background:"#fff"}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:"900",fontSize:"15px",color:C.texto}}>{nI(a.interprete_id)}{a.es_host_zoom&&<span style={{color:C.rojo,marginLeft:"8px",fontSize:"13px"}}>🎛 Host</span>}</div>
                  <div style={{fontSize:"15px",fontWeight:"700",color:C.azul,marginTop:"4px"}}>🌐 {nP(a.par_id)}</div>
                  <div style={{fontSize:"12px",color:C.textoSuave,marginTop:"4px",display:"flex",gap:"12px",flexWrap:"wrap"}}>
                    {a.nro_ot&&<span>OT: {a.nro_ot}</span>}
                    {a.nro_boleta&&<span>Boleta: {a.nro_boleta}{a.es_boleta_adicional?" (B#)":""}</span>}
                    {a.hora_presentacion&&<span>🕐 {a.hora_presentacion.slice(0,5)}</span>}
                  </div>
                </div>
                {a.estado_pago==="Pagado"&&<Badge texto="Pagado" color={C.verde} fondo={C.verdeClaro} icono="✓ "/>}
              </div>
            ))}
          </div>}
          {/* Días multidía */}
          {esMultidia&&dias.map((dia,dIdx)=>(
            <div key={dia.id||dIdx} style={{border:`2px solid ${C.grisBorde}`,borderRadius:"12px",marginBottom:"16px",overflow:"hidden"}}>
              <div style={{background:C.grisMed,padding:"12px 16px",fontWeight:"800",color:C.texto}}>
                📅 Día {dIdx+1} — {formatLargo(dia.fecha)}
                <span style={{fontWeight:"400",color:C.textoMed,fontSize:"13px",marginLeft:"12px"}}>{dia.hora_inicio?.slice(0,5)} – {dia.hora_termino?.slice(0,5)} hrs · {dia.jornada}</span>
              </div>
              <div style={{padding:"14px 16px"}}>
                {(dia.asignaciones_dia||[]).map((a,aIdx)=>(
                  <div key={aIdx} style={{padding:"10px 12px",background:C.gris,borderRadius:"8px",marginBottom:"8px"}}>
                    <div style={{fontWeight:"800",color:C.texto}}>{nI(a.interprete_id)}{a.es_host_zoom&&<span style={{color:C.rojo,marginLeft:"8px",fontSize:"12px"}}>🎛 Host</span>}</div>
                    <div style={{fontWeight:"700",color:C.azul,fontSize:"14px"}}>🌐 {nP(a.par_id)}</div>
                    <div style={{fontSize:"12px",color:C.textoSuave,marginTop:"4px",display:"flex",gap:"10px",flexWrap:"wrap"}}>
                      {a.nro_ot&&<span>OT: {a.nro_ot}</span>}
                      {a.nro_boleta&&<span>Boleta: {a.nro_boleta}</span>}
                      {a.hora_presentacion&&<span>🕐 {a.hora_presentacion.slice(0,5)}</span>}
                    </div>
                  </div>
                ))}
                {(dia.equipos_dia||[]).map((eq,eIdx)=>(
                  <div key={eIdx} style={{fontSize:"12px",color:C.textoMed,padding:"8px 12px",background:"#fff",border:`1px solid ${C.grisBorde}`,borderRadius:"8px",marginBottom:"6px"}}>
                    🔧 {eq.tipo_equipo==="fijo"?"Sistema fijo":eq.tipo_equipo==="portatil"?"Sistema portátil":"Cabina portátil"}
                    {eq.proveedor_nombre&&` · ${eq.proveedor_nombre}`}
                    {eq.num_receptores>0&&` · ${eq.num_receptores} receptores`}
                    {eq.num_cabinas>0&&` · ${eq.num_cabinas} cabinas`}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {evento.comentarios&&<div style={{background:C.gris,borderRadius:"10px",padding:"12px 16px"}}>
            <div style={{fontSize:"11px",color:C.textoSuave,fontWeight:"700",textTransform:"uppercase",marginBottom:"6px"}}>💬 Comentarios</div>
            <div style={{color:C.texto,fontSize:"14px"}}>{evento.comentarios}</div>
          </div>}
        </div>
        {/* Footer */}
        <div style={{padding:"16px 24px",borderTop:`1px solid ${C.grisBorde}`,flexShrink:0,display:"flex",gap:"10px",justifyContent:"space-between",alignItems:"center",background:C.gris,borderRadius:"0 0 20px 20px"}}>
          <BotonesAccion/><button onClick={onCerrar} style={S.btnG}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL FICHA ──────────────────────────────────────────────────────────────
function ModalFicha({evento,clientes,interpretes,pares,onCerrar}) {
  const fichaRef=useRef(null);
  const cliente=clientes.find(c=>c.id===evento.cliente_id);
  const esMultidia=evento.fecha_inicio!==evento.fecha_termino;
  const nI=(id)=>{const i=interpretes.find(x=>x.id===id);return i?`${i.nombre}${i.apellido?" "+i.apellido:""}`:""};
  const nP=(id)=>pares.find(p=>p.id===id)?.descripcion||"—";
  const dias=((evento.evento_dias||evento.dias||[]).sort((a,b)=>(a.orden||0)-(b.orden||0)));
  const CAMPOS_OPC=[
    {k:"cliente",l:"🏢 Cliente"},{k:"evento",l:"📌 Evento"},{k:"tipo",l:"🎙 Tipo"},
    {k:"modalidad",l:"🔄 Modalidad"},{k:"fecha",l:"📅 Fecha"},{k:"horario",l:"🕐 Horario"},
    {k:"jornada",l:"⏱ Jornada"},{k:"lugar",l:"📍 Lugar"},{k:"plataforma",l:"💻 Plataforma"},
    {k:"interpretes",l:"🎙 Intérpretes"},{k:"equipos",l:"🔧 Equipos AV"},{k:"comentarios",l:"💬 Comentarios"},
  ];
  const [campos,setCampos]=useState({cliente:true,evento:true,tipo:true,modalidad:true,fecha:true,horario:true,jornada:true,lugar:true,plataforma:true,interpretes:true,equipos:false,comentarios:false});

  const imprimir=()=>{
    const el=document.getElementById("ficha-mc");
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>Ficha MundoChile</title><style>body{font-family:'Segoe UI',sans-serif;padding:40px;color:#0f172a;}@media print{body{padding:20px;}}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:"16px",overflowY:"auto"}}>
      <div style={{background:"#fff",borderRadius:"20px",width:"100%",maxWidth:"700px",maxHeight:"90vh",boxShadow:"0 24px 80px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column"}}>
        {/* Selector campos */}
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.grisBorde}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <div style={{fontWeight:"800",color:C.texto,fontSize:"16px"}}>📄 Campos de la ficha</div>
            <button onClick={onCerrar} style={{background:"none",border:"none",cursor:"pointer",fontSize:"22px",color:C.textoSuave}}>✕</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            {CAMPOS_OPC.map(({k,l})=><button key={k} onClick={()=>setCampos(c=>({...c,[k]:!c[k]}))}
              style={{padding:"6px 14px",borderRadius:"20px",cursor:"pointer",fontSize:"13px",fontWeight:"700",fontFamily:"inherit",background:campos[k]?C.azul:C.grisMed,color:campos[k]?"#fff":C.textoMed,border:campos[k]?`1.5px solid ${C.azulOsc}`:`1.5px solid ${C.grisBorde}`}}>{l}</button>)}
          </div>
        </div>
        {/* Ficha */}
        <div id="ficha-mc" ref={fichaRef} style={{padding:"32px 36px",flex:1,overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"28px",paddingBottom:"20px",borderBottom:`3px solid ${C.azul}`}}>
            <Logo size={48}/>
            <div>
              <div style={{fontSize:"22px",fontWeight:"900",color:C.texto}}>MUNDO<span style={{color:C.rojo}}>CHILE</span></div>
              <div style={{fontSize:"12px",color:C.textoSuave}}>Gestión de Interpretaciones</div>
            </div>
            <div style={{marginLeft:"auto",textAlign:"right"}}>
              <div style={{fontSize:"12px",color:C.textoSuave}}>Generado el</div>
              <div style={{fontSize:"13px",fontWeight:"700",color:C.textoMed}}>{new Date().toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 24px"}}>
            {campos.cliente&&<div style={{gridColumn:"1/-1"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px"}}>Cliente</div><div style={{fontSize:"22px",fontWeight:"900",color:C.rojo,marginTop:"4px"}}>{cliente?.nombre_empresa||"—"}</div></div>}
            {campos.evento&&evento.nombre_evento&&<div style={{gridColumn:"1/-1"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px"}}>Evento</div><div style={{fontSize:"18px",fontWeight:"800",color:C.texto,marginTop:"4px"}}>{evento.nombre_evento}</div></div>}
            {campos.tipo&&<div><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px"}}>Tipo de interpretación</div><div style={{fontSize:"15px",fontWeight:"700",color:C.texto,marginTop:"4px"}}>🎙 {evento.tipo}</div></div>}
            {campos.modalidad&&<div><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px"}}>Modalidad</div><div style={{fontSize:"15px",fontWeight:"700",color:C.texto,marginTop:"4px"}}>{evento.modalidad==="presencial"?"📍":evento.modalidad==="hibrido"?"🔀":"💻"} {LBL_MODAL[evento.modalidad]}</div></div>}
            {campos.fecha&&<div><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px"}}>Fecha</div><div style={{fontSize:"15px",fontWeight:"700",color:C.texto,marginTop:"4px"}}>{esMultidia?`${formatCorto(evento.fecha_inicio)} → ${formatCorto(evento.fecha_termino)}`:formatLargo(evento.fecha_inicio)}</div></div>}
            {campos.horario&&<div><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px"}}>Horario</div><div style={{fontSize:"15px",fontWeight:"700",color:C.texto,marginTop:"4px"}}>🕐 {evento.hora_inicio?.slice(0,5)} – {evento.hora_termino?.slice(0,5)} hrs</div></div>}
            {campos.jornada&&evento.jornada&&<div><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px"}}>Jornada</div><div style={{fontSize:"15px",fontWeight:"700",color:C.texto,marginTop:"4px"}}>⏱ {evento.jornada}{evento.jornada_personalizada?` — ${evento.jornada_personalizada}`:""}</div></div>}
            {campos.lugar&&evento.lugar&&<div style={{gridColumn:"1/-1"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px"}}>Lugar</div><div style={{fontSize:"16px",fontWeight:"800",color:C.texto,marginTop:"4px"}}>📍 {evento.lugar}</div>{evento.lugar_detalle&&<div style={{fontSize:"13px",color:C.textoMed,marginTop:"3px"}}>{evento.lugar_detalle}</div>}</div>}
            {campos.plataforma&&(evento.modalidad==="remoto"||evento.modalidad==="hibrido")&&<div style={{gridColumn:"1/-1"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px"}}>Plataforma</div><div style={{marginTop:"6px"}}><span style={{display:"inline-block",padding:"8px 16px",borderRadius:"8px",fontWeight:"800",fontSize:"15px",background:evento.plataforma==="Zoom MundoChile"?C.amarilloVivo:C.grisMed,color:evento.plataforma==="Zoom MundoChile"?"#1a1a1a":C.texto}}>💻 {evento.plataforma}{evento.zoom_administrador&&` — ${evento.zoom_administrador}`}</span></div></div>}
          </div>
          {campos.interpretes&&(evento.asignaciones||[]).length>0&&<div style={{marginTop:"20px"}}>
            <div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px",marginBottom:"12px"}}>Intérpretes</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              {evento.asignaciones.map((a,i)=>(
                <div key={i} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"10px",padding:"12px 16px"}}>
                  <div style={{fontWeight:"800",fontSize:"16px",color:C.texto}}>{nI(a.interprete_id)}{a.es_host_zoom&&<span style={{color:C.rojo,marginLeft:"10px",fontSize:"13px",fontWeight:"700"}}>🎛 Host</span>}</div>
                  <div style={{fontWeight:"700",fontSize:"15px",color:C.azul,marginTop:"4px"}}>🌐 {nP(a.par_id)}</div>
                  {(a.nro_ot||a.nro_boleta||a.hora_presentacion)&&<div style={{fontSize:"13px",color:C.textoMed,marginTop:"6px",display:"flex",gap:"16px",flexWrap:"wrap"}}>
                    {a.nro_ot&&<span>OT: <strong>{a.nro_ot}</strong></span>}
                    {a.nro_boleta&&<span>Boleta: <strong>{a.nro_boleta}{a.es_boleta_adicional?" (B#)":""}</strong></span>}
                    {a.hora_presentacion&&<span>🕐 <strong>{a.hora_presentacion.slice(0,5)}</strong></span>}
                  </div>}
                </div>
              ))}
            </div>
          </div>}
          {campos.interpretes&&esMultidia&&dias.map((dia,dIdx)=>(
            <div key={dIdx} style={{marginTop:"16px",border:`2px solid ${C.grisBorde}`,borderRadius:"10px",overflow:"hidden"}}>
              <div style={{background:C.grisMed,padding:"10px 16px",fontWeight:"800",fontSize:"14px",color:C.texto}}>Día {dIdx+1} de {dias.length} — {formatLargo(dia.fecha)} · {dia.hora_inicio?.slice(0,5)}–{dia.hora_termino?.slice(0,5)} hrs</div>
              <div style={{padding:"12px 16px"}}>
                {(dia.asignaciones_dia||[]).map((a,aIdx)=>(
                  <div key={aIdx} style={{marginBottom:"8px"}}><div style={{fontWeight:"800",color:C.texto}}>{nI(a.interprete_id)}</div><div style={{fontWeight:"700",color:C.azul,fontSize:"14px"}}>🌐 {nP(a.par_id)}</div></div>
                ))}
              </div>
            </div>
          ))}
          {campos.comentarios&&evento.comentarios&&<div style={{marginTop:"20px",padding:"14px 16px",background:C.gris,borderRadius:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px",marginBottom:"6px"}}>Comentarios</div><div style={{color:C.texto,fontSize:"14px"}}>{evento.comentarios}</div></div>}
          <div style={{marginTop:"24px",paddingTop:"16px",borderTop:`1px solid ${C.grisBorde}`,fontSize:"11px",color:C.textoSuave,textAlign:"center"}}>MundoChile · Gestión de Interpretaciones · Confidencial</div>
        </div>
        {/* Footer */}
        <div style={{padding:"16px 24px",borderTop:`1px solid ${C.grisBorde}`,display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap",alignItems:"center",background:C.gris,borderRadius:"0 0 20px 20px"}}>
          <button onClick={()=>{if(fichaRef.current)fichaRef.current.scrollTop=0;}} style={{...S.btnG,padding:"8px 14px"}}>↑ Arriba</button>
          <button onClick={imprimir} style={{...S.btnA,background:C.azulOsc}}>🖨 Imprimir</button>
          <button onClick={onCerrar} style={S.btnG}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL NUEVO CLIENTE RÁPIDO ───────────────────────────────────────────────
function ModalNuevoCliente({onGuardar,onCerrar}) {
  const [f,setF]=useState({nombre_empresa:"",nombre_contacto:"",email_contacto:"",telefono:"",celular:"",notas:""});
  const u=(k,v)=>setF(x=>({...x,[k]:v}));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.7)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"16px",padding:"28px 24px",width:"100%",maxWidth:"480px",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
        <div style={{fontWeight:"900",fontSize:"18px",color:C.texto,marginBottom:"20px"}}>🏢 Nuevo cliente</div>
        <div style={{marginBottom:"14px"}}><label style={S.lbl}>Nombre empresa *</label><input style={S.inp} value={f.nombre_empresa} onChange={e=>u("nombre_empresa",e.target.value)}/></div>
        <div style={{...S.fila,marginBottom:"14px"}}>
          <div style={S.camp}><label style={S.lbl}>Contacto</label><input style={S.inp} value={f.nombre_contacto} onChange={e=>u("nombre_contacto",e.target.value)}/></div>
          <div style={S.camp}><label style={S.lbl}>Email</label><input style={S.inp} type="email" value={f.email_contacto} onChange={e=>u("email_contacto",e.target.value)}/></div>
        </div>
        <div style={{...S.fila,marginBottom:"14px"}}>
          <div style={S.camp}><label style={S.lbl}>Teléfono</label><input style={S.inp} value={f.telefono} onChange={e=>u("telefono",e.target.value)}/></div>
          <div style={S.camp}><label style={S.lbl}>Celular</label><input style={S.inp} value={f.celular} onChange={e=>u("celular",e.target.value)}/></div>
        </div>
        <div style={{marginBottom:"20px"}}><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:"60px"}} value={f.notas} onChange={e=>u("notas",e.target.value)}/></div>
        <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
          <button onClick={onCerrar} style={S.btnG}>Cancelar</button>
          <button onClick={()=>f.nombre_empresa&&onGuardar(f)} style={S.btnA}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL NUEVO INTÉRPRETE RÁPIDO ───────────────────────────────────────────
function ModalNuevoInterprete({onGuardar,onCerrar}) {
  const [f,setF]=useState({nombre:"",apellido:"",email:"",telefono:"",ciudad:"",modalidad_trabajo:"ambas",es_host_zoom:false,notas:""});
  const u=(k,v)=>setF(x=>({...x,[k]:v}));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.7)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"16px",padding:"28px 24px",width:"100%",maxWidth:"520px",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
        <div style={{fontWeight:"900",fontSize:"18px",color:C.texto,marginBottom:"20px"}}>👤 Nuevo intérprete</div>
        <div style={{...S.fila,marginBottom:"14px"}}>
          <div style={S.camp}><label style={S.lbl}>Nombre *</label><input style={S.inp} value={f.nombre} onChange={e=>u("nombre",e.target.value)}/></div>
          <div style={S.camp}><label style={S.lbl}>Apellido</label><input style={S.inp} value={f.apellido} onChange={e=>u("apellido",e.target.value)}/></div>
        </div>
        <div style={{...S.fila,marginBottom:"14px"}}>
          <div style={S.camp}><label style={S.lbl}>Email</label><input style={S.inp} type="email" value={f.email} onChange={e=>u("email",e.target.value)}/></div>
          <div style={S.camp}><label style={S.lbl}>Teléfono</label><input style={S.inp} value={f.telefono} onChange={e=>u("telefono",e.target.value)}/></div>
        </div>
        <div style={{...S.fila,marginBottom:"14px"}}>
          <div style={S.camp}><label style={S.lbl}>Ciudad</label><input style={S.inp} placeholder="Santiago…" value={f.ciudad} onChange={e=>u("ciudad",e.target.value)}/></div>
          <div style={S.camp}><label style={S.lbl}>Modalidad</label>
            <select style={S.sel} value={f.modalidad_trabajo} onChange={e=>u("modalidad_trabajo",e.target.value)}>
              <option value="ambas">💻📍 Presencial y Online</option>
              <option value="online">💻 Solo Online</option>
              <option value="presencial">📍 Solo Presencial</option>
            </select></div>
        </div>
        <div style={{marginBottom:"16px"}}><label style={{display:"flex",gap:"8px",alignItems:"center",cursor:"pointer",fontSize:"14px",color:C.rojo,fontWeight:"700"}}>
          <input type="checkbox" checked={f.es_host_zoom} onChange={e=>u("es_host_zoom",e.target.checked)}/> 🎛 Host alternativo Zoom MundoChile
        </label></div>
        <div style={{marginBottom:"20px"}}><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:"60px"}} value={f.notas} onChange={e=>u("notas",e.target.value)}/></div>
        <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
          <button onClick={onCerrar} style={S.btnG}>Cancelar</button>
          <button onClick={()=>f.nombre&&onGuardar({...f,activo:true})} style={S.btnA}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ─── PANTALLA CONFIGURACIÓN ───────────────────────────────────────────────────
function PantallaConfig({clientes,interpretes,pares,proveedores,onActualizar}) {
  const [tab,setTab]=useState("interpretes");
  const [editando,setEditando]=useState(null);
  const [formEdit,setFormEdit]=useState({});
  const tabs=[{id:"interpretes",l:"👤 Intérpretes"},{id:"clientes",l:"🏢 Clientes"},{id:"idiomas",l:"🌐 Idiomas"},{id:"proveedores",l:"🔧 Proveedores"}];

  const guardar=async(tabla,payload,id)=>{
    if(id==="nuevo") await sb.from(tabla).insert(payload);
    else await sb.from(tabla).update(payload).eq("id",id);
    setEditando(null);setFormEdit({});onActualizar();
  };

  const EF=(k)=><input style={S.inp} value={formEdit[k]||""} onChange={e=>setFormEdit(f=>({...f,[k]:e.target.value}))}/>;
  const SE=(k,opts,lab)=><select style={S.sel} value={formEdit[k]||""} onChange={e=>setFormEdit(f=>({...f,[k]:e.target.value}))}>{opts.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select>;

  return (
    <div style={{padding:"20px 16px 80px",maxWidth:"900px",margin:"0 auto"}}>
      {/* Tabs */}
      <div style={{display:"flex",gap:"6px",marginBottom:"20px",flexWrap:"wrap"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>{setTab(t.id);setEditando(null);setFormEdit({});}}
          style={{padding:"10px 18px",borderRadius:"10px",border:`2px solid ${tab===t.id?C.azul:C.grisBorde}`,background:tab===t.id?C.azulClaro:"#fff",color:tab===t.id?C.azul:C.textoMed,fontWeight:tab===t.id?"800":"600",cursor:"pointer",fontFamily:"inherit",fontSize:"14px"}}>
          {t.l}</button>)}
      </div>

      {/* ── INTÉRPRETES ── */}
      {tab==="interpretes"&&<>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"14px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({nombre:"",apellido:"",email:"",telefono:"",ciudad:"",modalidad_trabajo:"ambas",es_host_zoom:false,notas:"",activo:true});}} style={S.btnA}>+ Nuevo intérprete</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{fontWeight:"800",color:C.azul,marginBottom:"14px"}}>{editando==="nuevo"?"Nuevo intérprete":"Editar intérprete"}</div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Nombre *</label>{EF("nombre")}</div>
            <div style={S.camp}><label style={S.lbl}>Apellido</label>{EF("apellido")}</div>
          </div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Email</label>{EF("email")}</div>
            <div style={S.camp}><label style={S.lbl}>Teléfono</label>{EF("telefono")}</div>
          </div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Ciudad</label>{EF("ciudad")}</div>
            <div style={S.camp}><label style={S.lbl}>Modalidad</label>
              <select style={S.sel} value={formEdit.modalidad_trabajo||"ambas"} onChange={e=>setFormEdit(f=>({...f,modalidad_trabajo:e.target.value}))}>
                <option value="ambas">💻📍 Presencial y Online</option>
                <option value="online">💻 Solo Online</option>
                <option value="presencial">📍 Solo Presencial</option>
              </select></div>
          </div>
          <div style={{marginBottom:"12px"}}><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:"60px"}} value={formEdit.notas||""} onChange={e=>setFormEdit(f=>({...f,notas:e.target.value}))}/></div>
          <label style={{display:"flex",gap:"8px",alignItems:"center",cursor:"pointer",fontSize:"14px",color:C.rojo,fontWeight:"700",marginBottom:"16px"}}>
            <input type="checkbox" checked={!!formEdit.es_host_zoom} onChange={e=>setFormEdit(f=>({...f,es_host_zoom:e.target.checked}))}/> 🎛 Host alternativo Zoom MundoChile
          </label>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>guardar("interpretes",formEdit,editando)} style={S.btnA}>💾 Guardar</button>
            <button onClick={()=>{setEditando(null);setFormEdit({});}} style={S.btnG}>Cancelar</button>
          </div>
        </div>}
        {interpretes.map(i=>(
          <div key={i.id} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"12px",padding:"14px 20px",marginBottom:"10px",background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px",opacity:i.activo===false?0.6:1}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:"800",fontSize:"15px",color:C.texto}}>{i.nombre}{i.apellido?" "+i.apellido:""}{i.es_host_zoom&&<span style={{color:C.rojo,marginLeft:"8px",fontSize:"12px"}}>🎛 Host Zoom</span>}</div>
              <div style={{display:"flex",gap:"12px",marginTop:"5px",flexWrap:"wrap"}}>
                {i.email&&<CampoCopia valor={i.email}/>}
                {i.telefono&&<CampoCopia valor={i.telefono}/>}
                {i.ciudad&&<span style={{fontSize:"13px",color:C.textoMed}}>📍 {i.ciudad}</span>}
                {i.modalidad_trabajo&&<span style={{fontSize:"13px",color:C.textoMed}}>{i.modalidad_trabajo==="ambas"?"💻📍":i.modalidad_trabajo==="online"?"💻 Online":"📍 Presencial"}</span>}
              </div>
            </div>
            <div style={{display:"flex",gap:"6px",flexShrink:0}}>
              <button onClick={()=>{setEditando(i.id);setFormEdit({...i});}} style={S.btnP}>✏️ Editar</button>
              <button onClick={async()=>{await sb.from("interpretes").update({activo:!i.activo}).eq("id",i.id);onActualizar();}}
                style={{...S.btnP,background:i.activo?C.rojoClaro:C.verdeClaro,color:i.activo?C.rojo:C.verde,borderColor:i.activo?C.rojo:C.verde}}>
                {i.activo?"Desactivar":"Activar"}
              </button>
            </div>
          </div>
        ))}
      </>}

      {/* ── CLIENTES ── */}
      {tab==="clientes"&&<>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"14px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({nombre_empresa:"",nombre_contacto:"",email_contacto:"",telefono:"",celular:"",notas:"",activo:true});}} style={S.btnA}>+ Nuevo cliente</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{fontWeight:"800",color:C.azul,marginBottom:"14px"}}>{editando==="nuevo"?"Nuevo cliente":"Editar cliente"}</div>
          <div style={{marginBottom:"12px"}}><label style={S.lbl}>Nombre empresa *</label>{EF("nombre_empresa")}</div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Contacto</label>{EF("nombre_contacto")}</div>
            <div style={S.camp}><label style={S.lbl}>Email</label>{EF("email_contacto")}</div>
          </div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Teléfono</label>{EF("telefono")}</div>
            <div style={S.camp}><label style={S.lbl}>Celular</label>{EF("celular")}</div>
          </div>
          <div style={{marginBottom:"14px"}}><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:"60px"}} value={formEdit.notas||""} onChange={e=>setFormEdit(f=>({...f,notas:e.target.value}))}/></div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>guardar("clientes",formEdit,editando)} style={S.btnA}>💾 Guardar</button>
            <button onClick={()=>{setEditando(null);setFormEdit({});}} style={S.btnG}>Cancelar</button>
          </div>
        </div>}
        {clientes.map(c=>(
          <div key={c.id} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"12px",padding:"14px 20px",marginBottom:"10px",background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px"}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:"800",fontSize:"15px",color:C.texto}}>{c.nombre_empresa}</div>
              <div style={{display:"flex",gap:"14px",marginTop:"5px",flexWrap:"wrap"}}>
                {c.nombre_contacto&&<span style={{fontSize:"13px",color:C.textoMed}}>👤 {c.nombre_contacto}</span>}
                {c.email_contacto&&<CampoCopia valor={c.email_contacto}/>}
                {c.telefono&&<CampoCopia valor={c.telefono}/>}
              </div>
            </div>
            <button onClick={()=>{setEditando(c.id);setFormEdit({...c});}} style={S.btnP}>✏️ Editar</button>
          </div>
        ))}
      </>}

      {/* ── IDIOMAS ── */}
      {tab==="idiomas"&&<>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"14px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({idioma_origen:"",idioma_destino:"Español",activo:true});}} style={S.btnA}>+ Nuevo par de idiomas</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{...S.fila,marginBottom:"14px"}}>
            <div style={S.camp}><label style={S.lbl}>Idioma origen</label>{EF("idioma_origen")}</div>
            <div style={S.camp}><label style={S.lbl}>Idioma destino</label>{EF("idioma_destino")}</div>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>guardar("pares_idiomas",formEdit,editando)} style={S.btnA}>💾 Guardar</button>
            <button onClick={()=>{setEditando(null);setFormEdit({});}} style={S.btnG}>Cancelar</button>
          </div>
        </div>}
        {pares.map(p=>(
          <div key={p.id} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"10px",padding:"12px 18px",marginBottom:"8px",background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontWeight:"800",fontSize:"15px",color:C.texto}}>🌐 {p.descripcion}</div>
            <button onClick={()=>{setEditando(p.id);setFormEdit({...p});}} style={S.btnP}>✏️ Editar</button>
          </div>
        ))}
      </>}

      {/* ── PROVEEDORES ── */}
      {tab==="proveedores"&&<>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"14px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({nombre:"",nombre_contacto:"",email:"",telefono:"",notas:"",activo:true});}} style={S.btnA}>+ Nuevo proveedor</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Nombre empresa *</label>{EF("nombre")}</div>
            <div style={S.camp}><label style={S.lbl}>Contacto</label>{EF("nombre_contacto")}</div>
          </div>
          <div style={{...S.fila,marginBottom:"14px"}}>
            <div style={S.camp}><label style={S.lbl}>Email</label>{EF("email")}</div>
            <div style={S.camp}><label style={S.lbl}>Teléfono</label>{EF("telefono")}</div>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>guardar("proveedores",formEdit,editando)} style={S.btnA}>💾 Guardar</button>
            <button onClick={()=>{setEditando(null);setFormEdit({});}} style={S.btnG}>Cancelar</button>
          </div>
        </div>}
        {proveedores.map(p=>(
          <div key={p.id} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"10px",padding:"12px 18px",marginBottom:"8px",background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:"800",color:C.texto}}>{p.nombre}</div>
              <div style={{fontSize:"13px",color:C.textoMed,marginTop:"4px",display:"flex",gap:"10px"}}>
                {p.nombre_contacto&&<span>{p.nombre_contacto}</span>}
                {p.telefono&&<CampoCopia valor={p.telefono}/>}
              </div>
            </div>
            <button onClick={()=>{setEditando(p.id);setFormEdit({...p});}} style={S.btnP}>✏️ Editar</button>
          </div>
        ))}
      </>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [usuario,setUsuario]=useState(null);
  const [perfil,setPerfil]=useState(null);
  const [cargandoAuth,setCargandoAuth]=useState(true);
  const [eventos,setEventos]=useState([]);
  const [clientes,setClientes]=useState([]);
  const [interpretes,setInterpretes]=useState([]);
  const [pares,setPares]=useState([]);
  const [proveedores,setProveedores]=useState([]);
  const [cargando,setCargando]=useState(false);
  const [vista,setVista]=useState("semana");
  const [semanaOff,setSemanaOff]=useState(0);
  const [mesOff,setMesOff]=useState(0);
  const [diaActual,setDiaActual]=useState(hoy());
  const [pantalla,setPantalla]=useState("calendario");
  const [modalEvento,setModalEvento]=useState(null);
  const [modalDetalle,setModalDetalle]=useState(null);
  const [modalFicha,setModalFicha]=useState(null);
  const [modalNuevoCli,setModalNuevoCli]=useState(false);
  const [modalNuevoInt,setModalNuevoInt]=useState(null);

  // ── Auth ──
  useEffect(()=>{
    sb.auth.getSession().then(({data})=>{
      if(data.session?.user){setUsuario(data.session.user);cargarPerfil(data.session.user.id);}
      else setCargandoAuth(false);
    });
    const{data:sub}=sb.auth.onAuthStateChange((_,session)=>{
      if(session?.user){setUsuario(session.user);cargarPerfil(session.user.id);}
      else{setUsuario(null);setPerfil(null);setCargandoAuth(false);}
    });
    return()=>sub.subscription.unsubscribe();
  },[]);

  const cargarPerfil=async(uid)=>{
    const{data}=await sb.from("perfiles").select("*").eq("id",uid).single();
    setPerfil(data);setCargandoAuth(false);cargarDatos();
  };

  const cargarDatos=useCallback(async()=>{
    setCargando(true);
    const[evR,cliR,intR,parR,provR]=await Promise.all([
      sb.from("eventos").select("*, asignaciones(*), evento_dias(*, asignaciones_dia(*), equipos_dia(*))").order("fecha_inicio"),
      sb.from("clientes").select("*").order("nombre_empresa"),
      sb.from("interpretes").select("*").order("nombre"),
      sb.from("pares_idiomas").select("*").order("idioma_origen"),
      sb.from("proveedores").select("*").order("nombre"),
    ]);
    if(evR.data) setEventos(evR.data);
    if(cliR.data) setClientes(cliR.data);
    if(intR.data) setInterpretes(intR.data);
    if(parR.data) setPares(parR.data);
    if(provR.data) setProveedores(provR.data);
    setCargando(false);
  },[]);

  const diasSemana=useMemo(()=>semanaDesde(semanaOff),[semanaOff]);
  const esMobile=typeof window!=="undefined"&&window.innerWidth<768;
  const evsDia=(iso)=>eventos.filter(e=>e.fecha_inicio<=iso&&e.fecha_termino>=iso).sort((a,b)=>(a.hora_inicio||"").localeCompare(b.hora_inicio||""));

  const tituloNav=()=>{
    if(vista==="semana"){const d=diasSemana;return `${d[0].getDate()} ${MESES_C[d[0].getMonth()]} – ${d[6].getDate()} ${MESES_C[d[6].getMonth()]} ${d[6].getFullYear()}`;}
    if(vista==="mes"){const n=new Date();n.setMonth(n.getMonth()+mesOff);return `${MESES_L[n.getMonth()].charAt(0).toUpperCase()+MESES_L[n.getMonth()].slice(1)} ${n.getFullYear()}`;}
    return formatLargo(diaActual);
  };

  const abrirEvento=async(ev)=>{
    const{data}=await sb.from("eventos").select("*, asignaciones(*), evento_dias(*, asignaciones_dia(*), equipos_dia(*))").eq("id",ev.id).single();
    setModalDetalle(data||ev);
  };

  const editarEvento=(ev)=>{
    const diasForm=(ev.evento_dias||[]).sort((a,b)=>a.orden-b.orden).map(d=>({...d,asignaciones:d.asignaciones_dia||[],equipos:d.equipos_dia||[]}));
    setModalDetalle(null);
    setModalEvento({modo:"editar",data:{...ev,asignaciones:ev.asignaciones||[],dias:diasForm}});
  };

  const eliminarEvento=async(id)=>{
    if(!confirm("¿Eliminar este evento? Esta acción no se puede deshacer.")) return;
    await sb.from("eventos").delete().eq("id",id);
    setModalDetalle(null);cargarDatos();
  };

  // ── Vista MES ──
  const renderMes=()=>{
    const n=new Date();n.setMonth(n.getMonth()+mesOff);n.setDate(1);
    const pri=n.getDay()===0?6:n.getDay()-1;
    const total=new Date(n.getFullYear(),n.getMonth()+1,0).getDate();
    const celdas=[];
    for(let i=0;i<pri;i++) celdas.push(null);
    for(let i=1;i<=total;i++) celdas.push(i);
    return (
      <div style={{padding:"12px 16px 80px",overflowX:"auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",minWidth:"500px"}}>
          {DIAS_SEM.map(d=><div key={d} style={{textAlign:"center",fontWeight:"800",fontSize:"12px",color:C.textoSuave,padding:"8px 0",textTransform:"uppercase"}}>{d}</div>)}
          {celdas.map((dia,i)=>{
            if(!dia) return <div key={i}/>;
            const iso=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
            const evs=evsDia(iso), esHoy=iso===hoy();
            return <div key={i} onClick={()=>{setDiaActual(iso);setVista("dia");}}
              style={{minHeight:"80px",border:`1.5px solid ${esHoy?C.azul:C.grisBorde}`,borderRadius:"10px",padding:"6px 8px",cursor:"pointer",background:esHoy?C.azulClaro:"#fff"}}
              onMouseEnter={e=>{if(!esHoy)e.currentTarget.style.background=C.gris;}} onMouseLeave={e=>{if(!esHoy)e.currentTarget.style.background="#fff";}}>
              <div style={{fontWeight:esHoy?"900":"700",color:esHoy?C.azul:C.textoMed,fontSize:"14px",marginBottom:"4px"}}>{dia}</div>
              {evs.slice(0,2).map((ev,j)=>{const col=colorEv(ev.id);return <div key={j} onClick={e=>{e.stopPropagation();abrirEvento(ev);}} style={{fontSize:"10px",fontWeight:"700",background:col.borde,color:"#fff",borderRadius:"4px",padding:"2px 5px",marginBottom:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clientes.find(c=>c.id===ev.cliente_id)?.nombre_empresa||ev.nombre_evento||"Evento"}</div>;})}
              {evs.length>2&&<div style={{fontSize:"10px",color:C.textoSuave,fontWeight:"600"}}>+{evs.length-2} más</div>}
            </div>;
          })}
        </div>
      </div>
    );
  };

  // ── Vista SEMANA ──
  const renderSemana=()=>{
    if(esMobile) return (
      <div style={{padding:"10px 12px 80px"}}>
        {diasSemana.map((d,i)=>{
          const iso=toISO(d),evs=evsDia(iso),esHoy=iso===hoy();
          return <div key={i} style={{marginBottom:"10px",border:`2px solid ${esHoy?C.azul:C.grisBorde}`,borderRadius:"14px",overflow:"hidden"}}>
            <div style={{background:esHoy?C.azul:evs.length?C.grisMed:C.gris,padding:"12px 16px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer"}} onClick={()=>{setDiaActual(iso);setVista("dia");}}>
              <div style={{width:"48px",height:"48px",borderRadius:"50%",background:esHoy?"rgba(255,255,255,0.2)":"#fff",border:`2px solid ${esHoy?"rgba(255,255,255,0.4)":C.grisBorde}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:"9px",fontWeight:"800",textTransform:"uppercase",color:esHoy?"#bfdbfe":C.textoSuave}}>{DIAS_SEM[i]}</div>
                <div style={{fontSize:"20px",fontWeight:"900",lineHeight:1,color:esHoy?"#fff":C.texto}}>{d.getDate()}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:"13px",color:esHoy?"#bfdbfe":C.textoSuave}}>{MESES_L[d.getMonth()]}</div>
                {evs.length>0?<div style={{fontSize:"20px",fontWeight:"900",color:esHoy?"#fff":C.azul}}>{evs.length} evento{evs.length!==1?"s":""}</div>:<div style={{fontSize:"14px",color:esHoy?"#bfdbfe":C.textoSuave,fontWeight:"600"}}>Sin eventos</div>}
              </div>
              <div style={{fontSize:"18px",color:esHoy?"#bfdbfe":C.textoSuave}}>›</div>
            </div>
            {evs.length>0&&<div style={{padding:"10px 12px"}}>{evs.map(ev=><TarjetaEvento key={ev.id} ev={ev} clientes={clientes} pares={pares} interpretes={interpretes} onClick={()=>abrirEvento(ev)}/>)}</div>}
          </div>;
        })}
      </div>
    );
    return (
      <div style={{overflowX:"auto",padding:"16px 16px 80px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(200px,1fr))",gap:"10px",minWidth:"800px"}}>
          {diasSemana.map((d,i)=>{
            const iso=toISO(d),evs=evsDia(iso),esHoy=iso===hoy();
            return <div key={i}>
              <div onClick={()=>{setDiaActual(iso);setVista("dia");}} style={{textAlign:"center",padding:"12px",borderRadius:"12px",marginBottom:"10px",background:esHoy?C.azul:C.grisMed,border:`2px solid ${esHoy?C.azul:C.grisBorde}`,cursor:"pointer"}}>
                <div style={{fontSize:"11px",fontWeight:"800",textTransform:"uppercase",letterSpacing:"1px",color:esHoy?"#bfdbfe":C.textoSuave}}>{DIAS_SEM[i]}</div>
                <div style={{fontSize:"26px",fontWeight:"900",color:esHoy?"#fff":C.texto}}>{d.getDate()}</div>
                <div style={{fontSize:"11px",color:esHoy?"#bfdbfe":C.textoSuave,fontWeight:"600"}}>{MESES_C[d.getMonth()]} {d.getFullYear()}</div>
                {evs.length>0&&<div style={{fontSize:"17px",fontWeight:"900",marginTop:"4px",color:esHoy?"#bfdbfe":C.azul}}>{evs.length} evento{evs.length!==1?"s":""}</div>}
              </div>
              {evs.map(ev=><TarjetaEvento key={ev.id} ev={ev} clientes={clientes} pares={pares} interpretes={interpretes} onClick={()=>abrirEvento(ev)}/>)}
              {evs.length===0&&<div style={{textAlign:"center",color:C.textoSuave,fontWeight:"600",fontSize:"13px",padding:"16px 0"}}>Sin eventos</div>}
            </div>;
          })}
        </div>
      </div>
    );
  };

  // ── Vista DÍA ──
  const renderDia=()=>{
    const evs=evsDia(diaActual);
    return <div style={{padding:"16px 16px 80px"}}>
      <div style={{fontWeight:"900",fontSize:"18px",color:C.texto,marginBottom:"16px"}}>
        {formatLargo(diaActual)}<span style={{fontWeight:"400",color:C.textoSuave,fontSize:"15px",marginLeft:"12px"}}>{evs.length} evento{evs.length!==1?"s":""}</span>
      </div>
      {evs.length===0?<div style={{textAlign:"center",padding:"60px 20px",color:C.textoSuave,border:`2px dashed ${C.grisBorde}`,borderRadius:"16px"}}><div style={{fontSize:"40px",marginBottom:"12px"}}>📅</div><div style={{fontWeight:"700",fontSize:"16px"}}>Sin eventos este día</div></div>
      :<div style={{display:"grid",gridTemplateColumns:esMobile?"1fr":"1fr 1fr",gap:"12px"}}>{evs.map(ev=><TarjetaEvento key={ev.id} ev={ev} clientes={clientes} pares={pares} interpretes={interpretes} onClick={()=>abrirEvento(ev)}/>)}</div>}
    </div>;
  };

  // ── Guards ──
  if(cargandoAuth) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.gris}}>
      <div style={{textAlign:"center"}}><Logo size={48}/><div style={{marginTop:"16px",color:C.textoMed,fontSize:"16px",fontWeight:"600"}}>Cargando…</div></div>
    </div>
  );
  if(!usuario) return <PantallaLogin onLogin={(u)=>{setUsuario(u);cargarPerfil(u.id);}}/>;

  const esAdmin=perfil?.rol==="admin";
  const esEditor=perfil?.rol==="editor"||esAdmin;

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",minHeight:"100vh",background:C.gris,color:C.texto}}>
      {/* ── TOPBAR ── */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"#fff",borderBottom:`1px solid ${C.grisBorde}`,boxShadow:"0 2px 8px rgba(58,123,213,0.08)"}}>
        <div style={{padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"56px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <Logo size={32}/>
            <div><span style={{fontWeight:"900",fontSize:"16px",color:C.texto}}>MUNDO</span><span style={{fontWeight:"900",fontSize:"16px",color:C.rojo}}>CHILE</span></div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            {esEditor&&<button onClick={()=>setModalEvento({modo:"nuevo",data:evVacio()})} style={S.btnA}>➕ Nuevo evento</button>}
            {esAdmin&&<button onClick={()=>setPantalla(p=>p==="config"?"calendario":"config")} style={{...S.btnG,padding:"8px 14px"}}>⚙️ Config</button>}
            <button onClick={()=>sb.auth.signOut()} style={{...S.btnG,padding:"8px 14px",fontSize:"13px"}}>Salir</button>
          </div>
        </div>
        {pantalla==="calendario"&&<>
          <div style={{display:"flex",gap:"6px",padding:"8px 16px",borderTop:`1px solid ${C.grisBorde}`,background:C.gris}}>
            {[["semana","📅 Semana"],["dia","📆 Día"],["mes","🗓 Mes"]].map(([v,l])=><button key={v} onClick={()=>setVista(v)}
              style={{flex:1,maxWidth:"140px",padding:"10px 0",background:vista===v?"#fff":"transparent",border:`2px solid ${vista===v?C.azul:C.grisBorde}`,borderRadius:"10px",color:vista===v?C.azul:C.textoSuave,fontWeight:vista===v?"900":"600",cursor:"pointer",fontSize:"14px",fontFamily:"inherit",boxShadow:vista===v?`0 2px 8px ${C.azul}22`:"none",transition:"all 0.15s"}}>
              {l}</button>)}
          </div>
          <div style={{padding:"10px 16px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
            <div>
              <div style={{fontWeight:"900",fontSize:"17px",color:C.texto}}>{tituloNav()}</div>
              <div style={{fontSize:"12px",color:C.textoSuave,marginTop:"2px"}}>{cargando?"Cargando…":`${eventos.length} eventos`}</div>
            </div>
            <div style={{display:"flex",gap:"6px"}}>
              <button onClick={()=>{if(vista==="semana")setSemanaOff(o=>o-1);else if(vista==="mes")setMesOff(o=>o-1);else{const d=desdeISO(diaActual);d.setDate(d.getDate()-1);setDiaActual(toISO(d));};}} style={S.btnG}>← Anterior</button>
              <button onClick={()=>{setSemanaOff(0);setMesOff(0);setDiaActual(hoy());}} style={S.btnP}>Hoy</button>
              <button onClick={()=>{if(vista==="semana")setSemanaOff(o=>o+1);else if(vista==="mes")setMesOff(o=>o+1);else{const d=desdeISO(diaActual);d.setDate(d.getDate()+1);setDiaActual(toISO(d));};}} style={S.btnG}>Siguiente →</button>
            </div>
          </div>
        </>}
      </div>

      {/* ── CONTENIDO ── */}
      {pantalla==="calendario"&&<>{vista==="semana"&&renderSemana()}{vista==="dia"&&renderDia()}{vista==="mes"&&renderMes()}</>}
      {pantalla==="config"&&esAdmin&&<PantallaConfig clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} onActualizar={cargarDatos}/>}

      {/* ── MODALES ── */}
      {modalEvento&&<ModalEvento eventoInicial={modalEvento.data} clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} todos_eventos={eventos} perfil={perfil} onGuardar={()=>{setModalEvento(null);cargarDatos();}} onCerrar={()=>setModalEvento(null)} onNuevoCliente={()=>setModalNuevoCli(true)} onNuevoInterprete={(ai,di)=>setModalNuevoInt({ai,di})}/>}
      {modalDetalle&&<ModalDetalle evento={modalDetalle} clientes={clientes} interpretes={interpretes} pares={pares} perfil={perfil} onEditar={()=>editarEvento(modalDetalle)} onEliminar={()=>eliminarEvento(modalDetalle.id)} onCerrar={()=>setModalDetalle(null)} onVerFicha={()=>{setModalFicha(modalDetalle);setModalDetalle(null);}}/>}
      {modalFicha&&<ModalFicha evento={modalFicha} clientes={clientes} interpretes={interpretes} pares={pares} onCerrar={()=>setModalFicha(null)}/>}
      {modalNuevoCli&&<ModalNuevoCliente onGuardar={async(d)=>{await sb.from("clientes").insert(d);await cargarDatos();setModalNuevoCli(false);}} onCerrar={()=>setModalNuevoCli(false)}/>}
      {modalNuevoInt&&<ModalNuevoInterprete onGuardar={async(d)=>{await sb.from("interpretes").insert(d);await cargarDatos();setModalNuevoInt(null);}} onCerrar={()=>setModalNuevoInt(null)}/>}
    </div>
  );
}
