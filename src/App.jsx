// MundoChile v2.1 — Gestión de Interpretaciones
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_KEY;
const sb = createClient(SB_URL, SB_KEY);

const LOGO_SRC = "/logo.png";

// ─── PALETA (Notion-inspired) ─────────────────────────────────────────────────
const C = {
  azul:"#3a7bd5", azulOsc:"#2563a8", azulClaro:"#eef4fd", azulBorde:"#b3d0f5",
  rojo:"#e63946", rojoClaro:"#fdeef0", rojoBorde:"#f5b8bc",
  verde:"#16a34a", verdeClaro:"#f0fdf4", verdeBorde:"#86efac",
  amarillo:"#f59e0b", amarilloVivo:"#fef08a", amarilloFondo:"#fffbeb",
  gris:"#F7F7F5", grisMed:"#EFEFED", grisBorde:"#E5E5E3",
  texto:"#1A1A1A", textoMed:"#6B6B6B", textoSuave:"#9B9B9B", blanco:"#ffffff",
};
const PALETA_CLIENTE=["#E03131","#C2255C","#9C36B5","#3B5BDB","#1971C2","#0C8599","#2F9E44","#E67700","#D9480F","#5C7CFA","#F06595","#20C997"];
const colorCliente=(id)=>PALETA_CLIENTE[(id||0)%12];
const avatarColor=(str)=>PALETA_CLIENTE[(str||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0)%12];
const IDIOMA_COLOR={"Inglés":"#4A90D9","Francés":"#002395","Portugués":"#009C3B","Español":"#AA151B","Alemán":"#555555","Italiano":"#009246","Chino":"#DE2910","Japonés":"#BC002D"};
const IDIOMA_FLAG={"Inglés":"🇬🇧","Francés":"🇫🇷","Portugués":"🇧🇷","Español":"🇪🇸","Alemán":"🇩🇪","Italiano":"🇮🇹","Chino":"🇨🇳","Japonés":"🇯🇵"};
const idiomaColor=(idioma)=>IDIOMA_COLOR[idioma]||"#868E96";
const idiomaFlag=(idioma)=>IDIOMA_FLAG[idioma]||"🌐";
const IDIOMA_CDN={"Inglés":"gb","Francés":"fr","Portugués":"br","Español":"es","Alemán":"de","Italiano":"it","Chino":"cn","Japonés":"jp"};
function FlagImg({idioma}){const c=IDIOMA_CDN[idioma];if(!c)return<span style={{fontSize:"13px"}}>🌐</span>;return<img src={`https://flagcdn.com/20x15/${c}.png`} style={{width:"20px",height:"15px",objectFit:"cover",borderRadius:"2px",verticalAlign:"middle",display:"inline-block",flexShrink:0}} alt={idioma}/>;}


// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const TIPOS      = ["Simultánea","Consecutiva","Whispering"];
const MODALIDADES= ["remoto","presencial","hibrido"];
const LBL_MODAL  = {remoto:"Remoto",presencial:"Presencial",hibrido:"Híbrido"};
const PLATAFORMAS= ["Zoom MundoChile","Zoom Cliente","Teams","Webex","Meet","Otro"];
const ZOOM_ADMIN = ["Magix","RLA","El mismo cliente","Otro audiovisual"];
const JORNADAS_PRES=["1 hora","Media Jornada","Media Jornada + 1 hora adicional","Jornada Completa","Jornada Completa + 1 hora adicional","Otro horario personalizado"];
const JORNADAS_REM=["1 hora","1 hora + 1 bloque de 15 minutos","2 horas","2 horas + 1 bloque de 30 minutos","Media Jornada 4 horas","Media Jornada + 1 hora adicional","1 Jornada Completa","Jornada Completa + 1 hora adicional","Otro horario personalizado"];
const JORNADAS=[...new Set([...JORNADAS_PRES,...JORNADAS_REM])];
const getJornadas=(mod)=>mod==="remoto"?JORNADAS_REM:JORNADAS_PRES;
const calcJornada=(mins,mod)=>{
  if(mod==="remoto"){
    if(mins===60)return"1 hora";if(mins===75)return"1 hora + 1 bloque de 15 minutos";
    if(mins===120)return"2 horas";if(mins===150)return"2 horas + 1 bloque de 30 minutos";
    if(mins===240)return"Media Jornada 4 horas";
    if(mins>240&&mins<=300)return"Media Jornada + 1 hora adicional";
    if(mins>300&&mins<=540)return"1 Jornada Completa";
    if(mins>540&&mins<=600)return"Jornada Completa + 1 hora adicional";
    return"Otro horario personalizado";
  }
  if(mins===60)return"1 hora";if(mins>60&&mins<=240)return"Media Jornada";
  if(mins>240&&mins<=300)return"Media Jornada + 1 hora adicional";
  if(mins>300&&mins<=540)return"Jornada Completa";
  if(mins>540&&mins<=600)return"Jornada Completa + 1 hora adicional";
  return"Otro horario personalizado";
};
const ESTADOS    = ["Pendiente de Facturación","Facturado"];
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
const HORAS = (() => { const h=[]; for(let x=7;x<=22;x++) for(let m of [0,15,30,45]) h.push(`${String(x).padStart(2,"0")}:${String(m).padStart(2,"0")}`); return h; })();

