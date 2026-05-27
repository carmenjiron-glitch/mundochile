// MundoChile v2.1 — Gestión de Interpretaciones
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import EventCard from "./components/ui/EventCard.jsx";
import MultiDayPill from "./components/ui/MultiDayPill.jsx";
import PlatformChip from "./components/ui/PlatformChip.jsx";
import InterpreterRow from "./components/ui/InterpreterRow.jsx";
import FilterBar from "./components/FilterBar.jsx";

const IconMic = ({size=24}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)
const IconAV = ({size=24}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)
const IconoSimultanea = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)

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
const IDIOMA_COLOR={"Inglés":"#4A90D9","Francés":"#8B0000","Portugués":"#1B7A2F","Español":"#C2820A","Alemán":"#555555","Italiano":"#CC5500","Chino":"#DE2910","Japonés":"#6A0DAD"};
const IDIOMA_BORDE={"Inglés":"#1A4476","Francés":"#5C0000","Portugués":"#0F4D1C","Español":"#8B5E08","Alemán":"#333333","Italiano":"#993D00","Chino":"#9E1D0B","Japonés":"#4A0878"};
const IDIOMA_PILL_CLR={"Inglés":"#4A90D9","Francés":"#002395","Portugués":"#009C3B","Español":"#AA151B","Alemán":"#555555","Italiano":"#009246","Chino":"#DE2910","Japonés":"#BC002D"};
const IDIOMA_FLAG={"Inglés":"🇬🇧","Francés":"🇫🇷","Portugués":"🇧🇷","Español":"🇪🇸","Alemán":"🇩🇪","Italiano":"🇮🇹","Chino":"🇨🇳","Japonés":"🇯🇵"};
const idiomaColor=(idioma)=>IDIOMA_COLOR[idioma]||"#4C6EF5";
const idiomaBorde=(idioma)=>IDIOMA_BORDE[idioma]||"#3451d1";
const idiomaFlag=(idioma)=>IDIOMA_FLAG[idioma]||"🌐";
const IDIOMA_CDN={"Inglés":"gb","Francés":"fr","Portugués":"br","Español":"es","Alemán":"de","Italiano":"it","Chino":"cn","Japonés":"jp"};
function FlagImg({idioma}){const c=IDIOMA_CDN[idioma];if(!c)return<span style={{fontSize:"20px"}}>🌐</span>;return<img src={`https://flagcdn.com/28x21/${c}.png`} style={{width:"35px",height:"26px",objectFit:"cover",borderRadius:"2px",verticalAlign:"middle",display:"inline-block",flexShrink:0}} alt={idioma}/>;}
const B_TIPO={"Simultánea":{bg:"#EEF2FF",c:"#3B5BDB"},"Consecutiva":{bg:"#FCE4EC",c:"#C2185B"},"Whispering":{bg:"#F3E5F5",c:"#7B1FA2"}};
const B_MOD={"presencial":{bg:"#E8F5E9",c:"#2E7D32"},"remoto":{bg:"#E0F7FA",c:"#00838F"},"hibrido":{bg:"#FBE9E7",c:"#BF360C"}};
const B_EST=(e)=>e==="Facturado"?{bg:"#E3F2FD",c:"#1565C0",b:"#1565C0"}:{bg:"#FFEB3B",c:"#C62828",b:"#F9A825"};
const bS=(bg,c,b)=>({display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"700",lineHeight:"1.4",color:c,background:bg,border:`2px solid ${b||c}`,whiteSpace:"nowrap"});
const TIPO_ICON={"Simultánea":<IconoSimultanea/>,"Consecutiva":"🎤","Whispering":"🤫"};
const MOD_ICON={"presencial":"📍","remoto":"🖥️","hibrido":"🔀"};
const nombreCorto=(nombre,apellido)=>{if(!apellido)return nombre;const completo=`${nombre} ${apellido}`;if(completo.length<=12)return completo;return`${nombre} ${apellido.charAt(0)}.`;};


// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const TIPOS      = ["Simultánea","Consecutiva","Whispering"];
const MODALIDADES= ["remoto","presencial","hibrido"];
const LBL_MODAL  = {remoto:"Remoto",presencial:"Presencial",hibrido:"Híbrido"};
const PLATAFORMAS= ["Zoom MundoChile","Zoom Cliente","Teams","Webex","Meet","Otro"];
const ZOOM_ADMIN = ["Magix","RLA","El mismo cliente","Otro"];
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
const ESTADOS    = ["Facturación Pendiente","Facturado"];
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
const formatMedioES = (iso) => { if(!iso) return ""; const d=desdeISO(iso); return `${d.getDate()} de ${MESES_L[d.getMonth()]} de ${d.getFullYear()}`; };
const semanaDesde = (off) => {
  const d=new Date(), dow=d.getDay()===0?6:d.getDay()-1;
  d.setDate(d.getDate()-dow+off*7);
  return Array.from({length:7},(_,i)=>{ const x=new Date(d); x.setDate(d.getDate()+i); return x; });
};
const HORAS = (() => { const h=[]; for(let x=7;x<=22;x++) for(let m of [0,15,30,45]) h.push(`${String(x).padStart(2,"0")}:${String(m).padStart(2,"0")}`); return h; })();