// ─── ESTILOS BASE ─────────────────────────────────────────────────────────────
const S = {
  inp: {width:"100%",padding:"9px 12px",border:`1.5px solid ${C.grisBorde}`,borderRadius:"8px",fontSize:"16px",color:C.texto,background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit",height:"48px"},
  sel: {width:"100%",padding:"9px 12px",border:`1.5px solid ${C.grisBorde}`,borderRadius:"8px",fontSize:"16px",color:C.texto,background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit",cursor:"pointer",height:"48px"},
  lbl: {fontSize:"14px",fontWeight:"700",color:"#1A1A1A",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"5px",display:"block"},
  fila:{display:"flex",gap:"16px",flexWrap:"wrap"},
  camp:{flex:"1",minWidth:"140px"},
  btnA:{padding:"10px 20px",background:"#3a7bd5",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"14px",fontFamily:"inherit"},
  btnR:{padding:"10px 20px",background:"#E03131",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"14px",fontFamily:"inherit"},
  btnV:{padding:"10px 20px",background:"#2F9E44",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"14px",fontFamily:"inherit"},
  btnG:{padding:"10px 20px",background:"#fff",color:C.textoMed,border:`1.5px solid ${C.grisBorde}`,borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px",fontFamily:"inherit"},
  btnSave:{padding:"11px 22px",background:"#2F9E44",color:"#fff",border:"2px solid #1B5E20",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"16px",fontFamily:"inherit"},
  btnDel:{padding:"10px 20px",background:"#E03131",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px",fontFamily:"inherit"},
  btnCancel:{padding:"10px 20px",background:"#FFEBEE",color:"#C62828",border:"1px solid #EF9A9A",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px",fontFamily:"inherit"},
  btnEdit:{padding:"6px 12px",background:"#E67700",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"700",fontSize:"12px",fontFamily:"inherit"},
  btnFicha:{padding:"6px 12px",background:"#1971C2",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"700",fontSize:"12px",fontFamily:"inherit"},
  btnDup:{padding:"6px 12px",background:"#9C36B5",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"700",fontSize:"12px",fontFamily:"inherit"},
  btnP:{padding:"6px 12px",background:C.azulClaro,color:C.azul,border:`1px solid ${C.azulBorde}`,borderRadius:"6px",cursor:"pointer",fontWeight:"700",fontSize:"12px",fontFamily:"inherit"},
};

// ─── ESTADO VACÍO ─────────────────────────────────────────────────────────────
const evVacio = () => ({
  id:null, cliente_id:"", nro_oc:"", nombre_evento:"", tipo:"Simultánea",
  fecha_inicio:hoy(), fecha_termino:hoy(), hora_inicio:"09:00", hora_termino:"13:00",
  jornada:"Media Jornada", jornada_personalizada:"", lugar:"", lugar_detalle:"",
  modalidad:"remoto", plataforma:"Zoom MundoChile", zoom_owner:"mundochile",
  zoom_administrador:"", estado:"Pendiente de Facturación", comentarios:"",
  nro_hes:"", nro_otros:"",
  asignaciones:[], dias:[], equipos:[],
});
const asigVacia = () => ({interprete_id:"",par_id:"",nro_ot:"",nro_boleta:"",es_boleta_adicional:false,es_host_zoom:false,rol:"Principal",hora_presentacion:"",estado_pago:"Pendiente"});
const diaVacio  = (fecha) => ({fecha,hora_inicio:"09:00",hora_termino:"13:00",jornada:"Media Jornada",jornada_personalizada:"",asignaciones:[],equipos:[]});
const eqVacio   = () => ({tipo_equipo:"fijo",proveedor_id:"",proveedor_nombre:"",proveedor_contacto:"",proveedor_telefono:"",num_receptores:0,num_cabinas:0,num_asistentes:0,asistentes_origen:"mismo_proveedor",asistentes_otro_proveedor:"",asistentes_mundochile_nombres:"",portatiles_origen:"mundochile",proveedor_portatiles:"",dia_montaje:"",hora_montaje:"",contacto_in_situ:"",instrucciones:""});

// ─── TOAST ───────────────────────────────────────────────────────────────────
function ToastContainer({toasts,onRemove}) {
  if(!toasts.length) return null;
  return (
    <div style={{position:"fixed",bottom:"24px",right:"24px",zIndex:2000,display:"flex",flexDirection:"column",gap:"10px",maxWidth:"400px"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{background:"#fff",border:`1.5px solid ${t.type==="error"?C.rojo:t.type==="success"?C.verde:C.grisBorde}`,borderLeft:`5px solid ${t.type==="error"?C.rojo:t.type==="success"?C.verde:C.azul}`,borderRadius:"10px",padding:"12px 16px",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",display:"flex",alignItems:"flex-start",gap:"10px"}}>
          <div style={{flex:1,fontSize:"14px",color:C.texto,fontWeight:"600"}}>{t.msg}</div>
          {t.retry&&<button onClick={t.retry} style={{...S.btnP,fontSize:"11px",padding:"4px 8px",whiteSpace:"nowrap"}}>↺ Reintentar</button>}
          <button onClick={()=>onRemove(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.textoSuave,fontSize:"18px",lineHeight:1,padding:0,flexShrink:0}}>✕</button>
        </div>
      ))}
    </div>
  );
}

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

function Badge({texto,color=C.azul,fondo=C.azulClaro,icono="",solid=false}) {
  const bg=solid?color:fondo;
  const fg=solid?"#fff":color;
  return <span style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"3px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"700",color:fg,background:bg,border:solid?"none":`1px solid ${color}33`}}>{icono}{texto}</span>;
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
  const [manual,setManual]=useState(false);
  const esManual=manual||(!!value&&!HORAS.includes(value));
  if(esManual) return (
    <div style={{display:"flex",gap:"6px"}}>
      <input style={{...S.inp,flex:1}} value={value||""} onChange={e=>onChange(e.target.value)} placeholder="08:30"/>
      <button onClick={()=>{setManual(false);onChange("09:00");}} style={{...S.btnG,padding:"9px 10px",fontSize:"12px",whiteSpace:"nowrap",height:"48px"}}>↩ Lista</button>
    </div>
  );
  return (
    <select style={S.sel} value={value||""} onChange={e=>{if(e.target.value==="__otro__"){setManual(true);onChange("");}else onChange(e.target.value);}}>
      <option value="">{placeholder}</option>
      {HORAS.map(h=><option key={h} value={h}>{h} hrs</option>)}
      <option value="__otro__">Otro horario…</option>
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
          <img src={LOGO_SRC} alt="MundoChile" style={{height:"120px",marginTop:"8px",marginBottom:"8px"}}/>
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
function TarjetaEvento({ev,diaDe,clientes,pares,interpretes,proveedores=[],onClick}) {
  const borderColor=colorCliente(ev.cliente_id);
  const cliente=clientes.find(c=>c.id===ev.cliente_id);
  const todosEquipos=(ev.evento_dias||[]).flatMap(d=>d.equipos_dia||[]);
  const tieneEquipos=todosEquipos.length>0;
  const provNombreEq=tieneEquipos?(todosEquipos[0].proveedor_nombre||proveedores.find(p=>p.id===todosEquipos[0].proveedor_id)?.nombre||""):"";
  const esPresencial=ev.modalidad==="presencial"||ev.modalidad==="hibrido";
  const lugarOPlat=esPresencial?ev.lugar:ev.plataforma;
  const esZoomMC=ev.plataforma==="Zoom MundoChile";

  const hoyCal=hoy();
  const manana=toISO(new Date(desdeISO(hoyCal).getTime()+86400000));
  const dotColor=diaDe===hoyCal?"#E03131":diaDe===manana?"#F59E0B":null;

  let diaXdeY=null;
  if(diaDe&&ev.fecha_inicio!==ev.fecha_termino){
    const ini=desdeISO(ev.fecha_inicio);
    const diaCol=desdeISO(diaDe);
    const x=Math.round((diaCol-ini)/86400000)+1;
    const y=Math.round((desdeISO(ev.fecha_termino)-ini)/86400000)+1;
    diaXdeY={x,y};
  }

  const tipoBg=ev.tipo==="Simultánea"?"#3B5BDB":ev.tipo==="Consecutiva"?"#2F9E44":"#9C36B5";
  const modBg=ev.modalidad==="remoto"?"#1971C2":ev.modalidad==="presencial"?"#2F9E44":"#7950F2";
  const factBg=ev.estado==="Facturado"?"#1971C2":"#E67700";
  const bs={display:"inline-flex",alignItems:"center",padding:"5px 14px",borderRadius:"20px",fontSize:"13px",fontWeight:"600",color:"#fff",whiteSpace:"nowrap"};

  return (
    <div onClick={onClick}
      style={{borderRadius:"10px",padding:"18px 20px",background:"#FFFFFF",color:C.texto,cursor:"pointer",marginBottom:"12px",boxShadow:"0 3px 12px rgba(0,0,0,0.15)",borderLeft:`8px solid ${borderColor}`,position:"relative",transition:"transform 0.12s,box-shadow 0.12s",lineHeight:1.5}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.20)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 3px 12px rgba(0,0,0,0.15)";}}>
      {dotColor&&<div style={{position:"absolute",top:"12px",right:"12px",width:"12px",height:"12px",borderRadius:"50%",background:"#e63946",animation:"mcpulse 2s ease-in-out infinite"}}/>}
      {diaXdeY&&<div style={{marginBottom:"6px"}}><span style={{display:"inline-flex",alignItems:"center",padding:"4px 12px",borderRadius:"20px",fontSize:"13px",fontWeight:"700",color:"#1971C2",background:"#E8F4FD",border:"1px solid #bee3f8"}}>📅 Día {diaXdeY.x} de {diaXdeY.y}</span></div>}
      <div style={{fontSize:"24px",fontWeight:"800",color:"#1A1A1A",letterSpacing:"0.1px",lineHeight:1.2,marginBottom:"4px",paddingRight:dotColor?"18px":"0"}}>{cliente?.nombre_empresa||"—"}</div>
      {ev.nombre_evento&&<div style={{fontSize:"15px",fontWeight:"400",color:"#6B6B6B",marginBottom:"10px"}}>{ev.nombre_evento}</div>}
      <div style={{fontSize:"17px",fontWeight:"600",color:"#1A1A1A",marginBottom:"10px"}}>{ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)} hrs</div>
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap",alignItems:"center",marginBottom:"10px"}}>
        <span style={{...bs,background:tipoBg}}>{ev.tipo}</span>
        <span style={{...bs,background:modBg}}>{LBL_MODAL[ev.modalidad]||ev.modalidad}</span>
        <span style={{...bs,background:factBg}}>{ev.estado==="Facturado"?"Facturado":"Facturación Pendiente"}</span>
      </div>
      {lugarOPlat&&<div style={{fontSize:"15px",color:"#374151",marginBottom:"10px"}}>{esPresencial?"📍":"💻"} {lugarOPlat}</div>}
      {!esPresencial&&esZoomMC&&<div style={{marginBottom:"8px"}}><span style={{display:"inline-flex",alignItems:"center",padding:"5px 14px",borderRadius:"20px",fontSize:"13px",fontWeight:"500",color:"#92400E",background:"#FFF3CD",border:"1.5px solid #F59E0B"}}>💻 Zoom MundoChile{ev.zoom_administrador?` · ${ev.zoom_administrador}`:""}</span></div>}
      {(ev.asignaciones||[]).length>0&&<div style={{fontSize:"13px",fontWeight:"700",color:"#6B6B6B",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"6px",marginTop:"8px"}}>🎙 Intérpretes</div>}
      {(ev.asignaciones||[]).map((a,i)=>{
        const interp=interpretes.find(x=>x.id===a.interprete_id);
        const par=pares.find(p=>p.id===a.par_id);
        if(!interp) return null;
        const idioma=par?.idioma_origen||"";
        const bg=idiomaColor(idioma);
        const esHost=a.es_host_zoom;
        return (
          <div key={i} style={{marginBottom:"6px"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"8px 16px",borderRadius:"20px",fontSize:"15px",fontWeight:"500",color:"#fff",background:bg,border:esHost?"2px solid #E03131":"2px solid transparent",boxSizing:"border-box",maxWidth:"100%"}}>
              {esHost&&<span style={{fontSize:"13px"}}>🔑</span>}<FlagImg idioma={idioma}/><span style={{fontWeight:"500"}}>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span>
              {par&&<span style={{opacity:0.85,fontSize:"12px"}}> · {par.idioma_origen} — {par.idioma_destino}</span>}
            </span>
          </div>
        );
      })}
      {tieneEquipos&&<div style={{fontSize:"13px",fontWeight:"700",color:"#6B6B6B",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"6px",marginTop:"8px"}}>🔧 Equipos AV</div>}
      {tieneEquipos&&<span style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"6px 14px",borderRadius:"8px",fontSize:"14px",fontWeight:"500",color:"#495057",background:"#F1F3F5",border:"1px solid #DEE2E6"}}>{provNombreEq||"Equipos AV"}</span>}
    </div>
  );
}

// ─── MODAL EVENTO ─────────────────────────────────────────────────────────────
function ModalEvento({eventoInicial,clientes,interpretes,pares,proveedores,lugares=[],todos_eventos,perfil,onGuardar,onCerrar,onNuevoCliente,onNuevoInterprete,onLugarCreado}) {
  const [form,setForm]=useState(()=>eventoInicial?JSON.parse(JSON.stringify(eventoInicial)):evVacio());
  const [tab,setTab]=useState("general");
  const [guardando,setGuardando]=useState(false);
  const [error,setError]=useState("");
  const [agregarLugar,setAgregarLugar]=useState(false);
  const [nuevoLugar,setNuevoLugar]=useState("");
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

  useEffect(()=>{
    if(!form.hora_inicio||!form.hora_termino) return;
    const [hi,hm]=form.hora_inicio.split(":").map(Number);
    const [ti,tm]=form.hora_termino.split(":").map(Number);
    const mins=(ti*60+tm)-(hi*60+hm);
    if(mins>0) setF("jornada",calcJornada(mins,form.modalidad));
  },[form.hora_inicio,form.hora_termino,form.modalidad]);

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
      // Insertar equipos AV para evento de un día (phantom evento_dia)
      if(!esMultidia&&form.modalidad!=="remoto"&&(form.equipos||[]).length>0){
        const{data:dD,error:eDia}=await sb.from("evento_dias").insert({
          evento_id:eventoId,fecha:form.fecha_inicio,orden:1,
          hora_inicio:form.hora_inicio||"09:00",hora_termino:form.hora_termino||"13:00",
          jornada:form.jornada||"Media Jornada",jornada_personalizada:form.jornada_personalizada||"",
        }).select().single();
        if(eDia)throw eDia;
        const eqs=form.equipos.map(eq=>({
          evento_dia_id:dD.id,tipo_equipo:eq.tipo_equipo||"fijo",
          proveedor_id:eq.proveedor_id||null,proveedor_nombre:eq.proveedor_nombre||"",
          proveedor_contacto:eq.proveedor_contacto||"",proveedor_telefono:eq.proveedor_telefono||"",
          num_receptores:Number(eq.num_receptores)||0,num_cabinas:Number(eq.num_cabinas)||0,
          num_asistentes:Number(eq.num_asistentes)||0,
        }));
        const{error:eE}=await sb.from("equipos_dia").insert(eqs);if(eE)throw eE;
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
      <div style={{border:`1.5px solid ${a.es_host_zoom?"#E03131":C.grisBorde}`,borderRadius:"10px",padding:"14px",marginBottom:"10px",background:C.gris,boxShadow:a.es_host_zoom?"0 0 0 2px #fecaca":undefined}}>
        {alerta&&<div style={{background:"#fef3c7",border:"1px solid #f59e0b",borderRadius:"8px",padding:"10px 14px",marginBottom:"10px",fontSize:"13px",color:"#92400e"}}>
          <div style={{fontWeight:"600",marginBottom:"8px"}}>⚠️ {interp?.nombre||"Este intérprete"} ya tiene asignado "{alerta.nombre_evento||"otro evento"}" el {formatLargo(alerta.fecha_inicio)}. ¿Deseas agregarlo de todos modos?</div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>setAlerta(null)} style={{padding:"5px 12px",background:"#92400e",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"700",fontSize:"12px",fontFamily:"inherit"}}>Sí, agregar igual</button>
            <button onClick={()=>{edit("interprete_id","");setAlerta(null);}} style={{padding:"5px 12px",background:"none",color:"#92400e",border:"1px solid #92400e",borderRadius:"6px",cursor:"pointer",fontWeight:"700",fontSize:"12px",fontFamily:"inherit"}}>Cambiar intérprete</button>
          </div>
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
              {interp.modalidad_trabajo&&<span>{interp.modalidad_trabajo==="ambas"?"💻📍":interp.modalidad_trabajo==="online"?"💻 Online":"📍 Presencial"}</span>}
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
          <label style={{display:"flex",gap:"6px",alignItems:"center",cursor:"pointer",fontSize:"13px",color:a.es_host_zoom?C.rojo:C.textoMed,fontWeight:a.es_host_zoom?"700":"400"}}>
            <input type="checkbox" checked={!!a.es_host_zoom} onChange={e=>edit("es_host_zoom",e.target.checked)}/> 🔑 Host Zoom MundoChile
          </label>
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
    :[{id:"general",lbl:"📋 Detalles"},{id:"interpretes",lbl:"🎙 Intérpretes"},...(form.modalidad!=="remoto"?[{id:"equipos",lbl:"🔧 Equipos AV"}]:[])];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"20px",width:"100%",maxWidth:"760px",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.25)"}}>
        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:"none",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,background:form.id?"#E67700":"#3a7bd5",borderRadius:"20px 20px 0 0"}}>
          <div style={{fontSize:"18px",fontWeight:"600",color:"#fff"}}>{form.id?"✏️ Editar evento":"➕ Nuevo evento"}</div>
          <button onClick={onCerrar} style={{background:"none",border:"none",cursor:"pointer",fontSize:"24px",color:"#fff",lineHeight:1}}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.grisBorde}`,flexShrink:0}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 18px",background:tab===t.id?"#3a7bd5":"transparent",border:"none",borderRadius:tab===t.id?"8px":"0",cursor:"pointer",color:tab===t.id?"#fff":C.textoSuave,fontWeight:tab===t.id?"800":"600",fontSize:"14px",fontFamily:"inherit",margin:"6px 4px"}}>{t.lbl}</button>)}
        </div>
        {/* Cuerpo */}
        <div data-modal-scroll style={{overflowY:"auto",flex:1,padding:"20px 24px"}}>
          {error&&<div style={{background:C.rojoClaro,color:C.rojo,padding:"10px 14px",borderRadius:"8px",marginBottom:"20px",fontSize:"14px",fontWeight:"600"}}>{error}</div>}

          {/* ── TAB GENERAL ── */}
          {tab==="general"&&<>
            {/* Cliente */}
            <div style={{marginBottom:"20px"}}>
              <label style={S.lbl}>🏢 Cliente *</label>
              <div style={{display:"flex",gap:"8px"}}>
                <select style={S.sel} value={form.cliente_id||""} onChange={e=>setF("cliente_id",e.target.value?Number(e.target.value):"")}>
                  <option value="">Seleccionar cliente…</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre_empresa}</option>)}
                </select>
                <button onClick={onNuevoCliente} style={S.btnP}>+ Nuevo</button>
              </div>
            </div>
            {/* Nombre del evento */}
            <div style={{marginBottom:"20px"}}>
              <label style={S.lbl}>Nombre del evento</label>
              <input style={S.inp} value={form.nombre_evento} onChange={e=>setF("nombre_evento",e.target.value)} placeholder="Conferencia anual…"/>
            </div>
            {/* Referencias del cliente */}
            <div style={{marginBottom:"20px"}}>
              <label style={{...S.lbl,marginBottom:"8px"}}>Referencias del cliente</label>
              <div style={S.fila}>
                <div style={S.camp}><label style={{...S.lbl,fontSize:"11px"}}>N° OC</label><input style={S.inp} value={form.nro_oc} onChange={e=>setF("nro_oc",e.target.value)} placeholder="OC-0000"/></div>
                <div style={S.camp}><label style={{...S.lbl,fontSize:"11px"}} title="Hoja de Entrada de Servicios">N° HES <span style={{fontSize:"10px",color:C.textoSuave,fontWeight:"400",textTransform:"none"}}>(Hoja Entrada Servicios)</span></label><input style={S.inp} value={form.nro_hes||""} onChange={e=>setF("nro_hes",e.target.value)} placeholder="HES-000"/></div>
                <div style={S.camp}><label style={{...S.lbl,fontSize:"11px"}}>Otros</label><input style={S.inp} value={form.nro_otros||""} onChange={e=>setF("nro_otros",e.target.value)} placeholder="Ref. adicional…"/></div>
              </div>
            </div>
            {/* Tipo + Modalidad */}
            <div style={{...S.fila,marginBottom:"20px"}}>
              <div style={S.camp}><label style={S.lbl}>🎙 Tipo de interpretación</label>
                <select style={S.sel} value={form.tipo} onChange={e=>setF("tipo",e.target.value)}>{TIPOS.map(t=><option key={t}>{t}</option>)}</select></div>
              <div style={S.camp}><label style={S.lbl}>🔄 Modalidad</label>
                <select style={S.sel} value={form.modalidad} onChange={e=>setF("modalidad",e.target.value)}>{MODALIDADES.map(m=><option key={m} value={m}>{LBL_MODAL[m]}</option>)}</select></div>
            </div>
            {/* Fechas */}
            <div style={{...S.fila,marginBottom:"20px"}}>
              <div style={S.camp}><label style={S.lbl}>📅 Fecha inicio</label><input style={S.inp} type="date" value={form.fecha_inicio} onChange={e=>setF("fecha_inicio",e.target.value)}/></div>
              <div style={S.camp}><label style={S.lbl}>📅 Fecha término</label><input style={S.inp} type="date" value={form.fecha_termino} onChange={e=>setF("fecha_termino",e.target.value)}/></div>
            </div>
            {/* Horas + Jornada */}
            {!esMultidia&&<div style={{...S.fila,marginBottom:"20px"}}>
              <div style={S.camp}><label style={S.lbl}>🕐 Hora inicio</label><SelHora value={form.hora_inicio} onChange={v=>setF("hora_inicio",v)}/></div>
              <div style={S.camp}><label style={S.lbl}>🕐 Hora término</label><SelHora value={form.hora_termino} onChange={v=>setF("hora_termino",v)}/></div>
              <div style={S.camp}><label style={S.lbl}>⏱ Jornada</label>
                <select style={S.sel} value={form.jornada} onChange={e=>setF("jornada",e.target.value)}>{getJornadas(form.modalidad).map(j=><option key={j}>{j}</option>)}</select></div>
            </div>}
            {form.jornada==="Otro horario personalizado"&&!esMultidia&&<div style={{marginBottom:"20px"}}><label style={S.lbl}>✍️ Horario personalizado</label><input style={S.inp} value={form.jornada_personalizada} onChange={e=>setF("jornada_personalizada",e.target.value)}/></div>}
            {/* Plataforma (remoto/híbrido) */}
            {(form.modalidad==="remoto"||form.modalidad==="hibrido")&&<>
              <div style={{...S.fila,marginBottom:"20px"}}>
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
              <div style={{marginBottom:"10px"}}>
                <label style={S.lbl}>📍 Lugar</label>
                {agregarLugar
                  ?<div style={{display:"flex",gap:"6px"}}>
                      <input style={{...S.inp,flex:1}} value={nuevoLugar} onChange={e=>setNuevoLugar(e.target.value)} placeholder="Nombre del lugar…" autoFocus onKeyDown={async e=>{
                        if(e.key==="Enter"&&nuevoLugar.trim()){
                          const{data}=await sb.from("lugares").insert({nombre:nuevoLugar.trim(),activo:true}).select().single();
                          if(data){setF("lugar",data.nombre);if(onLugarCreado)onLugarCreado();}
                          setAgregarLugar(false);setNuevoLugar("");
                        }
                      }}/>
                      <button onClick={async()=>{
                        if(!nuevoLugar.trim())return;
                        const{data}=await sb.from("lugares").insert({nombre:nuevoLugar.trim(),activo:true}).select().single();
                        if(data){setF("lugar",data.nombre);if(onLugarCreado)onLugarCreado();}
                        setAgregarLugar(false);setNuevoLugar("");
                      }} style={{...S.btnV,padding:"9px 14px",fontSize:"13px",whiteSpace:"nowrap"}}>✓</button>
                      <button onClick={()=>{setAgregarLugar(false);setNuevoLugar("");}} style={{...S.btnG,padding:"9px 10px",fontSize:"13px"}}>✕</button>
                    </div>
                  :<div style={{display:"flex",gap:"6px"}}>
                      <select style={S.sel} value={form.lugar||""} onChange={e=>setF("lugar",e.target.value)}>
                        <option value="">Seleccionar lugar…</option>
                        {lugares.filter(l=>l.activo!==false).map(l=><option key={l.id} value={l.nombre}>{l.nombre}</option>)}
                        {form.lugar&&!lugares.find(l=>l.nombre===form.lugar)&&<option value={form.lugar}>{form.lugar}</option>}
                      </select>
                      <button onClick={()=>setAgregarLugar(true)} style={{...S.btnP,whiteSpace:"nowrap"}}>+ Nuevo</button>
                    </div>
                }
              </div>
              <div style={{marginBottom:"20px"}}><label style={S.lbl}>Detalles del lugar</label><input style={S.inp} value={form.lugar_detalle} onChange={e=>setF("lugar_detalle",e.target.value)} placeholder="Sala Andes, piso 3…"/></div>
            </>}
            {/* Estado + Comentarios */}
            <div style={{...S.fila,marginBottom:"20px"}}>
              <div style={S.camp}><label style={S.lbl}>Estado</label>
                <select style={S.sel} value={form.estado} onChange={e=>setF("estado",e.target.value)}>{ESTADOS.map(e=><option key={e}>{e}</option>)}</select></div>
            </div>
            <div style={{marginBottom:"4px"}}><label style={S.lbl}>💬 Comentarios</label><textarea style={{...S.inp,minHeight:"80px",resize:"vertical"}} value={form.comentarios} onChange={e=>setF("comentarios",e.target.value)}/></div>
          </>}

          {/* ── TAB INTÉRPRETES (un día) ── */}
          {tab==="interpretes"&&!esMultidia&&<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div style={{fontWeight:"800",color:C.rojo,fontSize:"17px"}}>🎙 Intérpretes asignados</div>
              <button onClick={()=>addAsig()} style={S.btnA}>+ Agregar intérprete</button>
            </div>
            {form.asignaciones.length===0&&<div style={{textAlign:"center",color:C.textoSuave,padding:"40px 20px",border:`2px dashed ${C.grisBorde}`,borderRadius:"12px"}}>Sin intérpretes — Agrega uno arriba</div>}
            {form.asignaciones.map((a,idx)=><FilaAsig key={idx} a={a} idx={idx}/>)}
            {form.asignaciones.length>0&&<button onClick={()=>addAsig()} style={{...S.btnP,width:"100%",padding:"9px"}}>+ Agregar otro intérprete</button>}
          </>}

          {/* ── TAB EQUIPOS AV (un día) ── */}
          {tab==="equipos"&&!esMultidia&&<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div style={{fontWeight:"800",color:C.verde,fontSize:"17px"}}>🔧 Equipos AV</div>
              <button onClick={()=>setForm(f=>({...f,equipos:[...(f.equipos||[]),eqVacio()]}))} style={S.btnA}>+ Agregar equipos</button>
            </div>
            {(form.equipos||[]).length===0&&<div style={{textAlign:"center",color:C.textoSuave,padding:"40px 20px",border:`2px dashed ${C.grisBorde}`,borderRadius:"12px"}}>Sin equipos AV — Agrega uno arriba</div>}
            {(form.equipos||[]).map((eq,eIdx)=>(
              <div key={eIdx} style={{border:`1px solid ${C.grisBorde}`,borderRadius:"10px",padding:"14px",marginBottom:"10px",background:"#fff"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                  <div style={{fontWeight:"700",color:C.azul,fontSize:"13px"}}>Equipo #{eIdx+1}</div>
                  <button onClick={()=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs.splice(eIdx,1);return{...f,equipos:eqs};})} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontWeight:"700"}}>✕</button>
                </div>
                <div style={S.fila}>
                  <div style={S.camp}><label style={S.lbl}>Tipo de sistema</label>
                    <select style={S.sel} value={eq.tipo_equipo} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],tipo_equipo:e.target.value};return{...f,equipos:eqs};})}>
                      <option value="fijo">Sistema fijo (cabina y receptores)</option>
                      <option value="portatil">Sistema portátil</option>
                      <option value="cabina_portatil">Cabina portátil</option>
                    </select></div>
                  <div style={S.camp}><label style={S.lbl}>Proveedor AV</label>
                    <select style={S.sel} value={eq.proveedor_id||""} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],proveedor_id:e.target.value?Number(e.target.value):null};return{...f,equipos:eqs};})}>
                      <option value="">Sin proveedor / otro</option>
                      {proveedores.filter(p=>p.activo!==false).map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select></div>
                </div>
                <div style={{...S.fila,marginTop:"10px"}}>
                  <div style={S.camp}><label style={S.lbl}>N° receptores</label><input style={S.inp} type="number" value={eq.num_receptores} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],num_receptores:e.target.value};return{...f,equipos:eqs};})}/></div>
                  <div style={S.camp}><label style={S.lbl}>N° cabinas</label><input style={S.inp} type="number" value={eq.num_cabinas} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],num_cabinas:e.target.value};return{...f,equipos:eqs};})}/></div>
                  <div style={S.camp}><label style={S.lbl}>N° asistentes</label><input style={S.inp} type="number" value={eq.num_asistentes} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],num_asistentes:e.target.value};return{...f,equipos:eqs};})}/></div>
                </div>
                <div style={{...S.fila,marginTop:"10px"}}>
                  <div style={S.camp}><label style={S.lbl}>Contacto proveedor</label><input style={S.inp} defaultValue={eq.proveedor_contacto} onBlur={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],proveedor_contacto:e.target.value};return{...f,equipos:eqs};})}/></div>
                  <div style={S.camp}><label style={S.lbl}>Teléfono proveedor</label><input style={S.inp} defaultValue={eq.proveedor_telefono} onBlur={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],proveedor_telefono:e.target.value};return{...f,equipos:eqs};})}/></div>
                </div>
              </div>
            ))}
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
                      {getJornadas(form.modalidad).map(j=><option key={j}>{j}</option>)}
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
          <button onClick={onCerrar} style={S.btnCancel}>Cancelar</button>
          <button onClick={guardar} disabled={guardando} style={{...S.btnSave,opacity:guardando?0.7:1,minWidth:"140px"}}>{guardando?"Guardando…":"💾 Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL DETALLE ────────────────────────────────────────────────────────────
function ModalDetalle({evento,clientes,interpretes,pares,perfil,onEditar,onEliminar,onCerrar,onVerFicha,addToast}) {
  const [asignaciones,setAsignaciones]=useState(evento?.asignaciones||[]);
  useEffect(()=>setAsignaciones(evento?.asignaciones||[]),[evento]);
  if(!evento) return null;
  const cliente=clientes.find(c=>c.id===evento.cliente_id);
  const esZoomMC=evento.plataforma==="Zoom MundoChile";
  const esMultidia=evento.fecha_inicio!==evento.fecha_termino;
  const dias=((evento.evento_dias||evento.dias||[]).sort((a,b)=>(a.orden||0)-(b.orden||0)));
  const tipoBg=evento.tipo==="Simultánea"?"#3B5BDB":evento.tipo==="Consecutiva"?"#2F9E44":"#9C36B5";
  const modBg=evento.modalidad==="remoto"?"#1971C2":evento.modalidad==="presencial"?"#2F9E44":"#7950F2";
  const factBg=evento.estado==="Facturado"?"#1971C2":"#E67700";
  const bs={display:"inline-flex",alignItems:"center",padding:"6px 16px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",color:"#fff",whiteSpace:"nowrap"};
  const ST=({txt})=><div style={{fontSize:"14px",fontWeight:"700",color:"#1A1A1A",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>{txt}</div>;
  const btnD=(bg)=>({padding:"10px 20px",background:bg,color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"15px",fontFamily:"inherit"});
  const InterpPill=({a})=>{
    const interp=interpretes.find(x=>x.id===a.interprete_id);
    const par=pares.find(p=>p.id===a.par_id);
    if(!interp) return null;
    const idioma=par?.idioma_origen||"";
    const bg=idiomaColor(idioma);
    return (
      <div style={{marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"12px 20px",borderRadius:"20px",fontSize:"17px",fontWeight:"500",color:"#fff",background:bg,border:a.es_host_zoom?"2px solid #E03131":"2px solid transparent",boxSizing:"border-box"}}>
          {a.es_host_zoom&&<span style={{fontSize:"14px"}}>🔑</span>}<FlagImg idioma={idioma}/><span style={{fontWeight:"500"}}>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span>
          {par&&<span style={{opacity:0.85,fontSize:"13px"}}> · {par.idioma_origen} — {par.idioma_destino}</span>}
        </span>
        {(a.nro_ot||a.nro_boleta||a.hora_presentacion)&&<span style={{fontSize:"12px",color:C.textoMed,display:"flex",gap:"10px"}}>
          {a.nro_ot&&<span>OT: {a.nro_ot}</span>}
          {a.nro_boleta&&<span>Boleta: {a.nro_boleta}</span>}
          {a.hora_presentacion&&<span>🕐 {a.hora_presentacion.slice(0,5)}</span>}
        </span>}
      </div>
    );
  };
  const BotonesAccion=()=>(
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
      <button onClick={onVerFicha} style={btnD("#1971C2")}>📄 Ver ficha</button>
      <button onClick={onEditar} style={btnD("#E67700")}>✏️ Editar</button>
      <button onClick={onEliminar} style={btnD("#E03131")}>🗑 Eliminar</button>
    </div>
  );
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"20px",width:"100%",maxWidth:"760px",maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.25)"}}>
        {/* Header */}
        <div style={{background:"#FFFFFF",padding:"20px 24px",borderRadius:"20px 20px 0 0",flexShrink:0,borderBottom:`5px solid ${colorCliente(evento.cliente_id)}`}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"16px"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:"28px",fontWeight:"800",color:"#1A1A1A",lineHeight:1.2,marginBottom:"4px"}}>{cliente?.nombre_empresa||"—"}</div>
              {evento.nombre_evento&&<div style={{fontSize:"15px",color:"#374151",marginBottom:"4px"}}>{evento.nombre_evento}</div>}
              {evento.nro_oc&&<div style={{fontSize:"13px",color:"#6B6B6B",marginBottom:"8px"}}>N° OC: {evento.nro_oc}</div>}
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                <span style={{...bs,background:tipoBg}}>🎙 {evento.tipo}</span>
                <span style={{...bs,background:modBg}}>{evento.modalidad==="presencial"?"📍":evento.modalidad==="hibrido"?"🔀":"💻"} {LBL_MODAL[evento.modalidad]||evento.modalidad}</span>
                <span style={{...bs,background:factBg}}>{evento.estado==="Facturado"?"✓ Facturado":"⏳ Facturación Pendiente"}</span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",alignItems:"flex-end",flexShrink:0}}>
              <BotonesAccion/>
              <button onClick={onCerrar} style={{background:"#868E96",border:"none",cursor:"pointer",fontSize:"13px",color:"#fff",padding:"6px 14px",borderRadius:"6px",fontFamily:"inherit",fontWeight:"600"}}>✕ Cerrar</button>
            </div>
          </div>
        </div>
        {/* Cuerpo */}
        <div style={{overflowY:"auto",flex:1,padding:"24px 28px"}}>
          {/* Programa multidía PRIMERO */}
          {esMultidia&&dias.length>0&&<div style={{marginBottom:"28px"}}>
            <ST txt="📅 Programa del evento"/>
            <div style={{borderRadius:"10px",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",border:`1px solid ${C.grisBorde}`}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"#2D3748",color:"#fff"}}>
                  {["Día","Fecha","Horario","Jornada"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:"12px",fontWeight:"600"}}>{h}</th>)}
                </tr></thead>
                <tbody>{dias.map((dia,dIdx)=>(
                  <tr key={dIdx} style={{background:dIdx%2===0?"#fff":"#F7FAFC",borderBottom:`1px solid ${C.grisBorde}`}}>
                    <td style={{padding:"10px 14px",fontSize:"13px",fontWeight:"700",color:C.azul}}>Día {dIdx+1}</td>
                    <td style={{padding:"10px 14px",fontSize:"13px",color:C.texto}}>{formatLargo(dia.fecha)}</td>
                    <td style={{padding:"10px 14px",fontSize:"13px",color:C.texto}}>{dia.hora_inicio?.slice(0,5)} – {dia.hora_termino?.slice(0,5)} hrs</td>
                    <td style={{padding:"10px 14px",fontSize:"13px",color:C.textoMed}}>{dia.jornada}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>}
          {/* Fecha y Horario */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"28px"}}>
            <div style={{background:C.gris,borderRadius:"10px",padding:"12px 16px"}}>
              <ST txt="📅 Fecha"/>
              <div style={{fontSize:"20px",fontWeight:"600",color:"#1A1A1A"}}>{esMultidia?`${formatCorto(evento.fecha_inicio)} → ${formatCorto(evento.fecha_termino)}`:formatLargo(evento.fecha_inicio)}</div>
            </div>
            <div style={{background:C.gris,borderRadius:"10px",padding:"12px 16px"}}>
              <ST txt="🕐 Horario"/>
              <div style={{fontSize:"20px",fontWeight:"600",color:"#1A1A1A"}}>{evento.hora_inicio?.slice(0,5)} – {evento.hora_termino?.slice(0,5)} hrs{evento.jornada&&<span style={{fontWeight:"400",color:C.textoMed}}> · {evento.jornada}</span>}</div>
            </div>
          </div>
          {/* Plataforma */}
          {(evento.modalidad==="remoto"||evento.modalidad==="hibrido")&&<div style={{marginBottom:"28px"}}>
            <ST txt="💻 Plataforma"/>
            <span style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"6px 14px",borderRadius:"20px",fontSize:"13px",fontWeight:"600",color:esZoomMC?"#92400E":C.texto,background:esZoomMC?"#FFF3CD":C.grisMed,border:esZoomMC?"1px solid #F59E0B":`1px solid ${C.grisBorde}`}}>
              💻 {evento.plataforma}{evento.zoom_administrador&&` — Administra: ${evento.zoom_administrador}`}
            </span>
          </div>}
          {/* Lugar */}
          {(evento.modalidad==="presencial"||evento.modalidad==="hibrido")&&evento.lugar&&<div style={{marginBottom:"28px"}}>
            <ST txt="📍 Lugar"/>
            <div style={{display:"flex",alignItems:"flex-start",gap:"12px",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:"180px"}}>
                <div style={{fontWeight:"600",fontSize:"20px",color:"#1A1A1A"}}>{evento.lugar}</div>
                {evento.lugar_detalle&&<div style={{color:C.textoMed,fontSize:"15px",marginTop:"4px"}}>{evento.lugar_detalle}</div>}
              </div>
              <div style={{display:"flex",gap:"8px",flexShrink:0}}>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((evento.lugar||"")+" "+(evento.lugar_detalle||""))}`} target="_blank" rel="noreferrer"
                  style={{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"13px",fontWeight:"600",color:C.azul,textDecoration:"none",padding:"7px 14px",border:`1px solid ${C.azulBorde}`,borderRadius:"8px",background:C.azulClaro,whiteSpace:"nowrap"}}>
                  📍 Google Maps
                </a>
                <CampoCopia valor={`${evento.lugar}${evento.lugar_detalle?", "+evento.lugar_detalle:""}`}/>
              </div>
            </div>
          </div>}
          {/* Intérpretes (un día) */}
          {asignaciones.length>0&&<div style={{marginBottom:"28px"}}>
            <ST txt="🎙 Intérpretes"/>
            {asignaciones.map((a,i)=><InterpPill key={i} a={a}/>)}
          </div>}
          {/* Intérpretes y equipos por día (multidía) */}
          {esMultidia&&dias.map((dia,dIdx)=>{
            const asigsDia=dia.asignaciones_dia||[],eqsDia=dia.equipos_dia||[];
            if(!asigsDia.length&&!eqsDia.length) return null;
            return (
              <div key={dia.id||dIdx} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"10px",marginBottom:"12px",overflow:"hidden"}}>
                <div style={{background:"#F7FAFC",padding:"10px 16px",fontWeight:"600",color:C.texto,fontSize:"13px"}}>
                  📅 Día {dIdx+1} — {formatLargo(dia.fecha)} · {dia.hora_inicio?.slice(0,5)} – {dia.hora_termino?.slice(0,5)} hrs
                </div>
                <div style={{padding:"12px 16px"}}>
                  {asigsDia.map((a,aIdx)=><InterpPill key={aIdx} a={a}/>)}
                  {eqsDia.map((eq,eIdx)=>(
                    <div key={eIdx} style={{fontSize:"13px",color:C.textoMed,padding:"8px 12px",background:"#EDF2F7",border:`1px solid ${C.grisBorde}`,borderRadius:"8px",marginTop:"6px"}}>
                      🔧 {eq.tipo_equipo==="fijo"?"Sistema fijo":eq.tipo_equipo==="portatil"?"Sistema portátil":"Cabina portátil"}
                      {eq.proveedor_nombre&&` · ${eq.proveedor_nombre}`}{eq.num_receptores>0&&` · ${eq.num_receptores} receptores`}{eq.num_cabinas>0&&` · ${eq.num_cabinas} cabinas`}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Equipos AV (un día) */}
          {!esMultidia&&(evento.evento_dias||[]).flatMap(d=>d.equipos_dia||[]).length>0&&<div style={{marginBottom:"16px",background:"#EDF2F7",borderRadius:"10px",padding:"14px 16px"}}>
            <ST txt="🔧 Equipos AV"/>
            {(evento.evento_dias||[]).flatMap(d=>d.equipos_dia||[]).map((eq,eIdx)=>(
              <div key={eIdx} style={{fontSize:"13px",color:C.textoMed,marginBottom:"4px"}}>
                {eq.tipo_equipo==="fijo"?"Sistema fijo":eq.tipo_equipo==="portatil"?"Sistema portátil":"Cabina portátil"}
                {eq.proveedor_nombre&&` · ${eq.proveedor_nombre}`}{eq.num_receptores>0&&` · ${eq.num_receptores} receptores`}{eq.num_cabinas>0&&` · ${eq.num_cabinas} cabinas`}
              </div>
            ))}
          </div>}
          {/* Comentarios */}
          {evento.comentarios&&<div style={{background:C.gris,borderRadius:"10px",padding:"12px 16px",marginBottom:"16px"}}>
            <ST txt="💬 Comentarios"/>
            <div style={{color:C.texto,fontSize:"14px"}}>{evento.comentarios}</div>
          </div>}
          {/* Historial */}
          <div style={{fontSize:"12px",color:"#6B6B6B",display:"flex",gap:"16px",flexWrap:"wrap",paddingTop:"8px",borderTop:`1px solid ${C.grisBorde}`}}>
            {evento.created_by_nombre&&<span>Creado por <strong>{evento.created_by_nombre}</strong>{evento.created_at&&" el "+new Date(evento.created_at).toLocaleString("es-CL")}</span>}
            {evento.edited_by_nombre&&<span>Última edición por <strong>{evento.edited_by_nombre}</strong>{evento.updated_at&&" el "+new Date(evento.updated_at).toLocaleString("es-CL")}</span>}
          </div>
        </div>
        {/* Footer */}
        <div style={{padding:"16px 24px",borderTop:`1px solid ${C.grisBorde}`,flexShrink:0,display:"flex",gap:"10px",justifyContent:"space-between",alignItems:"center",background:C.gris,borderRadius:"0 0 20px 20px"}}>
          <BotonesAccion/>
          <button onClick={onCerrar} style={btnD("#868E96")}>Cerrar</button>
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
  const DEFAULTS={cliente:true,evento:true,tipo:true,modalidad:true,fecha:true,horario:true,jornada:true,lugar:true,plataforma:true,interpretes:true,equipos:false,comentarios:false};
  const [campos,setCampos]=useState(()=>({...DEFAULTS,...JSON.parse(localStorage.getItem("mc_ficha_campos")||"{}")}));
  const toggleCampo=(k)=>{const n={...campos,[k]:!campos[k]};setCampos(n);localStorage.setItem("mc_ficha_campos",JSON.stringify(n));};
  const [exportando,setExportando]=useState(false);

  const exportarJPG=async()=>{
    const el=document.getElementById("ficha-mc");
    if(!el)return;
    setExportando(true);
    const prev=el.style.width;
    el.style.width="1200px";
    try{
      const canvas=await html2canvas(el,{scale:2,backgroundColor:"#ffffff",useCORS:true,logging:false});
      el.style.width=prev;
      const url=canvas.toDataURL("image/jpeg",0.95);
      const nombreCliente=(cliente?.nombre_empresa||"evento").replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g,"").trim().replace(/\s+/g,"-").toLowerCase();
      const fecha=new Date().toISOString().slice(0,10);
      const a=document.createElement("a");
      a.download=`ficha-${nombreCliente}-${fecha}.jpg`;a.href=url;a.click();
      window.open(url,"_blank");
    }catch(err){el.style.width=prev;}
    setExportando(false);
  };

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
            {CAMPOS_OPC.map(({k,l})=><button key={k} onClick={()=>toggleCampo(k)}
              style={{padding:"6px 14px",borderRadius:"20px",cursor:"pointer",fontSize:"13px",fontWeight:"700",fontFamily:"inherit",background:campos[k]?C.azul:C.grisMed,color:campos[k]?"#fff":C.textoMed,border:campos[k]?`1.5px solid ${C.azulOsc}`:`1.5px solid ${C.grisBorde}`}}>{l}</button>)}
          </div>
        </div>
        {/* Ficha */}
        <div id="ficha-mc" ref={fichaRef} style={{padding:"32px 36px",flex:1,overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"28px",padding:"20px 24px",borderRadius:"12px",background:"#1e3a6e",color:"#fff"}}>
            <Logo size={56}/>
            <div>
              <div style={{fontSize:"31px",fontWeight:"900",color:"#fff"}}>MUNDO<span style={{color:"#e63946"}}>CHILE</span></div>
              <div style={{fontSize:"17px",color:"rgba(255,255,255,0.75)"}}>Gestión de Interpretaciones</div>
            </div>
            <div style={{marginLeft:"auto",textAlign:"right"}}>
              <div style={{fontSize:"17px",color:"rgba(255,255,255,0.75)"}}>Generado el</div>
              <div style={{fontSize:"18px",fontWeight:"700",color:"#fff"}}>{new Date().toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 24px"}}>
            {campos.cliente&&<div style={{gridColumn:"1/-1"}}><div style={{fontSize:"11px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"1px"}}>Cliente</div><div style={{fontSize:"22px",fontWeight:"700",color:C.rojo,marginTop:"4px"}}>{cliente?.nombre_empresa||"—"}</div></div>}
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
        <div style={{fontWeight:"700",fontSize:"18px",color:C.texto,marginBottom:"20px"}}>🏢 Nuevo cliente</div>
        <div style={{marginBottom:"20px"}}><label style={S.lbl}>Nombre empresa *</label><input style={S.inp} value={f.nombre_empresa} onChange={e=>u("nombre_empresa",e.target.value)}/></div>
        <div style={{...S.fila,marginBottom:"20px"}}>
          <div style={S.camp}><label style={S.lbl}>Contacto</label><input style={S.inp} value={f.nombre_contacto} onChange={e=>u("nombre_contacto",e.target.value)}/></div>
          <div style={S.camp}><label style={S.lbl}>Email</label><input style={S.inp} type="email" value={f.email_contacto} onChange={e=>u("email_contacto",e.target.value)}/></div>
        </div>
        <div style={{...S.fila,marginBottom:"20px"}}>
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
        <div style={{fontWeight:"700",fontSize:"18px",color:C.texto,marginBottom:"20px"}}>👤 Nuevo intérprete</div>
        <div style={{...S.fila,marginBottom:"20px"}}>
          <div style={S.camp}><label style={S.lbl}>Nombre *</label><input style={S.inp} value={f.nombre} onChange={e=>u("nombre",e.target.value)}/></div>
          <div style={S.camp}><label style={S.lbl}>Apellido</label><input style={S.inp} value={f.apellido} onChange={e=>u("apellido",e.target.value)}/></div>
        </div>
        <div style={{...S.fila,marginBottom:"20px"}}>
          <div style={S.camp}><label style={S.lbl}>Email</label><input style={S.inp} type="email" value={f.email} onChange={e=>u("email",e.target.value)}/></div>
          <div style={S.camp}><label style={S.lbl}>Teléfono</label><input style={S.inp} value={f.telefono} onChange={e=>u("telefono",e.target.value)}/></div>
        </div>
        <div style={{...S.fila,marginBottom:"20px"}}>
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
function PantallaConfig({clientes,interpretes,pares,proveedores,lugares=[],onActualizar,perfil}) {
  const [tab,setTab]=useState("interpretes");
  const [editando,setEditando]=useState(null);
  const [formEdit,setFormEdit]=useState({});
  const [perfiles,setPerfiles]=useState([]);
  const tabs=[{id:"interpretes",l:"👤 Intérpretes"},{id:"clientes",l:"🏢 Clientes"},{id:"idiomas",l:"🌐 Idiomas"},{id:"proveedores",l:"🔧 Proveedores"},{id:"lugares",l:"📍 Lugares"},{id:"usuarios",l:"👥 Usuarios"}];

  useEffect(()=>{if(tab==="usuarios")sb.from("perfiles").select("*").order("nombre").then(({data})=>data&&setPerfiles(data));},[tab]);

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
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"20px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({nombre:"",apellido:"",email:"",telefono:"",ciudad:"",modalidad_trabajo:"ambas",es_host_zoom:false,notas:"",activo:true});}} style={S.btnA}>+ Nuevo intérprete</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{fontWeight:"800",color:C.azul,marginBottom:"20px"}}>{editando==="nuevo"?"Nuevo intérprete":"Editar intérprete"}</div>
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
        {interpretes.map(i=>{
          const nombreCompleto=`${i.nombre||""}${i.apellido?" "+i.apellido:""}`;
          const aColor=avatarColor(nombreCompleto);
          return(
          <div key={i.id} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"12px",padding:"14px 20px",marginBottom:"10px",background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",opacity:i.activo===false?0.6:1,transition:"background 0.1s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.gris}
            onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
            <div style={{display:"flex",gap:"12px",alignItems:"center",flex:1,minWidth:0}}>
              <div style={{width:"40px",height:"40px",borderRadius:"50%",background:aColor,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700",fontSize:"16px",flexShrink:0}}>{(i.nombre||"?").slice(0,1).toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:"800",fontSize:"15px",color:C.texto}}>{nombreCompleto}{i.es_host_zoom&&<span style={{color:C.rojo,marginLeft:"8px",fontSize:"12px"}}>🎛 Host Zoom</span>}</div>
                <div style={{display:"flex",gap:"12px",marginTop:"4px",flexWrap:"wrap"}}>
                  {i.email&&<CampoCopia valor={i.email}/>}
                  {i.telefono&&<CampoCopia valor={i.telefono}/>}
                  {i.ciudad&&<span style={{fontSize:"13px",color:C.textoMed}}>📍 {i.ciudad}</span>}
                  {i.modalidad_trabajo&&<span style={{fontSize:"13px",color:C.textoMed}}>{i.modalidad_trabajo==="ambas"?"💻📍":i.modalidad_trabajo==="online"?"💻 Online":"📍 Presencial"}</span>}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:"6px",flexShrink:0}}>
              <button onClick={()=>{setEditando(i.id);setFormEdit({...i});}} style={S.btnEdit}>✏️ Editar</button>
              <button onClick={async()=>{await sb.from("interpretes").update({activo:!i.activo}).eq("id",i.id);onActualizar();}}
                style={{...S.btnP,background:i.activo?C.rojoClaro:C.verdeClaro,color:i.activo?C.rojo:C.verde,borderColor:i.activo?C.rojo:C.verde}}>
                {i.activo?"Desactivar":"Activar"}
              </button>
            </div>
          </div>);
        })}
      </>}

      {/* ── CLIENTES ── */}
      {tab==="clientes"&&<>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"20px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({nombre_empresa:"",nombre_contacto:"",email_contacto:"",telefono:"",celular:"",notas:"",activo:true});}} style={S.btnA}>+ Nuevo cliente</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{fontWeight:"800",color:C.azul,marginBottom:"20px"}}>{editando==="nuevo"?"Nuevo cliente":"Editar cliente"}</div>
          <div style={{marginBottom:"12px"}}><label style={S.lbl}>Nombre empresa *</label>{EF("nombre_empresa")}</div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Contacto</label>{EF("nombre_contacto")}</div>
            <div style={S.camp}><label style={S.lbl}>Email</label>{EF("email_contacto")}</div>
          </div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Teléfono</label>{EF("telefono")}</div>
            <div style={S.camp}><label style={S.lbl}>Celular</label>{EF("celular")}</div>
          </div>
          <div style={{marginBottom:"20px"}}><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:"60px"}} value={formEdit.notas||""} onChange={e=>setFormEdit(f=>({...f,notas:e.target.value}))}/></div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>guardar("clientes",formEdit,editando)} style={S.btnA}>💾 Guardar</button>
            <button onClick={()=>{setEditando(null);setFormEdit({});}} style={S.btnG}>Cancelar</button>
          </div>
        </div>}
        {clientes.map(c=>{
          const cColor=avatarColor(c.nombre_empresa||"");
          return(
          <div key={c.id} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"12px",padding:"14px 20px",marginBottom:"10px",background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",transition:"background 0.1s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.gris}
            onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
            <div style={{display:"flex",gap:"12px",alignItems:"center",flex:1}}>
              <div style={{width:"40px",height:"40px",borderRadius:"50%",background:cColor,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700",fontSize:"16px",flexShrink:0}}>{(c.nombre_empresa||"?").slice(0,1).toUpperCase()}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:"800",fontSize:"15px",color:C.texto}}>{c.nombre_empresa}</div>
                <div style={{display:"flex",gap:"14px",marginTop:"4px",flexWrap:"wrap"}}>
                  {c.nombre_contacto&&<span style={{fontSize:"13px",color:C.textoMed}}>👤 {c.nombre_contacto}</span>}
                  {c.email_contacto&&<CampoCopia valor={c.email_contacto}/>}
                  {c.telefono&&<CampoCopia valor={c.telefono}/>}
                </div>
              </div>
            </div>
            <button onClick={()=>{setEditando(c.id);setFormEdit({...c});}} style={S.btnEdit}>✏️ Editar</button>
          </div>);
        })}
      </>}

      {/* ── IDIOMAS ── */}
      {tab==="idiomas"&&<>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"20px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({idioma_origen:"",idioma_destino:"Español",activo:true});}} style={S.btnA}>+ Nuevo par de idiomas</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{...S.fila,marginBottom:"20px"}}>
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
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"20px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({nombre:"",nombre_contacto:"",email:"",telefono:"",notas:"",activo:true});}} style={S.btnA}>+ Nuevo proveedor</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Nombre empresa *</label>{EF("nombre")}</div>
            <div style={S.camp}><label style={S.lbl}>Contacto</label>{EF("nombre_contacto")}</div>
          </div>
          <div style={{...S.fila,marginBottom:"20px"}}>
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

      {/* ── LUGARES ── */}
      {tab==="lugares"&&<>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"20px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({nombre:"",direccion:"",activo:true});}} style={S.btnA}>+ Nuevo lugar</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{fontWeight:"700",color:C.azul,marginBottom:"16px"}}>{editando==="nuevo"?"Nuevo lugar":"Editar lugar"}</div>
          <div style={{marginBottom:"12px"}}><label style={S.lbl}>Nombre *</label>{EF("nombre")}</div>
          <div style={{marginBottom:"16px"}}><label style={S.lbl}>Dirección</label>{EF("direccion")}</div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>guardar("lugares",formEdit,editando)} style={S.btnA}>💾 Guardar</button>
            <button onClick={()=>{setEditando(null);setFormEdit({});}} style={S.btnG}>Cancelar</button>
          </div>
        </div>}
        {lugares.map(l=>(
          <div key={l.id} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"10px",padding:"14px 20px",marginBottom:"8px",background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",opacity:l.activo===false?0.5:1}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:"700",fontSize:"15px",color:C.texto}}>📍 {l.nombre}</div>
              {l.direccion&&<div style={{fontSize:"13px",color:C.textoMed,marginTop:"3px"}}>{l.direccion}</div>}
            </div>
            <div style={{display:"flex",gap:"6px"}}>
              <button onClick={()=>{setEditando(l.id);setFormEdit({...l});}} style={S.btnEdit}>✏️ Editar</button>
              <button onClick={async()=>{await sb.from("lugares").update({activo:!l.activo}).eq("id",l.id);onActualizar();}}
                style={{...S.btnP,background:l.activo?C.rojoClaro:C.verdeClaro,color:l.activo?C.rojo:C.verde,borderColor:l.activo?C.rojo:C.verde}}>
                {l.activo?"Desactivar":"Activar"}
              </button>
            </div>
          </div>
        ))}
        {lugares.length===0&&<div style={{textAlign:"center",padding:"40px",color:C.textoSuave}}>Sin lugares registrados. Agrega uno arriba.</div>}
      </>}

      {/* ── USUARIOS ── */}
      {tab==="usuarios"&&<>
        <div style={{marginBottom:"16px",fontSize:"13px",color:C.textoMed}}>Gestión de accesos al sistema. Solo administradores pueden cambiar roles.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:"8px",padding:"8px 16px",background:C.grisMed,borderRadius:"8px",marginBottom:"8px",fontSize:"12px",fontWeight:"700",color:C.textoMed,textTransform:"uppercase"}}>
          <span>Nombre</span><span>Email</span><span>Rol</span><span>Acciones</span>
        </div>
        {perfiles.map(p=>{
          const rolColor=p.rol==="admin"?C.rojo:p.rol==="editor"?C.azul:C.textoSuave;
          return(
          <div key={p.id} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"10px",padding:"12px 16px",marginBottom:"8px",background:"#fff",display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:"8px",alignItems:"center",opacity:p.activo===false?0.5:1}}>
            <div style={{fontWeight:"700",fontSize:"14px",color:C.texto}}>{p.nombre||"Sin nombre"}</div>
            <div style={{fontSize:"13px",color:C.textoMed}}>{p.email||"—"}</div>
            <select style={{...S.sel,height:"36px",fontSize:"13px",color:rolColor,fontWeight:"700",borderColor:rolColor+"66"}} value={p.rol||"viewer"}
              onChange={async e=>{await sb.from("perfiles").update({rol:e.target.value}).eq("id",p.id);setPerfiles(xs=>xs.map(x=>x.id===p.id?{...x,rol:e.target.value}:x));}}>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button onClick={async()=>{const nu=p.activo===false;await sb.from("perfiles").update({activo:nu}).eq("id",p.id);setPerfiles(xs=>xs.map(x=>x.id===p.id?{...x,activo:nu}:x));}}
              style={{...S.btnP,background:p.activo===false?C.verdeClaro:C.rojoClaro,color:p.activo===false?C.verde:C.rojo,borderColor:p.activo===false?C.verde:C.rojo,whiteSpace:"nowrap"}}>
              {p.activo===false?"Activar":"Desactivar"}
            </button>
          </div>);
        })}
        {perfiles.length===0&&<div style={{textAlign:"center",padding:"40px",color:C.textoSuave}}>Cargando usuarios…</div>}
      </>}
    </div>
  );
}

// ─── VISTA AGENDA (F8) ───────────────────────────────────────────────────────
function VistaAgenda({eventos,clientes,interpretes,pares,onAbrir}) {
  const sorted=[...eventos].sort((a,b)=>a.fecha_inicio.localeCompare(b.fecha_inicio));
  const byWeek={};
  sorted.forEach(ev=>{
    const d=desdeISO(ev.fecha_inicio);
    const dow=d.getDay()===0?6:d.getDay()-1;
    const lun=new Date(d);lun.setDate(d.getDate()-dow);
    const key=toISO(lun);
    if(!byWeek[key])byWeek[key]=[];
    byWeek[key].push(ev);
  });
  if(!Object.keys(byWeek).length) return (
    <div style={{textAlign:"center",padding:"80px 20px",color:C.textoSuave}}>
      <div style={{fontSize:"40px",marginBottom:"12px"}}>📅</div>
      <div style={{fontWeight:"700",fontSize:"16px"}}>No hay eventos que mostrar</div>
    </div>
  );
  return (
    <div style={{padding:"24px 24px 80px"}}>
      {Object.entries(byWeek).map(([lunISO,evs])=>{
        const fin=new Date(desdeISO(lunISO));fin.setDate(fin.getDate()+6);
        return (
          <div key={lunISO} style={{marginBottom:"36px"}}>
            <div style={{fontSize:"18px",fontWeight:"700",color:C.textoSuave,textTransform:"uppercase",letterSpacing:"0.75px",marginBottom:"16px",paddingBottom:"12px",borderBottom:`1.5px solid ${C.grisBorde}`}}>
              Semana del {formatCorto(lunISO)} al {formatCorto(toISO(fin))} · {evs.length} evento{evs.length!==1?"s":""}
            </div>
            {evs.map(ev=>{
              const cliente=clientes.find(c=>c.id===ev.cliente_id);
              const evBg=colorCliente(ev.cliente_id);
              return (
                <div key={ev.id} onClick={()=>onAbrir(ev)}
                  style={{display:"flex",gap:"18px",alignItems:"flex-start",padding:"20px 22px",borderRadius:"12px",marginBottom:"16px",border:`1.5px solid ${C.grisBorde}`,background:"#fff",cursor:"pointer",borderLeft:`8px solid ${evBg}`,boxShadow:"0 2px 8px rgba(0,0,0,0.10)",transition:"transform 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <div style={{minWidth:"90px",textAlign:"center",background:C.gris,borderRadius:"8px",padding:"12px 6px",flexShrink:0}}>
                    <div style={{fontSize:"15px",color:C.textoSuave,fontWeight:"700",textTransform:"uppercase"}}>{diasNombres[desdeISO(ev.fecha_inicio).getDay()].slice(0,3)}</div>
                    <div style={{fontSize:"30px",fontWeight:"700",color:C.texto,lineHeight:1.1}}>{desdeISO(ev.fecha_inicio).getDate()}</div>
                    <div style={{fontSize:"15px",color:C.textoSuave}}>{MESES_C[desdeISO(ev.fecha_inicio).getMonth()]}</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:"700",fontSize:"22px",color:C.texto,marginBottom:"4px"}}>{cliente?.nombre_empresa||"—"}</div>
                    {ev.nombre_evento&&<div style={{fontSize:"19px",color:C.textoMed,marginBottom:"8px"}}>{ev.nombre_evento}</div>}
                    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontSize:"18px",color:C.textoMed,fontWeight:"600"}}>{ev.hora_inicio?.slice(0,5)}–{ev.hora_termino?.slice(0,5)}</span>
                      <Badge texto={ev.tipo} solid color={ev.tipo==="Simultánea"?"#3B5BDB":ev.tipo==="Consecutiva"?"#2F9E44":"#9C36B5"}/>
                      <Badge texto={LBL_MODAL[ev.modalidad]||ev.modalidad} solid color={ev.modalidad==="presencial"?"#2F9E44":ev.modalidad==="hibrido"?"#E67700":"#1971C2"}/>
                      <Badge texto={ev.estado==="Facturado"?"Facturado":"Facturación Pendiente"} solid color={ev.estado==="Facturado"?"#1971C2":"#E67700"}/>
                    </div>
                    {(ev.asignaciones||[]).length>0&&<div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"10px"}}>
                      {(ev.asignaciones||[]).slice(0,3).map((a,ai)=>{const i=interpretes.find(x=>x.id===a.interprete_id);const p=pares.find(x=>x.id===a.par_id);if(!i)return null;const idioma=p?.idioma_origen||"";return<span key={ai} style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 12px",borderRadius:"20px",fontSize:"16px",fontWeight:"600",color:"#fff",background:idiomaColor(idioma),border:a.is_host?"2px solid #E03131":"2px solid transparent",maxWidth:"220px"}}><FlagImg idioma={idioma}/><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i.nombre}{i.apellido?" "+i.apellido:""}</span></span>;})}
                      {(ev.asignaciones||[]).length>3&&<span style={{fontSize:"16px",color:C.textoSuave,alignSelf:"center",fontWeight:"600"}}>+{(ev.asignaciones||[]).length-3} más</span>}
                    </div>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  // TEMP: login desactivado — para reactivar cambiar SKIP_LOGIN a false
  const SKIP_LOGIN = true;
  const [usuario,setUsuario]=useState(SKIP_LOGIN ? {id:"bypass"} : null);
  const [perfil,setPerfil]=useState(SKIP_LOGIN ? {rol:"admin",nombre:"Admin"} : null);
  const [cargandoAuth,setCargandoAuth]=useState(false);
  const [eventos,setEventos]=useState([]);
  const [clientes,setClientes]=useState([]);
  const [interpretes,setInterpretes]=useState([]);
  const [pares,setPares]=useState([]);
  const [proveedores,setProveedores]=useState([]);
  const [lugares,setLugares]=useState([]);
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
  // Búsqueda, filtros y toasts
  const [busqueda,setBusqueda]=useState("");
  const [buscando,setBuscando]=useState(false);
  const [filtros,setFiltros]=useState({estado:"",modalidad:"",tipo:"",interprete_id:""});
  const [mostrarFiltros,setMostrarFiltros]=useState(false);
  const [toasts,setToasts]=useState([]);
  const addToast=useCallback((msg,type="info",retry=null)=>{
    const id=Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,type,retry}]);
    if(type!=="error")setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4000);
  },[]);
  const removeToast=useCallback(id=>setToasts(t=>t.filter(x=>x.id!==id)),[]);

  useEffect(()=>{
    const s=document.createElement("style");
    s.textContent="@keyframes mcpulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}";
    document.head.appendChild(s);
    return()=>document.head.removeChild(s);
  },[]);

  // ── Auth ──
  useEffect(()=>{
    if(SKIP_LOGIN){ cargarDatos(); return; }
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
    const[evR,cliR,intR,parR,provR,lugR]=await Promise.all([
      sb.from("eventos").select("*, asignaciones(*), evento_dias(*, asignaciones_dia(*), equipos_dia(*))").order("fecha_inicio"),
      sb.from("clientes").select("*").order("nombre_empresa"),
      sb.from("interpretes").select("*").order("nombre"),
      sb.from("pares_idiomas").select("*").order("idioma_origen"),
      sb.from("proveedores").select("*").order("nombre"),
      sb.from("lugares").select("*").order("nombre"),
    ]);
    if(evR.data) setEventos(evR.data);
    if(cliR.data) setClientes(cliR.data);
    if(intR.data) setInterpretes(intR.data);
    if(parR.data) setPares(parR.data);
    if(provR.data) setProveedores(provR.data);
    if(lugR.data) setLugares(lugR.data);
    setCargando(false);
  },[]);

  const diasSemana=useMemo(()=>semanaDesde(semanaOff),[semanaOff]);
  const esMobile=typeof window!=="undefined"&&window.innerWidth<768;

  const eventosFiltrados=useMemo(()=>{
    let evs=eventos;
    if(busqueda.trim()){
      const b=busqueda.toLowerCase().trim();
      evs=evs.filter(ev=>{
        const cli=clientes.find(c=>c.id===ev.cliente_id);
        const iNombres=(ev.asignaciones||[]).map(a=>{const i=interpretes.find(x=>x.id===a.interprete_id);return i?`${i.nombre} ${i.apellido||""}`:""}).join(" ");
        const ots=(ev.asignaciones||[]).map(a=>a.nro_ot||"").join(" ");
        const bols=(ev.asignaciones||[]).map(a=>a.nro_boleta||"").join(" ");
        return(cli?.nombre_empresa||"").toLowerCase().includes(b)||(ev.nombre_evento||"").toLowerCase().includes(b)||(ev.nro_oc||"").toLowerCase().includes(b)||iNombres.toLowerCase().includes(b)||ots.toLowerCase().includes(b)||bols.toLowerCase().includes(b);
      });
    }
    if(filtros.estado) evs=evs.filter(e=>e.estado===filtros.estado);
    if(filtros.modalidad) evs=evs.filter(e=>e.modalidad===filtros.modalidad);
    if(filtros.tipo) evs=evs.filter(e=>e.tipo===filtros.tipo);
    if(filtros.interprete_id) evs=evs.filter(e=>(e.asignaciones||[]).some(a=>String(a.interprete_id)===String(filtros.interprete_id)));
    return evs;
  },[eventos,busqueda,filtros,clientes,interpretes]);

  const evsDia=(iso)=>eventosFiltrados.filter(e=>e.fecha_inicio<=iso&&e.fecha_termino>=iso).sort((a,b)=>(a.hora_inicio||"").localeCompare(b.hora_inicio||""));

  const hayFiltros=busqueda||Object.values(filtros).some(Boolean);

  const exportarExcel=()=>{
    const rows=eventosFiltrados.map(ev=>{
      const cli=clientes.find(c=>c.id===ev.cliente_id);
      const asigs=(ev.asignaciones||[]).map(a=>{const i=interpretes.find(x=>x.id===a.interprete_id);const p=pares.find(x=>x.id===a.par_id);return i?`${i.nombre}${i.apellido?" "+i.apellido:""}${p?" ("+p.descripcion+")":""}`:""}).filter(Boolean).join("; ");
      return{"Cliente":cli?.nombre_empresa||"","Evento":ev.nombre_evento||"","Tipo":ev.tipo||"","Modalidad":LBL_MODAL[ev.modalidad]||ev.modalidad,"Estado":ev.estado||"","Fecha inicio":ev.fecha_inicio,"Fecha término":ev.fecha_termino,"Hora inicio":ev.hora_inicio?.slice(0,5),"Hora término":ev.hora_termino?.slice(0,5),"Jornada":ev.jornada,"N° OC":ev.nro_oc||"","Lugar":ev.lugar||"","Plataforma":ev.plataforma||"","Intérpretes":asigs};
    });
    const ws=XLSX.utils.json_to_sheet(rows);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Eventos");
    XLSX.writeFile(wb,`MundoChile_${new Date().toISOString().slice(0,10)}.xlsx`);
    addToast("Excel exportado correctamente","success");
  };

  const navAnterior=()=>{if(vista==="semana")setSemanaOff(o=>o-1);else if(vista==="mes")setMesOff(o=>o-1);else if(vista==="dia"){const d=desdeISO(diaActual);d.setDate(d.getDate()-1);setDiaActual(toISO(d));}};
  const navSiguiente=()=>{if(vista==="semana")setSemanaOff(o=>o+1);else if(vista==="mes")setMesOff(o=>o+1);else if(vista==="dia"){const d=desdeISO(diaActual);d.setDate(d.getDate()+1);setDiaActual(toISO(d));}};

  const tituloNav=()=>{
    if(vista==="semana"){const d=diasSemana;const capM=(m)=>MESES_L[m].charAt(0).toUpperCase()+MESES_L[m].slice(1);return `${d[0].getDate()} ${capM(d[0].getMonth())} – ${d[6].getDate()} ${capM(d[6].getMonth())} ${d[6].getFullYear()}`;}
    if(vista==="mes"){const n=new Date();n.setMonth(n.getMonth()+mesOff);return `${MESES_L[n.getMonth()].charAt(0).toUpperCase()+MESES_L[n.getMonth()].slice(1)} ${n.getFullYear()}`;}
    if(vista==="agenda") return "Agenda";
    return formatLargo(diaActual);
  };
  const contadorSubtitulo=()=>{
    if(cargando) return "Cargando…";
    if(vista==="dia"){const n=evsDia(diaActual).length;return `${n} evento${n!==1?"s":""}`;}
    const n=eventosFiltrados.length;return `${n} evento${n!==1?"s":""}${hayFiltros?" (filtrado)":""}`;
  };

  const abrirEvento=async(ev)=>{
    const{data}=await sb.from("eventos").select("*, asignaciones(*), evento_dias(*, asignaciones_dia(*), equipos_dia(*))").eq("id",ev.id).single();
    setModalDetalle(data||ev);
  };

  const editarEvento=(ev)=>{
    const esDia=ev.fecha_inicio===ev.fecha_termino;
    const diasForm=(ev.evento_dias||[])
      .filter(d=>!esDia)
      .sort((a,b)=>a.orden-b.orden)
      .map(d=>({...d,asignaciones:(d.asignaciones_dia||[]).map(a=>({...asigVacia(),...a})),equipos:d.equipos_dia||[]}));
    const equiposSingles=esDia&&(ev.evento_dias||[]).length>0?(ev.evento_dias[0].equipos_dia||[]):[];
    const asigs=(ev.asignaciones||[]).map(a=>({...asigVacia(),...a}));
    setModalDetalle(null);
    setModalEvento({modo:"editar",data:{...ev,asignaciones:asigs,dias:diasForm,equipos:equiposSingles}});
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
      <div style={{padding:"20px 24px 80px",overflowX:"auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",minWidth:"800px"}}>
          {DIAS_SEM.map(d=><div key={d} style={{textAlign:"center",fontWeight:"700",fontSize:"12px",color:"rgba(255,255,255,0.85)",padding:"8px 0",textTransform:"uppercase"}}>{d}</div>)}
          {celdas.map((dia,i)=>{
            if(!dia) return <div key={i}/>;
            const iso=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
            const evs=evsDia(iso), esHoy=iso===hoy();
            return <div key={i} onClick={()=>{setDiaActual(iso);setVista("dia");}}
              style={{minHeight:"100px",border:`1.5px solid ${esHoy?"#3a7bd5":"#E5E5E3"}`,borderRadius:"10px",padding:"10px",cursor:"pointer",background:esHoy?"#3a7bd5":"#FFFFFF"}}
              onMouseEnter={e=>{if(!esHoy)e.currentTarget.style.background="#F7F7F5";}} onMouseLeave={e=>{if(!esHoy)e.currentTarget.style.background="#FFFFFF";}}>
              <div style={{marginBottom:"4px"}}><span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"28px",height:"28px",borderRadius:"50%",background:esHoy?"rgba(255,255,255,0.25)":"transparent",color:esHoy?"#fff":C.texto,fontWeight:"700",fontSize:"14px"}}>{dia}</span></div>
              {evs.slice(0,2).map((ev,j)=><div key={j} onClick={e=>{e.stopPropagation();abrirEvento(ev);}} style={{fontSize:"11px",fontWeight:"600",background:colorCliente(ev.cliente_id),color:"#fff",borderRadius:"4px",padding:"3px 8px",marginBottom:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clientes.find(c=>c.id===ev.cliente_id)?.nombre_empresa||ev.nombre_evento||"Evento"}</div>)}
              {evs.length>2&&<div style={{fontSize:"10px",color:esHoy?"rgba(255,255,255,0.8)":C.textoSuave,fontWeight:"600"}}>+{evs.length-2} más</div>}
            </div>;
          })}
        </div>
      </div>
    );
  };

  // ── Vista SEMANA ──
  const renderSemana=()=>{
    const diasLF=diasSemana.slice(0,5);
    const diasFS=diasSemana.slice(5,7);
    const evsFinSemana=diasFS.flatMap(d=>evsDia(toISO(d)));
    const nombresDia=["LUN","MAR","MIÉ","JUE","VIE"];

    if(esMobile) return (
      <div style={{padding:"10px 12px 80px"}}>
        {evsFinSemana.length>0&&<div onClick={()=>{setDiaActual(toISO(diasFS[0]));setVista("dia");}} style={{background:"#FFF3CD",border:"1px solid #F59E0B",borderRadius:"8px",padding:"8px 16px",marginBottom:"12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",color:"#92400E",fontSize:"13px",fontWeight:"600"}}>
          ⚡ Ver {evsFinSemana.length} evento{evsFinSemana.length!==1?"s":""} activo{evsFinSemana.length!==1?"s":""} este fin de semana
        </div>}
        {diasLF.map((d,i)=>{
          const iso=toISO(d),evs=evsDia(iso),esHoy=iso===hoy();
          return <div key={i} style={{marginBottom:"10px",border:`2px solid ${esHoy?C.azul:C.grisBorde}`,borderRadius:"14px",overflow:"hidden"}}>
            <div style={{background:esHoy?C.azul:evs.length?C.grisMed:C.gris,padding:"12px 16px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer"}} onClick={()=>{setDiaActual(iso);setVista("dia");}}>
              <div style={{width:"48px",height:"48px",borderRadius:"50%",background:esHoy?"rgba(255,255,255,0.2)":"#fff",border:`2px solid ${esHoy?"rgba(255,255,255,0.4)":C.grisBorde}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:"9px",fontWeight:"800",textTransform:"uppercase",color:esHoy?"#bfdbfe":C.textoSuave}}>{nombresDia[i]}</div>
                <div style={{fontSize:"20px",fontWeight:"700",lineHeight:1,color:esHoy?"#fff":C.texto}}>{d.getDate()}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:"13px",color:esHoy?"#bfdbfe":C.textoSuave}}>{MESES_L[d.getMonth()]}</div>
                {evs.length>0?<div style={{fontSize:"20px",fontWeight:"700",color:esHoy?"#fff":C.azul}}>{evs.length} evento{evs.length!==1?"s":""}</div>:<div style={{fontSize:"14px",color:esHoy?"#bfdbfe":C.textoSuave,fontWeight:"600"}}>Sin eventos</div>}
              </div>
              <div style={{fontSize:"18px",color:esHoy?"#bfdbfe":C.textoSuave}}>›</div>
            </div>
            {evs.length>0&&<div style={{padding:"10px 12px"}}>{evs.map(ev=><TarjetaEvento key={ev.id} ev={ev} diaDe={iso} clientes={clientes} pares={pares} interpretes={interpretes} proveedores={proveedores} onClick={()=>abrirEvento(ev)}/>)}</div>}
          </div>;
        })}
      </div>
    );

    return (
      <div style={{padding:"20px 24px 80px"}}>
        {evsFinSemana.length>0&&<div onClick={()=>{setDiaActual(toISO(diasFS[0]));setVista("dia");}} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"8px",padding:"8px 16px",marginBottom:"16px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"8px",color:"#fff",fontSize:"13px",fontWeight:"600"}}>
          ⚡ Ver {evsFinSemana.length} evento{evsFinSemana.length!==1?"s":""} activo{evsFinSemana.length!==1?"s":""} este fin de semana
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"12px"}}>
          {diasLF.map((d,i)=>{
            const iso=toISO(d),evs=evsDia(iso),esHoy=iso===hoy();
            const mesLargo=MESES_L[d.getMonth()].charAt(0).toUpperCase()+MESES_L[d.getMonth()].slice(1);
            return <div key={i} style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",borderRadius:"12px",padding:"10px",minHeight:"calc(100vh - 220px)"}}>
              <div onClick={()=>{setDiaActual(iso);setVista("dia");}} style={{textAlign:"center",padding:"10px 8px",borderRadius:"10px",marginBottom:"8px",background:"rgba(255,255,255,0.20)",cursor:"pointer",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.30)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.20)"}>
                <div style={{fontSize:"18px",fontWeight:"700",color:"#fff",textTransform:"uppercase",letterSpacing:"1px"}}>{nombresDia[i]}</div>
                <div style={{fontSize:"36px",fontWeight:"800",lineHeight:1.1,color:"#fff",margin:"4px 0"}}>{d.getDate()}</div>
                <div style={{fontSize:"15px",color:"rgba(255,255,255,0.8)",fontWeight:"500"}}>{mesLargo} {d.getFullYear()}</div>
                {evs.length>0&&<div style={{fontSize:"15px",fontWeight:"700",color:"#fff",background:"rgba(255,255,255,0.25)",padding:"4px 16px",borderRadius:"20px",marginTop:"6px",whiteSpace:"nowrap",display:"inline-block"}}>{evs.length} evento{evs.length!==1?"s":""}</div>}
              </div>
              {evs.map(ev=><TarjetaEvento key={ev.id} ev={ev} diaDe={iso} clientes={clientes} pares={pares} interpretes={interpretes} proveedores={proveedores} onClick={()=>abrirEvento(ev)}/>)}
              {evs.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.6)",fontWeight:"600",fontSize:"13px",padding:"20px 0"}}>Sin eventos</div>}
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
      <div style={{fontWeight:"700",fontSize:"18px",color:C.texto,marginBottom:"16px"}}>
        {formatLargo(diaActual)}<span style={{fontWeight:"400",color:C.textoSuave,fontSize:"15px",marginLeft:"12px"}}>{evs.length} evento{evs.length!==1?"s":""}</span>
      </div>
      {evs.length===0?<div style={{textAlign:"center",padding:"60px 20px",color:C.textoSuave,border:`2px dashed ${C.grisBorde}`,borderRadius:"16px"}}><div style={{fontSize:"40px",marginBottom:"12px"}}>📅</div><div style={{fontWeight:"700",fontSize:"16px"}}>Sin eventos este día</div></div>
      :<div style={{display:"grid",gridTemplateColumns:esMobile?"1fr":"1fr 1fr",gap:"12px"}}>{evs.map(ev=><TarjetaEvento key={ev.id} ev={ev} diaDe={diaActual} clientes={clientes} pares={pares} interpretes={interpretes} proveedores={proveedores} onClick={()=>abrirEvento(ev)}/>)}</div>}
    </div>;
  };


  // ── Guards ──
  if(cargandoAuth) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.gris}}>
      <div style={{textAlign:"center"}}><Logo size={48}/><div style={{marginTop:"16px",color:C.textoMed,fontSize:"16px",fontWeight:"600"}}>Cargando…</div></div>
    </div>
  );
  if(!SKIP_LOGIN && !usuario) return <PantallaLogin onLogin={(u)=>{setUsuario(u);cargarPerfil(u.id);}}/>;

  const esAdmin=perfil?.rol==="admin";
  const esEditor=perfil?.rol==="editor"||esAdmin;

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",minHeight:"100vh",background:"linear-gradient(135deg, #1a2a4a 0%, #1e3a6e 50%, #2563a8 100%)",color:C.texto}}>
      {/* ── TOPBAR ── */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,0.3)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
        {/* Fila principal: logo | tabs | acciones */}
        <div style={{padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"120px",gap:"12px"}}>
          {/* Logo */}
          <div style={{flexShrink:0}}>
            <img src={LOGO_SRC} alt="MundoChile" style={{height:"104px"}}/>
          </div>
          {/* Tabs centrados */}
          {pantalla==="calendario"&&<div style={{display:"flex",gap:"4px",alignItems:"center",flex:1,justifyContent:"center",flexWrap:"wrap"}}>
            {[["semana","Semana"],["dia","Día"],["mes","Mes"],["agenda","Agenda"]].map(([v,l])=>(
              <button key={v} onClick={()=>setVista(v)} style={{padding:"10px 22px",background:vista===v?"#FFFFFF":"rgba(255,255,255,0.15)",border:"none",borderRadius:"8px",color:vista===v?"#1e3a6e":"#fff",fontWeight:vista===v?"700":"500",cursor:"pointer",fontSize:"16px",fontFamily:"inherit",transition:"all 0.15s"}}>{l}</button>
            ))}
          </div>}
          {/* Acciones */}
          <div style={{display:"flex",gap:"6px",alignItems:"center",flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
            {/* Búsqueda */}
            {buscando
              ?<input autoFocus style={{...S.inp,width:"180px",height:"38px",fontSize:"15px",background:"rgba(255,255,255,0.15)",color:"#fff",borderColor:"rgba(255,255,255,0.3)"}} value={busqueda} onChange={e=>setBusqueda(e.target.value)} onBlur={()=>{if(!busqueda)setBuscando(false);}} placeholder="Buscar…"/>
              :<button onClick={()=>setBuscando(true)} style={{padding:"8px 18px",fontSize:"15px",background:"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit"}} title="Buscar">🔍</button>
            }
            {busqueda&&<button onClick={()=>{setBusqueda("");setBuscando(false);}} style={{padding:"8px 18px",fontSize:"15px",background:"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit"}}>✕</button>}
            {/* Filtros */}
            <button onClick={()=>setMostrarFiltros(f=>!f)} style={{padding:"8px 18px",fontSize:"15px",background:mostrarFiltros||Object.values(filtros).some(Boolean)?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit",fontWeight:mostrarFiltros||Object.values(filtros).some(Boolean)?"700":"500"}}>
              {Object.values(filtros).some(Boolean)?"⚙️*":"⚙️"} Filtros
            </button>
            {/* Excel */}
            {esEditor&&<button onClick={exportarExcel} style={{padding:"8px 18px",fontSize:"15px",background:"rgba(22,163,74,0.25)",color:"#6EE7B7",border:"1px solid rgba(22,163,74,0.5)",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit"}}>📊 Excel</button>}
            {/* Nuevo evento */}
            {esEditor&&<button onClick={()=>setModalEvento({modo:"nuevo",data:evVacio()})} style={{...S.btnA,padding:"10px 24px",fontSize:"16px",background:"#e63946",fontWeight:"700"}}><span style={{color:"#FFFFFF",fontWeight:"700"}}>+</span> Nuevo</button>}
            {/* Config */}
            {esAdmin&&<button onClick={()=>setPantalla(p=>p==="config"?"calendario":"config")} style={{padding:"8px 18px",fontSize:"15px",background:pantalla==="config"?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit"}}>⚙️</button>}
            <button onClick={()=>sb.auth.signOut()} style={{padding:"8px 18px",fontSize:"15px",background:"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit"}}>Salir</button>
          </div>
        </div>
        {/* Navegación */}
        {pantalla==="calendario"&&vista!=="agenda"&&<div style={{padding:"8px 16px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px",borderTop:"1px solid rgba(255,255,255,0.15)"}}>
          <div>
            <div style={{fontWeight:"700",fontSize:"17px",color:"#fff"}}>{tituloNav()}</div>
            <div style={{fontSize:"12px",color:"rgba(255,255,255,0.7)",marginTop:"2px"}}>{contadorSubtitulo()}</div>
          </div>
          <div style={{display:"flex",gap:"6px"}}>
            <button onClick={navAnterior} style={{...S.btnG,background:"rgba(255,255,255,0.15)",color:"#fff",borderColor:"rgba(255,255,255,0.25)"}}>← Anterior</button>
            <button onClick={()=>{setSemanaOff(0);setMesOff(0);setDiaActual(hoy());}} style={{...S.btnP,background:"rgba(255,255,255,0.25)",color:"#fff",borderColor:"transparent"}}>Hoy</button>
            <button onClick={navSiguiente} style={{...S.btnG,background:"rgba(255,255,255,0.15)",color:"#fff",borderColor:"rgba(255,255,255,0.25)"}}>Siguiente →</button>
          </div>
        </div>}
        {/* Panel filtros F7 */}
        {mostrarFiltros&&pantalla==="calendario"&&<div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.15)",background:"rgba(0,0,0,0.2)",display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"flex-end"}}>
          {[["estado","Estado",["","Pendiente de Facturación","Facturado"],v=>v==="Pendiente de Facturación"?"Facturación Pendiente":v||"Todos"],["modalidad","Modalidad",["","remoto","presencial","hibrido"],v=>v?LBL_MODAL[v]:"Todas"],["tipo","Tipo",["Simultánea","Consecutiva","Whispering"],null]].map(([k,lbl,opts,fmt])=>(
            <div key={k} style={{minWidth:"130px"}}>
              <label style={{...S.lbl,color:"rgba(255,255,255,0.85)"}}>{lbl}</label>
              <select style={{...S.sel,height:"36px",fontSize:"13px"}} value={filtros[k]} onChange={e=>setFiltros(f=>({...f,[k]:e.target.value}))}>
                {k==="tipo"&&<option value="">Todos</option>}
                {opts.map(o=><option key={o} value={o}>{fmt?fmt(o):o||"Todos"}</option>)}
              </select>
            </div>
          ))}
          <div style={{minWidth:"160px"}}>
            <label style={{...S.lbl,color:"rgba(255,255,255,0.85)"}}>Intérprete</label>
            <select style={{...S.sel,height:"36px",fontSize:"13px"}} value={filtros.interprete_id} onChange={e=>setFiltros(f=>({...f,interprete_id:e.target.value}))}>
              <option value="">Todos</option>
              {interpretes.filter(i=>i.activo!==false).map(i=><option key={i.id} value={i.id}>{i.nombre}{i.apellido?" "+i.apellido:""}</option>)}
            </select>
          </div>
          {Object.values(filtros).some(Boolean)&&<button onClick={()=>setFiltros({estado:"",modalidad:"",tipo:"",interprete_id:""})} style={{...S.btnP,alignSelf:"flex-end",height:"36px"}}>✕ Limpiar</button>}
        </div>}
      </div>

      {/* ── CONTENIDO ── */}
      {pantalla==="calendario"&&<>
        {vista==="semana"&&renderSemana()}
        {vista==="dia"&&renderDia()}
        {vista==="mes"&&renderMes()}
        {vista==="agenda"&&<VistaAgenda eventos={eventosFiltrados} clientes={clientes} interpretes={interpretes} pares={pares} onAbrir={abrirEvento}/>}
      </>}
      {pantalla==="config"&&esAdmin&&<PantallaConfig clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} lugares={lugares} onActualizar={cargarDatos} perfil={perfil}/>}

      {/* ── MODALES ── */}
      {modalEvento&&<ModalEvento eventoInicial={modalEvento.data} clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} lugares={lugares} todos_eventos={eventos} perfil={perfil} onGuardar={()=>{setModalEvento(null);cargarDatos();addToast("Evento guardado correctamente","success");}} onCerrar={()=>setModalEvento(null)} onNuevoCliente={()=>setModalNuevoCli(true)} onNuevoInterprete={(ai,di)=>setModalNuevoInt({ai,di})} onLugarCreado={cargarDatos}/>}
      {modalDetalle&&<ModalDetalle evento={modalDetalle} clientes={clientes} interpretes={interpretes} pares={pares} perfil={perfil} onEditar={()=>editarEvento(modalDetalle)} onEliminar={()=>eliminarEvento(modalDetalle.id)} onCerrar={()=>setModalDetalle(null)} onVerFicha={()=>{setModalFicha(modalDetalle);setModalDetalle(null);}} addToast={addToast}/>}
      {modalFicha&&<ModalFicha evento={modalFicha} clientes={clientes} interpretes={interpretes} pares={pares} onCerrar={()=>setModalFicha(null)}/>}
      {modalNuevoCli&&<ModalNuevoCliente onGuardar={async(d)=>{await sb.from("clientes").insert(d);await cargarDatos();setModalNuevoCli(false);addToast("Cliente creado","success");}} onCerrar={()=>setModalNuevoCli(false)}/>}
      {modalNuevoInt&&<ModalNuevoInterprete onGuardar={async(d)=>{await sb.from("interpretes").insert(d);await cargarDatos();setModalNuevoInt(null);addToast("Intérprete creado","success");}} onCerrar={()=>setModalNuevoInt(null)}/>}
      <ToastContainer toasts={toasts} onRemove={removeToast}/>
    </div>
  );
}