// ─── ESTILOS BASE ─────────────────────────────────────────────────────────────
const S = {
  inp: {width:"100%",padding:"9px 12px",border:`1.5px solid ${C.grisBorde}`,borderRadius:"8px",fontSize:"15px",color:C.texto,background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit",height:"48px"},
  sel: {width:"100%",padding:"9px 12px",border:`1.5px solid ${C.grisBorde}`,borderRadius:"8px",fontSize:"16px",color:C.texto,background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit",cursor:"pointer",height:"48px"},
  lbl: {fontSize:"13px",fontWeight:"600",color:"#383838",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"5px",display:"block"},
  fila:{display:"flex",gap:"16px",flexWrap:"wrap"},
  camp:{flex:"1",minWidth:"140px"},
  btnA:{padding:"10px 20px",background:"#3a7bd5",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnR:{padding:"10px 20px",background:"#E03131",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnV:{padding:"10px 20px",background:"#2F9E44",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnG:{padding:"10px 20px",background:"#FFF5F5",color:"#E53E3E",border:"1.5px solid #FC8181",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnSave:{padding:"10px 20px",background:"#2F9E44",color:"#fff",border:"2px solid #1B5E20",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnDel:{padding:"10px 20px",background:"#E03131",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnCancel:{padding:"10px 20px",background:"#FFF5F5",color:"#E53E3E",border:"1.5px solid #FC8181",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnEdit:{padding:"4px 10px",background:"#E67700",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"},
  btnFicha:{padding:"4px 10px",background:"#1971C2",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"},
  btnDup:{padding:"4px 10px",background:"#9C36B5",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"},
  btnP:{padding:"4px 10px",background:C.azulClaro,color:C.azul,border:`1px solid ${C.azulBorde}`,borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"},
};

// ─── ESTADO VACÍO ─────────────────────────────────────────────────────────────
const evVacio = () => ({
  id:null, cliente_id:"", nro_oc:"", nombre_evento:"", tipo:"Simultánea",
  fecha_inicio:toISO(new Date(new Date().getTime()+86400000)), fecha_termino:toISO(new Date(new Date().getTime()+86400000)), hora_inicio:"09:00", hora_termino:"13:00",
  jornada:"Media Jornada", jornada_personalizada:"", lugar:"", lugar_detalle:"",
  modalidad:"remoto", plataforma:"Zoom MundoChile", zoom_owner:"mundochile",
  zoom_administrador:"", zoom_link:"", estado:"Facturación Pendiente", comentarios:"",
  nro_hes:"", nro_otros:"", comentarios_av:"", contacto_id:"",
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
          <div style={{flex:1,fontSize:"17px",color:C.texto,fontWeight:"500"}}>{t.msg}</div>
          {t.retry&&<button onClick={t.retry} style={{...S.btnP,fontSize:"13px",padding:"4px 8px",whiteSpace:"nowrap"}}>↺ Reintentar</button>}
          <button onClick={()=>onRemove(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.textoSuave,fontSize:"14px",lineHeight:1,padding:0,flexShrink:0}}>✕</button>
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

function Badge({texto,color="#3B5BDB",fondo="#EEF2FF",borde,icono="",solid=false}) {
  if(solid) return <span style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",lineHeight:"1.4",color:"#fff",background:color}}>{icono}{texto}</span>;
  return <span style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",lineHeight:"1.4",color,background:fondo,border:`2px solid ${borde||color}`}}>{icono}{texto}</span>;
}

function CampoCopia({valor}) {
  const [ok,setOk]=useState(false);
  if(!valor) return <span style={{color:C.textoSuave}}>—</span>;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
      <span>{valor}</span>
      <button onClick={()=>{navigator.clipboard.writeText(valor);setOk(true);setTimeout(()=>setOk(false),1500);}}
        style={{background:"none",border:"none",cursor:"pointer",color:ok?C.verde:C.textoSuave,fontSize:"15px",padding:0}}>
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
      <button onClick={()=>{setManual(false);onChange("09:00");}} style={{...S.btnG,padding:"9px 10px",fontSize:"14px",whiteSpace:"nowrap",height:"48px"}}>↩ Lista</button>
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
          <div style={{color:C.textoSuave,fontSize:"17px",marginTop:"4px"}}>Gestión de Interpretaciones</div>
        </div>
        {err&&<div style={{background:C.rojoClaro,color:C.rojo,padding:"10px 14px",borderRadius:"8px",marginBottom:"16px",fontSize:"17px",fontWeight:"500"}}>{err}</div>}
        <div style={{marginBottom:"16px"}}>
          <label style={S.lbl}>📧 Email</label>
          <input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ingresar()} placeholder="tu@email.com"/>
        </div>
        <div style={{marginBottom:"24px"}}>
          <label style={S.lbl}>🔒 Contraseña</label>
          <div style={{position:"relative"}}>
            <input style={{...S.inp,paddingRight:"42px"}} type={ver?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ingresar()} placeholder="••••••••"/>
            <button onClick={()=>setVer(v=>!v)} style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"14px",color:C.textoSuave}}>{ver?"🙈":"👁"}</button>
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
  const esZoomMC=(ev.plataforma==="Zoom MundoChile"||ev.plataforma==="Zoom");

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

  const bt=B_TIPO[ev.tipo]||{bg:"#EEF2FF",c:"#3B5BDB"};
  const bm=B_MOD[ev.modalidad]||{bg:"#F7F7F5",c:"#6B6B6B"};
  const be=B_EST(ev.estado);

  return (
    <div onClick={onClick}
      style={{borderRadius:"0 10px 4px 0",padding:"20px 22px",background:"#FFFFFF",color:"#1A1A1A",cursor:"pointer",marginBottom:"12px",boxShadow:"0 3px 14px rgba(0,0,0,0.18)",borderLeft:`28px solid ${borderColor}`,borderTop:`8px solid ${borderColor}`,position:"relative",transition:"transform 0.12s,box-shadow 0.12s",lineHeight:1.5}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.20)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 3px 14px rgba(0,0,0,0.18)";}}>
      {dotColor&&<div style={{position:"absolute",top:"12px",right:"12px",width:"12px",height:"12px",borderRadius:"50%",background:"#e63946",animation:"mcpulse 2s ease-in-out infinite"}}/>}
      {diaXdeY&&<div style={{marginBottom:"8px"}}><span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"700",lineHeight:"1.4",color:"#1971C2",background:"#E8F4FD",border:"2px solid #1971C2"}}>📅 Multidía · Día {diaXdeY.x} de {diaXdeY.y}</span></div>}
      <div style={{fontSize:"22px",fontWeight:"600",color:"#1A1A1A",letterSpacing:"0.1px",lineHeight:1.2,marginBottom:"4px",paddingRight:dotColor?"20px":"0"}}>{cliente?.nombre_empresa||"—"}</div>
      {ev.nombre_evento&&<div style={{fontSize:"14px",fontWeight:"500",color:"#374151",marginBottom:"6px"}}>{ev.nombre_evento}</div>}
      {cliente?.nombre_contacto&&<div style={{fontSize:"14px",fontWeight:"500",color:"#6B6B6B",fontStyle:"italic",marginBottom:"8px"}}>Contacto: {cliente.nombre_contacto}</div>}
      <div style={{fontSize:"17px",fontWeight:"500",color:"#1A1A1A",marginBottom:"10px"}}>{ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)} hrs</div>
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap",alignItems:"center",marginBottom:"10px"}}>
        <span style={bS(bt.bg,bt.c)}>{TIPO_ICON[ev.tipo]}{ev.tipo}</span>
        <span style={bS(bm.bg,bm.c)}>{MOD_ICON[ev.modalidad]}{LBL_MODAL[ev.modalidad]||ev.modalidad}</span>
      </div>
      {esPresencial&&ev.lugar&&<div style={{fontSize:"15px",color:"#475569",marginBottom:"8px"}}>📌 {ev.lugar}</div>}
      {!esPresencial&&ev.plataforma&&<div style={{marginBottom:"8px"}}>
        <PlatformChip platform={ev.plataforma==="Zoom"?"Zoom MundoChile":ev.plataforma} isMundoChile={ev.plataforma==="Zoom MundoChile"||ev.plataforma==="Zoom"}/>
      </div>}
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap",alignItems:"center",marginBottom:"10px"}}>
        <span style={bS(be.bg,be.c,be.b)}>{ev.estado==="Facturado"?"Facturado":"🟠 Facturación Pendiente"}</span>
      </div>
      {(()=>{
        const grupos={};
        (ev.asignaciones||[]).forEach(a=>{
          const par=pares.find(p=>p.id===a.par_id);
          const interp=interpretes.find(x=>x.id===a.interprete_id);
          if(!interp) return;
          const key=par?.descripcion||"Sin par";
          const idioma=par?.idioma_origen||"";
          if(!grupos[key]) grupos[key]={idioma,interpretes:[]};
          grupos[key].interpretes.push({...interp,isHost:!!a.es_host_zoom,hora_presentacion:a.hora_presentacion||null});
        });
        return Object.entries(grupos).map(([key,grupo])=>{
          const bg=idiomaColor(grupo.idioma);
          const bd=idiomaBorde(grupo.idioma);
          const esPort=grupo.idioma==="Portugués";
          const bubbleBg=esPort?"#FFFFFF":bg;
          const bubbleColor=esPort?"#0F3311":"#FFFFFF";
          const bubbleBorder=esPort?"2px solid #0F3311":`2px solid ${bd}`;
          const titleColor=esPort?"#0F3311":bg;
          const hp=grupo.interpretes.find(i=>i.hora_presentacion)?.hora_presentacion;
          return(
            <div key={key} style={{marginTop:"8px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}>
                <span style={{fontSize:"12px",fontWeight:"600",color:titleColor,textTransform:"uppercase",letterSpacing:"0.06em",filter:"brightness(0.65)"}}>{key}</span>
                {hp&&<span style={{fontSize:"12px",color:"#6B7280",display:"flex",alignItems:"center",gap:"4px"}}>🕐 {hp.slice(0,5)} hrs</span>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
                {grupo.interpretes.map((interp,i)=>(
                  <span key={i} title={`${interp.nombre}${interp.apellido?" "+interp.apellido:""}`} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"5px",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:esPort?"700":"600",lineHeight:"1.4",color:bubbleColor,background:bubbleBg,border:bubbleBorder,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"default"}}>
                    {interp.isHost&&<span style={{fontSize:"13px",color:bubbleColor}}>🔑</span>}
                    <FlagImg idioma={grupo.idioma}/>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",color:bubbleColor}}>{nombreCorto(interp.nombre,interp.apellido)}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        });
      })()}
      {tieneEquipos&&<div style={{fontSize:"15px",fontWeight:"500",color:"#6B6B6B",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"6px",marginTop:"10px",display:"flex",alignItems:"center",gap:"5px"}}><IconAV size={16}/> Equipos AV</div>}
      {tieneEquipos&&<span style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"700",lineHeight:"1.4",color:"#495057",background:"#F1F3F5",border:"1px solid #DEE2E6"}}>{provNombreEq||"Equipos AV"}</span>}
    </div>
  );
}

// ─── MODAL EVENTO ─────────────────────────────────────────────────────────────
function ModalEvento({eventoInicial,clientes,interpretes,pares,proveedores,lugares=[],contactos=[],todos_eventos,perfil,onGuardar,onCerrar,onNuevoCliente,onNuevoContacto,onNuevoInterprete,onLugarCreado}) {
  const [form,setForm]=useState(()=>eventoInicial?JSON.parse(JSON.stringify(eventoInicial)):evVacio());
  const [tab,setTab]=useState("general");
  const [guardando,setGuardando]=useState(false);
  const [error,setError]=useState("");
  const [agregarLugar,setAgregarLugar]=useState(false);
  const [nuevoLugar,setNuevoLugar]=useState("");
  const setF=useCallback((k,v)=>setForm(f=>({...f,[k]:v})),[]);
  const [zoomOtro,setZoomOtro]=useState(!ZOOM_ADMIN.includes(form.zoom_administrador)&&!!form.zoom_administrador);

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
      const enAsigs=(ev.asignaciones||[]).some(a=>a.interprete_id===interp_id);
      const enDias=(ev.evento_dias||[]).some(d=>(d.asignaciones_dia||[]).some(a=>a.interprete_id===interp_id));
      return enAsigs||enDias;
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
        zoom_administrador:form.zoom_administrador||"", zoom_link:form.zoom_link||"", contacto_id:form.contacto_id?Number(form.contacto_id):null, estado:form.estado||"Facturación Pendiente",
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
          <div style={{fontWeight:"500",marginBottom:"8px"}}>⚠️ {interp?.nombre||"Este intérprete"} ya tiene asignado "{alerta.nombre_evento||"otro evento"}" el {formatLargo(alerta.fecha_inicio)}. ¿Deseas agregarlo de todos modos?</div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>setAlerta(null)} style={{padding:"5px 12px",background:"#92400e",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"13px",fontFamily:"inherit"}}>Sí, agregar igual</button>
            <button onClick={()=>{edit("interprete_id","");setAlerta(null);}} style={{padding:"5px 12px",background:"none",color:"#92400e",border:"1px solid #92400e",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"13px",fontFamily:"inherit"}}>Cambiar intérprete</button>
          </div>
        </div>}
        <div style={S.fila}>
          <div style={{...S.camp,minWidth:"200px"}}>
            <label style={S.lbl}>👤 Intérprete</label>
            <div style={{display:"flex",gap:"6px"}}>
              <select style={S.sel} value={a.interprete_id||""} onChange={e=>edit("interprete_id",e.target.value?Number(e.target.value):"")}>
                <option value="">Seleccionar…</option>
                {interpretes.filter(i=>i.activo).map(i=><option key={i.id} value={i.id}>{i.nombre}{i.apellido?" "+i.apellido:""}{i.es_host_zoom?" 🔑":""}{i.ciudad?` · ${i.ciudad}`:""}</option>)}
              </select>
              <button onClick={()=>onNuevoInterprete(idx,dIdx)} style={{...S.btnP,fontSize:"19px",fontWeight:"500",width:"48px",height:"48px",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}}>+</button>
            </div>
            {interp&&<div style={{fontSize:"14px",color:C.textoSuave,marginTop:"4px",display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {interp.ciudad&&<span>📍 {interp.ciudad}</span>}
              {interp.modalidad_trabajo&&<span>{interp.modalidad_trabajo==="ambas"?"💻📍":interp.modalidad_trabajo==="online"?"💻 Online":"📍 Presencial"}</span>}
            </div>}
          </div>
          <div style={S.camp}>
            <label style={S.lbl}>🌐 Par de idiomas</label>
            <select style={{...S.sel,fontWeight:"400",color:C.textoMed}} value={a.par_id||""} onChange={e=>edit("par_id",e.target.value?Number(e.target.value):"")}>
              <option value="">Seleccionar par de idiomas…</option>
              {(pares||[]).filter(p=>p.activo!==false).sort((a,b)=>(a.descripcion||"").localeCompare(b.descripcion||"")).map(p=><option key={p.id} value={p.id}>{p.descripcion}</option>)}
            </select>
          </div>
        </div>
        <div style={{...S.fila,marginTop:"10px"}}>
          <div style={S.camp}><label style={S.lbl}>N° OT</label><input style={S.inp} defaultValue={a.nro_ot} onBlur={e=>edit("nro_ot",e.target.value)} placeholder="OT-0000"/></div>
          <div style={S.camp}><label style={S.lbl}>N° Boleta</label><input style={S.inp} defaultValue={a.nro_boleta} onBlur={e=>edit("nro_boleta",e.target.value)} placeholder="628"/></div>
          <div style={S.camp}><label style={S.lbl}>🕐 Hora presentación</label><SelHora value={a.hora_presentacion} onChange={v=>edit("hora_presentacion",v)} placeholder="Misma del evento"/></div>
        </div>
        <div style={{display:"flex",gap:"16px",marginTop:"10px",flexWrap:"wrap",alignItems:"center"}}>
          <label style={{display:"flex",gap:"6px",alignItems:"center",cursor:"pointer",fontSize:"13px",color:a.es_host_zoom?C.rojo:C.textoMed,fontWeight:a.es_host_zoom?"600":"400"}}>
            <input type="checkbox" checked={!!a.es_host_zoom} onChange={e=>edit("es_host_zoom",e.target.checked)}/> 🔑 Host Zoom MundoChile
          </label>
          <div style={{marginLeft:"auto"}}><button onClick={rem} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontWeight:"500",fontSize:"13px"}}>✕ Quitar</button></div>
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
    :[{id:"general",lbl:"📋 Detalles"},{id:"interpretes",lbl:<><IconMic size={16}/> Intérpretes</>},{id:"equipos",lbl:<><IconAV size={16}/> Equipos AV</>}];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"20px",width:"100%",maxWidth:"760px",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.25)"}}>
        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:"none",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,background:form.id?"#E67700":"#3a7bd5",borderRadius:"20px 20px 0 0"}}>
          <div style={{fontSize:"16px",fontWeight:"600",color:"#FFFFFF"}}>{form.id?<><span style={{filter:"brightness(10)"}}>✏️</span> Editar evento</>:"Nuevo evento"}</div>
          <button onClick={onCerrar} style={{background:"none",border:"none",cursor:"pointer",fontSize:"16px",color:"#FFFFFF",lineHeight:1,fontWeight:"300",opacity:1}}>×</button>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.grisBorde}`,flexShrink:0}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 16px",background:tab===t.id?"#3a7bd5":"#AECBEF",border:"none",borderRadius:"8px",cursor:"pointer",color:tab===t.id?"#fff":"#173060",fontWeight:"500",fontSize:"15px",fontFamily:"inherit",margin:"6px 4px",opacity:1}}>{t.lbl}</button>)}
        </div>
        {/* Cuerpo */}
        <div data-modal-scroll style={{overflowY:"auto",flex:1,padding:"20px 24px"}}>
          {error&&<div style={{background:C.rojoClaro,color:C.rojo,padding:"10px 14px",borderRadius:"8px",marginBottom:"20px",fontSize:"13px",fontWeight:"500"}}>{error}</div>}

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
                <button onClick={()=>onNuevoCliente(id=>setF("cliente_id",id))} style={{padding:"0",width:"42px",height:"42px",background:"#1E3A6E",color:"#FFFFFF",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"20px",fontWeight:"300",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>+</button>
              </div>
            </div>
            {form.cliente_id&&<div style={{marginBottom:"20px"}}>
              <label style={S.lbl}>👤 Contacto</label>
              <div style={{display:"flex",gap:"8px"}}>
                <select style={S.sel} value={form.contacto_id||""} onChange={e=>setF("contacto_id",e.target.value?Number(e.target.value):"")}>
                  <option value="">Seleccionar contacto…</option>
                  {contactos.filter(c=>c.cliente_id===Number(form.cliente_id)&&c.activo!==false).map(c=><option key={c.id} value={c.id}>{c.nombre}{c.cargo?` — ${c.cargo}`:""}</option>)}
                </select>
                <button onClick={()=>onNuevoContacto({cliente_id:form.cliente_id})} style={{padding:"0",width:"42px",height:"42px",background:"#3B82F6",color:"#FFFFFF",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"20px",fontWeight:"300",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>+</button>
              </div>
            </div>}
            {/* Nombre del evento */}
            <div style={{marginBottom:"20px"}}>
              <label style={S.lbl}>Nombre del evento</label>
              <input style={S.inp} value={form.nombre_evento} onChange={e=>setF("nombre_evento",e.target.value)} placeholder="Conferencia anual…"/>
            </div>
            {/* Referencias del cliente */}
            <div style={{marginBottom:"20px"}}>
              <label style={{...S.lbl,marginBottom:"8px"}}>Referencias del cliente</label>
              <div style={S.fila}>
                <div style={S.camp}><label style={{...S.lbl,fontSize:"14px"}}>N° OC</label><input style={S.inp} value={form.nro_oc} onChange={e=>setF("nro_oc",e.target.value)} placeholder="OC-0000"/></div>
                <div style={S.camp}><label style={{...S.lbl,fontSize:"14px"}} title="Hoja de Entrada de Servicios">N° HES <span style={{fontSize:"16px",color:C.textoSuave,fontWeight:"400",textTransform:"none"}}>(Hoja Entrada Servicios)</span></label><input style={S.inp} value={form.nro_hes||""} onChange={e=>setF("nro_hes",e.target.value)} placeholder="HES-000"/></div>
                <div style={S.camp}><label style={{...S.lbl,fontSize:"14px"}}>Otros</label><input style={S.inp} value={form.nro_otros||""} onChange={e=>setF("nro_otros",e.target.value)} placeholder="Ref. adicional…"/></div>
              </div>
            </div>
            {/* Tipo + Modalidad */}
            <div style={{...S.fila,marginBottom:"20px"}}>
              <div style={S.camp}><label style={{...S.lbl,display:"flex",alignItems:"center",gap:"5px"}}><IconMic size={16}/> Tipo de interpretación</label>
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
              <div style={{...S.fila,marginBottom:"20px",alignItems:"flex-start",flexWrap:"nowrap",gap:"12px"}}>
                <div style={{...S.camp,minWidth:"140px",flex:"0 0 auto"}}><label style={S.lbl}>💻 Plataforma</label>
                  <select style={S.sel} value={form.plataforma} onChange={e=>setF("plataforma",e.target.value)}>{PLATAFORMAS.map(p=><option key={p}>{p}</option>)}</select></div>
                {(form.plataforma==="Zoom MundoChile"||form.plataforma==="Zoom")&&<div style={{...S.camp,minWidth:"160px",flex:"0 0 auto"}}><label style={S.lbl}>🔑 Administrador Zoom</label>
                  <select style={S.sel} value={zoomOtro?"__otro__":(ZOOM_ADMIN.includes(form.zoom_administrador)?form.zoom_administrador:"")} onChange={e=>{if(e.target.value==="__otro__"){setZoomOtro(true);setF("zoom_administrador","");}else{setZoomOtro(false);setF("zoom_administrador",e.target.value);}}}>
                    <option value="">Sin asignar</option>{ZOOM_ADMIN.map(z=><option key={z}>{z}</option>)}<option value="__otro__">Otro…</option>
                  </select>
                  {zoomOtro&&<input style={{...S.inp,marginTop:"6px"}} value={form.zoom_administrador||""} onChange={e=>setF("zoom_administrador",e.target.value)} placeholder="Nombre del administrador…"/>}
                </div>}
                {(form.plataforma==="Zoom MundoChile"||form.plataforma==="Zoom")&&<div style={{...S.camp,minWidth:"238px",maxWidth:"238px"}}>
                  <label style={S.lbl}>🔗 Link de conexión Zoom</label>
                  <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                    <input style={{...S.inp,flex:1}} value={form.zoom_link||""} onChange={e=>setF("zoom_link",e.target.value)} placeholder="https://zoom.us/j/…"/>
                    <button onClick={()=>{if(form.zoom_link)navigator.clipboard.writeText(form.zoom_link);}} title="Copiar link" style={{padding:"0",width:"48px",height:"48px",background:"#EFF6FF",color:"#1D4ED8",border:"1.5px solid #BFDBFE",borderRadius:"8px",cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>📋</button>
                  </div>
                </div>}
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
                      }} style={{...S.btnV,padding:"9px 14px",fontSize:"15px",whiteSpace:"nowrap"}}>✓</button>
                      <button onClick={()=>{setAgregarLugar(false);setNuevoLugar("");}} style={{...S.btnG,padding:"9px 10px",fontSize:"15px"}}>✕</button>
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
              <div style={{fontWeight:"500",color:C.rojo,fontSize:"17px",display:"flex",alignItems:"center",gap:"6px"}}><IconMic size={20}/> Intérpretes asignados</div>
              <button onClick={()=>addAsig()} style={S.btnA}>+ Agregar intérprete</button>
            </div>
            {form.asignaciones.length===0&&<div style={{textAlign:"center",color:C.textoSuave,padding:"40px 20px",border:`2px dashed ${C.grisBorde}`,borderRadius:"12px"}}>Sin intérpretes — Agrega uno arriba</div>}
            {form.asignaciones.map((a,idx)=><FilaAsig key={idx} a={a} idx={idx}/>)}
            {form.asignaciones.length>0&&<button onClick={()=>addAsig()} style={{...S.btnP,width:"100%",padding:"9px"}}>+ Agregar otro intérprete</button>}
          <div style={{marginTop:"20px",borderTop:`1px solid ${C.grisBorde}`,paddingTop:"16px"}}>
            <label style={S.lbl}>💬 Comentarios</label>
            <textarea style={{...S.inp,minHeight:"80px",resize:"vertical"}}
              value={form.comentarios||""}
              onChange={e=>setF("comentarios",e.target.value)}
              placeholder="Notas adicionales sobre los intérpretes…"/>
          </div>
          </>}

          {/* ── TAB EQUIPOS AV (un día) ── */}
          {tab==="equipos"&&!esMultidia&&<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div style={{fontWeight:"500",color:C.verde,fontSize:"17px",display:"flex",alignItems:"center",gap:"6px"}}><IconAV size={20}/> Equipos AV</div>
              <button onClick={()=>setForm(f=>({...f,equipos:[...(f.equipos||[]),eqVacio()]}))} style={S.btnA}>+ Agregar equipos</button>
            </div>
            {(form.equipos||[]).length===0&&<div style={{textAlign:"center",color:C.textoSuave,padding:"40px 20px",border:`2px dashed ${C.grisBorde}`,borderRadius:"12px"}}>Sin equipos AV — Agrega uno arriba</div>}
            {(form.equipos||[]).map((eq,eIdx)=>(
              <div key={eIdx} style={{border:`1px solid ${C.grisBorde}`,borderRadius:"10px",padding:"14px",marginBottom:"10px",background:"#fff"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                  <div style={{fontWeight:"500",color:C.azul,fontSize:"13px"}}>Equipo #{eIdx+1}</div>
                  <button onClick={()=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs.splice(eIdx,1);return{...f,equipos:eqs};})} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontWeight:"500"}}>✕</button>
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
                  <div style={S.camp}><label style={S.lbl}>N° receptores</label>
  <select style={S.sel} value={[50,100,150,200,250,300,350,400,450,500].includes(Number(eq.num_receptores))||!eq.num_receptores?eq.num_receptores:"__otro__"}
    onChange={e=>{if(e.target.value==="__otro__")setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],num_receptores:""};return{...f,equipos:eqs};});else setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],num_receptores:e.target.value};return{...f,equipos:eqs};});}}>
    <option value="">Seleccionar…</option>
    {[50,100,150,200,250,300,350,400,450,500].map(n=><option key={n} value={n}>{n} receptores</option>)}
    <option value="__otro__">Otro número…</option>
  </select>
  {(![50,100,150,200,250,300,350,400,450,500].includes(Number(eq.num_receptores))&&eq.num_receptores!=="")&&
    <input style={{...S.inp,marginTop:"6px"}} type="number" value={eq.num_receptores||""} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],num_receptores:e.target.value};return{...f,equipos:eqs};})} placeholder="Ingresa número…"/>
  }
</div>
                  <div style={S.camp}><label style={S.lbl}>N° cabinas</label><input style={S.inp} type="number" value={eq.num_cabinas} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],num_cabinas:e.target.value};return{...f,equipos:eqs};})}/></div>
                  <div style={S.camp}><label style={S.lbl}>N° asistentes</label><input style={S.inp} type="number" value={eq.num_asistentes} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],num_asistentes:e.target.value};return{...f,equipos:eqs};})}/></div>
                </div>
                <div style={{marginTop:"10px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                    <label style={S.lbl}>Contactos proveedor</label>
                    <button onClick={()=>setForm(f=>{const eqs=[...(f.equipos||[])];let cs=[];try{cs=JSON.parse(eqs[eIdx].proveedor_contacto||"[]");}catch{cs=[];}cs.push({tipo:"celular",valor:""});eqs[eIdx]={...eqs[eIdx],proveedor_contacto:JSON.stringify(cs)};return{...f,equipos:eqs};})} style={{...S.btnP,padding:"4px 10px",fontSize:"14px",fontWeight:"500"}}>+</button>
                  </div>
                  <div style={{maxHeight:"160px",overflowY:"auto",display:"flex",flexDirection:"column",gap:"6px"}}>
                    {(()=>{let cs=[];try{cs=JSON.parse(eq.proveedor_contacto||"[]");}catch{cs=eq.proveedor_contacto?[{tipo:"celular",valor:eq.proveedor_contacto}]:[];}
                    return cs.map((c,ci)=>(
                      <div key={ci} style={{display:"flex",gap:"6px",alignItems:"center"}}>
                        <select style={{...S.sel,width:"130px",flexShrink:0}} value={c.tipo} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];let cs2=[];try{cs2=JSON.parse(eqs[eIdx].proveedor_contacto||"[]");}catch{cs2=[];}cs2[ci]={...cs2[ci],tipo:e.target.value};eqs[eIdx]={...eqs[eIdx],proveedor_contacto:JSON.stringify(cs2)};return{...f,equipos:eqs};})}>
                          <option value="celular">📱 Celular</option>
                          <option value="whatsapp">💬 WhatsApp</option>
                          <option value="mail">✉️ Mail</option>
                        </select>
                        <input style={{...S.inp,flex:1}} value={c.valor} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];let cs2=[];try{cs2=JSON.parse(eqs[eIdx].proveedor_contacto||"[]");}catch{cs2=[];}cs2[ci]={...cs2[ci],valor:e.target.value};eqs[eIdx]={...eqs[eIdx],proveedor_contacto:JSON.stringify(cs2)};return{...f,equipos:eqs};})} placeholder={c.tipo==="mail"?"correo@ejemplo.com":"+56 9 0000 0000"}/>
                        <button onClick={()=>setForm(f=>{const eqs=[...(f.equipos||[])];let cs2=[];try{cs2=JSON.parse(eqs[eIdx].proveedor_contacto||"[]");}catch{cs2=[];}cs2.splice(ci,1);eqs[eIdx]={...eqs[eIdx],proveedor_contacto:JSON.stringify(cs2)};return{...f,equipos:eqs};})} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontSize:"16px",padding:"0 4px"}}>×</button>
                      </div>
                    ));})()}
                  </div>
                </div>
              </div>
            ))}
          <div style={{marginTop:"20px",borderTop:`1px solid ${C.grisBorde}`,paddingTop:"16px"}}>
            <label style={S.lbl}>💬 Comentarios Equipos AV</label>
            <textarea style={{...S.inp,minHeight:"80px",resize:"vertical"}}
              value={form.comentarios_av||""}
              onChange={e=>setF("comentarios_av",e.target.value)}
              placeholder="Instrucciones, observaciones sobre equipos AV…"/>
          </div>
          </>}

          {/* ── TAB POR DÍA ── */}
          {tab==="dias"&&esMultidia&&form.dias.map((dia,dIdx)=>(
            <div key={dia.fecha} style={{border:`2px solid ${C.grisBorde}`,borderRadius:"14px",marginBottom:"16px",overflow:"hidden"}}>
              <div style={{background:C.grisMed,padding:"12px 16px",fontWeight:"500",color:C.azul,fontSize:"13px"}}>
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
                    <div style={{fontWeight:"500",color:C.rojo,display:"flex",alignItems:"center",gap:"5px"}}><IconMic size={16}/> Intérpretes de este día</div>
                    <button onClick={()=>addAsig(dIdx)} style={S.btnP}>+ Agregar</button>
                  </div>
                  {(dia.asignaciones||[]).length===0&&<div style={{color:C.textoSuave,fontSize:"15px",textAlign:"center",padding:"12px",border:`1.5px dashed ${C.grisBorde}`,borderRadius:"8px"}}>Sin intérpretes para este día</div>}
                  {(dia.asignaciones||[]).map((a,aIdx)=><FilaAsig key={aIdx} a={a} idx={aIdx} dIdx={dIdx}/>)}
                </div>
                {/* Equipos AV */}
                {form.modalidad!=="remoto"&&<div style={{marginTop:"14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <div style={{fontWeight:"500",color:C.verde,display:"flex",alignItems:"center",gap:"5px"}}><IconAV size={16}/> Equipos AV de este día</div>
                    <button onClick={()=>addEq(dIdx)} style={S.btnP}>+ Agregar equipos</button>
                  </div>
                  {(dia.equipos||[]).map((eq,eIdx)=>(
                    <div key={eIdx} style={{border:`1px solid ${C.grisBorde}`,borderRadius:"10px",padding:"14px",marginBottom:"10px",background:"#fff"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                        <div style={{fontWeight:"500",color:C.azul,fontSize:"13px"}}>Equipo #{eIdx+1}</div>
                        <button onClick={()=>setForm(f=>{const ds=[...f.dias],eqs=[...(ds[dIdx].equipos||[])];eqs.splice(eIdx,1);ds[dIdx]={...ds[dIdx],equipos:eqs};return{...f,dias:ds};})} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontWeight:"500"}}>✕</button>
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
                        <div style={S.camp}><label style={S.lbl}>N° receptores</label>
  <select style={S.sel} value={[50,100,150,200,250,300,350,400,450,500].includes(Number(eq.num_receptores))||!eq.num_receptores?eq.num_receptores:"__otro__"}
    onChange={e=>{if(e.target.value==="__otro__")editEq(dIdx,eIdx,"num_receptores","");else editEq(dIdx,eIdx,"num_receptores",e.target.value);}}>
    <option value="">Seleccionar…</option>
    {[50,100,150,200,250,300,350,400,450,500].map(n=><option key={n} value={n}>{n} receptores</option>)}
    <option value="__otro__">Otro número…</option>
  </select>
  {(![50,100,150,200,250,300,350,400,450,500].includes(Number(eq.num_receptores))&&eq.num_receptores!=="")&&
    <input style={{...S.inp,marginTop:"6px"}} type="number" value={eq.num_receptores||""} onChange={e=>editEq(dIdx,eIdx,"num_receptores",e.target.value)} placeholder="Ingresa número…"/>
  }
</div>
                        <div style={S.camp}><label style={S.lbl}>N° cabinas</label><input style={S.inp} type="number" value={eq.num_cabinas} onChange={e=>editEq(dIdx,eIdx,"num_cabinas",e.target.value)}/></div>
                        <div style={S.camp}><label style={S.lbl}>N° asistentes</label><input style={S.inp} type="number" value={eq.num_asistentes} onChange={e=>editEq(dIdx,eIdx,"num_asistentes",e.target.value)}/></div>
                      </div>
                      <div style={{marginTop:"10px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                          <label style={S.lbl}>Contactos proveedor</label>
                          <button onClick={()=>{let cs=[];try{cs=JSON.parse(eq.proveedor_contacto||"[]");}catch{cs=[];}cs.push({tipo:"celular",valor:""});editEq(dIdx,eIdx,"proveedor_contacto",JSON.stringify(cs));}} style={{...S.btnP,padding:"4px 10px",fontSize:"14px",fontWeight:"500"}}>+</button>
                        </div>
                        <div style={{maxHeight:"160px",overflowY:"auto",display:"flex",flexDirection:"column",gap:"6px"}}>
                          {(()=>{let cs=[];try{cs=JSON.parse(eq.proveedor_contacto||"[]");}catch{cs=eq.proveedor_contacto?[{tipo:"celular",valor:eq.proveedor_contacto}]:[];}
                          return cs.map((c,ci)=>(
                            <div key={ci} style={{display:"flex",gap:"6px",alignItems:"center"}}>
                              <select style={{...S.sel,width:"130px",flexShrink:0}} value={c.tipo} onChange={e=>{let cs2=[];try{cs2=JSON.parse(eq.proveedor_contacto||"[]");}catch{cs2=[];}cs2[ci]={...cs2[ci],tipo:e.target.value};editEq(dIdx,eIdx,"proveedor_contacto",JSON.stringify(cs2));}}>
                                <option value="celular">📱 Celular</option>
                                <option value="whatsapp">💬 WhatsApp</option>
                                <option value="mail">✉️ Mail</option>
                              </select>
                              <input style={{...S.inp,flex:1}} value={c.valor} onChange={e=>{let cs2=[];try{cs2=JSON.parse(eq.proveedor_contacto||"[]");}catch{cs2=[];}cs2[ci]={...cs2[ci],valor:e.target.value};editEq(dIdx,eIdx,"proveedor_contacto",JSON.stringify(cs2));}} placeholder={c.tipo==="mail"?"correo@ejemplo.com":"+56 9 0000 0000"}/>
                              <button onClick={()=>{let cs2=[];try{cs2=JSON.parse(eq.proveedor_contacto||"[]");}catch{cs2=[];}cs2.splice(ci,1);editEq(dIdx,eIdx,"proveedor_contacto",JSON.stringify(cs2));}} style={{background:"none",border:"none",cursor:"pointer",color:C.rojo,fontSize:"16px",padding:"0 4px"}}>×</button>
                            </div>
                          ));})()}
                        </div>
                      </div>
                      <div style={{marginTop:"12px",paddingTop:"12px",borderTop:`1px solid ${C.grisBorde}`}}>
                        <div style={{fontWeight:"500",color:C.textoMed,fontSize:"13px",marginBottom:"10px",textTransform:"uppercase"}}>🔩 Montaje</div>
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
          <button onClick={guardar} disabled={guardando} style={{...S.btnSave,opacity:guardando?0.7:1,minWidth:"140px",pointerEvents:guardando?"none":"auto"}}>{guardando?"Guardando…":"💾 Guardar"}</button>
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
  const esZoomMC=(evento.plataforma==="Zoom MundoChile"||evento.plataforma==="Zoom");
  const esPresencial=evento.modalidad==="presencial"||evento.modalidad==="hibrido";
  const esMultidia=evento.fecha_inicio!==evento.fecha_termino;
  const dias=((evento.evento_dias||evento.dias||[]).sort((a,b)=>(a.orden||0)-(b.orden||0)));
  const LBL={remoto:"Remoto",presencial:"Presencial",hibrido:"Híbrido"};
  const LBL_LARGA={txt:"13px",fw:"600",c:"#0F172A",tt:"uppercase",ls:"0.04em"};
  const SL=({t})=><div style={{fontSize:LBL_LARGA.txt,fontWeight:LBL_LARGA.fw,color:LBL_LARGA.c,textTransform:LBL_LARGA.tt,letterSpacing:LBL_LARGA.ls,marginBottom:"6px"}}>{t}</div>;
  const HR=()=><hr style={{border:"none",borderTop:"1px solid #E5E7EB",margin:"16px 0"}}/>;
  const btnA=(bg)=>({padding:"8px 16px",background:bg,color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"13px",height:"36px",fontFamily:"inherit"});
  const interpRows=(asigs)=>asigs.reduce((acc,a)=>{
    const interp=interpretes.find(x=>x.id===a.interprete_id);
    const par=pares.find(p=>p.id===a.par_id);
    if(!interp) return acc;
    acc.push({name:`${interp.nombre}${interp.apellido?" "+interp.apellido:""}`,language:par?.idioma_origen||"",isHost:!!a.es_host_zoom});
    return acc;
  },[]);
  const metaRow=(a)=>(a.nro_ot||a.nro_boleta)
    ?<div style={{fontSize:"13px",color:"#6B7280",marginTop:"4px",display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center"}}>
      {a.nro_ot&&<span>OT: {a.nro_ot}</span>}
      {a.nro_boleta&&<span>Boleta: {a.nro_boleta}</span>}
    </div>:null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"20px",width:"100%",maxWidth:"760px",maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.25)"}}>
        {/* Header */}
        <div style={{background:"#FFFFFF",padding:"20px 24px",borderRadius:"20px 20px 0 0",flexShrink:0,borderBottom:`10px solid ${colorCliente(evento.cliente_id)}`,position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"16px"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:"29px",fontWeight:"600",color:"#0F172A",lineHeight:1.2}}>{cliente?.nombre_empresa||"—"}</div>
              {cliente?.nombre_contacto&&<div style={{fontSize:"19px",fontWeight:"500",color:"#6B7280",fontStyle:"italic",marginTop:"4px"}}>Contacto: {cliente.nombre_contacto}</div>}
              {evento.nro_oc&&<div style={{fontSize:"14px",color:"#6B7280",marginTop:"4px"}}>N° OC: {evento.nro_oc}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"6px",alignItems:"flex-end",flexShrink:0}}>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                <button onClick={onVerFicha} style={btnA("#1971C2")}>📄 Ficha</button>
                <button onClick={onEditar} style={btnA("#E67700")}><span style={{filter:"brightness(10)"}}>✏️</span> Editar</button>
                <button onClick={onEliminar} style={btnA("#E03131")}>🗑 Eliminar</button>
                <button onClick={onCerrar} style={{background:"#FFF5F5",border:"1.5px solid #FC8181",cursor:"pointer",fontSize:"13px",color:"#E53E3E",padding:"8px 16px",borderRadius:"8px",fontFamily:"inherit",fontWeight:"500",height:"36px"}}>✕ Cerrar</button>
              </div>
            </div>
          </div>
        </div>
        {/* Cuerpo */}
        <div style={{overflowY:"auto",flex:1,padding:"24px 28px"}}>
          {/* Evento + Fecha + Horario */}
          {evento.nombre_evento&&<div style={{fontSize:"14px",fontWeight:"500",color:"#0F172A",marginBottom:"8px"}}>{evento.nombre_evento}</div>}
          <div style={{fontSize:"14px",fontWeight:"500",color:"#1E293B",marginBottom:"4px"}}>
            📅 {esMultidia?`${formatMedioES(evento.fecha_inicio)} → ${formatMedioES(evento.fecha_termino)}`:formatLargo(evento.fecha_inicio)}
          </div>
          <div style={{fontSize:"16px",fontWeight:"500",color:"#0F172A",marginBottom:"6px"}}>
            🕐 {evento.hora_inicio?.slice(0,5)} – {evento.hora_termino?.slice(0,5)} hrs{evento.jornada&&<span style={{fontWeight:"400",color:"#6B7280",fontSize:"17px"}}> · {evento.jornada}</span>}
          </div>
          <HR/>
          {/* Badges tipo + modalidad */}
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center",marginBottom:"4px"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",lineHeight:"1.4",color:(B_TIPO[evento.tipo]||{c:"#3B5BDB"}).c,background:(B_TIPO[evento.tipo]||{bg:"#EEF2FF"}).bg,border:`2px solid ${(B_TIPO[evento.tipo]||{c:"#3B5BDB"}).c}`,whiteSpace:"nowrap"}}>{evento.tipo==="Simultánea"?<IconoSimultanea/>:evento.tipo==="Consecutiva"?"🎤":"🤫"} {evento.tipo}</span>
            <span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",lineHeight:"1.4",color:(B_MOD[evento.modalidad]||{c:"#6B6B6B"}).c,background:(B_MOD[evento.modalidad]||{bg:"#F7F7F5"}).bg,border:`2px solid ${(B_MOD[evento.modalidad]||{c:"#6B6B6B"}).c}`,whiteSpace:"nowrap"}}>
              {evento.modalidad==="presencial"?"📍":evento.modalidad==="hibrido"?"🔀":"💻"} {LBL[evento.modalidad]||evento.modalidad}
            </span>
          </div>
          <HR/>
          {/* Lugar / Plataforma */}
          {esPresencial&&evento.lugar&&<div style={{marginBottom:"4px"}}>
            <SL t="📍 Lugar"/>
            <div style={{fontSize:"16px",fontWeight:"500",color:"#0F172A"}}>{evento.lugar}</div>
            {evento.lugar_detalle&&<div style={{fontSize:"15px",color:"#475569",marginTop:"4px"}}>{evento.lugar_detalle}</div>}
            <div style={{display:"flex",gap:"8px",marginTop:"8px",flexWrap:"wrap"}}>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((evento.lugar||"")+" "+(evento.lugar_detalle||""))}`} target="_blank" rel="noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"15px",fontWeight:"500",color:"#1971C2",textDecoration:"none",padding:"6px 12px",border:"1px solid #93C5FD",borderRadius:"8px",background:"#EFF6FF"}}>
                📍 Ver en Maps
              </a>
              <CampoCopia valor={`${evento.lugar}${evento.lugar_detalle?", "+evento.lugar_detalle:""}`}/>
            </div>
          </div>}
          {!esPresencial&&evento.plataforma&&<div style={{marginBottom:"4px"}}>
            <SL t="💻 Plataforma"/>
            <PlatformChip platform={evento.plataforma} isMundoChile={esZoomMC} extra={esZoomMC?evento.zoom_administrador:""}/>
            {evento.zoom_link&&(
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"8px",padding:"8px 12px",background:"#EFF6FF",borderRadius:"8px",border:"1px solid #BFDBFE"}}>
                <span style={{fontSize:"15px",color:"#1D4ED8",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>🔗 {evento.zoom_link}</span>
                <button onClick={()=>navigator.clipboard.writeText(evento.zoom_link)} style={{padding:"5px 12px",background:"#1D4ED8",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontSize:"14px",fontWeight:"500",whiteSpace:"nowrap",flexShrink:0}}>📋 Copiar</button>
                <a href={evento.zoom_link} target="_blank" rel="noreferrer" style={{padding:"5px 12px",background:"#059669",color:"#fff",borderRadius:"6px",cursor:"pointer",fontSize:"14px",fontWeight:"500",whiteSpace:"nowrap",textDecoration:"none",flexShrink:0}}>🚀 Abrir</a>
              </div>
            )}
          </div>}
          {(esPresencial&&evento.lugar)||(!esPresencial&&evento.plataforma)?<HR/>:null}
          {/* Intérpretes (un día) */}
          {(()=>{
            const grupos={};
            asignaciones.forEach(a=>{
              const par=pares.find(p=>p.id===a.par_id);
              const interp=interpretes.find(x=>x.id===a.interprete_id);
              if(!interp) return;
              const key=par?.descripcion||"Sin par";
              const idioma=par?.idioma_origen||"";
              if(!grupos[key]) grupos[key]={idioma,items:[]};
              grupos[key].items.push({interp,isHost:!!a.es_host_zoom,asig:a});
            });
            const entries=Object.entries(grupos);
            if(!entries.length) return null;
            return(<div style={{marginBottom:"4px"}}>
              <SL t={<><IconMic size={20}/> Intérpretes</>}/>
              {entries.map(([key,grupo])=>{
                const pillClr=IDIOMA_PILL_CLR[grupo.idioma]||"#4C6EF5";
                const bubbleBg="#FFFFFF";
                const bubbleColor="#1A1A1A";
                const bubbleBorder=`3px solid ${pillClr}`;
                const titleColor=pillClr;
                const hp=grupo.items.find(({asig})=>asig.hora_presentacion)?.asig.hora_presentacion;
                return(<div key={key} style={{marginBottom:"12px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}>
                    <span style={{fontSize:"12px",fontWeight:"600",color:titleColor,textTransform:"uppercase",letterSpacing:"0.06em"}}>{key}</span>
                    {hp&&<span style={{fontSize:"12px",color:"#6B7280",display:"flex",alignItems:"center",gap:"4px"}}>🕐 {hp.slice(0,5)} hrs</span>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
                    {grupo.items.map(({interp,isHost},i)=>(
                      <span key={i} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"5px",padding:"4px 10px",borderRadius:"20px",fontSize:"15px",fontWeight:"500",lineHeight:"1.4",color:bubbleColor,background:bubbleBg,border:bubbleBorder,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {isHost&&<span style={{fontSize:"12px"}}>🔑</span>}
                        <FlagImg idioma={grupo.idioma}/>
                        <span style={{overflow:"hidden",textOverflow:"ellipsis",color:bubbleColor}}>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span>
                      </span>
                    ))}
                  </div>
                  {grupo.items.map(({asig},i)=>metaRow(asig)?<div key={i}>{metaRow(asig)}</div>:null)}
                </div>);
              })}
            </div>);
          })()}
          {/* Intérpretes y equipos por día (multidía) */}
          {esMultidia&&dias.map((dia,dIdx)=>{
            const asigsDia=dia.asignaciones_dia||[],eqsDia=dia.equipos_dia||[];
            if(!asigsDia.length&&!eqsDia.length) return null;
            return (
              <div key={dia.id||dIdx} style={{border:"1px solid #E5E7EB",borderRadius:"10px",marginBottom:"10px",overflow:"hidden"}}>
                <div style={{background:"#F8FAFC",padding:"10px 16px",fontWeight:"500",color:"#0F172A",fontSize:"15px"}}>
                  📅 Día {dIdx+1} — {formatLargo(dia.fecha)} · {dia.hora_inicio?.slice(0,5)} – {dia.hora_termino?.slice(0,5)} hrs
                </div>
                <div style={{padding:"12px 16px"}}>
                  {(()=>{
                    const gDia={};
                    asigsDia.forEach(a=>{
                      const par=pares.find(p=>p.id===a.par_id);
                      const interp=interpretes.find(x=>x.id===a.interprete_id);
                      if(!interp) return;
                      const key=par?.descripcion||"Sin par";
                      const idioma=par?.idioma_origen||"";
                      if(!gDia[key]) gDia[key]={idioma,items:[]};
                      gDia[key].items.push({interp,isHost:!!a.es_host_zoom,asig:a});
                    });
                    return Object.entries(gDia).map(([key,grupo])=>{
                      const pillClr=IDIOMA_PILL_CLR[grupo.idioma]||"#4C6EF5";
                      const bubbleBg="#FFFFFF";
                      const bubbleColor="#1A1A1A";
                      const bubbleBorder=`3px solid ${pillClr}`;
                      const titleColor=pillClr;
                      const hp=grupo.items.find(({asig})=>asig.hora_presentacion)?.asig.hora_presentacion;
                      return(<div key={key} style={{marginBottom:"12px"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}>
                          <span style={{fontSize:"12px",fontWeight:"600",color:titleColor,textTransform:"uppercase",letterSpacing:"0.06em"}}>{key}</span>
                          {hp&&<span style={{fontSize:"12px",color:"#6B7280",display:"flex",alignItems:"center",gap:"4px"}}>🕐 {hp.slice(0,5)} hrs</span>}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px"}}>
                          {grupo.items.map(({interp,isHost},i)=>(
                            <span key={i} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"5px",padding:"4px 10px",borderRadius:"20px",fontSize:"15px",fontWeight:"500",lineHeight:"1.4",color:bubbleColor,background:bubbleBg,border:bubbleBorder,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              {isHost&&<span style={{fontSize:"12px"}}>🔑</span>}
                              <FlagImg idioma={grupo.idioma}/>
                              <span style={{overflow:"hidden",textOverflow:"ellipsis",color:bubbleColor}}>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span>
                            </span>
                          ))}
                        </div>
                        {grupo.items.map(({asig},i)=>metaRow(asig)?<div key={i}>{metaRow(asig)}</div>:null)}
                      </div>);
                    });
                  })()}
                  {eqsDia.map((eq,eIdx)=>(
                    <div key={eIdx} style={{fontSize:"15px",color:"#6B7280",padding:"6px 10px",background:"#F1F5F9",border:"1px solid #E2E8F0",borderRadius:"6px",marginTop:"6px",display:"flex",alignItems:"center",gap:"6px"}}>
                      <IconAV size={16}/> {eq.tipo_equipo==="fijo"?"Sistema fijo":eq.tipo_equipo==="portatil"?"Sistema portátil":"Cabina portátil"}
                      {eq.proveedor_nombre&&` · ${eq.proveedor_nombre}`}{eq.num_receptores>0&&` · ${eq.num_receptores} receptores`}{eq.num_cabinas>0&&` · ${eq.num_cabinas} cabinas`}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Equipos AV (un día) */}
          {!esMultidia&&(evento.evento_dias||[]).flatMap(d=>d.equipos_dia||[]).length>0&&<div style={{marginBottom:"12px",background:"#F1F5F9",borderRadius:"10px",padding:"12px 16px"}}>
            <SL t={<><IconAV size={20}/> Equipos AV</>}/>
            {(evento.evento_dias||[]).flatMap(d=>d.equipos_dia||[]).map((eq,eIdx)=>(
              <div key={eIdx} style={{fontSize:"15px",color:"#6B7280",marginBottom:"4px"}}>
                {eq.tipo_equipo==="fijo"?"Sistema fijo":eq.tipo_equipo==="portatil"?"Sistema portátil":"Cabina portátil"}
                {eq.proveedor_nombre&&` · ${eq.proveedor_nombre}`}{eq.num_receptores>0&&` · ${eq.num_receptores} receptores`}{eq.num_cabinas>0&&` · ${eq.num_cabinas} cabinas`}
              </div>
            ))}
          </div>}
          <HR/>
          {/* Estado */}
          <div style={{marginBottom:"8px"}}>
            <SL t="Estado de facturación"/>
            {(()=>{const be=B_EST(evento.estado);return<span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",lineHeight:"1.4",color:be.c,background:be.bg,border:`2px solid ${be.b||be.c}`,whiteSpace:"nowrap"}}>{evento.estado==="Facturado"?"✓ Facturado":"🟠 Facturación Pendiente"}</span>;})()}
          </div>
          {/* Programa multidía */}
          {esMultidia&&dias.length>0&&<><HR/><div style={{marginBottom:"12px"}}>
            <SL t="📅 Programa del evento"/>
            <div style={{borderRadius:"10px",overflow:"hidden",border:"1px solid #E5E7EB"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"#1E3A6E",color:"#fff"}}>
                  {["Día","Fecha","Horario","Jornada"].map(h=><th key={h} style={{padding:"8px 14px",textAlign:"left",fontSize:"14px",fontWeight:"500"}}>{h}</th>)}
                </tr></thead>
                <tbody>{dias.map((dia,dIdx)=>(
                  <tr key={dIdx} style={{background:dIdx%2===0?"#fff":"#F8FAFC",borderBottom:"1px solid #E5E7EB"}}>
                    <td style={{padding:"8px 14px",fontSize:"15px",fontWeight:"500",color:"#1971C2"}}>Día {dIdx+1}</td>
                    <td style={{padding:"8px 14px",fontSize:"15px",color:"#0F172A"}}>{formatLargo(dia.fecha)}</td>
                    <td style={{padding:"8px 14px",fontSize:"15px",color:"#0F172A"}}>{dia.hora_inicio?.slice(0,5)} – {dia.hora_termino?.slice(0,5)} hrs</td>
                    <td style={{padding:"8px 14px",fontSize:"15px",color:"#475569"}}>{dia.jornada}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div></>}
          {/* Comentarios */}
          {evento.comentarios&&<div style={{background:"#F8FAFC",borderRadius:"10px",padding:"12px 16px",marginTop:"12px"}}>
            <SL t="💬 Comentarios"/>
            <div style={{color:"#0F172A",fontSize:"17px"}}>{evento.comentarios}</div>
          </div>}
          {/* Historial */}
          <div style={{fontSize:"14px",color:"#6B7280",display:"flex",gap:"16px",flexWrap:"wrap",paddingTop:"12px",marginTop:"12px",borderTop:"1px solid #E5E7EB"}}>
            {evento.created_by_nombre&&<span>Creado por <strong>{evento.created_by_nombre}</strong>{evento.created_at&&" el "+new Date(evento.created_at).toLocaleString("es-CL")}</span>}
            {evento.edited_by_nombre&&<span>Última edición por <strong>{evento.edited_by_nombre}</strong>{evento.updated_at&&" el "+new Date(evento.updated_at).toLocaleString("es-CL")}</span>}
          </div>
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
  const esPresencial=evento.modalidad==="presencial"||evento.modalidad==="hibrido";
  const dias=((evento.evento_dias||evento.dias||[]).sort((a,b)=>(a.orden||0)-(b.orden||0)));
  const CAMPOS_OPC=[
    {k:"cliente",l:"🏢 Cliente"},{k:"evento",l:"📌 Evento"},{k:"tipo",l:<><IconMic size={14}/> Tipo</>},
    {k:"modalidad",l:"🔄 Modalidad"},{k:"fecha",l:"📅 Fecha"},{k:"horario",l:"🕐 Horario"},
    {k:"jornada",l:"⏱ Jornada"},{k:"lugar",l:"📍 Lugar"},{k:"plataforma",l:"💻 Plataforma"},
    {k:"interpretes",l:<><IconMic size={14}/> Intérpretes</>},{k:"equipos",l:<><IconAV size={14}/> Equipos AV</>},{k:"comentarios",l:"💬 Comentarios"},
  ];
  const DEFAULTS={cliente:true,evento:true,tipo:true,modalidad:true,fecha:true,horario:true,jornada:true,lugar:true,plataforma:true,interpretes:true,equipos:false,comentarios:false};
  const [campos,setCampos]=useState(()=>({...DEFAULTS,...JSON.parse(localStorage.getItem("mc_ficha_campos")||"{}")}));
  const toggleCampo=(k)=>{const n={...campos,[k]:!campos[k]};setCampos(n);localStorage.setItem("mc_ficha_campos",JSON.stringify(n));};


  const Sec=({label,accent="#1E3A6E",children,fullWidth=false})=>(
    <div style={{borderRadius:"8px",overflow:"hidden",marginBottom:"12px",gridColumn:fullWidth?"1/-1":"auto"}}>
      <div style={{background:`${accent}18`,padding:"6px 16px",fontSize:"13px",fontWeight:"500",color:accent==="#1E3A6E"?"#1E3A6E":"#374151",textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</div>
      <div style={{padding:"12px 16px",background:"#FFFFFF",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"}}>{children}</div>
    </div>
  );

  const btFicha=(bg)=>({padding:"8px 16px",background:bg,color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"13px",height:"36px",fontFamily:"inherit"});

  const metaFicha=(a)=>(a.nro_ot||a.nro_boleta||a.hora_presentacion)
    ?<div style={{fontSize:"14px",color:"#6B7280",marginTop:"4px",display:"flex",gap:"10px",flexWrap:"wrap"}}>
      {a.nro_ot&&<span>OT: {a.nro_ot}</span>}
      {a.nro_boleta&&<span>Boleta: {a.nro_boleta}</span>}
      {a.hora_presentacion&&<span style={{fontSize:"15px",display:"inline-flex",alignItems:"center",gap:"6px"}}><span style={{fontSize:"15px"}}>🕐</span> {a.hora_presentacion.slice(0,5)}</span>}
    </div>:null;

  const renderGrupos=(asignaciones)=>{
    const grupos={};
    (asignaciones||[]).forEach(a=>{
      const par=pares.find(p=>p.id===a.par_id);
      const interp=interpretes.find(x=>x.id===a.interprete_id);
      if(!interp) return;
      const key=par?.descripcion||"Sin par";
      const idioma=par?.idioma_origen||"";
      if(!grupos[key]) grupos[key]={idioma,items:[]};
      grupos[key].items.push({interp,isHost:!!a.es_host_zoom,asig:a});
    });
    return Object.entries(grupos).map(([key,grupo])=>{
      const bg=idiomaColor(grupo.idioma);
      const bd=idiomaBorde(grupo.idioma);
      const esPort=grupo.idioma==="Portugués";
      const bubbleBg=esPort?"#FFFFFF":bg;
      const bubbleColor=esPort?"#1B5E20":"#FFFFFF";
      const bubbleBorder=esPort?"2px solid #1B5E20":`2px solid ${bd}`;
      const titleColor=esPort?"#1B5E20":bg;
      return(<div key={key} style={{marginBottom:"10px"}}>
        <div style={{fontSize:"16px",fontWeight:"500",color:titleColor,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"5px",filter:"brightness(0.65)"}}>{key}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
          {grupo.items.map(({interp,isHost},i)=>(
            <span key={i} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"5px",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",lineHeight:"1.4",color:bubbleColor,background:bubbleBg,border:bubbleBorder,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {isHost&&<span style={{fontSize:"12px"}}>🔑</span>}
              <FlagImg idioma={grupo.idioma}/>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",color:bubbleColor}}>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span>
            </span>
          ))}
        </div>
        {grupo.items.map(({asig},i)=>metaFicha(asig)?<div key={i}>{metaFicha(asig)}</div>:null)}
      </div>);
    });
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:"16px",overflowY:"auto"}}>
      <div style={{background:"#F8FAFC",borderRadius:"20px",width:"100%",maxWidth:"700px",maxHeight:"92vh",boxShadow:"0 24px 80px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column"}}>

        {/* Selector campos */}
        <div style={{padding:"12px 20px",borderBottom:"1px solid #E2E8F0",background:"#fff",borderRadius:"20px 20px 0 0",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
            <div style={{fontWeight:"500",color:"#0F172A",fontSize:"17px"}}>Campos visibles</div>
            <button onClick={onCerrar} style={{background:"none",border:"none",cursor:"pointer",fontSize:"14px",color:"#9CA3AF",lineHeight:1}}>✕</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
            {CAMPOS_OPC.map(({k,l})=><button key={k} onClick={()=>toggleCampo(k)}
              style={{padding:"4px 12px",borderRadius:"20px",cursor:"pointer",fontSize:"14px",fontWeight:"400",fontFamily:"inherit",background:campos[k]?"#1E3A6E":"#E2E8F0",color:campos[k]?"#fff":"#6B7280",border:"none"}}>{l}</button>)}
          </div>
        </div>

        {/* Ficha */}
        <div id="ficha-mc" ref={fichaRef} style={{flex:1,overflowY:"auto",padding:"16px 20px 20px",background:"#F8FAFC"}}>

          {/* Header */}
          <div style={{display:"flex",alignItems:"center",height:"64px",padding:"0 16px",borderRadius:"8px",background:"#1E3A6E",color:"#fff",marginBottom:"12px",flexShrink:0}}>
            <div style={{flexShrink:0,marginRight:"12px",display:"flex",alignItems:"center"}}>
              <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"#FFFFFF",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                <img src={LOGO_SRC} alt="MundoChile" style={{width:"56px",height:"56px",objectFit:"contain"}}/>
              </div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:"14px",fontWeight:"500",color:"#fff",letterSpacing:"0.04em",lineHeight:1}}>MundoChile</div>
              <div style={{fontSize:"11px",color:"rgba(255,255,255,0.70)",marginTop:"2px",letterSpacing:"0.05em"}}>TRANSLATIONS & INTERPRETERS</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:"11px",color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:"0.05em"}}>Generado el</div>
              <div style={{fontSize:"15px",fontWeight:"500",color:"#fff"}}>{new Date().toLocaleDateString("es-CL",{day:"numeric",month:"long",year:"numeric"})}</div>
            </div>
          </div>

          {/* Contenido */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>

            {campos.cliente&&<Sec label="Cliente" accent="#E03131" fullWidth>
              <div style={{fontSize:"16px",fontWeight:"500",color:"#E03131",lineHeight:1.1}}>{cliente?.nombre_empresa||"—"}</div>
              {cliente?.nombre_contacto&&<div style={{fontSize:"17px",color:"#6B7280",fontStyle:"italic",marginTop:"4px"}}>{cliente.nombre_contacto}</div>}
            </Sec>}

            {campos.evento&&evento.nombre_evento&&<Sec label="Evento" accent="#3B5BDB" fullWidth>
              <div style={{fontSize:"16px",fontWeight:"500",color:"#1E293B"}}>{evento.nombre_evento}</div>
              {evento.nro_oc&&<div style={{fontSize:"15px",color:"#6B7280",marginTop:"4px"}}>N° OC: {evento.nro_oc}</div>}
            </Sec>}

            {campos.tipo&&<Sec label="Tipo de interpretación" accent="#9C36B5">
              <div style={{fontSize:"14px",fontWeight:"500",color:"#0F172A",display:"flex",alignItems:"center",gap:"8px"}}><IconMic size={20}/> {evento.tipo}</div>
            </Sec>}

            {campos.modalidad&&<Sec label="Modalidad" accent="#C2255C">
              <div style={{fontSize:"14px",fontWeight:"500",color:"#0F172A"}}>
                {evento.modalidad==="presencial"?"📍":evento.modalidad==="hibrido"?"🔀":"💻"} {LBL_MODAL[evento.modalidad]}
              </div>
            </Sec>}

            {campos.fecha&&<Sec label="Fecha" accent="#E67700">
              <div style={{fontSize:"14px",fontWeight:"500",color:"#0F172A"}}>
                {esMultidia?`${formatCorto(evento.fecha_inicio)} → ${formatCorto(evento.fecha_termino)}`:formatLargo(evento.fecha_inicio)}
              </div>
            </Sec>}

            {campos.horario&&<Sec label="Horario" accent="#E67700">
              <div style={{fontSize:"16px",fontWeight:"500",color:"#0F172A"}}>
                {evento.hora_inicio?.slice(0,5)} – {evento.hora_termino?.slice(0,5)} hrs
              </div>
            </Sec>}

            {campos.jornada&&evento.jornada&&<Sec label="Jornada" accent="#475569" fullWidth>
              <div style={{fontSize:"14px",fontWeight:"500",color:"#0F172A"}}>
                ⏱ {evento.jornada}{evento.jornada_personalizada?` — ${evento.jornada_personalizada}`:""}
              </div>
            </Sec>}

            {campos.lugar&&esPresencial&&evento.lugar&&<Sec label="Lugar" accent="#2F9E44" fullWidth>
              <div style={{fontSize:"14px",fontWeight:"500",color:"#0F172A"}}>📍 {evento.lugar}</div>
              {evento.lugar_detalle&&<div style={{fontSize:"17px",color:"#475569",marginTop:"4px"}}>{evento.lugar_detalle}</div>}
            </Sec>}

            {campos.plataforma&&!esPresencial&&<Sec label="Plataforma" accent="#0C8599" fullWidth>
              <PlatformChip platform={evento.plataforma==="Zoom"?"Zoom MundoChile":evento.plataforma} isMundoChile={(evento.plataforma==="Zoom MundoChile"||evento.plataforma==="Zoom")} extra={(evento.plataforma==="Zoom MundoChile"||evento.plataforma==="Zoom")?evento.zoom_administrador:""}/>
            </Sec>}

            {campos.interpretes&&!esMultidia&&(evento.asignaciones||[]).length>0&&<Sec label="Intérpretes" accent="#7048E8" fullWidth>
              {renderGrupos(evento.asignaciones)}
            </Sec>}

            {campos.interpretes&&esMultidia&&dias.map((dia,dIdx)=>(
              <Sec key={dIdx} label={`Día ${dIdx+1} de ${dias.length} — ${formatLargo(dia.fecha)} · ${dia.hora_inicio?.slice(0,5)}–${dia.hora_termino?.slice(0,5)} hrs`} accent="#7048E8" fullWidth>
                {renderGrupos(dia.asignaciones_dia||[])}
              </Sec>
            ))}

            {campos.equipos&&(evento.evento_dias||[]).flatMap(d=>d.equipos_dia||[]).length>0&&<Sec label="Equipos AV" accent="#E67700" fullWidth>
              {(evento.evento_dias||[]).flatMap(d=>d.equipos_dia||[]).map((eq,i)=>(
                <div key={i} style={{fontSize:"16px",color:"#0F172A",marginBottom:"4px",display:"flex",alignItems:"center",gap:"6px"}}>
                  <IconAV size={20}/> {eq.tipo_equipo==="fijo"?"Sistema fijo":eq.tipo_equipo==="portatil"?"Sistema portátil":"Cabina portátil"}
                  {eq.proveedor_nombre&&` · ${eq.proveedor_nombre}`}{eq.num_receptores>0&&` · ${eq.num_receptores} receptores`}
                </div>
              ))}
            </Sec>}

            {campos.comentarios&&evento.comentarios&&<Sec label="Comentarios" accent="#475569" fullWidth>
              <div style={{fontSize:"16px",color:"#0F172A",lineHeight:1.5}}>{evento.comentarios}</div>
            </Sec>}

          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"12px 20px",borderTop:"1px solid #E2E8F0",display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap",alignItems:"center",background:"#fff",borderRadius:"0 0 20px 20px",flexShrink:0}}>
<button onClick={onCerrar} style={S.btnCancel}>× Cerrar</button>
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
        <div style={{fontWeight:"500",fontSize:"14px",color:C.texto,marginBottom:"20px"}}>🏢 Nuevo cliente</div>
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
        <div style={{fontWeight:"500",fontSize:"14px",color:C.texto,marginBottom:"20px"}}>👤 Nuevo intérprete</div>
        <div style={{...S.fila,marginBottom:"20px"}}>
          <div style={S.camp}><label style={S.lbl}>Nombre *</label><input style={S.inp} value={f.nombre} onChange={e=>u("nombre",e.target.value)}/></div>
          <div style={S.camp}><label style={S.lbl}>Apellido</label><input style={S.inp} value={f.apellido} onChange={e=>u("apellido",e.target.value)}/></div>
        </div>
        <div style={{...S.fila,marginBottom:"20px"}}>
          <div style={S.camp}><label style={S.lbl}>Email</label><input style={S.inp} type="email" value={f.email} onChange={e=>u("email",e.target.value)}/></div>
          <div style={S.camp}><label style={S.lbl}>Teléfono</label><input style={S.inp} value={f.telefono} onChange={e=>u("telefono",e.target.value)}/></div>
        </div>
        <div style={{...S.fila,marginBottom:"20px"}}>
          <div style={S.camp}><label style={S.lbl}>Ciudad</label>
  <select style={S.sel} value={f.ciudad} onChange={e=>u("ciudad",e.target.value)}>
    <option value="">Seleccionar…</option>
    <optgroup label="🇨🇱 Chile">
      <option>Santiago</option><option>Viña del Mar</option><option>Valparaíso</option>
      <option>Concepción</option><option>La Serena</option><option>Antofagasta</option>
      <option>Temuco</option><option>Rancagua</option><option>Talca</option>
      <option>Arica</option><option>Iquique</option><option>Puerto Montt</option>
      <option>Chillán</option><option>Calama</option><option>Copiapó</option>
    </optgroup>
    <optgroup label="🌎 Otros países">
      <option>Buenos Aires</option><option>Lima</option><option>Bogotá</option>
      <option>Ciudad de México</option><option>Madrid</option><option>Miami</option>
      <option>Nueva York</option><option>São Paulo</option><option>Montevideo</option><option>Quito</option>
    </optgroup>
  </select>
</div>
          <div style={S.camp}><label style={S.lbl}>Modalidad</label>
            <select style={S.sel} value={f.modalidad_trabajo} onChange={e=>u("modalidad_trabajo",e.target.value)}>
              <option value="ambas">💻📍 Presencial y Online</option>
              <option value="online">💻 Solo Online</option>
              <option value="presencial">📍 Solo Presencial</option>
            </select></div>
        </div>
        <div style={{marginBottom:"16px"}}><label style={{display:"flex",gap:"8px",alignItems:"center",cursor:"pointer",fontSize:"17px",color:C.rojo,fontWeight:"500"}}>
          <input type="checkbox" checked={f.es_host_zoom} onChange={e=>u("es_host_zoom",e.target.checked)}/> 🔑 Host Zoom MundoChile
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
          style={{
            padding:"10px 18px",borderRadius:"10px",cursor:"pointer",fontFamily:"inherit",fontSize:"17px",
            background:tab===t.id?"#FFFBEB":"#fff",
            color:tab===t.id?C.azul:C.textoMed,
            fontWeight:tab===t.id?"600":"600",
            border:tab===t.id?"2px solid #F59E0B":`2px solid ${C.grisBorde}`,
            borderBottom:tab===t.id?"4px solid #F59E0B":`2px solid ${C.grisBorde}`,
            boxShadow:tab===t.id?"0 2px 8px rgba(245,158,11,0.25)":"none"
          }}>
          {t.l}</button>)}
      </div>

      {/* ── INTÉRPRETES ── */}
      {tab==="interpretes"&&<>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"20px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({nombre:"",apellido:"",email:"",telefono:"",ciudad:"",modalidad_trabajo:"ambas",es_host_zoom:false,notas:"",activo:true});}} style={S.btnA}>+ Nuevo intérprete</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{fontWeight:"500",color:C.azul,marginBottom:"20px"}}>{editando==="nuevo"?"Nuevo intérprete":"Editar intérprete"}</div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Nombre *</label>{EF("nombre")}</div>
            <div style={S.camp}><label style={S.lbl}>Apellido</label>{EF("apellido")}</div>
          </div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Email</label>{EF("email")}</div>
            <div style={S.camp}><label style={S.lbl}>Teléfono</label>{EF("telefono")}</div>
          </div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Ciudad</label>
              <select style={S.sel} value={formEdit.ciudad||""} onChange={e=>setFormEdit(f=>({...f,ciudad:e.target.value}))}>
                <option value="">Seleccionar…</option>
                <optgroup label="🇨🇱 Chile">
                  <option>Santiago</option><option>Viña del Mar</option><option>Valparaíso</option>
                  <option>Concepción</option><option>La Serena</option><option>Antofagasta</option>
                  <option>Temuco</option><option>Rancagua</option><option>Talca</option>
                  <option>Arica</option><option>Iquique</option><option>Puerto Montt</option>
                  <option>Chillán</option><option>Calama</option><option>Copiapó</option>
                </optgroup>
                <optgroup label="🌎 Otros países">
                  <option>Buenos Aires</option><option>Lima</option><option>Bogotá</option>
                  <option>Ciudad de México</option><option>Madrid</option><option>Miami</option>
                  <option>Nueva York</option><option>São Paulo</option><option>Montevideo</option><option>Quito</option>
                </optgroup>
              </select>
            </div>
            <div style={S.camp}><label style={S.lbl}>Modalidad</label>
              <select style={S.sel} value={formEdit.modalidad_trabajo||"ambas"} onChange={e=>setFormEdit(f=>({...f,modalidad_trabajo:e.target.value}))}>
                <option value="ambas">💻📍 Presencial y Online</option>
                <option value="online">💻 Solo Online</option>
                <option value="presencial">📍 Solo Presencial</option>
              </select></div>
          </div>
          <div style={{marginBottom:"12px"}}><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:"60px"}} value={formEdit.notas||""} onChange={e=>setFormEdit(f=>({...f,notas:e.target.value}))}/></div>
          <label style={{display:"flex",gap:"8px",alignItems:"center",cursor:"pointer",fontSize:"17px",color:C.rojo,fontWeight:"500",marginBottom:"16px"}}>
            <input type="checkbox" checked={!!formEdit.es_host_zoom} onChange={e=>setFormEdit(f=>({...f,es_host_zoom:e.target.checked}))}/> 🔑 Host Zoom MundoChile
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
              <div style={{width:"40px",height:"40px",borderRadius:"50%",background:aColor,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"500",fontSize:"16px",flexShrink:0}}>{(i.nombre||"?").slice(0,1).toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:"500",fontSize:"16px",color:C.texto}}>{nombreCompleto}{i.es_host_zoom&&<span style={{color:C.rojo,marginLeft:"8px",fontSize:"14px"}}>🔑 Host Zoom</span>}</div>
                <div style={{display:"flex",gap:"12px",marginTop:"4px",flexWrap:"wrap"}}>
                  {i.email&&<CampoCopia valor={i.email}/>}
                  {i.telefono&&<CampoCopia valor={i.telefono}/>}
                  {i.ciudad&&<span style={{fontSize:"15px",color:C.textoMed}}>📍 {i.ciudad}</span>}
                  {i.modalidad_trabajo&&<span style={{fontSize:"15px",color:C.textoMed}}>{i.modalidad_trabajo==="ambas"?"💻📍":i.modalidad_trabajo==="online"?"💻 Online":"📍 Presencial"}</span>}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:"6px",flexShrink:0}}>
              <button onClick={()=>{setEditando(i.id);setFormEdit({...i});}} style={S.btnEdit}><span style={{filter:"brightness(10)"}}>✏️</span> Editar</button>
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
          <div style={{fontWeight:"500",color:C.azul,marginBottom:"20px"}}>{editando==="nuevo"?"Nuevo cliente":"Editar cliente"}</div>
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
              <div style={{width:"40px",height:"40px",borderRadius:"50%",background:cColor,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"500",fontSize:"16px",flexShrink:0}}>{(c.nombre_empresa||"?").slice(0,1).toUpperCase()}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:"500",fontSize:"16px",color:C.texto}}>{c.nombre_empresa}</div>
                <div style={{display:"flex",gap:"14px",marginTop:"4px",flexWrap:"wrap"}}>
                  {c.nombre_contacto&&<span style={{fontSize:"15px",color:C.textoMed}}>👤 {c.nombre_contacto}</span>}
                  {c.email_contacto&&<CampoCopia valor={c.email_contacto}/>}
                  {c.telefono&&<CampoCopia valor={c.telefono}/>}
                </div>
              </div>
            </div>
            <button onClick={()=>{setEditando(c.id);setFormEdit({...c});}} style={S.btnEdit}><span style={{filter:"brightness(10)"}}>✏️</span> Editar</button>
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
            <div style={{fontWeight:"500",fontSize:"16px",color:C.texto}}>🌐 {p.descripcion}</div>
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
              <div style={{fontWeight:"500",color:C.texto}}>{p.nombre}</div>
              <div style={{fontSize:"15px",color:C.textoMed,marginTop:"4px",display:"flex",gap:"10px"}}>
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
          <div style={{fontWeight:"500",color:C.azul,marginBottom:"16px"}}>{editando==="nuevo"?"Nuevo lugar":"Editar lugar"}</div>
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
              <div style={{fontWeight:"500",fontSize:"16px",color:C.texto}}>📍 {l.nombre}</div>
              {l.direccion&&<div style={{fontSize:"15px",color:C.textoMed,marginTop:"3px"}}>{l.direccion}</div>}
            </div>
            <div style={{display:"flex",gap:"6px"}}>
              <button onClick={()=>{setEditando(l.id);setFormEdit({...l});}} style={S.btnEdit}><span style={{filter:"brightness(10)"}}>✏️</span> Editar</button>
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
        <div style={{marginBottom:"16px",fontSize:"15px",color:C.textoMed}}>Gestión de accesos al sistema. Solo administradores pueden cambiar roles.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:"8px",padding:"8px 16px",background:C.grisMed,borderRadius:"8px",marginBottom:"8px",fontSize:"14px",fontWeight:"500",color:C.textoMed,textTransform:"uppercase"}}>
          <span>Nombre</span><span>Email</span><span>Rol</span><span>Acciones</span>
        </div>
        {perfiles.map(p=>{
          const rolColor=p.rol==="admin"?C.rojo:p.rol==="editor"?C.azul:C.textoSuave;
          return(
          <div key={p.id} style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"10px",padding:"12px 16px",marginBottom:"8px",background:"#fff",display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:"8px",alignItems:"center",opacity:p.activo===false?0.5:1}}>
            <div style={{fontWeight:"500",fontSize:"17px",color:C.texto}}>{p.nombre||"Sin nombre"}</div>
            <div style={{fontSize:"15px",color:C.textoMed}}>{p.email||"—"}</div>
            <select style={{...S.sel,height:"36px",fontSize:"15px",color:rolColor,fontWeight:"500",borderColor:rolColor+"66"}} value={p.rol||"viewer"}
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
function VistaAgenda({eventos,clientes,interpretes,pares,proveedores=[],filtros,setFiltros,onAbrir}) {
  const todayRef=useRef(null);
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
  useEffect(()=>{if(todayRef.current)todayRef.current.scrollIntoView({behavior:"smooth",block:"start"});},[]);
  return (
    <div style={{padding:"16px 24px 80px",width:"100%",maxWidth:"100%"}}>
      {!Object.keys(byWeek).length&&<div style={{textAlign:"center",padding:"80px 20px",color:"#fff"}}>
        <div style={{fontSize:"15px",marginBottom:"12px"}}>📅</div>
        <div style={{fontWeight:"500",fontSize:"14px",color:"#fff"}}>No hay eventos que mostrar</div>
      </div>}
      {Object.entries(byWeek).map(([lunISO,evs])=>{
        const finSem=new Date(desdeISO(lunISO));finSem.setDate(finSem.getDate()+6);
        const hoyISO=hoy();
        const esSemanaActual=lunISO<=hoyISO&&hoyISO<=toISO(finSem);
        return (
          <div key={lunISO} ref={esSemanaActual?todayRef:null} style={{marginBottom:"32px"}}>
            <div style={{background:"rgba(255,255,255,0.12)",color:"#fff",fontSize:"16px",fontWeight:"500",padding:"10px 16px",borderRadius:"8px",margin:"16px 0 8px",letterSpacing:"0.03em"}}>
              Semana del {formatCorto(lunISO)} al {formatCorto(toISO(finSem))} · {evs.length} evento{evs.length!==1?"s":""}
            </div>
            {evs.map(ev=>(
              <EventCard key={ev.id} ev={ev} clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} onClick={()=>onAbrir(ev)}/>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
function ModalNuevoContacto({clienteId,onGuardar,onCerrar}) {
  const [f,setF]=useState({nombre:"",cargo:"",email:"",telefono:""});
  const u=(k,v)=>setF(x=>({...x,[k]:v}));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.7)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"16px",padding:"28px 24px",width:"100%",maxWidth:"440px",boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
        <div style={{fontWeight:"500",fontSize:"14px",color:"#0F172A",marginBottom:"20px"}}>👤 Nuevo contacto</div>
        <div style={{marginBottom:"16px"}}><label style={S.lbl}>Nombre *</label><input style={S.inp} value={f.nombre} onChange={e=>u("nombre",e.target.value)} placeholder="Nombre completo"/></div>
        <div style={{marginBottom:"16px"}}><label style={S.lbl}>Cargo</label><input style={S.inp} value={f.cargo} onChange={e=>u("cargo",e.target.value)} placeholder="Gerente, Coordinador…"/></div>
        <div style={{display:"flex",gap:"12px",marginBottom:"16px"}}>
          <div style={{flex:1}}><label style={S.lbl}>Email</label><input style={S.inp} type="email" value={f.email} onChange={e=>u("email",e.target.value)} placeholder="correo@empresa.com"/></div>
          <div style={{flex:1}}><label style={S.lbl}>Teléfono</label><input style={S.inp} value={f.telefono} onChange={e=>u("telefono",e.target.value)} placeholder="+56 9 0000 0000"/></div>
        </div>
        <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
          <button onClick={onCerrar} style={S.btnCancel}>Cancelar</button>
          <button onClick={()=>f.nombre&&onGuardar(f)} style={S.btnSave}>💾 Guardar</button>
        </div>
      </div>
    </div>
  );
}

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
  const [contactos,setContactos]=useState([]);
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
  const [modalNuevoContacto,setModalNuevoContacto]=useState(null);
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
    const[evR,cliR,intR,parR,provR,lugR,conR]=await Promise.all([
      sb.from("eventos").select("*, asignaciones(*), evento_dias(*, asignaciones_dia(*), equipos_dia(*))").order("fecha_inicio"),
      sb.from("clientes").select("*").order("nombre_empresa"),
      sb.from("interpretes").select("*").order("nombre"),
      sb.from("pares_idiomas").select("*").order("idioma_origen"),
      sb.from("proveedores").select("*").order("nombre"),
      sb.from("lugares").select("*").order("nombre"),
      sb.from("contactos").select("*").order("nombre"),
    ]);
    if(evR.data) setEventos(evR.data);
    if(cliR.data) setClientes(cliR.data);
    if(intR.data) setInterpretes(intR.data);
    if(parR.data) setPares(parR.data);
    if(provR.data) setProveedores(provR.data);
    if(lugR.data) setLugares(lugR.data);
    if(conR.data) setContactos(conR.data);
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
    if(vista==="semana"){const semIni=toISO(diasSemana[0]);const semFin=toISO(diasSemana[6]);const n=eventosFiltrados.filter(e=>e.fecha_inicio<=semFin&&e.fecha_termino>=semIni).length;return `${n} evento${n!==1?"s":""} esta semana`;}
    if(vista==="mes"){const mv=new Date();mv.setMonth(mv.getMonth()+mesOff);const n=eventosFiltrados.filter(e=>{const f=desdeISO(e.fecha_inicio);return f.getFullYear()===mv.getFullYear()&&f.getMonth()===mv.getMonth();}).length;return `${n} evento${n!==1?"s":""}${hayFiltros?" (filtrado)":""}`;  }
    const n=eventosFiltrados.length;return `${n} evento${n!==1?"s":""}${hayFiltros?" (filtrado)":""}`;
  };

  const abrirEvento=async(ev)=>{
    const{data}=await sb.from("eventos").select("*, asignaciones(*), evento_dias(*, asignaciones_dia(*), equipos_dia(*))").eq("id",ev.id).single();
    setModalDetalle(data||ev);
  };

  const editarEvento=async(ev)=>{
    const{data}=await sb.from("eventos")
      .select("*, asignaciones(*), evento_dias(*, asignaciones_dia(*), equipos_dia(*))")
      .eq("id",ev.id).single();
    const evFresh=data||ev;
    const esDia=evFresh.fecha_inicio===evFresh.fecha_termino;
    const diasForm=(evFresh.evento_dias||[])
      .filter(d=>!esDia)
      .sort((a,b)=>a.orden-b.orden)
      .map(d=>({...d,asignaciones:(d.asignaciones_dia||[]).map(a=>({...asigVacia(),...a})),equipos:d.equipos_dia||[]}));
    const equiposSingles=esDia&&(evFresh.evento_dias||[]).length>0?(evFresh.evento_dias[0].equipos_dia||[]):[];
    const asigs=(evFresh.asignaciones||[]).map(a=>({...asigVacia(),...a}));
    setModalDetalle(null);
    setModalEvento({modo:"editar",data:{...evFresh,asignaciones:asigs,dias:diasForm,equipos:equiposSingles}});
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
      <div style={{padding:"16px 24px 80px",overflowX:"auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",minWidth:"800px"}}>
          {DIAS_SEM.map(d=><div key={d} style={{textAlign:"center",fontWeight:"500",fontSize:"15px",color:"#FFFFFF",padding:"8px 0",textTransform:"uppercase"}}>{d}</div>)}
          {celdas.map((dia,i)=>{
            if(!dia) return <div key={i} style={{background:"rgba(255,255,255,0.35)",borderRadius:"8px",minHeight:"90px"}}/>;
            const iso=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
            const evs=evsDia(iso), esHoy=iso===hoy();
            return <div key={i} onClick={()=>{setDiaActual(iso);setVista("dia");}}
              style={{minHeight:"90px",border:esHoy?"2px solid #4C6EF5":"none",borderRadius:"8px",padding:"8px",cursor:"pointer",background:"#FFFFFF",boxSizing:"border-box"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"} onMouseLeave={e=>e.currentTarget.style.background="#FFFFFF"}>
              <div style={{marginBottom:"4px"}}>
                <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:"26px",height:"26px",borderRadius:"50%",background:esHoy?"#4C6EF5":"transparent",color:esHoy?"#FFFFFF":"#0F172A",fontWeight:"500",fontSize:"15px"}}>{dia}</span>
              </div>
              {evs.slice(0,2).map((ev,j)=><div key={j} onClick={e=>{e.stopPropagation();abrirEvento(ev);}} style={{fontSize:"13px",fontWeight:"500",background:colorCliente(ev.cliente_id),color:"#fff",borderRadius:"4px",padding:"3px 8px",marginBottom:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clientes.find(c=>c.id===ev.cliente_id)?.nombre_empresa||ev.nombre_evento||"Evento"}</div>)}
              {evs.length>2&&<div style={{fontSize:"13px",color:"#6B7280",fontWeight:"500",marginTop:"1px"}}>+{evs.length-2} más</div>}
              {evs.length>0&&<div style={{fontSize:"13px",color:"#9CA3AF",fontWeight:"500",marginTop:"2px"}}>{evs.length} evento{evs.length!==1?"s":""}</div>}
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
        {evsFinSemana.length>0&&<div onClick={()=>{setDiaActual(toISO(diasFS[0]));setVista("dia");}} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"8px",padding:"8px 16px",marginBottom:"12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",color:"#fff",fontSize:"15px",fontWeight:"500"}}>
          ⚡ Ver {evsFinSemana.length} evento{evsFinSemana.length!==1?"s":""} este fin de semana
        </div>}
        {diasLF.map((d,i)=>{
          const iso=toISO(d),evs=evsDia(iso),esHoy=iso===hoy();
          const mesLargo=MESES_L[d.getMonth()].charAt(0).toUpperCase()+MESES_L[d.getMonth()].slice(1);
          const colBg=esHoy?"rgba(255,255,255,0.25)":evs.length>0?"rgba(255,255,255,0.13)":"rgba(255,255,255,0.07)";
          return <div key={i} style={{marginBottom:"10px",background:colBg,borderRadius:"12px",overflow:"hidden"}}>
            <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer"}} onClick={()=>{setDiaActual(iso);setVista("dia");}}>
              <div style={{textAlign:"center",minWidth:"54px"}}>
                <div style={{fontSize:"16px",fontWeight:"500",color:"#fff",textTransform:"uppercase",letterSpacing:"0.05em"}}>{nombresDia[i]}</div>
                <div style={{fontSize:"32px",fontWeight:"600",lineHeight:1,color:"#fff"}}>{d.getDate()}</div>
                <div style={{fontSize:"14px",color:"rgba(255,255,255,0.75)"}}>{mesLargo}</div>
              </div>
              <div style={{flex:1,color:"#fff",fontWeight:"500",fontSize:"17px"}}>{evs.length>0?`${evs.length} evento${evs.length!==1?"s":""}`:""}</div>
              <div style={{fontSize:"14px",color:"rgba(255,255,255,0.6)"}}>›</div>
            </div>
            {evs.length>0&&<div style={{padding:"0 10px 10px"}}>{evs.map(ev=><EventCard key={ev.id} ev={ev} diaDe={iso} clientes={clientes} pares={pares} interpretes={interpretes} proveedores={proveedores} onClick={()=>abrirEvento(ev)} onNavegar={d=>{setDiaActual(d);setVista("dia");}}/>)}</div>}
          </div>;
        })}
      </div>
    );

    return (
      <div style={{padding:"16px 24px 80px"}}>
        {evsFinSemana.length>0&&<div onClick={()=>{setDiaActual(toISO(diasFS[0]));setVista("dia");}} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"8px",padding:"8px 16px",marginBottom:"12px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"8px",color:"#fff",fontSize:"15px",fontWeight:"500"}}>
          ⚡ Ver {evsFinSemana.length} evento{evsFinSemana.length!==1?"s":""} este fin de semana
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"8px",padding:"8px"}}>
          {diasLF.map((d,i)=>{
            const iso=toISO(d),evs=evsDia(iso),esHoy=iso===hoy();
            const mesLargo=MESES_L[d.getMonth()].charAt(0).toUpperCase()+MESES_L[d.getMonth()].slice(1);
            const colBg=esHoy?"rgba(255,255,255,0.25)":evs.length>0?"rgba(255,255,255,0.13)":"rgba(255,255,255,0.07)";
            return <div key={i} style={{background:colBg,backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",borderRadius:"12px",padding:"10px",minHeight:"calc(100vh - 260px)"}}>
              <div onClick={()=>{setDiaActual(iso);setVista("dia");}} style={{textAlign:"center",padding:"12px 8px",borderRadius:"10px",marginBottom:"8px",background:"rgba(255,255,255,0.15)",cursor:"pointer",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>
                <div style={{fontSize:"16px",fontWeight:"500",color:"#fff",textTransform:"uppercase",letterSpacing:"0.05em"}}>{nombresDia[i]}</div>
                <div style={{fontSize:"32px",fontWeight:"600",lineHeight:1,color:"#fff",margin:"4px 0"}}>{d.getDate()}</div>
                <div style={{fontSize:"14px",color:"rgba(255,255,255,0.75)"}}>{mesLargo} {d.getFullYear()}</div>
                {evs.length>0&&<div style={{display:"inline-block",background:"rgba(255,255,255,0.20)",color:"#fff",fontSize:"14px",fontWeight:"500",padding:"2px 8px",borderRadius:"10px",marginTop:"6px"}}>{evs.length} evento{evs.length!==1?"s":""}</div>}
              </div>
              {evs.map(ev=><EventCard key={ev.id} ev={ev} diaDe={iso} clientes={clientes} pares={pares} interpretes={interpretes} proveedores={proveedores} onClick={()=>abrirEvento(ev)} onNavegar={d=>{setDiaActual(d);setVista("dia");}}/>)}
              {evs.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.5)",fontWeight:"500",fontSize:"15px",padding:"20px 0"}}>Sin eventos</div>}
            </div>;
          })}
        </div>
      </div>
    );
  };

  // ── Vista DÍA ──
  const renderDia=()=>{
    const evs=evsDia(diaActual);
    return <div style={{paddingTop:"16px",paddingBottom:"80px",paddingLeft:"24px",paddingRight:"24px",margin:"0 auto",maxWidth:"800px",width:"100%"}}>
      <div style={{fontWeight:"500",fontSize:"14px",color:"#fff",marginBottom:"16px"}}>
        {formatLargo(diaActual)}<span style={{fontWeight:"400",color:"rgba(255,255,255,0.75)",fontSize:"16px",marginLeft:"12px"}}>{evs.length} evento{evs.length!==1?"s":""}</span>
      </div>
      {evs.length===0?<div style={{textAlign:"center",padding:"60px 20px",color:"rgba(255,255,255,0.7)",border:"2px dashed rgba(255,255,255,0.3)",borderRadius:"16px"}}><div style={{fontSize:"15px",marginBottom:"12px"}}>📅</div><div style={{fontWeight:"500",fontSize:"14px",color:"#fff"}}>Sin eventos este día</div></div>
      :<div style={{display:"grid",gridTemplateColumns:esMobile?"1fr":"1fr 1fr",gap:"12px"}}>{evs.map(ev=><EventCard key={ev.id} ev={ev} diaDe={diaActual} clientes={clientes} pares={pares} interpretes={interpretes} proveedores={proveedores} onClick={()=>abrirEvento(ev)} onNavegar={d=>setDiaActual(d)}/>)}</div>}
    </div>;
  };


  // ── Guards ──
  if(cargandoAuth) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.gris}}>
      <div style={{textAlign:"center"}}><Logo size={48}/><div style={{marginTop:"16px",color:C.textoMed,fontSize:"16px",fontWeight:"500"}}>Cargando…</div></div>
    </div>
  );
  if(!SKIP_LOGIN && !usuario) return <PantallaLogin onLogin={(u)=>{setUsuario(u);cargarPerfil(u.id);}}/>;

  const esAdmin=perfil?.rol==="admin";
  const esEditor=perfil?.rol==="editor"||esAdmin;

  return (
    <div style={{fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",minHeight:"100vh",background:"linear-gradient(135deg, #1a2a4a 0%, #1e3a6e 50%, #2563a8 100%)",color:"#FFFFFF",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale",textRendering:"optimizeLegibility"}}>
      {/* ── TOPBAR ── */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"#162654"}}>
        <div style={{padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"96px",gap:"14px"}}>
          {/* IZQUIERDA: logo + brand */}
          <div style={{display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
            <div style={{flexShrink:0,display:"flex",alignItems:"center"}}>
              <div style={{width:"82px",height:"82px",borderRadius:"50%",background:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",padding:"2px",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",overflow:"hidden"}}>
                <img src={LOGO_SRC} alt="MundoChile" style={{width:"78px",height:"78px",objectFit:"contain",display:"block"}}/>
              </div>
            </div>
            <div>
              <div style={{fontWeight:"500",fontSize:"16px",color:"#FFFFFF",lineHeight:1,letterSpacing:"0.01em"}}>MundoChile</div>
              <div style={{fontSize:"13px",color:"rgba(255,255,255,0.70)",marginTop:"3px"}}>Translations & Interpreters · Since 2003</div>
            </div>
          </div>
          {/* CENTRO: tabs */}
          {pantalla==="calendario"&&<div style={{display:"flex",gap:"8px",alignItems:"center",flex:1,justifyContent:"center"}}>
            {[["semana","Semana"],["dia","Día"],["mes","Mes"],["agenda","Agenda"]].map(([v,l])=>(
              <button key={v} onClick={()=>setVista(v)} style={{padding:"9px 16px",background:vista===v?"#FFFFFF":"rgba(255,255,255,0.12)",border:"none",borderRadius:"8px",color:vista===v?"#1E3A6E":"#FFFFFF",fontWeight:vista===v?"600":"400",cursor:"pointer",fontSize:"15px",fontFamily:"inherit",transition:"all 0.15s"}}>{l}</button>
            ))}
          </div>}
          {/* DERECHA: nav + utilidades */}
          <div style={{display:"flex",gap:"6px",alignItems:"center",flexShrink:0}}>
            {pantalla==="calendario"&&vista!=="agenda"&&<>
              <div style={{textAlign:"right",marginRight:"6px"}}>
                <div style={{color:"#FFFFFF",fontSize:"19px",fontWeight:"500",lineHeight:1.2}}>{tituloNav()}</div>
                <div style={{color:"rgba(255,255,255,0.70)",fontSize:"15px"}}>{contadorSubtitulo()}</div>
              </div>
              <button onClick={navAnterior} style={{background:"rgba(255,255,255,0.15)",color:"#FFFFFF",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"15px",cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>← Ant</button>
              <button onClick={()=>{setSemanaOff(0);setMesOff(0);setDiaActual(hoy());}} style={{background:"rgba(255,255,255,0.15)",color:"#FFFFFF",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"15px",cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>Hoy</button>
              <button onClick={navSiguiente} style={{background:"rgba(255,255,255,0.15)",color:"#FFFFFF",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"15px",cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>Sig →</button>
            </>}
            {buscando
              ?<input autoFocus style={{...S.inp,width:"160px",height:"34px",fontSize:"15px",background:"rgba(255,255,255,0.15)",color:"#fff",borderColor:"rgba(255,255,255,0.3)"}} value={busqueda} onChange={e=>setBusqueda(e.target.value)} onBlur={()=>{if(!busqueda)setBuscando(false);}} placeholder="Buscar…"/>
              :<button onClick={()=>setBuscando(true)} style={{padding:"7px 12px",fontSize:"17px",background:"rgba(255,255,255,0.15)",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit"}} title="Buscar">🔍</button>
            }
            {busqueda&&<button onClick={()=>{setBusqueda("");setBuscando(false);}} style={{padding:"7px 10px",fontSize:"15px",background:"rgba(255,255,255,0.15)",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit"}}>✕</button>}
            {esEditor&&<button onClick={exportarExcel} style={{padding:"7px 12px",fontSize:"15px",background:"rgba(22,163,74,0.25)",color:"#6EE7B7",border:"1px solid rgba(22,163,74,0.5)",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit"}} title="Exportar Excel">📊</button>}
            {esEditor&&<button onClick={()=>setModalEvento({modo:"nuevo",data:evVacio()})} style={{padding:"7px 16px",fontSize:"17px",background:"#e63946",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit",fontWeight:"500"}}>+ Nuevo</button>}
            {esAdmin&&<button onClick={()=>setPantalla(p=>p==="config"?"calendario":"config")} style={{padding:"7px 12px",fontSize:"17px",background:pantalla==="config"?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.15)",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit"}}>⚙️</button>}
            <button onClick={()=>{sb.auth.signOut();window.location.reload();}} style={{padding:"9px 14px",fontSize:"17px",background:"rgba(255,255,255,0.15)",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontFamily:"inherit"}}>Salir</button>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      {pantalla==="calendario"&&<>
        <div style={{position:"sticky",top:"100px",zIndex:90,background:"rgba(26,47,90,0.97)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderBottom:"1px solid rgba(255,255,255,0.10)",padding:"6px 24px",width:"100%"}}>
          <FilterBar filters={filtros} onChange={setFiltros} interpreters={interpretes}/>
        </div>
        {vista==="semana"&&renderSemana()}
        {vista==="dia"&&renderDia()}
        {vista==="mes"&&renderMes()}
        {vista==="agenda"&&<VistaAgenda eventos={eventosFiltrados} clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} filtros={filtros} setFiltros={setFiltros} onAbrir={abrirEvento}/>}
      </>}
      {pantalla==="config"&&esAdmin&&<PantallaConfig clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} lugares={lugares} onActualizar={cargarDatos} perfil={perfil}/>}

      {/* ── MODALES ── */}
      {modalEvento&&<ModalEvento eventoInicial={modalEvento.data} clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} lugares={lugares} contactos={contactos} todos_eventos={eventos} perfil={perfil} onGuardar={()=>{setModalEvento(null);cargarDatos();addToast("Evento guardado correctamente","success");}} onCerrar={()=>setModalEvento(null)} onNuevoCliente={(cb)=>setModalNuevoCli({cb})} onNuevoContacto={setModalNuevoContacto} onNuevoInterprete={(ai,di)=>setModalNuevoInt({ai,di})} onLugarCreado={cargarDatos}/>}
      {modalDetalle&&<ModalDetalle evento={modalDetalle} clientes={clientes} interpretes={interpretes} pares={pares} perfil={perfil} onEditar={()=>editarEvento(modalDetalle)} onEliminar={()=>eliminarEvento(modalDetalle.id)} onCerrar={()=>setModalDetalle(null)} onVerFicha={()=>{setModalFicha(modalDetalle);setModalDetalle(null);}} addToast={addToast}/>}
      {modalFicha&&<ModalFicha evento={modalFicha} clientes={clientes} interpretes={interpretes} pares={pares} onCerrar={()=>setModalFicha(null)}/>}
      {modalNuevoCli&&<ModalNuevoCliente onGuardar={async(d)=>{const{data}=await sb.from("clientes").insert(d).select().single();if(data)setClientes(prev=>[...prev,data]);const cb=modalNuevoCli?.cb;setModalNuevoCli(false);if(data){cb?.(data.id);addToast("Cliente creado","success");}cargarDatos();}} onCerrar={()=>setModalNuevoCli(false)}/>}
      {modalNuevoInt&&<ModalNuevoInterprete onGuardar={async(d)=>{await sb.from("interpretes").insert(d);await cargarDatos();setModalNuevoInt(null);addToast("Intérprete creado","success");}} onCerrar={()=>setModalNuevoInt(null)}/>}
      {modalNuevoContacto&&<ModalNuevoContacto clienteId={modalNuevoContacto.cliente_id} onGuardar={async(d)=>{await sb.from("contactos").insert({...d,cliente_id:Number(modalNuevoContacto.cliente_id)});await cargarDatos();setModalNuevoContacto(null);addToast("Contacto creado","success");}} onCerrar={()=>setModalNuevoContacto(null)}/>}
      <ToastContainer toasts={toasts} onRemove={removeToast}/>
    </div>
  );
}
