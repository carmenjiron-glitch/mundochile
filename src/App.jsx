// MundoChile v2.1 — Gestión de Interpretaciones
import { useState, useEffect, useCallback, useRef, useMemo, Fragment } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
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
  <svg width="12.6" height="12.6" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)
const IconPresencial = ({size=16,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 10L12 2L22 10V21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V10z"/>
    <path d="M9 22v-7h6v7"/>
  </svg>
)
const IconHeadphones = ({size=13,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
)
const IconChatBubble = ({size=13,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconArrowsExchange = ({size=13,color="currentColor"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <path d="M7 23l-4-4 4-4"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_KEY;
const sb = createClient(SB_URL, SB_KEY, {global:{headers:{"Cache-Control":"no-cache"}}});

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
function FlagImg({idioma}){const c=IDIOMA_CDN[idioma];if(!c)return<span style={{fontSize:"14px"}}>🌐</span>;return<img src={`https://flagcdn.com/28x21/${c}.png`} style={{width:"25px",height:"18px",objectFit:"cover",borderRadius:"2px",verticalAlign:"middle",display:"inline-block",flexShrink:0}} alt={idioma}/>;}
const B_TIPO={"Simultánea":{bg:"#1D4ED8",c:"#FFFFFF",ct:"#FFFFFF"},"Consecutiva":{bg:"#9B1349",c:"#FFFFFF",ct:"#FFFFFF"},"Whispering":{bg:"#6D28D9",c:"#FFFFFF",ct:"#FFFFFF"}};
const B_MOD={"presencial":{bg:"#00AF57",c:"#FFFFFF",ct:"#FFFFFF"},"remoto":{bg:"#0E7490",c:"#FFFFFF",ct:"#FFFFFF"},"hibrido":{bg:"#D97706",c:"#FFFFFF",ct:"#FFFFFF"}};
const B_EST=(e)=>e==="Facturado"?{bg:"#FFF7ED",c:"#181818",b:"#FB923C"}:{bg:"#FFFFFF",c:"#1A1A1A",b:"#E57373"};
const bS=(bg,c,b)=>({display:"inline-flex",alignItems:"center",gap:"4px",padding:"3px 8px",borderRadius:"20px",fontSize:"10px",fontWeight:"700",lineHeight:"1.4",color:c,background:bg,border:`2px solid ${b||c}`,whiteSpace:"nowrap"});
const TIPO_ICON={"Simultánea":<IconHeadphones size={13}/>,"Consecutiva":<IconMic size={13}/>,"Whispering":<IconChatBubble size={13}/>};
const MOD_ICON={"presencial":<IconPresencial size={13}/>,"remoto":<IconAV size={13}/>,"hibrido":<IconArrowsExchange size={13}/>};
const nombreCorto=(nombre,apellido)=>{if(!apellido)return nombre;const completo=`${nombre} ${apellido}`;if(completo.length<=12)return completo;return`${nombre} ${apellido.charAt(0)}.`;};


// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const TIPOS      = ["Simultánea","Consecutiva","Whispering"];
const tiposArr=(t)=>{if(Array.isArray(t))return t;if(!t)return["Simultánea"];if(typeof t==="string"&&t.startsWith("{")&&t.endsWith("}"))return t.slice(1,-1).split(",").map(s=>s.replace(/^"|"$/g,"").trim());return[t];};
// Convierte array JS → literal PostgreSQL text[]: ["A","B"] → {A,B}
const tiposPg    = (t) => `{${tiposArr(t).join(',')}}`;
const MODALIDADES= ["remoto","presencial","hibrido"];
const LBL_MODAL  = {remoto:"Remoto",presencial:"Presencial",hibrido:"Híbrido"};
const PLATAFORMAS= ["Zoom MundoChile","Zoom Cliente","Teams","Webex","Meet","Otro"];
const ZOOM_ADMIN = ["Magix","RLA","El mismo cliente","Otro"];
const JORNADAS_PRES=["1 hora","Media Jornada","Media Jornada + 1 hora adicional","Jornada Completa","Jornada Completa + 1 hora adicional","Otro horario personalizado"];
const JORNADAS_REM=["1 hora","1 hora + 1 bloque de 15 minutos","2 horas","2 horas + 1 bloque de 30 minutos","Media Jornada 4 horas","Media Jornada + 1 hora adicional","1 Jornada Completa","Jornada Completa + 1 hora adicional","Otro horario personalizado"];
const JORNADAS=[...new Set([...JORNADAS_PRES,...JORNADAS_REM])];
const getJornadas=(mod)=>mod==="remoto"?JORNADAS_REM:JORNADAS_PRES;
const calcJornada=(mins,mod)=>{
  let r;
  if(mod==="remoto"){
    if(mins===60)r="1 hora";else if(mins===75)r="1 hora + 1 bloque de 15 minutos";
    else if(mins===120)r="2 horas";else if(mins===150)r="2 horas + 1 bloque de 30 minutos";
    else if(mins===240)r="Media Jornada 4 horas";
    else if(mins>240&&mins<=300)r="Media Jornada + 1 hora adicional";
    else if(mins>300&&mins<=540)r="1 Jornada Completa";
    else if(mins>540&&mins<=600)r="Jornada Completa + 1 hora adicional";
    else r="Otro horario personalizado";
  } else {
    if(mins<=60)r="1 hora";
    else if(mins<=360)r="Media Jornada";
    else if(mins<=420)r="Media Jornada + 1 hora adicional";
    else if(mins<=600)r="Jornada Completa";
    else r="Otro horario personalizado";
  }
  r=r.replace(/(\d+) Jornadas? Completas?/g,(_,n)=>Number(n)>1?`${n} Jornadas Completas`:`${n} Jornada Completa`);
  r=r.replace(/(\d+) Medias? Jornadas?/g,(_,n)=>Number(n)>1?`${n} Medias Jornadas`:`${n} Media Jornada`);
  return r;
};
const pluralizarJornada=(texto)=>{
  if(!texto) return texto;
  return texto
    .replace(/(\d+)\s+Jornadas? Completas?/g,(_,n)=>Number(n)>1?`${n} Jornadas Completas`:`${n} Jornada Completa`)
    .replace(/(\d+)\s+Medias? Jornadas?/g,(_,n)=>Number(n)>1?`${n} Medias Jornadas`:`${n} Media Jornada`);
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
  lbl: {fontSize:"13px",fontWeight:"600",color:"#234A80",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"6px",display:"block",background:"#DBEAFE",padding:"4px 8px",borderRadius:"4px"},
  fila:{display:"flex",gap:"16px",flexWrap:"wrap"},
  camp:{flex:"1",minWidth:"140px"},
  btnA:{padding:"10px 20px",background:"#3a7bd5",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnR:{padding:"10px 20px",background:"#E03131",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnV:{padding:"10px 20px",background:"#2F9E44",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnG:{padding:"10px 20px",background:"#FFF5F5",color:"#A02B2B",border:"1.5px solid #B05A5A",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnSave:{padding:"10px 20px",background:"#2F9E44",color:"#fff",border:"2px solid #1B5E20",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnDel:{padding:"10px 20px",background:"#E03131",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnCancel:{padding:"10px 20px",background:"#FFF5F5",color:"#A02B2B",border:"1.5px solid #B05A5A",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"14px",height:"40px",fontFamily:"inherit"},
  btnEdit:{padding:"4px 10px",background:"#E67700",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"},
  btnFicha:{padding:"4px 10px",background:"#1971C2",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"},
  btnDup:{padding:"4px 10px",background:"#9C36B5",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"},
  btnP:{padding:"4px 10px",background:C.azulClaro,color:C.azul,border:`1px solid ${C.azulBorde}`,borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"},
};

// ─── ESTADO VACÍO ─────────────────────────────────────────────────────────────
const evVacio = () => ({
  id:null, cliente_id:"", nro_oc:"", nombre_evento:"", tipo:["Simultánea"],
  fecha_inicio:toISO(new Date(new Date().getTime()+86400000)), fecha_termino:toISO(new Date(new Date().getTime()+86400000)), hora_inicio:"09:00", hora_termino:"13:00",
  jornada:"Media Jornada", jornada_personalizada:"", lugar:"", lugar_detalle:"",
  modalidad:"remoto", plataforma:"Zoom MundoChile", zoom_owner:"mundochile",
  zoom_administrador:"", zoom_link:"", estado:"Facturación Pendiente", numero_factura:"", comentarios:"",
  nro_hes:"", nro_otros:"", comentarios_av:"", contacto_id:"", fecha_emision:"",
  asignaciones:[], dias:[], equipos:[],
});
const asigVacia = () => ({interprete_id:"",par_id:"",nro_ot:"",nro_boleta:"",es_boleta_adicional:false,es_host_zoom:false,rol:"Principal",hora_presentacion:"",estado_pago:"Pendiente",conflicto_ok:false});
const diaVacio  = (fecha) => ({fecha,hora_inicio:"09:00",hora_termino:"13:00",jornada:"Media Jornada",jornada_personalizada:"",tipo:null,modalidad:null,lugar:null,lugar_detalle:null,asignaciones:[],equipos:[]});
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

function CampoCopia({valor, mostrarValor=true, wrapStyle={}, btnColor=null, btnFontSize="15px", btnTitle=null}) {
  const [ok,setOk]=useState(false);
  if(!valor) return <span style={{color:C.textoSuave}}>—</span>;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:"6px",...wrapStyle}}>
      {mostrarValor&&<span>{valor}</span>}
      <button onClick={async()=>{try{await navigator.clipboard.writeText(valor);}catch{const t=document.createElement("textarea");t.value=valor;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t);}setOk(true);setTimeout(()=>setOk(false),1500);}}
        title={btnTitle||undefined}
        style={{background:"none",border:"none",cursor:"pointer",color:ok?C.verde:(btnColor||C.textoSuave),fontSize:btnFontSize,padding:0}}>
        {ok?"✓":"⧉"}
      </button>
    </span>
  );
}

function SelHora({value,onChange,placeholder="Hora"}) {
  const [manual,setManual]=useState(false);
  const v5=value?.slice(0,5)||"";
  const esManual=manual||(!!v5&&!HORAS.includes(v5));
  if(esManual) return (
    <input type="time" step="60" style={S.inp} value={v5} onChange={e=>onChange(e.target.value)} placeholder="08:30"/>
  );
  return (
    <select style={S.sel} value={v5} onChange={e=>{if(e.target.value==="__otro__"){setManual(true);onChange("");}else onChange(e.target.value);}}>
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

  const bt=B_TIPO[tiposArr(ev.tipo)[0]]||{bg:"#EEF2FF",c:"#3B5BDB"};
  const bm=B_MOD[ev.modalidad]||{bg:"#F7F7F5",c:"#6B6B6B"};
  const be=B_EST(ev.estado);

  return (
    <div onClick={onClick}
      style={{borderRadius:"0 10px 4px 0",padding:"10px 12px",background:"#FFFFFF",color:"#1A1A1A",cursor:"pointer",marginBottom:"12px",boxShadow:"0 3px 14px rgba(0,0,0,0.18)",borderLeft:`28px solid ${borderColor}`,borderTop:`8px solid ${borderColor}`,position:"relative",transition:"transform 0.12s,box-shadow 0.12s",lineHeight:1.5}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.20)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 3px 14px rgba(0,0,0,0.18)";}}>
      {dotColor&&<div style={{position:"absolute",top:"12px",right:"12px",width:"12px",height:"12px",borderRadius:"50%",background:"#e63946",animation:"mcpulse 2s ease-in-out infinite"}}/>}
      {diaXdeY&&<div style={{marginBottom:"8px"}}><span style={{display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:"20px",fontSize:"10px",fontWeight:"700",lineHeight:"1.4",color:"#1971C2",background:"#E8F4FD",border:"2px solid #1971C2"}}>📅 Multidía · Día {diaXdeY.x} de {diaXdeY.y}</span></div>}
      <div style={{fontSize:"9px",fontWeight:"600",color:"#1A1A1A",letterSpacing:"0.1px",lineHeight:1.2,marginBottom:"4px",paddingRight:dotColor?"20px":"0"}}>{cliente?.nombre_empresa||"—"}</div>
      {ev.nombre_evento&&<div style={{fontSize:"14px",fontWeight:"500",color:"#374151",marginBottom:"6px"}}>{ev.nombre_evento}</div>}
      {cliente?.nombre_contacto&&<div style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontSize:"0.55em",fontStyle:"italic",color:"#6B7280",marginBottom:"6px"}}>{cliente.nombre_contacto}</div>}
      <div style={{fontSize:"17px",fontWeight:"500",color:"#1A1A1A",marginBottom:"8px"}}>{ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)} hrs</div>
      <div style={{display:"flex",gap:"4px",flexWrap:"wrap",alignItems:"center",marginBottom:"8px"}}>
        {tiposArr(ev.tipo).map(t=>{const btx=B_TIPO[t]||{bg:"#1D4ED8",c:"#FFFFFF"};return<span key={t} style={bS(btx.bg,btx.c,btx.bg)}>{TIPO_ICON[t]}{t}</span>;})}
        <span style={bS(bm.bg,bm.c,bm.bg)}>{MOD_ICON[ev.modalidad]}{LBL_MODAL[ev.modalidad]||ev.modalidad}</span>
      </div>
      {esPresencial&&ev.lugar&&<div style={{fontSize:"15px",color:"#475569",marginBottom:"8px"}}>📌 {ev.lugar}</div>}
      {!esPresencial&&ev.plataforma&&<div style={{marginBottom:"8px"}}>
        <PlatformChip platform={ev.plataforma==="Zoom"?"Zoom MundoChile":ev.plataforma} isMundoChile={ev.plataforma==="Zoom MundoChile"||ev.plataforma==="Zoom"}/>
      </div>}
      <div style={{display:"flex",gap:"4px",flexWrap:"wrap",alignItems:"center",marginBottom:"8px"}}>
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
                <span style={{fontSize:"12px",fontWeight:"600",color:/inglés.*español/i.test(key)?"#2D8CFF":titleColor,textTransform:"uppercase",letterSpacing:"0.06em",filter:"brightness(0.65)",textAlign:"center",width:"100%",display:"block"}}>{key}</span>
                {hp&&<span style={{fontSize:"14px",color:"#545B68",display:"flex",alignItems:"center",gap:"4px"}}>🕐 {hp.slice(0,5)} hrs</span>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
                {grupo.interpretes.map((interp,i)=>(
                  <span key={i} title={`${interp.nombre}${interp.apellido?" "+interp.apellido:""}`} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"5px",padding:"4px 10px",borderRadius:"20px",fontSize:"14px",fontWeight:esPort?"600":"500",lineHeight:"1.4",color:bubbleColor,background:bubbleBg,border:bubbleBorder,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"default"}}>
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
      {tieneEquipos&&<span style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"3px 8px",borderRadius:"20px",fontSize:"10px",fontWeight:"700",lineHeight:"1.4",color:"#495057",background:"#F1F3F5",border:"1px solid #DEE2E6"}}>{provNombreEq||"Equipos AV"}</span>}
    </div>
  );
}

// ─── MODAL EVENTO ─────────────────────────────────────────────────────────────
function ModalEvento({eventoInicial,clientes,interpretes,pares,proveedores,lugares=[],contactos=[],todos_eventos,perfil,onGuardar,onCerrar,onNuevoCliente,onNuevoContacto,onNuevoInterprete,onLugarCreado,onNuevoLugar,onNuevoProveedor}) {
  const [form,setForm]=useState(()=>{
    if(!eventoInicial) return evVacio();
    const f=JSON.parse(JSON.stringify(eventoInicial));
    f.asignaciones=(f.asignaciones||[]).map(a=>({...a,conflicto_ok:true}));
    f.dias=(f.dias||[]).map(d=>({...d,asignaciones:(d.asignaciones||[]).map(a=>({...a,conflicto_ok:true}))}));
    return f;
  });
  const [tab,setTab]=useState("general");
  const [guardando,setGuardando]=useState(false);
  const guardandoRef=useRef(false);
  const [error,setError]=useState("");
  const [guardadoOk,setGuardadoOk]=useState(false);
  const setF=useCallback((k,v)=>{guardandoRef.current=false;setForm(f=>({...f,[k]:v}));},[ ]);
  const [zoomOtro,setZoomOtro]=useState(!ZOOM_ADMIN.includes(form.zoom_administrador)&&!!form.zoom_administrador);
  const [adminZoomManual,setAdminZoomManual]=useState("");
  const [modalNuevoProveedor,setModalNuevoProveedor]=useState(null);

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

  const [contactosLocal,setContactosLocal]=useState(()=>
    contactos.filter(c=>Number(c.cliente_id)===Number(eventoInicial?.cliente_id)&&c.activo!==false)
  );
  useEffect(()=>{
    if(!form.cliente_id){setContactosLocal([]);return;}
    const filtrados=contactos.filter(c=>Number(c.cliente_id)===Number(form.cliente_id)&&c.activo!==false);
    setContactosLocal(filtrados);
    if(filtrados.length>0)setF("contacto_id",filtrados[0].id);
  },[contactos,form.cliente_id]);

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

  const guardar=async({cerrar=true}={})=>{
    if(guardandoRef.current)return;
    guardandoRef.current=true;
    if(!form.cliente_id){guardandoRef.current=false;setError("Selecciona un cliente");return;}
    const _asigsTodas=esMultidia?form.dias.flatMap(d=>d.asignaciones||[]):form.asignaciones;
    const _confPend=_asigsTodas.find(a=>a.interprete_id&&!a.conflicto_ok&&conflicto(a.interprete_id));
    if(_confPend){const _ci=interpretes.find(x=>x.id===_confPend.interprete_id);setError(`⚠️ ${_ci?.nombre||"Un intérprete"} tiene un conflicto de agenda sin resolver. Resuélvelo en el tab Intérpretes antes de guardar.`);guardandoRef.current=false;return;}
    setGuardando(true);setError("");
    try {
      const payload={
        cliente_id:form.cliente_id||null, nro_oc:form.nro_oc||"", nombre_evento:(form.nombre_evento||"").trim().replace(/\s+/g,' '),
        tipo:tiposPg(form.tipo), fecha_inicio:form.fecha_inicio, fecha_termino:form.fecha_termino,
        hora_inicio:form.hora_inicio||"09:00", hora_termino:form.hora_termino||"13:00",
        jornada:form.jornada||"Media Jornada", jornada_personalizada:form.jornada_personalizada||"",
        lugar:form.lugar||"", lugar_detalle:form.lugar_detalle||"", modalidad:form.modalidad||"remoto",
        plataforma:form.plataforma||"", zoom_owner:form.zoom_owner||"mundochile",
        zoom_administrador:form.zoom_administrador==="__manual__"?adminZoomManual:(form.zoom_administrador||""), zoom_link:form.zoom_link||"", contacto_id:form.contacto_id?Number(form.contacto_id):null, estado:form.estado||"Facturación Pendiente",
        comentarios:form.comentarios||"", edited_by:perfil?.id||null, edited_by_nombre:perfil?.nombre||"",
      };
      let eventoId=form.id;
      if(form.id){const{error:e}=await sb.from("eventos").update(payload).eq("id",form.id);if(e)throw e;}
      else {
        payload.created_by=perfil?.id||null; payload.created_by_nombre=perfil?.nombre||"";
        const{data,error:e}=await sb.from("eventos").insert(payload).select().single();
        if(e)throw e; eventoId=data.id;
        // Actualizar form.id para que saves posteriores hagan UPDATE, no INSERT
        setForm(f=>({...f,id:eventoId}));
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
        const asigs=form.asignaciones.filter(a=>a.interprete_id).map(a=>({
          evento_id:eventoId, interprete_id:a.interprete_id, par_id:a.par_id||null,
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
          const diaPayload={
            evento_id:eventoId, fecha:dia.fecha, orden:i+1,
            hora_inicio:dia.hora_inicio||"09:00", hora_termino:dia.hora_termino||"13:00",
            jornada:dia.jornada||"Media Jornada", jornada_personalizada:dia.jornada_personalizada||"",
          };
          if(dia.tipo!==null&&dia.tipo!==undefined)diaPayload.tipo=tiposPg(dia.tipo);
          if(dia.modalidad!==null&&dia.modalidad!==undefined)diaPayload.modalidad=dia.modalidad;
          if(dia.lugar!==null&&dia.lugar!==undefined)diaPayload.lugar=dia.lugar;
          if(dia.lugar_detalle!==null&&dia.lugar_detalle!==undefined)diaPayload.lugar_detalle=dia.lugar_detalle;
          const{data:dD,error:eD}=await sb.from("evento_dias").insert(diaPayload).select().single();
          if(eD)throw eD;
          const asigsDia=(dia.asignaciones||[]).filter(a=>a.interprete_id).map(a=>({
            evento_dia_id:dD.id, interprete_id:a.interprete_id, par_id:a.par_id||null,
            es_host_zoom:!!a.es_host_zoom, hora_presentacion:a.hora_presentacion||null,
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
      guardandoRef.current=false;
      if(cerrar){onGuardar();}
      else{setGuardadoOk(true);setTimeout(()=>setGuardadoOk(false),2000);setTimeout(()=>{const m=document.querySelector("[data-modal-scroll]");if(m)m.scrollTop=0;},80);}
    } catch(e){setError("Error al guardar: "+(e.message||JSON.stringify(e)));guardandoRef.current=false;}
    finally{setGuardando(false);guardandoRef.current=false;}
  };

  // Fila de asignación
  const FilaAsig=({a,idx,dIdx=null})=>{
    const [alerta,setAlerta]=useState(null);
    const divRef=useRef(null);
    useEffect(()=>{
      if(!scrollToNewAsigRef.current||!divRef.current)return;
      scrollToNewAsigRef.current=false;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        divRef.current?.scrollIntoView({block:'start'});
      }));
    },[]);
    const edit=(k,v)=>{
      const extra=k==="interprete_id"?{conflicto_ok:false}:{};
      if(dIdx===null) setForm(f=>{const asigs=[...f.asignaciones];asigs[idx]={...asigs[idx],[k]:v,...extra};return{...f,asignaciones:asigs};});
      else setForm(f=>{const dias=[...f.dias],asigs=[...dias[dIdx].asignaciones];asigs[idx]={...asigs[idx],[k]:v,...extra};dias[dIdx]={...dias[dIdx],asignaciones:asigs};return{...f,dias};});
      if(k==="interprete_id") setAlerta(v?conflicto(v):null);
    };
    const aceptarConflicto=()=>{
      if(dIdx===null) setForm(f=>{const asigs=[...f.asignaciones];asigs[idx]={...asigs[idx],conflicto_ok:true};return{...f,asignaciones:asigs};});
      else setForm(f=>{const dias=[...f.dias],asigs=[...dias[dIdx].asignaciones];asigs[idx]={...asigs[idx],conflicto_ok:true};dias[dIdx]={...dias[dIdx],asignaciones:asigs};return{...f,dias};});
      setAlerta(null);
    };
    const rem=()=>{
      const nombre=interpretes.find(x=>x.id===a.interprete_id);
      const label=nombre?`${nombre.nombre||""}${nombre.apellido?" "+nombre.apellido:""}`.trim():`Intérprete ${idx+1}`;
      if(!window.confirm(`¿Quitar a ${label} de la asignación?`))return;
      if(dIdx===null) setForm(f=>{const asigs=[...f.asignaciones];asigs.splice(idx,1);return{...f,asignaciones:asigs};});
      else setForm(f=>{const dias=[...f.dias],asigs=[...dias[dIdx].asignaciones];asigs.splice(idx,1);dias[dIdx]={...dias[dIdx],asignaciones:asigs};return{...f,dias};});
    };
    const interp=interpretes.find(x=>x.id===a.interprete_id);
    return (
      <div ref={divRef} id={`asig-${dIdx??'s'}-${idx}`} data-fila-asig="" style={{border:`1.5px solid ${a.es_host_zoom?"#E03131":C.grisBorde}`,borderRadius:"10px",padding:"14px",marginBottom:"10px",background:C.gris,boxShadow:a.es_host_zoom?"0 0 0 2px #fecaca":undefined}}>
        <div style={{fontWeight:"600",color:"#374151",fontSize:"13px",marginBottom:"10px",paddingBottom:"8px",borderBottom:`1px solid ${C.grisBorde}`}}>Intérprete {idx+1}</div>
        {alerta&&<div style={{background:"#FEF2F2",border:"2px solid #DC2626",borderRadius:"10px",padding:"14px 16px",marginBottom:"12px",boxShadow:"0 0 0 4px rgba(220,38,38,0.12)"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:"10px"}}>
            <span style={{fontSize:"22px",flexShrink:0,lineHeight:1.2}}>🚫</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:"700",fontSize:"14px",color:"#991B1B",marginBottom:"4px"}}>Conflicto de agenda detectado</div>
              <div style={{fontSize:"13px",color:"#7F1D1D",marginBottom:"12px",lineHeight:1.5}}>
                <strong>{interp?.nombre||"Este intérprete"}</strong> ya está asignado a <strong>"{alerta.nombre_evento||"otro evento"}"</strong> el {formatLargo(alerta.fecha_inicio)}.<br/>No puedes guardar hasta resolver este conflicto.
              </div>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                <button onClick={aceptarConflicto} style={{padding:"6px 16px",background:"#991B1B",color:"#fff",border:"none",borderRadius:"7px",cursor:"pointer",fontWeight:"600",fontSize:"13px",fontFamily:"inherit"}}>✓ Asignar como excepción</button>
                <button onClick={()=>{edit("interprete_id","");}} style={{padding:"6px 16px",background:"none",color:"#991B1B",border:"1.5px solid #DC2626",borderRadius:"7px",cursor:"pointer",fontWeight:"600",fontSize:"13px",fontFamily:"inherit"}}>← Cambiar intérprete</button>
              </div>
            </div>
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
              <button onClick={()=>onNuevoInterprete(idx,dIdx,(interpId,parId)=>{edit("interprete_id",interpId);if(parId)edit("par_id",parId);})} style={{...S.btnP,fontSize:"19px",fontWeight:"500",width:"48px",height:"48px",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1}}>+</button>
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
              {(pares||[]).filter(p=>p.activo!==false).sort((a,b)=>(a.descripcion||"").localeCompare(b.descripcion||"")).map(p=><option key={p.id} value={p.id}>{p.descripcion||(p.idioma_origen&&p.idioma_destino?`${p.idioma_origen} – ${p.idioma_destino}`:"Par sin nombre")}</option>)}
            </select>
          </div>
        </div>
        <div style={{...S.fila,marginTop:"10px"}}>
          <div style={S.camp}><label style={S.lbl}>N° OT</label><input style={S.inp} defaultValue={a.nro_ot} onBlur={e=>edit("nro_ot",e.target.value)} placeholder="OT-0000"/></div>
          <div style={S.camp}><label style={S.lbl}>N° Boleta</label><input style={S.inp} defaultValue={a.nro_boleta} onBlur={e=>edit("nro_boleta",e.target.value)} placeholder="628"/></div>
          <div style={S.camp}><label style={S.lbl}>🕐 Hora presentación</label><SelHora value={a.hora_presentacion} onChange={v=>edit("hora_presentacion",v)} placeholder="Misma del evento"/></div>
        </div>
        <div style={{display:"flex",gap:"16px",marginTop:"10px",flexWrap:"wrap",alignItems:"center"}}>
          <label style={{display:"flex",gap:"6px",alignItems:"center",cursor:"pointer",fontSize:"13px",color:a.es_host_zoom?"#B82E38":C.textoMed,fontWeight:a.es_host_zoom?"600":"400"}}>
            <input type="checkbox" checked={!!a.es_host_zoom} onChange={e=>edit("es_host_zoom",e.target.checked)}/> 🔑 Host Zoom MundoChile
          </label>
          <div style={{marginLeft:"auto"}}><button onClick={rem} style={{background:"none",border:"none",cursor:"pointer",color:"#B82E38",fontWeight:"500",fontSize:"13px"}}>✕ Quitar</button></div>
        </div>
      </div>
    );
  };

  const scrollToNewAsigRef=useRef(false);
  const addAsig=(dIdx=null)=>{
    scrollToNewAsigRef.current=true;
    if(dIdx===null) setForm(f=>({...f,asignaciones:[...f.asignaciones,asigVacia()]}));
    else setForm(f=>{const dias=[...f.dias];dias[dIdx]={...dias[dIdx],asignaciones:[...dias[dIdx].asignaciones,asigVacia()]};return{...f,dias};});
  };

  const addEq=(dIdx)=>{setForm(f=>{const dias=[...f.dias];dias[dIdx]={...dias[dIdx],equipos:[...(dias[dIdx].equipos||[]),eqVacio()]};return{...f,dias};});setTimeout(()=>{const t=document.querySelector(`[data-dia-section="${dIdx}"]`);const m=document.querySelector("[data-modal-scroll]");if(t&&m)m.scrollTop=t.offsetTop-m.offsetTop;},80);};
  const editEq=(dIdx,eIdx,k,v)=>setForm(f=>{const dias=[...f.dias],eqs=[...(dias[dIdx].equipos||[])];eqs[eIdx]={...eqs[eIdx],[k]:v};dias[dIdx]={...dias[dIdx],equipos:eqs};return{...f,dias};});
  const setDiaField=(dIdx,k,v)=>setForm(f=>{const ds=[...f.dias];ds[dIdx]={...ds[dIdx],[k]:v};return{...f,dias:ds};});
  const copyFromPrev=(dIdx)=>setForm(f=>{const ds=[...f.dias],prev=ds[dIdx-1];ds[dIdx]={...ds[dIdx],hora_inicio:prev.hora_inicio,hora_termino:prev.hora_termino,jornada:prev.jornada,tipo:prev.tipo,modalidad:prev.modalidad,lugar:prev.lugar,lugar_detalle:prev.lugar_detalle};return{...f,dias:ds};});

  const TABS=esMultidia
    ?[{id:"general",lbl:<><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Detalles</>},{id:"dias",lbl:"📅 Por Día"}]
    :[{id:"general",lbl:<><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Detalles</>},{id:"interpretes",lbl:<><IconMic size={16}/> Intérpretes</>},{id:"equipos",lbl:<><IconAV size={16}/> Equipos AV</>}];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"20px",width:"100%",maxWidth:"760px",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.25)"}}>
        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:"none",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,background:form.id?"#E67700":"#3a7bd5",borderRadius:"20px 20px 0 0"}}>
          <div style={{fontSize:"16px",fontWeight:"600",color:"#FFFFFF"}}>{form.id?<><span style={{filter:"brightness(10)"}}>✏️</span> Editar evento</>:"Nuevo evento"}</div>
          <button onClick={onCerrar} style={{background:"none",border:"none",cursor:"pointer",fontSize:"21px",color:"#FFFFFF",lineHeight:1,fontWeight:"300",opacity:1}}>×</button>
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
                  {contactosLocal.map(c=><option key={c.id} value={c.id}>{c.nombre}{c.cargo?` — ${c.cargo}`:""}</option>)}
                </select>
                <button onClick={()=>onNuevoContacto({cliente_id:form.cliente_id,cb:(nc)=>{setContactosLocal(p=>[...p,nc]);setF("contacto_id",nc.id);}})} style={{padding:"0",width:"42px",height:"42px",background:"#3B82F6",color:"#FFFFFF",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"20px",fontWeight:"300",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>+</button>
              </div>
            </div>}
            {/* Nombre del evento */}
            <div style={{marginBottom:"20px"}}>
              <label style={S.lbl}>Nombre del evento</label>
              <input style={S.inp} value={form.nombre_evento} onChange={e=>setF("nombre_evento",e.target.value)} placeholder="Conferencia anual…"/>
            </div>
            {/* Tipo + Modalidad */}
            <div style={{...S.fila,marginBottom:"20px"}}>
              <div style={S.camp}><label style={{...S.lbl,display:"flex",alignItems:"center",gap:"5px"}}><IconMic size={16}/> Tipo de interpretación</label>
                <div style={{display:"flex",gap:"7px",flexWrap:"wrap",paddingTop:"4px"}}>
                  {TIPOS.map(t=>{const on=tiposArr(form.tipo).includes(t);const clr=(B_TIPO[t]||{c:"#3B5BDB"}).c;const bg=(B_TIPO[t]||{bg:"#EEF2FF"}).bg;return(
                    <label key={t} style={{display:"inline-flex",alignItems:"center",gap:"7px",cursor:"pointer",padding:"8px 14px",borderRadius:"10px",border:`2px solid ${on?clr:"#E2E8F0"}`,background:on?bg:"#F8FAFC",transition:"all 0.12s",userSelect:"none",fontSize:"14px",fontWeight:on?"600":"400",color:on?clr:"#374151"}}>
                      <input type="checkbox" checked={on} onChange={()=>{const cur=tiposArr(form.tipo);const nx=on?cur.filter(x=>x!==t):[...cur,t];setF("tipo",nx.length?nx:cur);}} style={{display:"none"}}/>
                      <span style={{width:"16px",height:"16px",borderRadius:"4px",border:`2px solid ${on?clr:"#CBD5E1"}`,background:on?clr:"transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{on&&<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}</span>
                      {TIPO_ICON[t]} {t}
                    </label>
                  );})}
                </div></div>
              <div style={S.camp}><label style={S.lbl}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline",verticalAlign:"middle",marginRight:"2px"}}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Modalidad</label>
                <select style={S.sel} value={form.modalidad} onChange={e=>setF("modalidad",e.target.value)}>{MODALIDADES.map(m=><option key={m} value={m}>{LBL_MODAL[m]}</option>)}</select></div>
            </div>
            {/* Fechas */}
            <div style={{...S.fila,marginBottom:"20px"}}>
              <div style={S.camp}><label style={S.lbl}>📅 Fecha inicio</label><input style={S.inp} type="date" value={form.fecha_inicio} onChange={e=>{const v=e.target.value;setF("fecha_inicio",v);if(!form.fecha_termino||form.fecha_termino<v)setF("fecha_termino",v);}}/></div>
              <div style={S.camp}><label style={S.lbl}>📅 Fecha término</label><input style={S.inp} type="date" value={form.fecha_termino} min={form.fecha_inicio} onChange={e=>{const v=e.target.value;setF("fecha_termino",v<form.fecha_inicio?form.fecha_inicio:v);}}/></div>
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
              <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1fr",gap:"12px",alignItems:"end",marginBottom:"20px"}}>
                <div style={S.camp}><label style={S.lbl}>💻 Plataforma</label>
                  <select style={S.sel} value={form.plataforma} onChange={e=>setF("plataforma",e.target.value)}>{PLATAFORMAS.map(p=><option key={p}>{p}</option>)}</select></div>
                {(form.plataforma==="Zoom MundoChile"||form.plataforma==="Zoom")&&<div style={S.camp}><label style={S.lbl}>🔑 Administrador Zoom</label>
                  <select style={S.sel}
                    value={(()=>{if(!form.zoom_administrador)return"";if(form.zoom_administrador==="__manual__")return"__manual__";const m=interpretes.find(i=>`${i.nombre} ${i.apellido||""}`.trim()===form.zoom_administrador.trim());return m?String(m.id):"__manual__";})()}
                    onChange={e=>{if(e.target.value==="__manual__"){setF("zoom_administrador","__manual__");setAdminZoomManual("");}else if(e.target.value===""){setF("zoom_administrador","");}else{const interp=interpretes.find(i=>String(i.id)===e.target.value);setF("zoom_administrador",interp?`${interp.nombre} ${interp.apellido||""}`.trim():"");}}}>
                    <option value="">Sin asignar</option>
                    {interpretes.map(i=><option key={i.id} value={String(i.id)}>{i.nombre} {i.apellido||""}</option>)}
                    <option value="__manual__">+ Agregar manualmente…</option>
                  </select>
                  {form.zoom_administrador==="__manual__"&&<input style={{...S.inp,marginTop:"6px"}} type="text" placeholder="Nombre del administrador" value={adminZoomManual} onChange={e=>setAdminZoomManual(e.target.value)}/>}
                </div>}
                {(form.plataforma==="Zoom MundoChile"||form.plataforma==="Zoom")&&<div style={S.camp}>
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
                <div style={{display:"flex",gap:"6px"}}>
                  {(()=>{const TL={hotel:"Hotel",centro_eventos:"Centro de eventos",universidad:"Universidad",edificio_corporativo:"Edificio corporativo",oficina_cliente:"Oficina del cliente",planta_produccion:"Planta de producción",faena_minera:"Faena minera",ministerio:"Ministerio",edificio_gobierno:"Edificio de gobierno",otro:"Otro"};const fn=l=>l.tipo&&TL[l.tipo]?`${TL[l.tipo]} ${l.nombre}`:l.nombre;return(<select style={S.sel} value={form.lugar||""} onChange={e=>setF("lugar",e.target.value)}><option value="">Seleccionar lugar…</option>{lugares.filter(l=>l.activo!==false).map(l=><option key={l.id} value={fn(l)}>{fn(l)}</option>)}{form.lugar&&!lugares.filter(l=>l.activo!==false).find(l=>fn(l)===form.lugar)&&<option value={form.lugar}>{form.lugar}</option>}</select>);})()}
                  <button onClick={()=>onNuevoLugar&&onNuevoLugar(l=>{const TL={hotel:"Hotel",centro_eventos:"Centro de eventos",universidad:"Universidad",edificio_corporativo:"Edificio corporativo",oficina_cliente:"Oficina del cliente",planta_produccion:"Planta de producción",faena_minera:"Faena minera",ministerio:"Ministerio",edificio_gobierno:"Edificio de gobierno",otro:"Otro"};const fn=l.tipo&&TL[l.tipo]?`${TL[l.tipo]} ${l.nombre}`:l.nombre;setF("lugar",fn);if(onLugarCreado)onLugarCreado();})} style={{padding:"0",width:"42px",height:"42px",background:"#3B82F6",color:"#FFFFFF",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"20px",fontWeight:"300",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>+</button>
                </div>
              </div>
              <div style={{marginBottom:"20px"}}><label style={S.lbl}>Detalles del lugar</label><input style={S.inp} value={form.lugar_detalle} onChange={e=>setF("lugar_detalle",e.target.value)} placeholder="Sala Andes, piso 3…"/></div>
            </>}
            {/* Comentarios */}
            <div style={{marginBottom:"16px",marginTop:"8px"}}><label style={S.lbl}>💬 Comentarios</label><textarea style={{...S.inp,minHeight:"80px",resize:"vertical",height:"auto",border:"1.5px solid #A0A09F"}} value={form.comentarios||""} onChange={e=>setF("comentarios",e.target.value)} placeholder="Notas adicionales…"/></div>
            {/* Panel contable */}
            <div style={{border:"2px solid #F0C890",borderRadius:"12px",padding:"16px",background:"#FFF5E6",marginTop:"16px",marginBottom:"16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px",paddingBottom:"10px",borderBottom:"1px solid #E5E7EB"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A6FD4" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span style={{fontSize:"13px",fontWeight:"700",color:"#1A6FD4",textTransform:"uppercase",letterSpacing:"0.06em"}}>Información Contable</span>
              </div>
              {/* Información para facturación */}
              <div style={{marginBottom:"16px"}}>
                <label style={{...S.lbl,marginBottom:"8px"}}>Información para facturación</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px",alignItems:"start"}}>
                  <div><label style={{...S.lbl,fontSize:"11px",fontWeight:"600",textTransform:"uppercase",marginBottom:"4px",whiteSpace:"nowrap"}}>N° OC</label><input style={{...S.inp,fontSize:"13px",padding:"6px 10px",width:"100%",boxSizing:"border-box"}} value={form.nro_oc} onChange={e=>setF("nro_oc",e.target.value)} placeholder="OC-0000"/></div>
                  <div><label style={{...S.lbl,fontSize:"11px",fontWeight:"600",textTransform:"uppercase",marginBottom:"4px",whiteSpace:"nowrap"}} title="Hoja Entrada Servicios">N° HES</label><input style={{...S.inp,fontSize:"13px",padding:"6px 10px",width:"100%",boxSizing:"border-box"}} value={form.nro_hes||""} onChange={e=>setF("nro_hes",e.target.value)} placeholder="HES-000"/></div>
                  <div><label style={{...S.lbl,fontSize:"11px",fontWeight:"600",textTransform:"uppercase",marginBottom:"4px",whiteSpace:"nowrap"}}>Otros</label><input style={{...S.inp,fontSize:"13px",padding:"6px 10px",width:"100%",boxSizing:"border-box"}} value={form.nro_otros||""} onChange={e=>setF("nro_otros",e.target.value)} placeholder="Ref. adicional…"/></div>
                </div>
              </div>
              {/* Estado de facturación + N° Factura */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",alignItems:"end",marginBottom:"12px"}}>
                <div style={S.camp}><label style={S.lbl}>Estado de facturación</label>
                  <select style={{...S.sel,textAlign:"left"}} value={form.estado} onChange={e=>setF("estado",e.target.value)}>{ESTADOS.map(e=><option key={e} style={{textAlign:"left"}}>{e}</option>)}</select>
                </div>
                <div style={S.camp}><label style={S.lbl}>N° Factura</label>
                  <input style={S.inp} type="text" value={form.numero_factura||""} onChange={e=>setF("numero_factura",e.target.value)} placeholder="Ej: 12345"/>
                </div>
              </div>
              {/* Fecha de emisión + Fecha de pago automática */}
              {(()=>{
                const clienteActual=clientes.find(c=>c.id===form.cliente_id);
                const esMagix=/magix/i.test(clienteActual?.nombre_empresa||"");
                const diasPago=esMagix?60:30;
                const calcFechaPago=(iso)=>{
                  if(!iso)return"";
                  const d=new Date(iso+"T12:00:00");
                  d.setDate(d.getDate()+diasPago);
                  const off=(d.getDay()-3+7)%7;
                  d.setDate(d.getDate()-off);
                  return d.toISOString().slice(0,10);
                };
                const fechaPago=calcFechaPago(form.fecha_emision);
                const fmtCL=(iso)=>{if(!iso)return"";const[y,m,d]=iso.split("-");return`${d}/${m}/${y}`;};
                return(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",alignItems:"end"}}>
                    <div style={S.camp}>
                      <label style={S.lbl}>📅 Fecha de emisión</label>
                      <input style={S.inp} type="date" value={form.fecha_emision||""} onChange={e=>setF("fecha_emision",e.target.value)}/>
                    </div>
                    <div style={S.camp}>
                      <label style={{...S.lbl,color:"#6B7280"}}>💸 Fecha de pago{esMagix?" (60 días — Magix)":""}</label>
                      <div style={{...S.inp,display:"flex",alignItems:"center",background:"#F1F5F9",color:fechaPago?"#0F172A":"#9CA3AF",fontWeight:fechaPago?"600":"400",border:"1.5px solid #CBD5E1",cursor:"default"}}>
                        {fechaPago?fmtCL(fechaPago):"— completar fecha de emisión"}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </>}

          {/* ── TAB INTÉRPRETES (un día) ── */}
          {tab==="interpretes"&&!esMultidia&&<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div style={{fontWeight:"500",color:"#B82E38",fontSize:"17px",display:"flex",alignItems:"center",gap:"6px"}}><IconMic size={20}/> Intérpretes asignados</div>
              <button onClick={()=>addAsig()} style={S.btnA}>+ Agregar intérprete</button>
            </div>
            {form.asignaciones.length===0&&<div style={{textAlign:"center",color:C.textoSuave,padding:"40px 20px",border:`2px dashed ${C.grisBorde}`,borderRadius:"12px"}}>Sin intérpretes — Agrega uno arriba</div>}
            {form.asignaciones.map((a,idx)=><FilaAsig key={idx} a={a} idx={idx}/>)}
            {form.asignaciones.length>0&&<button onClick={()=>addAsig()} style={{...S.btnP,width:"100%",padding:"9px"}}>+ Agregar otro intérprete</button>}
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
                  <button onClick={()=>{if(!window.confirm(`¿Eliminar equipo #${eIdx+1}?`))return;setForm(f=>{const eqs=[...(f.equipos||[])];eqs.splice(eIdx,1);return{...f,equipos:eqs};});}} style={{background:"none",border:"none",cursor:"pointer",color:"#B82E38",fontWeight:"500"}}>✕</button>
                </div>
                <div style={S.fila}>
                  <div style={S.camp}><label style={S.lbl}>Tipo de sistema</label>
                    <select style={S.sel} value={eq.tipo_equipo} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],tipo_equipo:e.target.value};return{...f,equipos:eqs};})}>
                      <option value="fijo">Sistema fijo (cabina y receptores)</option>
                      <option value="portatil">Sistema portátil</option>
                      <option value="cabina_portatil">Cabina portátil</option>
                    </select></div>
                  <div style={S.camp}><label style={S.lbl}>Proveedor AV</label>
                    <div style={{display:"flex",gap:"8px"}}>
                      <select style={{...S.sel,flex:1}} value={eq.proveedor_id||""} onChange={e=>setForm(f=>{const eqs=[...(f.equipos||[])];eqs[eIdx]={...eqs[eIdx],proveedor_id:e.target.value?Number(e.target.value):null};return{...f,equipos:eqs};})}>
                        <option value="">Sin proveedor / otro</option>
                        {proveedores.filter(p=>p.activo!==false).map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                      <button type="button" onClick={()=>setModalNuevoProveedor({eIdx})} style={{padding:"0 12px",borderRadius:"8px",background:"#1A6FD4",color:"#FFFFFF",border:"none",cursor:"pointer",fontWeight:"700",fontSize:"18px",flexShrink:0,height:"36px"}}>+</button>
                    </div></div>
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
                        <button onClick={()=>setForm(f=>{const eqs=[...(f.equipos||[])];let cs2=[];try{cs2=JSON.parse(eqs[eIdx].proveedor_contacto||"[]");}catch{cs2=[];}cs2.splice(ci,1);eqs[eIdx]={...eqs[eIdx],proveedor_contacto:JSON.stringify(cs2)};return{...f,equipos:eqs};})} style={{background:"none",border:"none",cursor:"pointer",color:"#B82E38",fontSize:"16px",padding:"0 4px"}}>×</button>
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
          {tab==="dias"&&esMultidia&&<>
            {/* Panel global */}
            <div style={{background:"#EEF2FF",borderRadius:"10px",padding:"12px 16px",marginBottom:"16px",border:"1.5px solid #C7D2FE"}}>
              <div style={{fontSize:"12.84px",fontWeight:"700",color:"#4338CA",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"10px"}}>🌐 Información General del evento — Aplica a todos los días salvo excepción</div>
              <div style={{display:"flex",gap:"9px",flexWrap:"wrap",alignItems:"center",marginBottom:"8px"}}>
                {tiposArr(form.tipo).map(t=>{const bt=B_TIPO[t]||{bg:"#1D4ED8",c:"#FFFFFF",ct:"#FFFFFF"};return<span key={t} style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4.28px 11.77px",borderRadius:"21.4px",fontSize:"13.91px",fontWeight:"600",color:bt.ct,background:bt.bg,border:"none",whiteSpace:"nowrap"}}>{TIPO_ICON[t]} {t}</span>;})}
                {form.modalidad&&<span style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"4.28px 11.77px",borderRadius:"21.4px",fontSize:"13.91px",fontWeight:"600",color:(B_MOD[form.modalidad]||{ct:"#FFFFFF"}).ct,background:(B_MOD[form.modalidad]||{bg:"#0E7490"}).bg,border:"none",whiteSpace:"nowrap"}}>{MOD_ICON[form.modalidad]||"💻"} {LBL_MODAL[form.modalidad]}</span>}
                {(form.modalidad==="presencial"||form.modalidad==="hibrido")&&form.lugar&&<span style={{display:"inline-flex",alignItems:"center",padding:"4.28px 11.77px",borderRadius:"21.4px",fontSize:"13.91px",fontWeight:"600",color:"#5B21B6",background:"#EDE9FE",border:"1.5px solid #7C3AED",whiteSpace:"nowrap"}}>📍 {form.lugar}</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"13.91px",fontWeight:"500",color:"#4338CA"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 15 16"/><path d="M10 3h4"/><path d="M12 3v2"/></svg>
                Horario global: <strong>{form.hora_inicio?.slice(0,5)||"–"} – {form.hora_termino?.slice(0,5)||"–"}</strong>
              </div>
            </div>
            {form.dias.map((dia,dIdx)=>{
              const modEfectiva=dia.modalidad||form.modalidad;
              return(
            <div key={dia.fecha} data-dia-section={dIdx} style={{border:"2.5px solid #1D4ED8",borderRadius:"14px",marginBottom:"16px",overflow:"hidden"}}>
              {/* Header del día */}
              <div style={{background:C.grisMed,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:"600",color:"#234A80",fontSize:"16px"}}>📅 {formatMedioES(dia.fecha)}</div>
                  <div style={{fontSize:"13.91px",color:"#5A687D",marginTop:"2px"}}>{dia.hora_inicio?.slice(0,5)||"–"} – {dia.hora_termino?.slice(0,5)||"–"} hrs — {pluralizarJornada(dia.jornada)||""}</div>
                </div>
                <div style={{display:"flex",gap:"6px",alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
                  {dIdx>0&&<button onClick={()=>copyFromPrev(dIdx)} style={{padding:"5px 14px",fontSize:"12px",fontWeight:"600",background:"#EFF6FF",border:"2px solid #1D4ED8",borderRadius:"20px",cursor:"pointer",color:"#1D4ED8",fontFamily:"inherit"}}>↑ Copiar día anterior</button>}
                </div>
              </div>
              <div style={{padding:"16px"}}>
                {/* Horario del día */}
                <div style={{...S.fila,marginBottom:"12px"}}>
                  <div style={S.camp}><label style={S.lbl}>🕐 Hora inicio</label><SelHora value={dia.hora_inicio} onChange={v=>{
                    setForm(f=>{const ds=[...f.dias];const ht=ds[dIdx].hora_termino;let jor=ds[dIdx].jornada;if(ht){const[hi,hm]=v.split(":").map(Number);const[ti,tm]=ht.split(":").map(Number);const m=(ti*60+tm)-(hi*60+hm);if(m>0)jor=calcJornada(m,ds[dIdx].modalidad||f.modalidad);}ds[dIdx]={...ds[dIdx],hora_inicio:v,jornada:jor};return{...f,dias:ds};});
                  }}/></div>
                  <div style={S.camp}><label style={S.lbl}>🕐 Hora término</label><SelHora value={dia.hora_termino} onChange={v=>{
                    setForm(f=>{const ds=[...f.dias];const hi2=ds[dIdx].hora_inicio;let jor=ds[dIdx].jornada;if(hi2){const[hi,hm]=hi2.split(":").map(Number);const[ti,tm]=v.split(":").map(Number);const m=(ti*60+tm)-(hi*60+hm);if(m>0)jor=calcJornada(m,ds[dIdx].modalidad||f.modalidad);}ds[dIdx]={...ds[dIdx],hora_termino:v,jornada:jor};return{...f,dias:ds};});
                  }}/></div>
                  <div style={S.camp}><label style={S.lbl}>⏱ Jornada</label>
                    <select style={S.sel} value={dia.jornada||"Media Jornada"} onChange={e=>setDiaField(dIdx,"jornada",e.target.value)}>
                      {getJornadas(modEfectiva).map(j=><option key={j}>{j}</option>)}
                    </select>
                  </div>
                </div>
                {/* Intérpretes del día */}
                <div style={{marginTop:"12px",border:"2px solid #E03131",borderRadius:"16px",padding:"16px",background:"rgba(224,49,49,0.06)",marginBottom:"16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <div style={{fontWeight:"500",color:"#E03131",fontSize:"16px",display:"flex",alignItems:"center",gap:"5px"}}><IconMic size={16}/> Intérpretes de este día</div>
                    <button onClick={()=>addAsig(dIdx)} style={{...S.btnP,fontSize:"13px",color:"#2C5CA0",border:"1px solid #869CB8"}}>+ Agregar intérprete</button>
                  </div>
                  {(dia.asignaciones||[]).length===0&&<div style={{color:C.textoSuave,fontSize:"15px",textAlign:"center",padding:"12px",border:`1.5px dashed ${C.grisBorde}`,borderRadius:"8px"}}>Sin intérpretes para este día</div>}
                  {(dia.asignaciones||[]).map((a,aIdx)=><FilaAsig key={aIdx} a={a} idx={aIdx} dIdx={dIdx}/>)}
                </div>
                {/* Equipos AV */}
                {modEfectiva!=="remoto"&&<div style={{marginTop:"14px",border:"2px solid #155724",borderRadius:"16px",padding:"16px",background:"rgba(21,87,36,0.06)",marginBottom:"16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <div style={{fontWeight:"500",color:"#155724",fontSize:"16px",display:"flex",alignItems:"center",gap:"5px"}}><IconAV size={16}/> Equipos AV de este día</div>
                    <button onClick={()=>addEq(dIdx)} style={{...S.btnP,fontSize:"13px",color:"#2C5CA0",border:"1px solid #869CB8"}}>+ Agregar equipos</button>
                  </div>
                  {(dia.equipos||[]).map((eq,eIdx)=>(
                    <div key={eIdx} style={{border:`1px solid ${C.grisBorde}`,borderRadius:"10px",padding:"14px",marginBottom:"10px",background:"#fff"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                        <div style={{fontWeight:"500",color:C.azul,fontSize:"13px"}}>Equipo #{eIdx+1}</div>
                        <button onClick={()=>{if(!window.confirm(`¿Eliminar equipo #${eIdx+1}?`))return;setForm(f=>{const ds=[...f.dias],eqs=[...(ds[dIdx].equipos||[])];eqs.splice(eIdx,1);ds[dIdx]={...ds[dIdx],equipos:eqs};return{...f,dias:ds};});}} style={{background:"none",border:"none",cursor:"pointer",color:"#B82E38",fontWeight:"500"}}>✕</button>
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
                              <button onClick={()=>{let cs2=[];try{cs2=JSON.parse(eq.proveedor_contacto||"[]");}catch{cs2=[];}cs2.splice(ci,1);editEq(dIdx,eIdx,"proveedor_contacto",JSON.stringify(cs2));}} style={{background:"none",border:"none",cursor:"pointer",color:"#B82E38",fontSize:"16px",padding:"0 4px"}}>×</button>
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
          );})}</>}
        </div>
        {/* Footer */}
        <div style={{padding:"16px 24px",borderTop:`1px solid ${C.grisBorde}`,flexShrink:0,display:"flex",gap:"10px",justifyContent:"flex-end",alignItems:"center",background:C.gris,borderRadius:"0 0 20px 20px"}}>
          {guardadoOk&&<span style={{color:"#059669",fontSize:"13px",fontWeight:"500"}}>✅ Guardado</span>}
          <button onClick={onCerrar} style={S.btnCancel}>Cancelar</button>
          <button onClick={()=>guardar({cerrar:false})} disabled={guardando} style={{...S.btnSave,background:"#059669",opacity:guardando?0.7:1,minWidth:"120px",pointerEvents:guardando?"none":"auto"}}>{guardando?"Guardando…":"💾 Guardar"}</button>
          <button onClick={()=>guardar({cerrar:true})} disabled={guardando} style={{...S.btnSave,background:"#1D4ED8",opacity:guardando?0.7:1,minWidth:"160px",pointerEvents:guardando?"none":"auto"}}>{guardando?"Guardando…":"💾 Guardar y cerrar"}</button>
        </div>
      </div>
      {modalNuevoProveedor&&<ModalNuevoProveedor
        onCerrar={()=>setModalNuevoProveedor(null)}
        onGuardado={prov=>{
          onNuevoProveedor&&onNuevoProveedor(prov);
          setForm(f=>{const eqs=[...(f.equipos||[])];if(modalNuevoProveedor.eIdx!=null)eqs[modalNuevoProveedor.eIdx]={...eqs[modalNuevoProveedor.eIdx],proveedor_id:prov.id};return{...f,equipos:eqs};});
          setModalNuevoProveedor(null);
        }}
      />}
    </div>
  );
}

// ─── MODAL NUEVO PROVEEDOR ───────────────────────────────────────────────────
function ModalNuevoProveedor({onCerrar,onGuardado}) {
  const CT={nombre:"",c1_nombre:"",c1_celular:"",c1_email:"",c2_nombre:"",c2_celular:"",c2_email:"",c3_nombre:"",c3_celular:"",c3_email:"",comentarios:""};
  const [form,setForm]=useState(CT);
  const [guardando,setGuardando]=useState(false);
  const [error,setError]=useState("");
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const guardar=async()=>{
    if(!form.nombre.trim()){setError("El nombre es obligatorio.");return;}
    setGuardando(true);setError("");
    const payload={nombre:form.nombre.trim(),activo:true};
    if(form.c1_nombre.trim())payload.contacto1_nombre=form.c1_nombre.trim();
    if(form.c1_celular.trim())payload.contacto1_celular=form.c1_celular.trim();
    if(form.c1_email.trim())payload.contacto1_email=form.c1_email.trim();
    if(form.c2_nombre.trim())payload.contacto2_nombre=form.c2_nombre.trim();
    if(form.c2_celular.trim())payload.contacto2_celular=form.c2_celular.trim();
    if(form.c2_email.trim())payload.contacto2_email=form.c2_email.trim();
    if(form.c3_nombre.trim())payload.contacto3_nombre=form.c3_nombre.trim();
    if(form.c3_celular.trim())payload.contacto3_celular=form.c3_celular.trim();
    if(form.c3_email.trim())payload.contacto3_email=form.c3_email.trim();
    if(form.comentarios.trim())payload.comentarios=form.comentarios.trim();
    await sb.rpc("reload_schema_cache").catch(()=>{});
    const {data,error:err}=await sb.from("proveedores").insert(payload).select().single();
    setGuardando(false);
    if(err){setError("Error al guardar: "+err.message);return;}
    onGuardado(data);
  };

  const INP={width:"100%",padding:"8px 10px",borderRadius:"8px",border:"1px solid #CBD5E1",fontSize:"13px",fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
  const LBL={fontSize:"11px",fontWeight:"600",color:"#475569",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"4px",display:"block"};
  const contactoRow=(num,pre)=>(
    <div style={{display:"grid",gridTemplateColumns:"1fr 140px 1fr",gap:"8px",marginBottom:"10px"}}>
      <div><label style={LBL}>Contacto {num} — Nombre</label><input style={INP} value={form[pre+"nombre"]} onChange={e=>setF(pre+"nombre",e.target.value)} placeholder="Nombre contacto"/></div>
      <div><label style={LBL}>Celular</label><input style={INP} value={form[pre+"celular"]} onChange={e=>setF(pre+"celular",e.target.value)} placeholder="+56 9…"/></div>
      <div><label style={LBL}>Email</label><input style={INP} type="email" value={form[pre+"email"]} onChange={e=>setF(pre+"email",e.target.value)} placeholder="correo@…"/></div>
    </div>
  );

  return (
    <div style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0,0,0,0.6)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",boxSizing:"border-box"}}>
      <div style={{background:"#FFFFFF",borderRadius:"16px",width:"100%",maxWidth:"640px",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.3)"}}>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{fontSize:"16px",fontWeight:"700",color:"#0F172A"}}>Nuevo Proveedor AV</div>
          <button onClick={onCerrar} style={{background:"none",border:"none",cursor:"pointer",fontSize:"20px",color:"#64748B",padding:"4px",lineHeight:1}}>×</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          <div style={{marginBottom:"16px"}}>
            <label style={LBL}>Nombre empresa *</label>
            <input style={INP} value={form.nombre} onChange={e=>setF("nombre",e.target.value)} placeholder="Nombre del proveedor AV" autoFocus/>
          </div>
          <div style={{borderTop:"1px solid #E2E8F0",paddingTop:"14px",marginBottom:"12px"}}>
            <div style={{fontSize:"12px",fontWeight:"600",color:"#64748B",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"12px"}}>Contactos</div>
            {contactoRow(1,"c1_")}
            {contactoRow(2,"c2_")}
            {contactoRow(3,"c3_")}
          </div>
          <div>
            <label style={LBL}>Comentarios</label>
            <textarea style={{...INP,minHeight:"70px",resize:"vertical"}} value={form.comentarios} onChange={e=>setF("comentarios",e.target.value)} placeholder="Notas adicionales…"/>
          </div>
          {error&&<div style={{marginTop:"10px",color:"#DC2626",fontSize:"13px"}}>{error}</div>}
        </div>
        <div style={{padding:"16px 24px",borderTop:"1px solid #E2E8F0",display:"flex",gap:"10px",justifyContent:"flex-end",flexShrink:0}}>
          <button onClick={onCerrar} style={{padding:"9px 18px",borderRadius:"8px",border:"1px solid #CBD5E1",background:"#F8FAFC",color:"#374151",cursor:"pointer",fontSize:"13px",fontWeight:"500",fontFamily:"inherit"}}>Cancelar</button>
          <button onClick={guardar} disabled={guardando} style={{padding:"9px 22px",borderRadius:"8px",border:"none",background:"#1A6FD4",color:"#FFFFFF",cursor:guardando?"not-allowed":"pointer",fontSize:"13px",fontWeight:"600",fontFamily:"inherit",opacity:guardando?0.7:1}}>{guardando?"Guardando…":"Guardar proveedor"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL DETALLE ────────────────────────────────────────────────────────────
function ModalDetalle({evento,clientes,interpretes,pares,perfil,lugares=[],onEditar,onEliminar,onCerrar,onVerFicha,onNavDia,addToast}) {
  const _combinarAsigs=(ev)=>{const all=[...(ev?.asignaciones||[]),...(ev?.evento_dias||[]).flatMap(d=>d.asignaciones_dia||[])];const seen=new Set();return all.filter(a=>{const uid=`${a.interprete_id}-${a.par_id}`;if(seen.has(uid))return false;seen.add(uid);return true;});};
  const [asignaciones,setAsignaciones]=useState(()=>_combinarAsigs(evento));
  useEffect(()=>setAsignaciones(_combinarAsigs(evento)),[evento]);
  const [geoOk,setGeoOk]=useState(false);
  const [geoLoading,setGeoLoading]=useState(false);
  if(!evento) return null;
  const cliente=clientes.find(c=>c.id===evento.cliente_id);
  const esZoomMC=(evento.plataforma==="Zoom MundoChile"||evento.plataforma==="Zoom");
  const esPresencial=evento.modalidad==="presencial"||evento.modalidad==="hibrido";
  const esMultidia=evento.evento_dias?.length>1||(evento.es_multidia===true)||(evento.fecha_inicio!==evento.fecha_termino)||(evento.evento_dias?.length>0&&evento.fecha_inicio!==evento.evento_dias[evento.evento_dias.length-1]?.fecha);
  const dias=(()=>{
    if(evento.evento_dias?.length>0) return [...evento.evento_dias].sort((a,b)=>(a.orden||0)-(b.orden||0));
    if(!evento.fecha_inicio||!evento.fecha_termino||evento.fecha_inicio===evento.fecha_termino)return[];
    const result=[];const ini=desdeISO(evento.fecha_inicio);const fin=desdeISO(evento.fecha_termino);let cur=new Date(ini);
    while(cur<=fin){result.push({fecha:toISO(cur),hora_inicio:evento.hora_inicio,hora_termino:evento.hora_termino,jornada:evento.jornada});cur.setDate(cur.getDate()+1);}
    return result;
  })();
  const LBL={remoto:"Remoto",presencial:"Presencial",hibrido:"Híbrido"};
  const LBL_LARGA={txt:"13px",fw:"600",c:"#0F172A",tt:"uppercase",ls:"0.04em"};
  const B_TIPO_D={"Simultánea":{bg:"#1D4ED8",c:"#FFFFFF"},"Consecutiva":{bg:"#9B1349",c:"#FFFFFF"},"Whispering":{bg:"#6D28D9",c:"#FFFFFF"}};
  const B_MOD_D={"presencial":{bg:"#00AF57",c:"#FFFFFF"},"remoto":{bg:"#0E7490",c:"#FFFFFF"},"hibrido":{bg:"#D97706",c:"#FFFFFF"}};
  const B_EST_D=(e)=>e==="Facturado"?{bg:"#FFF7ED",c:"#181818",b:"#FB923C"}:{bg:"#FFFFFF",c:"#1A1A1A",b:"#E57373"};
  const SL=({t})=><div style={{fontSize:"13px",fontWeight:"700",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"10px",display:"flex",alignItems:"center",gap:"8px",WebkitFontSmoothing:"antialiased"}}>{t}</div>;
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
    <div style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:"16px",boxSizing:"border-box"}}>
      <div style={{background:"#FFFFFF",borderRadius:"20px",width:"100%",maxWidth:"855px",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.25)",position:"relative",zIndex:1001}}>
        {/* Header */}
        <div style={{background:"#FFFFFF",padding:"20px 24px 14px",borderRadius:"20px 20px 0 0",flexShrink:0,borderBottom:`10px solid ${colorCliente(evento.cliente_id)}`,position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
          {/* Fila 1: dots izquierda, botones derecha en una línea */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
              {(()=>{
                const hoyD=new Date();const manana=new Date();manana.setDate(hoyD.getDate()+1);
                const fechaEvento=desdeISO(evento.fecha_inicio);
                const esHoy=fechaEvento.toDateString()===hoyD.toDateString();
                const esManana=fechaEvento.toDateString()===manana.toDateString();
                if(esHoy) return <div style={{width:"16px",height:"16px",borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 8px #22C55E",flexShrink:0,animation:"flash 1.2s ease-in-out infinite"}}/>;
                if(esManana) return <div style={{width:"16px",height:"16px",borderRadius:"50%",background:"#EAB308",boxShadow:"0 0 8px #EAB308",flexShrink:0,animation:"flashYellow 1.8s ease-in-out infinite"}}/>;
                return null;
              })()}
              {evento.comentarios&&<div style={{width:"12px",height:"12px",borderRadius:"50%",background:"#F472B6",boxShadow:"0 0 6px #F472B6",flexShrink:0}}/>}
            </div>
            <div style={{display:"flex",gap:"6px",flexWrap:"nowrap",alignItems:"center",flexShrink:0}}>
              <button onClick={onCerrar} style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"8px",background:"#F1F5F9",color:"#374151",border:"1px solid #94A3B8",cursor:"pointer",fontSize:"13px",fontWeight:"500",fontFamily:"inherit",whiteSpace:"nowrap"}} onMouseEnter={e=>{e.currentTarget.style.background="#E2E8F0";}} onMouseLeave={e=>{e.currentTarget.style.background="#F1F5F9";}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>Volver</button>
              <button onClick={onVerFicha} style={btnA("#1971C2")}>📄 Ficha</button>
              <button onClick={onEditar} style={btnA("#E67700")}><span style={{filter:"brightness(10)"}}>✏️</span> Editar</button>
              <button onClick={onEliminar} style={btnA("#E03131")}>🗑 Eliminar</button>
              <button onClick={onCerrar} style={{background:"#FFF5F5",border:"1.5px solid #FC8181",cursor:"pointer",fontSize:"13px",color:"#E53E3E",padding:"8px 16px",borderRadius:"8px",fontFamily:"inherit",fontWeight:"500",height:"36px",whiteSpace:"nowrap"}}>✕ Cerrar</button>
            </div>
          </div>
          {/* Fila 2: nombre cliente / contacto alineado a la izquierda */}
          <div style={{display:"flex",flexDirection:"column",marginBottom:"6px"}}>
            <div style={{fontSize:"29px",fontWeight:"600",color:"#0F172A",lineHeight:1.2}}>{cliente?.nombre_empresa||"—"}</div>
            {cliente?.nombre_contacto&&<div style={{fontSize:"23px",fontWeight:"600",color:"#373B41",fontStyle:"italic",marginTop:"2px"}}>Contacto: {cliente.nombre_contacto}</div>}
          </div>
          {/* Fila 3: nombre del evento ancho completo */}
          {(evento.nombre_evento||evento.titulo||evento.nombre||evento.descripcion)&&<div style={{fontSize:"17px",fontWeight:"500",color:"#111827",marginBottom:"8px",wordBreak:"break-word",overflowWrap:"break-word"}}><span style={{fontWeight:"600",color:"#6B7280"}}>Nombre del evento: </span>{(evento.nombre_evento||evento.titulo||evento.nombre||evento.descripcion)?.replace(/[\t\r\n]+/g,' ').replace(/\s{2,}/g,' ').trim()}</div>}
          {/* Fila 4 (multidía): franja color con fechas izq + pills der */}
          {esMultidia&&<div style={{background:`${colorCliente(evento.cliente_id)}18`,border:`2px solid ${colorCliente(evento.cliente_id)}`,borderRadius:"10px",padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",marginTop:"4px"}}>
            <div style={{fontSize:"15px",fontWeight:"600",color:"#1E293B",whiteSpace:"nowrap"}}>📅 {formatMedioES(evento.fecha_inicio)} → {formatMedioES(evento.fecha_termino)}</div>
            <div style={{display:"flex",gap:"8px",flexShrink:0,alignItems:"center"}}>
              {tiposArr(evento.tipo).map(t=>{const bt=B_TIPO_D[t]||{bg:"#1D4ED8",c:"#FFFFFF"};return<span key={t} style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"5px 12px",borderRadius:"20px",fontSize:"16px",fontWeight:"500",lineHeight:"1.4",color:bt.c,background:bt.bg,border:"none",whiteSpace:"nowrap"}}>{TIPO_ICON[t]} {t}</span>;})}
              {(()=>{const bm=B_MOD_D[evento.modalidad]||{bg:"#0E7490",c:"#FFFFFF"};return<span style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 12px",borderRadius:"20px",fontSize:"16px",fontWeight:"500",lineHeight:"1.4",color:bm.c,background:bm.bg,border:"none",whiteSpace:"nowrap"}}>{MOD_ICON[evento.modalidad]||"💻"} {LBL[evento.modalidad]||evento.modalidad}</span>;})()}
            </div>
          </div>}
        </div>
        {/* Cuerpo */}
        <div style={{overflowY:"auto",flex:1,padding:"24px 28px"}}>
          {esMultidia?(
            <>
              {/* ── MULTIDÍA: dos columnas ── */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"20px"}}>
                {/* COL IZQ: Agenda + Comentarios */}
                <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                  {dias.length>0&&<div style={{border:"2px solid #1D4ED8",borderRadius:"12px",background:"#EFF6FF",overflow:"hidden"}}>
                    <div style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em"}}>🗓️ Agenda del evento</div>
                    <div style={{padding:"12px"}}>
                      <div style={{borderRadius:"8px",overflow:"hidden",border:"1px solid #BFDBFE"}}>
                        <table style={{width:"100%",borderCollapse:"collapse"}}>
                          <thead><tr style={{background:"#1E3A6E",color:"#fff"}}>
                            {["Día","Fecha","Horario","Jornada"].map(h=><th key={h} style={{padding:"7px 12px",textAlign:"left",fontSize:"12px",fontWeight:"600",WebkitFontSmoothing:"antialiased"}}>{h}</th>)}
                          </tr></thead>
                          <tbody>{dias.map((dia,dIdx)=>(
                            <tr key={dIdx} onClick={()=>onNavDia&&onNavDia(dIdx)} style={{background:dIdx%2===0?"#fff":"#F8FAFC",borderBottom:"1px solid #BFDBFE",cursor:onNavDia?"pointer":"default"}} onMouseEnter={e=>{if(onNavDia)e.currentTarget.style.background=dIdx%2===0?"#DBEAFE":"#BFDBFE";}} onMouseLeave={e=>{e.currentTarget.style.background=dIdx%2===0?"#fff":"#F8FAFC";}}>
                              <td style={{padding:"7px 12px",fontSize:"13px",fontWeight:"600",color:"#1A6FD4",WebkitFontSmoothing:"antialiased"}}>{dIdx+1}</td>
                              <td style={{padding:"7px 12px",fontSize:"13px",color:"#0F172A",WebkitFontSmoothing:"antialiased"}}>{formatLargo(dia.fecha).replace(/ de \d{4}$/,"")}</td>
                              <td style={{padding:"7px 12px",fontSize:"13px",color:"#0F172A",WebkitFontSmoothing:"antialiased"}}>{dia.hora_inicio?.slice(0,5)} – {dia.hora_termino?.slice(0,5)} hrs</td>
                              <td style={{padding:"7px 12px",fontSize:"13px",color:"#475569",WebkitFontSmoothing:"antialiased"}}>{pluralizarJornada(dia.jornada)}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </div>
                  </div>}
                  {((esPresencial&&evento.lugar)||(!esPresencial&&evento.plataforma))&&(
                    <div style={{border:"2px solid #7C3AED",borderRadius:"12px",background:"#F5F3FF",overflow:"hidden"}}>
                      <div style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em"}}>{esPresencial?"📍 Lugar":"💻 Plataforma"}</div>
                      <div style={{padding:"12px 14px"}}>
                        {esPresencial&&evento.lugar&&<>
                          {(()=>{const TL_={hotel:"Hotel",centro_eventos:"Centro de eventos",universidad:"Universidad",edificio_corporativo:"Edificio corporativo",oficina_cliente:"Oficina del cliente",planta_produccion:"Planta de producción",faena_minera:"Faena minera",ministerio:"Ministerio",edificio_gobierno:"Edificio de gobierno",otro:"Otro"};const lr=lugares.find(l=>evento.lugar===l.nombre||(l.tipo&&TL_[l.tipo]&&evento.lugar===TL_[l.tipo]+" – "+l.nombre));const disp=lr?(lr.tipo&&TL_[lr.tipo]?TL_[lr.tipo]+" "+lr.nombre:lr.nombre):evento.lugar;const dir=lr?.direccion||"";return<><span style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"5px 20px",borderRadius:"6px",fontSize:"13.5px",fontWeight:"700",color:"#9F4444",background:"#FEF2F2",border:"2px solid #D55252",whiteSpace:"nowrap"}}>📍 {disp}</span>{dir&&<div style={{marginTop:"6px"}}><span style={{display:"inline-flex",alignItems:"center",padding:"3px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:"600",color:"#9F4444",background:"#FEF2F2",border:"1.5px solid #D55252",whiteSpace:"nowrap"}}>📌 {dir}</span></div>}</>;})()}
                          {evento.lugar_detalle&&<div style={{marginTop:"6px"}}><span style={{display:"inline-flex",alignItems:"center",padding:"3px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:"600",color:"#9F4444",background:"#FEF2F2",border:"1.5px solid #D55252",whiteSpace:"nowrap"}}>{evento.lugar_detalle}</span></div>}
                          <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginTop:"10px"}}>
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((evento.lugar||"")+" "+(evento.lugar_detalle||""))}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"14px",fontWeight:"500",color:"#0F4577",textDecoration:"none",padding:"8px 16px",border:"1px solid #84B1E4",borderRadius:"8px",background:"#EFF6FF"}}>📍 Ver en Maps</a>
                            <button title="Copiar link" onClick={()=>{const q=`${evento.lugar||""}${evento.lugar_detalle?", "+evento.lugar_detalle:""}`.trim();navigator.clipboard.writeText(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`).then(()=>{setGeoOk(true);setTimeout(()=>setGeoOk(false),2500);}).catch(()=>{});}} style={{padding:"8px 16px",borderRadius:"8px",border:`1px solid ${geoOk?"#79D79B":"#84B1E4"}`,background:geoOk?"#F0FDF4":"#EFF6FF",display:"inline-flex",alignItems:"center",gap:"5px",cursor:"pointer",fontSize:"14px",fontWeight:"500",color:geoOk?"#145B2F":"#0F4577",fontFamily:"inherit"}}>{geoOk?"✓ Copiado":"⊕ Copiar link Maps"}</button>
                          </div>
                        </>}
                        {!esPresencial&&evento.plataforma&&<PlatformChip platform={evento.plataforma} isMundoChile={esZoomMC} extra={esZoomMC?evento.zoom_administrador:""}/>}
                      </div>
                    </div>
                  )}
                  {evento.comentarios&&<div style={{border:"2px solid #F472B6",borderRadius:"12px",background:"#FFF0F6",overflow:"hidden"}}>
                    <div style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em",display:"flex",alignItems:"center",justifyContent:"space-between"}}>💬 Comentarios<div style={{width:"11px",height:"11px",borderRadius:"50%",background:"#F472B6",boxShadow:"0 0 6px #F472B6",animation:"flash 2.4s ease-in-out infinite",flexShrink:0}}/></div>
                    <div style={{padding:"12px 14px",color:"#0F172A",fontSize:"16px"}}>{evento.comentarios}</div>
                  </div>}
                </div>
                {/* COL DER: Detalle por día */}
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  {(()=>{
                    const todosIguales=dias.length>1&&dias.every(d=>
                      d.hora_inicio===dias[0].hora_inicio&&
                      d.hora_termino===dias[0].hora_termino&&
                      d.jornada===dias[0].jornada&&
                      JSON.stringify((d.asignaciones_dia||[]).map(a=>a.interprete_id).sort())===JSON.stringify((dias[0].asignaciones_dia||[]).map(a=>a.interprete_id).sort())&&
                      JSON.stringify((d.equipos_dia||[]).map(e=>e.tipo_equipo).sort())===JSON.stringify((dias[0].equipos_dia||[]).map(e=>e.tipo_equipo).sort())
                    );
                    const renderDia=(dia,titulo,dIdx=null)=>{
                      const gDia={};
                      (dia.asignaciones_dia||[]).forEach(a=>{
                        const par=pares.find(p=>p.id===a.par_id);
                        const interp=interpretes.find(x=>x.id===a.interprete_id);
                        if(!interp)return;
                        const key=par?.descripcion||"Sin par";
                        const idioma=par?.idioma_origen||"";
                        if(!gDia[key])gDia[key]={idioma,items:[]};
                        gDia[key].items.push({interp,isHost:!!a.es_host_zoom});
                      });
                      const eqsDia=dia.equipos_dia||[];
                      return(
                        <div style={{border:"2px solid #1D4ED8",borderRadius:"12px",background:"#EFF6FF",overflow:"hidden"}}>
                          <div onClick={dIdx!==null&&onNavDia?()=>onNavDia(dIdx):undefined} style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em",cursor:dIdx!==null&&onNavDia?"pointer":"default"}}>{titulo}</div>
                          <div style={{padding:"12px 14px"}}>
                            <div style={{fontSize:"14px",fontWeight:"600",color:"#0F172A",marginBottom:"10px"}}>🕐 {dia.hora_inicio?.slice(0,5)} – {dia.hora_termino?.slice(0,5)} hrs{dia.jornada&&<span style={{fontWeight:"400",color:"#6B7280",fontSize:"13px"}}> · {pluralizarJornada(dia.jornada)}</span>}</div>
                            {Object.entries(gDia).map(([key,grupo])=>{
                              const pillClr=IDIOMA_PILL_CLR[grupo.idioma]||"#4C6EF5";
                              return(<div key={key} style={{marginBottom:"10px"}}>
                                <div style={{fontSize:"13px",fontWeight:"600",color:"#1256A3",textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center",marginBottom:"5px",WebkitFontSmoothing:"antialiased"}}>{key}</div>
                                <div style={{display:"flex",flexWrap:"wrap",gap:"6px",justifyContent:"center"}}>
                                  {grupo.items.map(({interp,isHost},i)=>(
                                    <span key={i} style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"4px 11px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",lineHeight:"1.4",color:"#111111",background:"#FFFFFF",border:`2px solid ${pillClr}`,whiteSpace:"nowrap"}}>
                                      {isHost&&<span style={{fontSize:"12px"}}>🔑</span>}
                                      <FlagImg idioma={grupo.idioma}/>
                                      {interp.nombre}{interp.apellido?" "+interp.apellido:""}
                                    </span>
                                  ))}
                                  {grupo.items.length===1&&<span style={{display:"inline-flex",alignItems:"center",padding:"4px 11px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",color:"#505660",background:"#F3F4F6",border:"1px dashed #9CA3AF",fontStyle:"italic"}}>Sin partner</span>}
                                </div>
                              </div>);
                            })}
                            {eqsDia.map((eq,eIdx)=>(
                              <div key={eIdx} style={{fontSize:"13px",color:"#166534",padding:"5px 10px",background:"#DCFCE7",border:"1px solid #86EFAC",borderRadius:"6px",marginTop:"6px",display:"flex",alignItems:"center",gap:"6px"}}>
                                <IconAV size={14}/> {eq.tipo_equipo==="fijo"?"Sistema fijo":eq.tipo_equipo==="portatil"?"Sistema portátil":"Cabina portátil"}
                                {eq.proveedor_nombre&&` · ${eq.proveedor_nombre}`}{eq.num_receptores>0&&` · ${eq.num_receptores} receptores`}{eq.num_cabinas>0&&` · ${eq.num_cabinas} cabinas`}
                              </div>
                            ))}
                            {!Object.keys(gDia).length&&!eqsDia.length&&<div style={{fontSize:"15px",color:"#374151",fontStyle:"italic"}}>Sin intérpretes ni equipos asignados</div>}
                          </div>
                        </div>
                      );
                    };
                    if(todosIguales){return(<>
                      {renderDia(dias[0],"📅 Todos los días")}
                      <div style={{textAlign:"center",fontSize:"15px",color:"#565B66",fontStyle:"italic",padding:"4px 0"}}>Todos los días son iguales</div>
                    </>);}
                    return dias.map((dia,dIdx)=>(<div key={dia.id||dIdx}>{renderDia(dia,`📅 Día ${dIdx+1} — ${formatLargo(dia.fecha)}`,dIdx)}</div>));
                  })()}
                </div>
              </div>
              {/* Full width: Info Contable */}
              <div style={{border:"2px solid #EA580C",borderRadius:"12px",background:"#FFF7ED",overflow:"hidden",marginBottom:"16px"}}>
                <div style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em"}}>📊 Información Contable</div>
                <div style={{padding:"14px 16px"}}>
                  {(()=>{
                    const esMagix=/magix/i.test(cliente?.nombre_empresa||"");
                    const diasPago=esMagix?60:30;
                    const calcFechaPago=(iso)=>{if(!iso)return"";const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+diasPago);const off=(d.getDay()-3+7)%7;d.setDate(d.getDate()-off);return d.toISOString().slice(0,10);};
                    const fechaPago=calcFechaPago(evento.fecha_emision);
                    const fmtCL=(iso)=>{if(!iso)return"";const[y,m,d]=iso.split("-");return`${d}/${m}/${y}`;};
                    const fila=(lbl,val)=>val?<div style={{display:"flex",gap:"6px",color:"#2C3441",fontSize:"13px",marginBottom:"4px"}}><span style={{color:"#6B7280",fontWeight:"500"}}>{lbl}:</span><span style={{fontWeight:"600"}}>{val}</span></div>:null;
                    const be=B_EST_D(evento.estado);
                    return(<div>
                      <div style={{marginBottom:"8px"}}><span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",lineHeight:"1.4",color:be.c,background:be.bg,border:`2px solid ${be.b||be.c}`,whiteSpace:"nowrap"}}>{evento.estado==="Facturado"?"✓ Facturado":"🟠 Facturación Pendiente"}</span></div>
                      {fila("N° Factura",evento.numero_factura)}
                      {fila("N° OC",evento.nro_oc)}
                      {fila("N° HES",evento.nro_hes)}
                      {fila("Otros",evento.nro_otros)}
                      {fila("Fecha de emisión",fmtCL(evento.fecha_emision))}
                      {fechaPago&&fila(`Fecha de pago${esMagix?" (60 días — Magix)":""}`,fmtCL(fechaPago))}
                    </div>);
                  })()}
                </div>
              </div>
              {/* Historial */}
              <div style={{fontSize:"12px",color:"#6B7280",display:"flex",gap:"16px",flexWrap:"wrap",paddingTop:"12px",borderTop:"1px solid #E5E7EB"}}>
                {evento.created_by_nombre&&<span>Creado por <strong>{evento.created_by_nombre}</strong>{evento.created_at&&" el "+new Date(evento.created_at).toLocaleString("es-CL")}</span>}
                {evento.edited_by_nombre&&<span>Última edición por <strong>{evento.edited_by_nombre}</strong>{evento.updated_at&&" el "+new Date(evento.updated_at).toLocaleString("es-CL")}</span>}
              </div>
            </>
          ):(
            /* ── UN DÍA: dos columnas ── */
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"20px"}}>
                {/* COL IZQ: Fecha/Horario/Pills + Lugar/Plataforma + Comentarios */}
                <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                  {/* Fecha + Horario + Pills */}
                  <div style={{border:"2px solid #1D4ED8",borderRadius:"12px",background:"#EFF6FF",overflow:"hidden"}}>
                    <div style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em"}}>📅 Fecha y horario</div>
                    <div style={{padding:"12px 14px"}}>
                      <div style={{fontSize:"15px",fontWeight:"500",color:"#1E293B",marginBottom:"6px"}}>📅 {formatLargo(evento.fecha_inicio)}</div>
                      <div style={{fontSize:"15px",fontWeight:"500",color:"#0F172A",marginBottom:"10px"}}>🕐 {evento.hora_inicio?.slice(0,5)} – {evento.hora_termino?.slice(0,5)} hrs{evento.jornada&&<span style={{fontWeight:"400",color:"#29313D",fontSize:"15px"}}> · {pluralizarJornada(evento.jornada)}</span>}</div>
                      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}>
                        {tiposArr(evento.tipo).map(t=>{const bt=B_TIPO_D[t]||{bg:"#1D4ED8",c:"#FFFFFF"};return<span key={t} style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"5px 12px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",lineHeight:"1.4",color:bt.c,background:bt.bg,border:"none",whiteSpace:"nowrap"}}>{TIPO_ICON[t]} {t}</span>;})}
                        {(()=>{const bm=B_MOD_D[evento.modalidad]||{bg:"#0E7490",c:"#FFFFFF"};return<span style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"5px 12px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",lineHeight:"1.4",color:bm.c,background:bm.bg,border:"none",whiteSpace:"nowrap"}}>{MOD_ICON[evento.modalidad]||"💻"} {LBL[evento.modalidad]||evento.modalidad}</span>;})()}
                      </div>
                    </div>
                  </div>
                  {/* Lugar / Plataforma */}
                  {((esPresencial&&evento.lugar)||(!esPresencial&&evento.plataforma))&&(
                    <div style={{border:"2px solid #7C3AED",borderRadius:"12px",background:"#F5F3FF",overflow:"hidden"}}>
                      <div style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em"}}>{esPresencial?"📍 Lugar":"💻 Plataforma"}</div>
                      <div style={{padding:"12px 14px"}}>
                        {esPresencial&&evento.lugar&&<>
                          {(()=>{const TL_={hotel:"Hotel",centro_eventos:"Centro de eventos",universidad:"Universidad",edificio_corporativo:"Edificio corporativo",oficina_cliente:"Oficina del cliente",planta_produccion:"Planta de producción",faena_minera:"Faena minera",ministerio:"Ministerio",edificio_gobierno:"Edificio de gobierno",otro:"Otro"};const lr=lugares.find(l=>evento.lugar===l.nombre||(l.tipo&&TL_[l.tipo]&&evento.lugar===TL_[l.tipo]+" – "+l.nombre));const disp=lr?(lr.tipo&&TL_[lr.tipo]?TL_[lr.tipo]+" "+lr.nombre:lr.nombre):evento.lugar;const dir=lr?.direccion||"";return<><span style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"5px 20px",borderRadius:"6px",fontSize:"13.5px",fontWeight:"700",color:"#9F4444",background:"#FEF2F2",border:"2px solid #D55252",whiteSpace:"nowrap"}}>📍 {disp}</span>{dir&&<div style={{marginTop:"6px"}}><span style={{display:"inline-flex",alignItems:"center",padding:"3px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:"600",color:"#9F4444",background:"#FEF2F2",border:"1.5px solid #D55252",whiteSpace:"nowrap"}}>📌 {dir}</span></div>}</>;})()}
                          {evento.lugar_detalle&&<div style={{marginTop:"6px"}}><span style={{display:"inline-flex",alignItems:"center",padding:"3px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:"600",color:"#9F4444",background:"#FEF2F2",border:"1.5px solid #D55252",whiteSpace:"nowrap"}}>{evento.lugar_detalle}</span></div>}
                          <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginTop:"10px"}}>
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((evento.lugar||"")+" "+(evento.lugar_detalle||""))}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"14px",fontWeight:"500",color:"#0F4577",textDecoration:"none",padding:"8px 16px",border:"1px solid #84B1E4",borderRadius:"8px",background:"#EFF6FF"}}>📍 Ver en Maps</a>
                            <button title="Copiar link" onClick={()=>{const q=`${evento.lugar||""}${evento.lugar_detalle?", "+evento.lugar_detalle:""}`.trim();navigator.clipboard.writeText(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`).then(()=>{setGeoOk(true);setTimeout(()=>setGeoOk(false),2500);}).catch(()=>{});}} style={{padding:"8px 16px",borderRadius:"8px",border:`1px solid ${geoOk?"#79D79B":"#84B1E4"}`,background:geoOk?"#F0FDF4":"#EFF6FF",display:"inline-flex",alignItems:"center",gap:"5px",cursor:"pointer",fontSize:"14px",fontWeight:"500",color:geoOk?"#145B2F":"#0F4577",fontFamily:"inherit"}}>{geoOk?"✓ Copiado":"⊕ Copiar link Maps"}</button>
                          </div>
                        </>}
                        {!esPresencial&&evento.plataforma&&<>
                          <PlatformChip platform={evento.plataforma} isMundoChile={esZoomMC} extra={esZoomMC?evento.zoom_administrador:""}/>
                          {evento.zoom_link&&<div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"8px",padding:"8px 12px",background:"#EFF6FF",borderRadius:"8px",border:"1px solid #BFDBFE"}}>
                            <span style={{fontSize:"15px",color:"#1D4ED8",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>🔗 {evento.zoom_link}</span>
                            <button onClick={()=>navigator.clipboard.writeText(evento.zoom_link)} style={{padding:"5px 12px",background:"#1D4ED8",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer",fontSize:"14px",fontWeight:"500",whiteSpace:"nowrap",flexShrink:0}}>📋 Copiar</button>
                            <a href={evento.zoom_link} target="_blank" rel="noreferrer" style={{padding:"5px 12px",background:"#059669",color:"#fff",borderRadius:"6px",fontSize:"14px",fontWeight:"500",whiteSpace:"nowrap",textDecoration:"none",flexShrink:0}}>🚀 Abrir</a>
                          </div>}
                        </>}
                      </div>
                    </div>
                  )}
                  {/* Comentarios */}
                  {evento.comentarios&&<div style={{border:"2px solid #F472B6",borderRadius:"12px",background:"#FFF0F6",overflow:"hidden"}}>
                    <div style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em",display:"flex",alignItems:"center",justifyContent:"space-between"}}>💬 Comentarios<div style={{width:"11px",height:"11px",borderRadius:"50%",background:"#F472B6",boxShadow:"0 0 6px #F472B6",animation:"flash 2.4s ease-in-out infinite",flexShrink:0}}/></div>
                    <div style={{padding:"12px 14px",color:"#0F172A",fontSize:"16px"}}>{evento.comentarios}</div>
                  </div>}
                </div>
                {/* COL DER: Intérpretes + Equipos AV */}
                <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                  {/* Intérpretes */}
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
                    return(
                      <div style={{border:"2px solid #1D4ED8",borderRadius:"12px",background:"#EFF6FF",overflow:"hidden"}}>
                        <div style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:"6px"}}><IconMic size={14}/> Intérpretes</div>
                        <div style={{padding:"12px 14px"}}>
                          {!entries.length&&<div style={{fontSize:"13px",color:"#374151",fontStyle:"italic"}}>Sin intérpretes asignados</div>}
                          {entries.map(([key,grupo])=>{
                            const pillClr=IDIOMA_PILL_CLR[grupo.idioma]||"#4C6EF5";
                            const hp=grupo.items.find(({asig})=>asig.hora_presentacion)?.asig.hora_presentacion;
                            return(<div key={key} style={{marginBottom:"12px"}}>
                              <div style={{position:"relative",textAlign:"center",marginBottom:"6px"}}>
                                <span style={{fontSize:"13px",fontWeight:"600",color:"#1256A3",textTransform:"uppercase",letterSpacing:"0.06em",WebkitFontSmoothing:"antialiased"}}>{key}</span>
                                {hp&&<span style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",fontSize:"14px",color:"#545B68",whiteSpace:"nowrap"}}>🕐 {hp.slice(0,5)} hrs</span>}
                              </div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:"6px",justifyContent:"center"}}>
                                {grupo.items.map(({interp,isHost},i)=>(
                                  <span key={i} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"5px",padding:"4px 16px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",lineHeight:"1.4",color:"#111111",background:"#FFFFFF",border:`2px solid ${pillClr}`,whiteSpace:"nowrap"}}>
                                    {isHost&&<span style={{fontSize:"12px"}}>🔑</span>}
                                    <FlagImg idioma={grupo.idioma}/>
                                    <span style={{color:"#111111",fontSize:"14px",fontWeight:"500",WebkitFontSmoothing:"antialiased"}}>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span>
                                  </span>
                                ))}
                                {grupo.items.length===1&&<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"4px 16px",borderRadius:"20px",background:"#F3F4F6",color:"#505660",border:"1px dashed #9CA3AF",fontSize:"14px",fontWeight:"500",fontStyle:"italic"}}>Sin partner</span>}
                              </div>
                              {grupo.items.map(({asig},i)=>metaRow(asig)?<div key={i}>{metaRow(asig)}</div>:null)}
                            </div>);
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  {/* Equipos AV */}
                  {(evento.evento_dias||[]).flatMap(d=>d.equipos_dia||[]).length>0&&(
                    <div style={{border:"2px solid #138B3F",borderRadius:"12px",background:"#F0FDF4",overflow:"hidden"}}>
                      <div style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:"6px"}}><IconAV size={14}/> Equipos AV</div>
                      <div style={{padding:"12px 14px"}}>
                        {(evento.evento_dias||[]).flatMap(d=>d.equipos_dia||[]).map((eq,eIdx)=>(
                          <div key={eIdx} style={{fontSize:"14px",color:"#166534",padding:"5px 10px",background:"#DCFCE7",border:"1px solid #86EFAC",borderRadius:"6px",marginBottom:"6px",display:"flex",alignItems:"center",gap:"6px"}}>
                            <IconAV size={14}/> {eq.tipo_equipo==="fijo"?"Sistema fijo":eq.tipo_equipo==="portatil"?"Sistema portátil":"Cabina portátil"}
                            {eq.proveedor_nombre&&` · ${eq.proveedor_nombre}`}{eq.num_receptores>0&&` · ${eq.num_receptores} receptores`}{eq.num_cabinas>0&&` · ${eq.num_cabinas} cabinas`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Full width: Info Contable */}
              <div style={{border:"2px solid #EA580C",borderRadius:"12px",background:"#FFF7ED",overflow:"hidden",marginBottom:"16px"}}>
                <div style={{background:"#FEF9C3",padding:"8px 14px",fontWeight:"700",fontSize:"13px",color:"#111827",textTransform:"uppercase",letterSpacing:"0.06em"}}>📊 Información Contable</div>
                <div style={{padding:"14px 16px"}}>
                  {(()=>{
                    const esMagix=/magix/i.test(cliente?.nombre_empresa||"");
                    const diasPago=esMagix?60:30;
                    const calcFechaPago=(iso)=>{if(!iso)return"";const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+diasPago);const off=(d.getDay()-3+7)%7;d.setDate(d.getDate()-off);return d.toISOString().slice(0,10);};
                    const fechaPago=calcFechaPago(evento.fecha_emision);
                    const fmtCL=(iso)=>{if(!iso)return"";const[y,m,d]=iso.split("-");return`${d}/${m}/${y}`;};
                    const fila=(lbl,val)=>val?<div style={{display:"flex",gap:"6px",color:"#2C3441",fontSize:"13px",marginBottom:"4px"}}><span style={{color:"#6B7280",fontWeight:"500"}}>{lbl}:</span><span style={{fontWeight:"600"}}>{val}</span></div>:null;
                    const be=B_EST_D(evento.estado);
                    return(<div>
                      <div style={{marginBottom:"8px"}}><span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",lineHeight:"1.4",color:be.c,background:be.bg,border:`2px solid ${be.b||be.c}`,whiteSpace:"nowrap"}}>{evento.estado==="Facturado"?"✓ Facturado":"🟠 Facturación Pendiente"}</span></div>
                      {fila("N° Factura",evento.numero_factura)}
                      {fila("N° OC",evento.nro_oc)}
                      {fila("N° HES",evento.nro_hes)}
                      {fila("Otros",evento.nro_otros)}
                      {fila("Fecha de emisión",fmtCL(evento.fecha_emision))}
                      {fechaPago&&fila(`Fecha de pago${esMagix?" (60 días — Magix)":""}`,fmtCL(fechaPago))}
                    </div>);
                  })()}
                </div>
              </div>
              {/* Historial */}
              <div style={{fontSize:"12px",color:"#6B7280",display:"flex",gap:"16px",flexWrap:"wrap",paddingTop:"12px",borderTop:"1px solid #E5E7EB"}}>
                {evento.created_by_nombre&&<span>Creado por <strong>{evento.created_by_nombre}</strong>{evento.created_at&&" el "+new Date(evento.created_at).toLocaleString("es-CL")}</span>}
                {evento.edited_by_nombre&&<span>Última edición por <strong>{evento.edited_by_nombre}</strong>{evento.updated_at&&" el "+new Date(evento.updated_at).toLocaleString("es-CL")}</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MODAL FICHA ──────────────────────────────────────────────────────────────
function ModalFicha({evento,clientes,interpretes,pares,lugares=[],onCerrar,paginacion=null}) {
  const fichaRef=useRef(null);
  const cliente=clientes.find(c=>c.id===evento.cliente_id);
  const esMultidia=evento.fecha_inicio!==evento.fecha_termino;
  const esPresencial=evento.modalidad==="presencial"||evento.modalidad==="hibrido";
  const dias=((evento.evento_dias||evento.dias||[]).sort((a,b)=>(a.orden||0)-(b.orden||0)));
  const CAMPOS_OPC=[
    {k:"cliente",l:"🏢 Cliente"},{k:"evento",l:"📌 Evento"},{k:"tipo",l:<><IconMic size={14}/> Tipo</>},
    {k:"modalidad",l:"🔄 Modalidad"},{k:"fecha",l:"📅 Fecha"},{k:"horario",l:"🕐 Horario"},
    {k:"jornada",l:"⏱ Jornada"},{k:"lugar",l:"📍 Lugar"},{k:"plataforma",l:"💻 Plataforma"},
    {k:"facturacion",l:"💰 Facturación"},
    {k:"interpretes",l:<><IconMic size={14}/> Intérpretes</>},{k:"equipos",l:<><IconAV size={14}/> Equipos AV</>},{k:"comentarios",l:"💬 Comentarios"},
  ];
  const DEFAULTS={cliente:true,evento:true,tipo:true,modalidad:true,fecha:true,horario:true,jornada:true,lugar:true,plataforma:true,facturacion:true,interpretes:true,equipos:false,comentarios:false};
  const [campos,setCampos]=useState(()=>({...DEFAULTS,...JSON.parse(localStorage.getItem("mc_ficha_campos")||"{}")}));
  const toggleCampo=(k)=>{const n={...campos,[k]:!campos[k]};setCampos(n);localStorage.setItem("mc_ficha_campos",JSON.stringify(n));};
  const [imgJPG,setImgJPG]=useState(null);
  const [verJPG,setVerJPG]=useState(false);
  const abrirVistaJPG=()=>{
    const elemento=document.getElementById("ficha-exportable");
    const inner=elemento.querySelector('div');
    html2canvas(inner,{scale:2,useCORS:true,allowTaint:true,backgroundColor:"#FFFFFF",logging:false,scrollX:0,scrollY:0,width:inner.offsetWidth,height:inner.offsetHeight,onclone:(clonedDoc)=>{const el=clonedDoc.getElementById("ficha-exportable");el.style.transform="none";el.style.position="static";el.style.overflow="visible";el.style.maxHeight="none";el.style.height="auto";const todos=el.querySelectorAll('*');todos.forEach(e=>{if(e.style.overflow==='hidden')e.style.overflow='visible';if(e.style.maxHeight)e.style.maxHeight='none';const bg=e.style.backgroundColor||e.style.background||"";if(bg&&(bg.includes('3D85D8')||bg.includes('2E7BC4')||bg.includes('1A6FD4')||bg.includes('0D4EA6')||bg.includes('1E3A6E'))){e.style.color='#FFFFFF';e.style.webkitTextFillColor='#FFFFFF';e.style.cssText+='; color: #FFFFFF !important;';}});const logos=clonedDoc.querySelectorAll('img[alt="MundoChile"]');logos.forEach(img=>{img.style.objectFit="contain";img.style.height="52px";img.style.width="auto";img.style.display="block";});const headerTexts=clonedDoc.querySelectorAll('[data-header-text]');headerTexts.forEach(ht=>{ht.style.color="#FFFFFF";ht.style.webkitTextFillColor="#FFFFFF";});}}).then(canvas=>{setImgJPG(canvas.toDataURL("image/jpeg",0.95));setVerJPG(true);});
  };

  const Sec=({label,children})=>(
    <div style={{overflow:"hidden",borderBottom:"1px solid #E5E7EB"}}>
      <div style={{background:"#2E7BC4",padding:"5px 12px",fontSize:"11px",fontWeight:"600",color:"#FFFFFF",textTransform:"uppercase",letterSpacing:"0.06em",borderRadius:"0"}}>{label}</div>
      <div style={{padding:"8px 10px",background:"#FFFFFF",borderLeft:"3px solid #2E7BC4",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale",fontSize:"13px"}}>{children}</div>
    </div>
  );

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
      const pillClr=IDIOMA_PILL_CLR[grupo.idioma]||"#4C6EF5";
      const hp=grupo.items.find(({asig})=>asig.hora_presentacion)?.asig.hora_presentacion;
      return(<div key={key} style={{marginBottom:"8px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"4px"}}>
          <span style={{fontSize:"10px",fontWeight:"600",color:/inglés.*español/i.test(key)?"#2D8CFF":pillClr,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center",width:"100%",display:"block"}}>{key}</span>
          {hp&&<span style={{fontSize:"11px",color:"#505860"}}>🕐 {hp.slice(0,5)} hrs</span>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px"}}>
          {grupo.items.map(({interp,isHost},i)=>(
            <span key={i} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"4px",padding:"3px 6px",borderRadius:"20px",fontSize:"11px",fontWeight:"500",lineHeight:"1.4",color:"#141414",background:"#FFFFFF",border:`2px solid ${pillClr}`,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {isHost&&<span style={{fontSize:"10px"}}>🔑</span>}
              <FlagImg idioma={grupo.idioma}/>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",color:"#141414",fontSize:"11px",fontWeight:"600"}}>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span>
            </span>
          ))}
        </div>
        {grupo.items.map(({asig},i)=>(asig.nro_ot||asig.nro_boleta)?<div key={i} style={{fontSize:"11px",color:"#505860",marginTop:"3px",display:"flex",gap:"8px",flexWrap:"wrap"}}>{asig.nro_ot&&<span>OT: {asig.nro_ot}</span>}{asig.nro_boleta&&<span>Boleta: {asig.nro_boleta}</span>}</div>:null)}
      </div>);
    });
  };

  return (
    <>
    {verJPG&&<div style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0,0,0,0.92)",zIndex:9999,display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",padding:"20px",boxSizing:"border-box"}}>
      <div style={{position:"relative",maxWidth:"820px",width:"100%"}}>
        <button onClick={()=>setVerJPG(false)} style={{position:"sticky",top:"0",float:"right",background:"#FFFFFF",border:"none",borderRadius:"50%",width:"32px",height:"32px",cursor:"pointer",fontSize:"16px",fontWeight:"700",zIndex:10000,marginBottom:"8px"}}>✕</button>
        <img src={imgJPG} style={{width:"100%",height:"auto",borderRadius:"8px",display:"block",clear:"both"}} alt="Ficha"/>
      </div>
    </div>}
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:"16px",overflowY:"auto"}}>
      <div style={{background:"#F8FAFF",borderRadius:"20px",width:"100%",maxWidth:"820px",maxHeight:"92vh",boxShadow:"0 8px 32px rgba(45,140,255,0.15)",display:"flex",flexDirection:"column"}}>

        {/* Selector campos — FUERA del área exportable */}
        <div style={{padding:"10px 20px",borderBottom:"1px solid #E2E8F0",background:"#fff",borderRadius:"20px 20px 0 0",flexShrink:0}}>
          {paginacion&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px",paddingBottom:"8px",borderBottom:"1px solid #E2E8F0"}}>
            <div style={{color:"#374151",fontSize:"13px",fontWeight:"500"}}>📋 Ficha {paginacion.idx+1} de {paginacion.total}</div>
            <div style={{display:"flex",gap:"6px"}}>
              <button onClick={paginacion.onAnterior} disabled={paginacion.idx===0} style={{padding:"4px 12px",background:"#1A6FD4",color:"#FFFFFF",border:"none",borderRadius:"8px",cursor:paginacion.idx===0?"default":"pointer",fontSize:"13px",fontFamily:"inherit",opacity:paginacion.idx===0?0.5:1}}>← Ant</button>
              <button onClick={paginacion.onSiguiente} disabled={paginacion.idx===paginacion.total-1} style={{padding:"4px 12px",background:"#1A6FD4",color:"#FFFFFF",border:"none",borderRadius:"8px",cursor:paginacion.idx===paginacion.total-1?"default":"pointer",fontSize:"13px",fontFamily:"inherit",opacity:paginacion.idx===paginacion.total-1?0.5:1}}>Sig →</button>
            </div>
          </div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
            <div style={{fontWeight:"500",color:"#0F172A",fontSize:"14px"}}>Campos visibles</div>
            <button onClick={onCerrar} style={{background:"none",border:"none",cursor:"pointer",fontSize:"14px",color:"#9CA3AF",lineHeight:1}}>✕</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",alignItems:"center",gap:"8px",padding:"12px 16px"}}>
            {CAMPOS_OPC.map(({k,l})=><button key={k} onClick={()=>toggleCampo(k)}
              style={{padding:"3px 11px",borderRadius:"20px",cursor:"pointer",fontSize:"13px",fontWeight:"500",fontFamily:"inherit",background:campos[k]?"#2E7BC4":"#E2E8F0",color:campos[k]?"#fff":"#6B7280",border:"none",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale",letterSpacing:"0.02em"}}>{l}</button>)}
          </div>
        </div>

        {/* Área exportable */}
        <div id="ficha-exportable" ref={fichaRef} style={{flex:1,overflow:"visible",maxHeight:"none",height:"auto",background:"#F0F4FA",padding:"12px"}}>
          <div style={{width:"800px",maxWidth:"100%",margin:"0 auto",background:"#FFFFFF",border:"2px solid #1A6FD4",borderRadius:"12px",overflow:"hidden",fontFamily:"'Inter','Segoe UI',system-ui,sans-serif"}}>

            {/* HEADER */}
            <div style={{display:"flex",alignItems:"center",gap:"14px",padding:"18px 24px",background:"#1E3A6E"}}>
              <img src="/logo.png" alt="MundoChile" style={{height:"52px",width:"auto",objectFit:"contain",display:"block",flexShrink:0}} crossOrigin="anonymous"/>
              <div>
                <div data-header-text="" style={{color:"#FFFFFF",WebkitTextFillColor:"#FFFFFF",fontSize:"22px",fontWeight:"700",lineHeight:1.2}}>MundoChile</div>
                <div data-header-text="" style={{color:"#FFFFFF",WebkitTextFillColor:"#FFFFFF",fontSize:"11px",fontWeight:"400",letterSpacing:"1.5px",opacity:0.85}}>TRANSLATIONS & INTERPRETERS</div>
              </div>
            </div>

            {/* SECCIONES — una columna */}
            {(()=>{
              const sH={background:"#3D85D8",color:"#FFFFFF",WebkitTextFillColor:"#FFFFFF",fontSize:"13px",fontWeight:"600",letterSpacing:"0.06em",padding:"4px 16px",textTransform:"uppercase"};
              const sB={padding:"10px 16px",borderBottom:"1px solid #E5E7EB",background:"#FFFFFF"};
              const pillClrFor=(idioma)=>IDIOMA_PILL_CLR[idioma]||"#4C6EF5";
              const dimClr=(hex)=>{try{const v=hex.replace('#','');const r=parseInt(v.slice(0,2),16),g=parseInt(v.slice(2,4),16),b=parseInt(v.slice(4,6),16);const m=(x)=>Math.round(Math.min(255,x*0.9+25.5));return`#${m(r).toString(16).padStart(2,'0')}${m(g).toString(16).padStart(2,'0')}${m(b).toString(16).padStart(2,'0')}`;}catch{return hex;}};
              const pillSt=(idioma)=>({background:"#FFFFFF",border:`1.5px solid ${dimClr(pillClrFor(idioma))}`,color:"#313131",borderRadius:"17px",padding:"5px 10px",textAlign:"center",width:"100%",fontSize:"14px",fontWeight:"400",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px",boxSizing:"border-box"});
              const renderI=(asigs)=>{
                if(!asigs||asigs.length===0) return null;
                const gmap={};
                asigs.forEach(a=>{
                  const par=pares.find(p=>p.id===a.par_id);
                  const interp=interpretes.find(x=>x.id===a.interprete_id);
                  if(!interp) return;
                  const key=a.par_id||"sp";
                  if(!gmap[key]) gmap[key]={idioma:par?.idioma_origen||"",desc:par?.descripcion||"Sin par",items:[]};
                  gmap[key].items.push({interp,asig:a});
                });
                const entries=Object.values(gmap);
                if(!entries.length) return null;
                const pares2=entries.filter(g=>g.items.length>=2);
                const solos=entries.filter(g=>g.items.length===1);
                return(<div>
                  {pares2.map((g,i)=>{
                    const clr=pillClrFor(g.idioma);
                    const hp=g.items.find(({asig})=>asig.hora_presentacion)?.asig.hora_presentacion;
                    return(<div key={i} style={{marginBottom:i<pares2.length-1||solos.length>0?"12px":0}}>
                      <div style={{textAlign:"center",fontSize:"12px",fontWeight:"600",color:/inglés.*español/i.test(g.desc)?dimClr("#2D8CFF"):dimClr(clr),marginBottom:"4px",textTransform:"uppercase",letterSpacing:"0.06em"}}>{g.desc}</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:"5px"}}>
                        {g.items.map(({interp,asig},j)=>(<div key={j} style={pillSt(g.idioma)}>{asig.es_host_zoom&&<span style={{fontSize:"9px"}}>🔑</span>}<FlagImg idioma={g.idioma}/><span>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span></div>))}
                      </div>
                      {hp&&<div style={{textAlign:"center",fontSize:"13px",color:"#40464D",marginTop:"6px"}}>🕐 Hora de presentación intérpretes: {hp.slice(0,5)} hrs</div>}
                    </div>);
                  })}
                  {solos.length>0&&(<div style={{display:"grid",gridTemplateColumns:"1fr",gap:"6px"}}>
                    {solos.map((g,i)=>{
                      const clr=pillClrFor(g.idioma);
                      const {interp,asig}=g.items[0];
                      return(<div key={i}>
                        <div style={{textAlign:"center",fontSize:"12px",fontWeight:"600",color:/inglés.*español/i.test(g.desc)?dimClr("#2D8CFF"):dimClr(clr),marginBottom:"3px",textTransform:"uppercase",letterSpacing:"0.06em"}}>{g.desc}</div>
                        <div style={pillSt(g.idioma)}>{asig.es_host_zoom&&<span style={{fontSize:"9px"}}>🔑</span>}<FlagImg idioma={g.idioma}/><span>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span></div>
                        {asig.hora_presentacion&&<div style={{textAlign:"center",fontSize:"13px",color:"#40464D",marginTop:"6px"}}>🕐 Hora de presentación intérprete: {asig.hora_presentacion.slice(0,5)} hrs</div>}
                      </div>);
                    })}
                  </div>)}
                </div>);
              };
              const asigsSingle=evento.asignaciones||[];
              const interpsEl=campos.interpretes&&asigsSingle.length>0?renderI(asigsSingle):null;
              const hasInterpsDia=campos.interpretes&&esMultidia&&dias.length>0;
              const hasInterps=interpsEl||hasInterpsDia;
              const hasDerecha=(campos.tipo||campos.modalidad)||hasInterps;
              return(<table style={{width:"100%",borderCollapse:"collapse"}}>
                {hasDerecha&&<colgroup><col style={{width:"60%"}}/><col style={{width:"40%"}}/></colgroup>}
                <tbody>
                  {/* Fila 1: Cliente | Tipo/Modalidad */}
                  <tr>
                    <td style={{padding:0,verticalAlign:"top",borderRight:hasDerecha?"2px solid #D1D5DB":"none"}}>
                      {campos.cliente&&cliente&&<><div style={sH}>Cliente</div><div style={sB}><div style={{fontSize:"18px",fontWeight:"700",color:"#000000",lineHeight:1.2}}>{cliente.nombre_empresa}</div>{cliente.nombre_contacto&&<div style={{fontSize:"14px",color:"#484f56",fontStyle:"italic",marginTop:"3px"}}>{cliente.nombre_contacto}</div>}</div></>}
                    </td>
                    {hasDerecha&&<td style={{padding:0,verticalAlign:"top"}}>
                      {(campos.tipo||campos.modalidad)&&<><div style={{...sH,textAlign:"center"}}>Tipo / Modalidad</div><div style={{...sB}}><div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center",justifyContent:"center"}}>{campos.tipo&&tiposArr(evento.tipo).map(t=><span key={t} style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"5px 12px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",color:(B_TIPO[t]||{ct:"#294099"}).ct,WebkitFontSmoothing:"antialiased",background:(B_TIPO[t]||{bg:"#EEF2FF"}).bg,border:`2px solid ${(B_TIPO[t]||{c:"#3B5BDB"}).c}`,whiteSpace:"nowrap"}}>{t==="Simultánea"?<IconoSimultanea/>:t==="Consecutiva"?"🎤":"🤫"} {t}</span>)}{campos.modalidad&&evento.modalidad&&<span style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 12px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",color:(B_MOD[evento.modalidad]||{ct:"#4B4B4B"}).ct,WebkitFontSmoothing:"antialiased",background:(B_MOD[evento.modalidad]||{bg:"#F7F7F5"}).bg,border:`2px solid ${(B_MOD[evento.modalidad]||{c:"#6B6B6B"}).c}`,whiteSpace:"nowrap"}}>{evento.modalidad==="presencial"?<IconPresencial size={14} color={(B_MOD[evento.modalidad]||{ct:"#4B4B4B"}).ct}/>:evento.modalidad==="hibrido"?"🔀":"💻"} {LBL_MODAL[evento.modalidad]}</span>}</div></div></>}
                    </td>}
                  </tr>
                  {/* Fila 2: Evento + Fecha/Horario | Intérpretes */}
                  {(campos.evento&&evento.nombre_evento||hasInterps||campos.fecha||campos.horario)&&<tr>
                    <td style={{padding:0,verticalAlign:"top",borderRight:hasDerecha?"2px solid #D1D5DB":"none"}}>
                      {campos.evento&&evento.nombre_evento&&<><div style={sH}>Evento</div><div style={sB}><div style={{fontSize:"14px",fontWeight:"500",color:"#151c28"}}>{evento.nombre_evento}</div>{evento.nro_oc&&<div style={{fontSize:"13px",color:"#484f56",marginTop:"3px"}}>N° OC: {evento.nro_oc}</div>}</div></>}
                      {(campos.fecha||campos.horario)&&<><div style={sH}>Fecha / Horario</div><div style={sB}><div>{campos.fecha&&evento.fecha_inicio&&<div style={{fontSize:"14px",fontWeight:"500",color:"#0a0f1d"}}>{esMultidia?`${formatCorto(evento.fecha_inicio)} → ${formatCorto(evento.fecha_termino)}`:formatLargo(evento.fecha_inicio)}</div>}{campos.horario&&evento.hora_inicio&&<div style={{fontSize:"14px",fontWeight:"500",color:"#0a0f1d",marginTop:"4px"}}>🕐 {evento.hora_inicio.slice(0,5)} – {evento.hora_termino?.slice(0,5)} hrs</div>}</div></div></>}
                    </td>
                    {hasDerecha&&<td style={{padding:0,verticalAlign:"top"}}>
                      {interpsEl&&<><div style={{...sH,textAlign:"center"}}>Intérpretes</div><div style={{...sB,borderBottom:"none"}}>{interpsEl}</div></>}
                      {hasInterpsDia&&<><div style={{...sH,textAlign:"center"}}>Intérpretes por día</div><div style={{background:"#FFFFFF"}}>{dias.map((dia,dIdx)=>(<div key={dIdx} style={{borderBottom:dIdx<dias.length-1?"1px solid #E5E7EB":"none"}}><div style={{background:"#EBF4FF",padding:"4px 16px",fontSize:"11px",fontWeight:"600",color:"#1A6FD4",textTransform:"uppercase",letterSpacing:"0.04em"}}>Día {dIdx+1}/{dias.length} · {formatCorto(dia.fecha)} · {dia.hora_inicio?.slice(0,5)}–{dia.hora_termino?.slice(0,5)}</div><div style={{padding:"10px 16px"}}>{renderI(dia.asignaciones_dia||dia.asignaciones||[])}</div></div>))}</div></>}
                    </td>}
                  </tr>}
                  {/* Fila 4: Jornada */}
                  {campos.jornada&&evento.jornada&&<tr>
                    <td style={{padding:0,verticalAlign:"top",borderRight:hasDerecha?"2px solid #D1D5DB":"none"}}>
                      <div style={sH}>Jornada</div><div style={sB}><div style={{fontSize:"14px",fontWeight:"500",color:"#0a0f1d"}}>⏱ {pluralizarJornada(evento.jornada)}{evento.jornada_personalizada?` — ${evento.jornada_personalizada}`:""}</div></div>
                    </td>
                    {hasDerecha&&<td style={{padding:0}}></td>}
                  </tr>}
                  {/* Fila 5: Lugar / Plataforma | (vacío) */}
                  {(campos.lugar&&esPresencial&&evento.lugar||campos.plataforma&&!esPresencial&&evento.plataforma)&&<tr>
                    <td style={{padding:0,verticalAlign:"top",borderRight:hasDerecha?"2px solid #D1D5DB":"none"}}>
                      {campos.lugar&&esPresencial&&evento.lugar&&(()=>{const TL_={hotel:"Hotel",centro_eventos:"Centro de eventos",universidad:"Universidad",edificio_corporativo:"Edificio corporativo",oficina_cliente:"Oficina del cliente",planta_produccion:"Planta de producción",faena_minera:"Faena minera",ministerio:"Ministerio",edificio_gobierno:"Edificio de gobierno",otro:"Otro"};const lr=lugares.find(l=>evento.lugar===l.nombre||(l.tipo&&TL_[l.tipo]&&evento.lugar===TL_[l.tipo]+" – "+l.nombre));const disp=lr?(lr.tipo&&TL_[lr.tipo]?TL_[lr.tipo]+" "+lr.nombre:lr.nombre):evento.lugar;const dir=lr?.direccion||"";return<><div style={sH}>Lugar</div><div style={sB}><div style={{fontSize:"14px",fontWeight:"500",color:"#0a0f1d"}}>📍 {disp}</div>{dir&&<div style={{fontSize:"13px",color:"#303a47",marginTop:"3px"}}>📌 {dir}</div>}{evento.lugar_detalle&&<div style={{fontSize:"13px",color:"#303a47",marginTop:"3px"}}>{evento.lugar_detalle}</div>}</div></>;})()}
                      {campos.plataforma&&!esPresencial&&evento.plataforma&&<><div style={sH}>Plataforma</div><div style={sB}><PlatformChip platform={evento.plataforma==="Zoom"?"Zoom MundoChile":evento.plataforma} isMundoChile={(evento.plataforma==="Zoom MundoChile"||evento.plataforma==="Zoom")} extra={(evento.plataforma==="Zoom MundoChile"||evento.plataforma==="Zoom")?evento.zoom_administrador:""}/></div></>}
                    </td>
                    {hasDerecha&&<td style={{padding:0}}></td>}
                  </tr>}
                  {/* Fila 6: Comentarios | (vacío) */}
                  {campos.comentarios&&evento.comentarios&&<tr>
                    <td style={{padding:0,verticalAlign:"top",borderRight:hasDerecha?"2px solid #D1D5DB":"none"}}>
                      <div style={sH}>Comentarios</div><div style={{...sB,borderBottom:"none"}}><div style={{fontSize:"13px",color:"#0a0f1d",lineHeight:1.5}}>{evento.comentarios}</div></div>
                    </td>
                    {hasDerecha&&<td style={{padding:0}}></td>}
                  </tr>}
                </tbody>
              </table>);
            })()}
          </div>
        </div>

        {/* Footer — fuera del área exportable */}
        <div style={{padding:"10px 20px",borderTop:"1px solid #E2E8F0",display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap",alignItems:"center",background:"#fff",borderRadius:"0 0 20px 20px",flexShrink:0}}>
          <button onClick={abrirVistaJPG} style={{padding:"8px 16px",borderRadius:"8px",background:"#1A6FD4",color:"#FFFFFF",fontSize:"13px",fontWeight:"500",border:"none",cursor:"pointer",fontFamily:"inherit"}}>🖼️ Ver JPG</button>
          <button onClick={onCerrar} style={{padding:"10px 24px",background:"#2E7BC4",color:"#FFFFFF",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"500",fontSize:"13px",fontFamily:"inherit"}}>× Cerrar</button>
        </div>
      </div>
    </div>
    </>
  );
}

// ─── MODAL FICHAS MÚLTIPLES ──────────────────────────────────────────────────
function ModalFichasMultiples({eventosLista,clientes,interpretes,pares,onCerrar}) {
  const [idx,setIdx]=useState(0);
  return(
    <ModalFicha
      evento={eventosLista[idx]||eventosLista[0]}
      clientes={clientes}
      interpretes={interpretes}
      pares={pares}
      onCerrar={onCerrar}
      paginacion={{
        idx,
        total:eventosLista.length,
        onAnterior:()=>setIdx(i=>Math.max(0,i-1)),
        onSiguiente:()=>setIdx(i=>Math.min(eventosLista.length-1,i+1)),
      }}
    />
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
function ModalNuevoInterprete({onGuardar,onCerrar,pares=[]}) {
  const [f,setF]=useState({nombre:"",apellido:"",email:"",telefono:"",ciudad:"",modalidad_trabajo:"ambas",es_host_zoom:false,notas:"",par_id:""});
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
        <div style={{...S.fila,marginBottom:"20px"}}>
          <div style={S.camp}><label style={S.lbl}>🌐 Par de idiomas (opcional)</label>
            <select style={S.sel} value={f.par_id||""} onChange={e=>u("par_id",e.target.value)}>
              <option value="">Sin asignar</option>
              {pares.filter(p=>p.activo!==false).sort((a,b)=>(a.descripcion||"").localeCompare(b.descripcion||"")).map(p=><option key={p.id} value={p.id}>{p.descripcion||(p.idioma_origen&&p.idioma_destino?`${p.idioma_origen} – ${p.idioma_destino}`:"Par sin nombre")}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:"16px"}}><label style={{display:"flex",gap:"8px",alignItems:"center",cursor:"pointer",fontSize:"17px",color:C.rojo,fontWeight:"500"}}>
          <input type="checkbox" checked={f.es_host_zoom} onChange={e=>u("es_host_zoom",e.target.checked)}/> 🔑 Host Zoom MundoChile
        </label></div>
        <div style={{marginBottom:"20px"}}><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:"60px"}} value={f.notas} onChange={e=>u("notas",e.target.value)}/></div>
        <div style={{display:"flex",gap:"10px",justifyContent:"flex-end"}}>
          <button onClick={onCerrar} style={S.btnG}>Cancelar</button>
          <button onClick={()=>{if(!f.nombre)return;const{par_id,...fData}=f;onGuardar({...fData,activo:true},Number(par_id)||null);}} style={S.btnA}>💾 Guardar</button>
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
  const [interpPares,setInterpPares]=useState({});
  const [busquedaInterp,setBusquedaInterp]=useState("");
  const [filtroParConfig,setFiltroParConfig]=useState("");
  const [confirmarEliminar,setConfirmarEliminar]=useState(null);
  const tabs=[{id:"interpretes",l:"👤 Intérpretes"},{id:"clientes",l:"🏢 Clientes"},{id:"idiomas",l:"🌐 Idiomas"},{id:"proveedores",l:"🔧 Proveedores"},{id:"lugares",l:"📍 Lugares"},{id:"usuarios",l:"👥 Usuarios"}];

  useEffect(()=>{if(tab==="usuarios")sb.from("perfiles").select("*").order("nombre").then(({data})=>data&&setPerfiles(data));},[tab]);
  useEffect(()=>{
    if(tab==="interpretes"){
      sb.from("asignaciones").select("interprete_id, par_id").then(({data})=>{
        if(!data)return;
        const m={};
        data.forEach(a=>{if(!a.interprete_id||!a.par_id)return;if(!m[a.interprete_id])m[a.interprete_id]=new Set();m[a.interprete_id].add(a.par_id);});
        const res={};Object.entries(m).forEach(([id,s])=>{res[id]=Array.from(s);});
        setInterpPares(res);
      });
    }
  },[tab]);

  const [errorGuardar,setErrorGuardar]=useState(null);
  const guardar=async(tabla,payload,id)=>{
    setErrorGuardar(null);
    const {id:_,created_at:__,...clean}=payload;
    let err,savedId=id;
    if(tabla==="interpretes"){
      const {notas,par_ids,...cleanSinNotas}=clean;
      if(id==="nuevo"){const r=await sb.from(tabla).insert(cleanSinNotas).select("id").single();err=r.error;savedId=r.data?.id;}
      else{const r=await sb.from(tabla).update(cleanSinNotas).eq("id",id);err=r.error;}
      if(!err&&savedId){const upd={};if(notas!==undefined)upd.notas=notas;if(par_ids!==undefined)upd.par_ids=par_ids;if(Object.keys(upd).length)await sb.from(tabla).update(upd).eq("id",savedId);}
    } else if(tabla==="lugares"){
      const {tipo,direccion,...cleanBase}=clean;
      if(id==="nuevo"){const r=await sb.from(tabla).insert(cleanBase).select("id").single();err=r.error;savedId=r.data?.id;}
      else{const r=await sb.from(tabla).update(cleanBase).eq("id",id);err=r.error;}
      if(!err&&savedId){const upd={};if(tipo!==undefined)upd.tipo=tipo;if(direccion!==undefined)upd.direccion=direccion;if(Object.keys(upd).length)await sb.from(tabla).update(upd).eq("id",savedId);}
    } else {
      if(tabla==="pares_idiomas"&&clean.idioma_origen&&clean.idioma_destino)
        clean.descripcion=`${clean.idioma_origen} – ${clean.idioma_destino}`;
      if(id==="nuevo"){const r=await sb.from(tabla).insert(clean);err=r.error;}
      else{const r=await sb.from(tabla).update(clean).eq("id",id);err=r.error;}
    }
    if(err){setErrorGuardar(err.message||"Error al guardar");return;}
    setEditando(null);setFormEdit({});onActualizar();
  };

  const ejecutarEliminacion=async({tipo,id})=>{
    const tabla=tipo==="cliente"?"clientes":tipo==="interprete"?"interpretes":"proveedores";
    await sb.from(tabla).delete().eq("id",id);
    onActualizar();
  };

  const EF=(k)=><input style={S.inp} value={formEdit[k]||""} onChange={e=>setFormEdit(f=>({...f,[k]:e.target.value}))}/>;
  const SE=(k,opts,lab)=><select style={S.sel} value={formEdit[k]||""} onChange={e=>setFormEdit(f=>({...f,[k]:e.target.value}))}>{opts.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select>;

  return (
    <>
      <div style={{position:"sticky",top:"96px",zIndex:80,background:"rgba(22,38,84,0.97)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderBottom:"1px solid rgba(255,255,255,0.10)"}}>
        <div style={{maxWidth:"900px",margin:"0 auto",padding:"0 16px"}}>
          <div style={{display:"flex",flexWrap:"nowrap",gap:"8px",alignItems:"center",overflowX:"auto",justifyContent:"center",width:"100%",padding:"12px 0"}}>
            {tabs.map(t=><button key={t.id} onClick={()=>{setTab(t.id);setEditando(null);setFormEdit({});}}
              style={{
                padding:"8px 20px",borderRadius:"10px",cursor:"pointer",fontFamily:"inherit",fontSize:"13px",
                height:"36px",whiteSpace:"nowrap",textAlign:"center",
                background:tab===t.id?"#FFFBEB":"rgba(255,255,255,0.12)",
                color:tab===t.id?C.azul:"#FFFFFF",
                fontWeight:"500",
                border:tab===t.id?"2px solid #F59E0B":"2px solid rgba(255,255,255,0.2)",
                borderBottom:tab===t.id?"4px solid #F59E0B":"2px solid rgba(255,255,255,0.2)",
                boxShadow:tab===t.id?"0 2px 8px rgba(245,158,11,0.25)":"none"
              }}>
              {t.l}</button>)}
          </div>
        </div>
      </div>
      <div style={{padding:"20px 16px 80px",maxWidth:"900px",margin:"0 auto"}}>

      {/* ── INTÉRPRETES ── */}
      {tab==="interpretes"&&<>
        {/* Header: buscador + filtro idioma + botón nuevo */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",gap:"12px",flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center",flex:1}}>
            <div style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
              <input
                style={{padding:"8px 12px",paddingRight:busquedaInterp?"32px":"12px",border:"1px solid #D1D5DB",borderRadius:"8px",fontSize:"13px",color:"#1A1A1A",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit",width:"220px"}}
                placeholder="Buscar intérprete..."
                value={busquedaInterp}
                onChange={e=>setBusquedaInterp(e.target.value)}
              />
              {busquedaInterp&&<button onClick={()=>setBusquedaInterp("")} style={{position:"absolute",right:"8px",background:"#EF4444",color:"#FFFFFF",border:"none",borderRadius:"50%",width:"18px",height:"18px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"11px",fontWeight:"700",lineHeight:1,padding:0,flexShrink:0}}>×</button>}
            </div>
            <select value={filtroParConfig} onChange={e=>setFiltroParConfig(e.target.value)} style={{padding:"8px 12px",border:"1px solid #D1D5DB",borderRadius:"8px",fontSize:"13px",color:"#1A1A1A",background:"#fff",outline:"none",fontFamily:"inherit",cursor:"pointer",height:"36px"}}>
              <option value="">Todos los idiomas</option>
              {pares.filter(p=>p.activo!==false).sort((a,b)=>(a.descripcion||"").localeCompare(b.descripcion||"")).map(p=><option key={p.id} value={p.id}>{p.descripcion||(p.idioma_origen&&p.idioma_destino?`${p.idioma_origen} – ${p.idioma_destino}`:"Par sin nombre")}</option>)}
            </select>
            {filtroParConfig&&<button onClick={()=>setFiltroParConfig("")} style={{background:"#EF4444",color:"#FFFFFF",border:"none",borderRadius:"50%",width:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"12px",fontWeight:"700",lineHeight:1,padding:0,flexShrink:0}}>×</button>}
          </div>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({nombre:"",apellido:"",email:"",telefono:"",ciudad:"",modalidad_trabajo:"ambas",es_host_zoom:false,notas:"",par_ids:[],activo:true});}} style={S.btnA}>+ Nuevo intérprete</button>
        </div>

        {/* Form edición */}
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
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Par de idiomas</label>
              <select style={S.sel} value={(formEdit.par_ids||[])[0]||""} onChange={e=>setFormEdit(f=>({...f,par_ids:e.target.value?[Number(e.target.value)]:[]}))}>
                <option value="">Seleccionar…</option>
                {pares.filter(p=>p.activo!==false).sort((a,b)=>(a.descripcion||"").localeCompare(b.descripcion||"")).map(p=><option key={p.id} value={p.id}>{p.descripcion||(p.idioma_origen&&p.idioma_destino?`${p.idioma_origen} – ${p.idioma_destino}`:"Par sin nombre")}</option>)}
              </select>
            </div>
          </div>
          <label style={{display:"flex",gap:"8px",alignItems:"center",cursor:"pointer",fontSize:"17px",color:C.rojo,fontWeight:"500",marginBottom:"16px"}}>
            <input type="checkbox" checked={!!formEdit.es_host_zoom} onChange={e=>setFormEdit(f=>({...f,es_host_zoom:e.target.checked}))}/> 🔑 Host Zoom MundoChile
          </label>
          {errorGuardar&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:"8px",padding:"8px 12px",marginBottom:"12px",color:"#DC2626",fontSize:"13px"}}>⚠️ {errorGuardar}</div>}
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>guardar("interpretes",formEdit,editando)} style={S.btnA}>💾 Guardar</button>
            <button onClick={()=>{setEditando(null);setFormEdit({});setErrorGuardar(null);}} style={S.btnG}>Cancelar</button>
          </div>
        </div>}

        {interpretes
          .filter(i=>!busquedaInterp.trim()||(`${i.nombre||""} ${i.apellido||""}`).toLowerCase().includes(busquedaInterp.toLowerCase().trim()))
          .filter(i=>!filtroParConfig||(i.par_ids||[]).includes(Number(filtroParConfig))||(interpPares[i.id]||[]).includes(Number(filtroParConfig)))
          .map(i=>{
            const nombreCompleto=`${i.nombre||""}${i.apellido?" "+i.apellido:""}`;
            const aColor=avatarColor(nombreCompleto);
            const parsDelInterp=pares.filter(p=>(interpPares[i.id]||[]).includes(p.id)||(i.par_ids||[]).includes(p.id));
            return(
              <div key={i.id}
                style={{border:`1.5px solid ${C.grisBorde}`,borderRadius:"12px",padding:"14px 20px",marginBottom:"10px",background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",transition:"background 0.1s",opacity:i.activo===false?0.55:1}}
                onMouseEnter={e=>e.currentTarget.style.background=C.gris}
                onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                <div style={{display:"flex",gap:"12px",alignItems:"center",flex:1,minWidth:0}}>
                  <div style={{width:"40px",height:"40px",borderRadius:"50%",background:aColor,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"500",fontSize:"16px",flexShrink:0}}>
                    {(i.nombre||"?").slice(0,1).toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                      <span style={{fontWeight:"500",fontSize:"16px",color:C.texto,whiteSpace:"nowrap"}}>{nombreCompleto}</span>
                      {i.es_host_zoom&&<span title="Host Zoom MundoChile" style={{fontSize:"13px",cursor:"help"}}>🔑</span>}
                      {(i.modalidad_trabajo==="ambas"||i.modalidad_trabajo==="online")&&<span title="Maneja plataforma Zoom" style={{fontSize:"13px",cursor:"help"}}>💻</span>}
                      {(i.modalidad_trabajo==="ambas"||i.modalidad_trabajo==="presencial")&&<span title="Disponible presencial" style={{fontSize:"13px",cursor:"help"}}>📍</span>}
                      {parsDelInterp.map(p=>{const clr=IDIOMA_PILL_CLR[p.idioma_origen]||"#4C6EF5";const desc=p.descripcion||(p.idioma_origen&&p.idioma_destino?`${p.idioma_origen} – ${p.idioma_destino}`:"");return(<span key={p.id} style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"2px 9px",borderRadius:"20px",background:"#FFFFFF",border:`2px solid ${clr}`,color:"#1A1A1A",fontSize:"13px",fontWeight:"500",whiteSpace:"nowrap",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"}}><FlagImg idioma={p.idioma_origen}/>{desc}</span>);})}
                    </div>
                    {(i.email||i.telefono)&&<div style={{display:"flex",gap:"14px",marginTop:"5px",flexWrap:"wrap",alignItems:"center"}}>
                      {i.email&&<CampoCopia valor={i.email} wrapStyle={{fontSize:"13px",color:"#5B5B5B"}}/>}
                      {i.telefono&&<CampoCopia valor={i.telefono} wrapStyle={{fontSize:"13px",color:"#5B5B5B"}}/>}
                    </div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:"8px",alignItems:"center",flexShrink:0}}>
                  <button onClick={()=>{setEditando(i.id);setFormEdit({...i});}} style={S.btnEdit}><span style={{filter:"brightness(10)"}}>✏️</span> Editar</button>
                  <button onClick={async()=>{await sb.from("interpretes").update({activo:!i.activo}).eq("id",i.id);onActualizar();}}
                    style={{padding:"4px 10px",background:"#FFFFFF",color:"#6B7280",border:"1px solid #D1D5DB",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"}}>
                    {i.activo?"Desactivar":"Activar"}
                  </button>
                  <button onClick={()=>setConfirmarEliminar({tipo:"interprete",id:i.id,nombre:`${i.nombre||""}${i.apellido?" "+i.apellido:""}`.trim()})}
                    style={{padding:"4px 10px",background:"#FEF2F2",color:"#DC2626",border:"1px solid #FECACA",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"}}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        }
        {interpretes.filter(i=>!busquedaInterp.trim()||(`${i.nombre||""} ${i.apellido||""}`).toLowerCase().includes(busquedaInterp.toLowerCase().trim())).length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:"#9CA3AF",fontSize:"14px"}}>No se encontraron intérpretes</div>
        )}
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
            <div style={{display:"flex",gap:"8px",flexShrink:0}}>
              <button onClick={()=>{setEditando(c.id);setFormEdit({...c});}} style={S.btnEdit}><span style={{filter:"brightness(10)"}}>✏️</span> Editar</button>
              <button onClick={()=>setConfirmarEliminar({tipo:"cliente",id:c.id,nombre:c.nombre_empresa||"este cliente"})}
                style={{padding:"4px 10px",background:"#FEF2F2",color:"#DC2626",border:"1px solid #FECACA",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"}}>
                Eliminar
              </button>
            </div>
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
            <div style={{display:"flex",gap:"8px",flexShrink:0}}>
              <button onClick={()=>{setEditando(p.id);setFormEdit({...p});}} style={S.btnP}>✏️ Editar</button>
              <button onClick={()=>setConfirmarEliminar({tipo:"proveedor",id:p.id,nombre:p.nombre||"este proveedor"})}
                style={{padding:"4px 10px",background:"#FEF2F2",color:"#DC2626",border:"1px solid #FECACA",borderRadius:"6px",cursor:"pointer",fontWeight:"500",fontSize:"12px",height:"28px",fontFamily:"inherit"}}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </>}

      {/* ── LUGARES ── */}
      {tab==="lugares"&&<>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"20px"}}>
          <button onClick={()=>{setEditando("nuevo");setFormEdit({nombre:"",tipo:"",direccion:"",activo:true});}} style={S.btnA}>+ Nuevo lugar</button>
        </div>
        {editando&&<div style={{background:C.azulClaro,border:`1.5px solid ${C.azulBorde}`,borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
          <div style={{fontWeight:"500",color:C.azul,marginBottom:"16px"}}>{editando==="nuevo"?"Nuevo lugar":"Editar lugar"}</div>
          <div style={{...S.fila,marginBottom:"12px"}}>
            <div style={S.camp}><label style={S.lbl}>Tipo de lugar</label><select style={S.sel} value={formEdit.tipo||""} onChange={e=>setFormEdit(f=>({...f,tipo:e.target.value}))}><option value="">Sin tipo</option><option value="hotel">Hotel</option><option value="centro_eventos">Centro de eventos</option><option value="universidad">Universidad</option><option value="edificio_corporativo">Edificio corporativo</option><option value="oficina_cliente">Oficina del cliente</option><option value="planta_produccion">Planta de producción</option><option value="faena_minera">Faena minera</option><option value="ministerio">Ministerio</option><option value="edificio_gobierno">Edificio de gobierno</option><option value="otro">Otro</option></select></div>
            <div style={S.camp}><label style={S.lbl}>Nombre *</label>{EF("nombre")}</div>
          </div>
          <div style={{marginBottom:"16px"}}><label style={S.lbl}>Dirección</label>{EF("direccion")}</div>
          {errorGuardar&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:"8px",padding:"8px 12px",marginBottom:"12px",color:"#DC2626",fontSize:"13px"}}>⚠️ {errorGuardar}</div>}
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>guardar("lugares",formEdit,editando)} style={S.btnA}>💾 Guardar</button>
            <button onClick={()=>{setEditando(null);setFormEdit({});setErrorGuardar(null);}} style={S.btnG}>Cancelar</button>
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

      {confirmarEliminar&&(
        <div style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#FFFFFF",borderRadius:"12px",padding:"32px",maxWidth:"400px",width:"90%",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
            <h3 style={{fontSize:"18px",fontWeight:"600",color:"#111827",margin:"0 0 8px 0"}}>¿Confirmar eliminación?</h3>
            <p style={{fontSize:"14px",color:"#6B7280",margin:"0 0 24px 0"}}>
              Estás a punto de eliminar <strong>{confirmarEliminar.nombre}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{display:"flex",gap:"12px",justifyContent:"flex-end"}}>
              <button onClick={()=>setConfirmarEliminar(null)}
                style={{padding:"8px 20px",borderRadius:"8px",background:"#F3F4F6",color:"#374151",border:"1px solid #D1D5DB",cursor:"pointer",fontSize:"13px",fontWeight:"500",fontFamily:"inherit"}}>
                Cancelar
              </button>
              <button onClick={async()=>{await ejecutarEliminacion(confirmarEliminar);setConfirmarEliminar(null);}}
                style={{padding:"8px 20px",borderRadius:"8px",background:"#DC2626",color:"#FFFFFF",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:"500",fontFamily:"inherit"}}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

// ─── VISTA GRILLA ────────────────────────────────────────────────────────────
function VistaGrilla({eventos,clientes,interpretes,pares,proveedores=[],contactos=[],onAbrir,onVerMultidia,vista}) {
  const [colFiltros,setColFiltros]=useState({});
  const [openCol,setOpenCol]=useState(null);
  const [mesesFiltro,setMesesFiltro]=useState(new Set());
  const [celdaActiva,setCeldaActiva]=useState(null);
  const tablaRef=useRef(null);
  const filteredRef=useRef([]);
  const onAbrirRef=useRef(onAbrir);
  const onVerMultidiaRef=useRef(onVerMultidia);
  const COLS=["Mes","Orden de Compra","Cliente","Contacto Cliente","# Evento","Detalle Equipos AV","Proveedor","Detalles Instalación","Modalidad","Tipo","Nombre Evento","Lugar","Par de Idiomas","Jornada","Horario","Fecha Inicio","Fecha Término","Comentarios","Intérprete 1","Nro OT","Nro Boleta Intérprete 1","Intérprete 2","Nro OT 2","Nro Boleta Intérprete 2"];
  const FILTERABLE=COLS;
  const TOTAL_COLS=COLS.length+1;
  useEffect(()=>{onAbrirRef.current=onAbrir;},[onAbrir]);
  useEffect(()=>{onVerMultidiaRef.current=onVerMultidia;},[onVerMultidia]);
  useEffect(()=>{if(!openCol)return;const h=()=>setOpenCol(null);document.addEventListener("click",h);return()=>document.removeEventListener("click",h);},[openCol]);
  useEffect(()=>{if(vista!=="grilla")return;setTimeout(()=>{const hoy=new Date();const todayStr=`${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`;let el=document.getElementById(`grilla-evento-${todayStr}`);if(!el){const filas=Array.from(document.querySelectorAll("[id^='grilla-evento-']"));el=filas.find(f=>f.id.replace("grilla-evento-","")>=todayStr)||filas[0];}if(el&&tablaRef.current){const contenedor=tablaRef.current;const offsetTop=el.offsetTop-60;contenedor.scrollTo({top:offsetTop,behavior:"instant"});}},300);},[vista]);
  const allRows=useMemo(()=>[...eventos].sort((a,b)=>a.fecha_inicio.localeCompare(b.fecha_inicio)).map(ev=>{
    const cli=clientes.find(c=>c.id===ev.cliente_id);
    const contacto=contactos.find(c=>c.id===ev.contacto_id);
    const asigs=ev.asignaciones||[];
    const a1=asigs[0]||null;const a2=asigs[1]||null;
    const i1=a1?interpretes.find(x=>x.id===a1.interprete_id):null;
    const i2=a2?interpretes.find(x=>x.id===a2.interprete_id):null;
    const i1N=i1?`${i1.nombre}${i1.apellido?" "+i1.apellido:""}` :"";
    const i2N=i2?`${i2.nombre}${i2.apellido?" "+i2.apellido:""}` :"";
    const par=a1?pares.find(p=>p.id===a1.par_id):null;
    const equipos=(ev.evento_dias||[]).flatMap(d=>d.equipos_dia||[]);
    const eq=equipos[0]||null;
    const detalleEq=eq?[eq.tipo_equipo,eq.num_receptores?`${eq.num_receptores} receptores`:null,eq.num_cabinas?`${eq.num_cabinas} cabinas`:null].filter(Boolean).join(", "):"";
    const provNom=eq?.proveedor_nombre||(eq?.proveedor_id?proveedores.find(p=>p.id===eq.proveedor_id)?.nombre:"")||"";
    const detalleInst=eq?.instrucciones||eq?.contacto_in_situ||"";
    const d=desdeISO(ev.fecha_inicio);
    const mesKey=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const mesStr=d.toLocaleDateString('es-CL',{month:'short'}).replace('.','').slice(0,3).toLowerCase()+'-'+String(d.getFullYear()).slice(2);
    const mesLargo=`${MESES_L[d.getMonth()].charAt(0).toUpperCase()+MESES_L[d.getMonth()].slice(1)} ${d.getFullYear()}`;
    return {ev,cli,contactoNombre:contacto?.nombre||cli?.nombre_contacto||"",esMultidia:ev.fecha_inicio!==ev.fecha_termino,a1,a2,i1N,i2N,par,detalleEq,provNom,detalleInst,mesKey,mesStr,mesLargo};
  }),[eventos,clientes,interpretes,pares,proveedores,contactos]);
  const mesesDisponibles=useMemo(()=>[...new Set(allRows.map(r=>r.mesLargo))],[allRows]);
  const uniqueVals=useMemo(()=>({
    "Mes":[...new Set(allRows.map(r=>r.mesStr))].filter(Boolean),
    "Orden de Compra":[...new Set(allRows.map(r=>r.ev.nro_oc||""))].filter(Boolean),
    "Cliente":[...new Set(allRows.map(r=>r.cli?.nombre_empresa||""))].filter(Boolean),
    "Contacto Cliente":[...new Set(allRows.map(r=>r.contactoNombre||""))].filter(Boolean),
    "# Evento":[],
    "Detalle Equipos AV":[...new Set(allRows.map(r=>r.detalleEq||""))].filter(Boolean),
    "Proveedor":[...new Set(allRows.map(r=>r.provNom||""))].filter(Boolean),
    "Detalles Instalación":[...new Set(allRows.map(r=>r.detalleInst||""))].filter(Boolean),
    "Modalidad":[...new Set(allRows.map(r=>r.ev.modalidad||""))].filter(Boolean),
    "Tipo":[...new Set(allRows.flatMap(r=>tiposArr(r.ev.tipo)))].filter(Boolean),
    "Nombre Evento":[...new Set(allRows.map(r=>r.ev.nombre_evento||""))].filter(Boolean),
    "Lugar":[...new Set(allRows.map(r=>r.ev.lugar||""))].filter(Boolean),
    "Par de Idiomas":[...new Set(allRows.map(r=>r.par?.descripcion||""))].filter(Boolean),
    "Jornada":[...new Set(allRows.map(r=>r.ev.jornada||""))].filter(Boolean),
    "Horario":[...new Set(allRows.map(r=>`${r.ev.hora_inicio?.slice(0,5)||""} – ${r.ev.hora_termino?.slice(0,5)||""}`))].filter(v=>v.trim()!=="–"),
    "Fecha Inicio":[...new Set(allRows.map(r=>formatCorto(r.ev.fecha_inicio)))].filter(Boolean),
    "Fecha Término":[...new Set(allRows.map(r=>formatCorto(r.ev.fecha_termino)))].filter(Boolean),
    "Comentarios":[...new Set(allRows.map(r=>r.ev.comentarios||""))].filter(Boolean),
    "Intérprete 1":[...new Set(allRows.map(r=>r.i1N))].filter(Boolean),
    "Nro OT":[...new Set(allRows.map(r=>r.a1?.nro_ot||""))].filter(Boolean),
    "Nro Boleta Intérprete 1":[...new Set(allRows.map(r=>r.a1?.nro_boleta||""))].filter(Boolean),
    "Intérprete 2":[...new Set(allRows.map(r=>r.i2N))].filter(Boolean),
    "Nro OT 2":[...new Set(allRows.map(r=>r.a2?.nro_ot||""))].filter(Boolean),
    "Nro Boleta Intérprete 2":[...new Set(allRows.map(r=>r.ev.nro_boleta_2||""))].filter(Boolean),
  }),[allRows]);
  const filtered=useMemo(()=>allRows.filter(r=>{
    if(mesesFiltro.size>0&&!mesesFiltro.has(r.mesLargo))return false;
    if(colFiltros["Mes"]&&r.mesStr!==colFiltros["Mes"])return false;
    if(colFiltros["Orden de Compra"]&&(r.ev.nro_oc||"")!==colFiltros["Orden de Compra"])return false;
    if(colFiltros["Cliente"]&&(r.cli?.nombre_empresa||"")!==colFiltros["Cliente"])return false;
    if(colFiltros["Contacto Cliente"]&&(r.contactoNombre||"")!==colFiltros["Contacto Cliente"])return false;
    if(colFiltros["Detalle Equipos AV"]&&(r.detalleEq||"")!==colFiltros["Detalle Equipos AV"])return false;
    if(colFiltros["Proveedor"]&&(r.provNom||"")!==colFiltros["Proveedor"])return false;
    if(colFiltros["Detalles Instalación"]&&(r.detalleInst||"")!==colFiltros["Detalles Instalación"])return false;
    if(colFiltros["Modalidad"]&&(r.ev.modalidad||"")!==colFiltros["Modalidad"])return false;
    if(colFiltros["Tipo"]&&!tiposArr(r.ev.tipo).includes(colFiltros["Tipo"]))return false;
    if(colFiltros["Nombre Evento"]&&(r.ev.nombre_evento||"")!==colFiltros["Nombre Evento"])return false;
    if(colFiltros["Lugar"]&&(r.ev.lugar||"")!==colFiltros["Lugar"])return false;
    if(colFiltros["Par de Idiomas"]&&(r.par?.descripcion||"")!==colFiltros["Par de Idiomas"])return false;
    if(colFiltros["Jornada"]&&(r.ev.jornada||"")!==colFiltros["Jornada"])return false;
    if(colFiltros["Horario"]){const h=`${r.ev.hora_inicio?.slice(0,5)||""} – ${r.ev.hora_termino?.slice(0,5)||""}`;if(h!==colFiltros["Horario"])return false;}
    if(colFiltros["Fecha Inicio"]&&formatCorto(r.ev.fecha_inicio)!==colFiltros["Fecha Inicio"])return false;
    if(colFiltros["Fecha Término"]&&formatCorto(r.ev.fecha_termino)!==colFiltros["Fecha Término"])return false;
    if(colFiltros["Comentarios"]&&(r.ev.comentarios||"")!==colFiltros["Comentarios"])return false;
    if(colFiltros["Intérprete 1"]&&r.i1N!==colFiltros["Intérprete 1"])return false;
    if(colFiltros["Nro OT"]&&(r.a1?.nro_ot||"")!==colFiltros["Nro OT"])return false;
    if(colFiltros["Nro Boleta Intérprete 1"]&&(r.a1?.nro_boleta||"")!==colFiltros["Nro Boleta Intérprete 1"])return false;
    if(colFiltros["Intérprete 2"]&&r.i2N!==colFiltros["Intérprete 2"])return false;
    if(colFiltros["Nro OT 2"]&&(r.a2?.nro_ot||"")!==colFiltros["Nro OT 2"])return false;
    if(colFiltros["Nro Boleta Intérprete 2"]&&(r.ev.nro_boleta_2||"")!==colFiltros["Nro Boleta Intérprete 2"])return false;
    return true;
  }),[allRows,mesesFiltro,colFiltros]);
  useEffect(()=>{filteredRef.current=filtered;},[filtered]);
  useEffect(()=>{
    const el=tablaRef.current;
    if(!el) return;
    const handler=(e)=>{
      const rows=filteredRef.current;
      if(!rows.length) return;
      if(e.key==="Escape"){setCeldaActiva(null);return;}
      if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","Enter"].includes(e.key)) return;
      e.preventDefault();
      setCeldaActiva(prev=>{
        const cur=prev||{fila:0,col:0};
        let {fila,col}=cur;
        if(e.key==="ArrowRight") col=Math.min(col+1,TOTAL_COLS-1);
        else if(e.key==="ArrowLeft") col=Math.max(col-1,0);
        else if(e.key==="ArrowDown") fila=Math.min(fila+1,rows.length-1);
        else if(e.key==="ArrowUp") fila=Math.max(fila-1,0);
        else if(e.key==="Tab"){col++;if(col>=TOTAL_COLS){col=0;fila=Math.min(fila+1,rows.length-1);}}
        else if(e.key==="Enter"){const r=rows[fila];if(r){r.esMultidia?onVerMultidiaRef.current(r.ev.id):onAbrirRef.current(r.ev);}return prev;}
        return {fila,col};
      });
    };
    el.addEventListener("keydown",handler);
    return()=>el.removeEventListener("keydown",handler);
  },[]);
  useEffect(()=>{
    if(!celdaActiva||!tablaRef.current) return;
    const el=tablaRef.current.querySelector(`[data-celda="${celdaActiva.fila}-${celdaActiva.col}"]`);
    if(el) el.scrollIntoView({block:"nearest",inline:"nearest"});
  },[celdaActiva]);
  const COL_MINW={"Mes":"60px","Orden de Compra":"90px","Cliente":"120px","Contacto Cliente":"110px","# Evento":"70px","Detalle Equipos AV":"90px","Proveedor":"90px","Detalles Instalación":"90px","Modalidad":"90px","Tipo":"110px","Nombre Evento":"150px","Lugar":"100px","Par de Idiomas":"100px","Jornada":"90px","Horario":"100px","Fecha Inicio":"100px","Fecha Término":"100px","Comentarios":"90px","Intérprete 1":"100px","Nro OT":"80px","Nro Boleta":"80px","Intérprete 2":"100px","Nro OT 2":"80px"};
  const thS={background:"#1E3A5F",color:"#FFFFFF",position:"sticky",top:0,zIndex:50,borderRight:"1px solid rgba(255,255,255,0.15)",borderBottom:"2px solid #94A3B8",height:"auto",padding:0,textAlign:"center"};
  const renderThFiltro=(col)=>{
    const active=!!colFiltros[col];const isOpen=openCol===col;
    return(<th key={col} style={{...thS,background:active?"#2D5F9E":"#1E3A5F",cursor:"pointer",userSelect:"none",zIndex:isOpen?1000:50,minWidth:COL_MINW[col]||"80px"}}>
      <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",gap:"4px",padding:"6px 8px",minHeight:"48px",height:"100%",boxSizing:"border-box"}}
        onClick={e=>{e.stopPropagation();setOpenCol(isOpen?null:col);}}>
        <span style={{fontSize:"11px",fontWeight:"600",color:"#FFFFFF",textAlign:"center",whiteSpace:"normal",wordBreak:"break-word",lineHeight:"1.3",width:"100%"}}>{col}</span>
        <span style={{display:"block",fontSize:"9px",color:"rgba(255,255,255,0.8)",marginTop:"2px",flexShrink:0}}>{active?"▲":"▼"}</span>
        {isOpen&&(<div onClick={e=>e.stopPropagation()}
          style={{position:"absolute",top:"100%",left:"0",marginTop:"2px",zIndex:1000,minWidth:"160px",background:"#FFFFFF",color:"#1A1A1A",borderRadius:"6px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",border:"1px solid #E5E7EB",maxHeight:"240px",overflowY:"auto",fontSize:"12px",textAlign:"left",fontWeight:"400"}}>
          <div onClick={()=>{setColFiltros(f=>{const n={...f};delete n[col];return n;});setOpenCol(null);}}
            style={{padding:"4px 8px",cursor:"pointer",background:!active?"#EFF6FF":"transparent",fontWeight:!active?"600":"400",borderBottom:"1px solid #E5E7EB"}}>Todos</div>
          {(uniqueVals[col]||[]).map(v=>(<div key={v} onClick={()=>{setColFiltros(f=>({...f,[col]:v}));setOpenCol(null);}}
            style={{padding:"4px 8px",cursor:"pointer",background:colFiltros[col]===v?"#DBEAFE":"transparent",fontWeight:colFiltros[col]===v?"600":"400"}}>{v}</div>))}
        </div>)}
      </div>
    </th>);
  };
  const hoyISO=toISO(new Date());
  const byMonth={};let rowIdx=0;
  filtered.forEach(r=>{if(!byMonth[r.mesKey])byMonth[r.mesKey]={label:r.mesLargo,rows:[]};byMonth[r.mesKey].rows.push(r);});
  const hayFiltros=mesesFiltro.size>0||Object.values(colFiltros).some(Boolean);
  const countMes=filtered.length;
  const toggleMes=(mes)=>setMesesFiltro(prev=>{const n=new Set(prev);n.has(mes)?n.delete(mes):n.add(mes);return n;});
  return (
    <div style={{paddingBottom:"80px",width:"100%"}}>
      <div style={{padding:"8px 16px",display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap",background:"rgba(26,47,90,0.97)",borderBottom:"1px solid rgba(255,255,255,0.10)"}}>
        <button onClick={()=>setMesesFiltro(new Set())}
          style={{padding:"4px 14px",borderRadius:"20px",fontSize:"12px",fontWeight:"600",cursor:"pointer",fontFamily:"inherit",border:"none",flexShrink:0,
            background:mesesFiltro.size===0?"#FFFFFF":"rgba(255,255,255,0.15)",
            color:mesesFiltro.size===0?"#1E3A5F":"#FFFFFF"}}>
          Todos
        </button>
        {mesesDisponibles.map(mes=>{
          const sel=mesesFiltro.has(mes);
          return(<button key={mes} onClick={()=>toggleMes(mes)}
            style={{padding:"4px 14px",borderRadius:"20px",fontSize:"12px",fontWeight:"600",cursor:"pointer",fontFamily:"inherit",border:"none",flexShrink:0,
              background:sel?"#FFFFFF":"rgba(255,255,255,0.15)",
              color:sel?"#1E3A5F":"#FFFFFF"}}>
            {mes}
          </button>);
        })}
        <span style={{marginLeft:"auto",padding:"4px 12px",background:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.85)",fontSize:"12px",fontWeight:"600",borderRadius:"20px",whiteSpace:"nowrap",flexShrink:0}}>
          {countMes} evento{countMes!==1?"s":""}
        </span>
        {Object.values(colFiltros).some(Boolean)&&<button onClick={()=>setColFiltros({})} style={{padding:"4px 10px",background:"#EF4444",color:"#FFFFFF",border:"none",borderRadius:"20px",cursor:"pointer",fontSize:"11px",fontFamily:"inherit",flexShrink:0}}>✕ Col</button>}
      </div>
      <div ref={tablaRef} style={{overflowX:"auto",overflowY:"auto",width:"100%",height:"calc(100vh - 200px)",outline:"none",background:"#F1F5F9"}} tabIndex={0}>
      <table style={{borderCollapse:"collapse",tableLayout:"fixed",minWidth:"2200px",width:"100%",fontSize:"13px",background:"#F1F5F9"}}>
        <thead style={{position:"sticky",top:"0",zIndex:"40",background:"#1E3A5F"}}>
          <tr>
            <th style={{...thS,width:"40px",left:0,zIndex:60}}></th>
            {COLS.map(col=>FILTERABLE.includes(col)?renderThFiltro(col):<th key={col} style={thS}>{col}</th>)}
          </tr>
        </thead>
        {filtered.length===0&&<tbody><tr><td colSpan={TOTAL_COLS} style={{textAlign:"center",padding:"60px 20px",color:"#9CA3AF",fontSize:"14px",background:"#fff"}}>No hay eventos que mostrar</td></tr></tbody>}
        {Object.entries(byMonth).map(([mk,{label,rows}])=>(
          <tbody key={mk}>
            <tr><td colSpan={TOTAL_COLS} style={{background:"#1E3A5F",color:"#FFFFFF",fontSize:"17px",fontWeight:"600",padding:"8px 12px",textTransform:"uppercase",letterSpacing:"0.08em",margin:"0",marginBottom:"0"}}>📅 {label}</td></tr>
            {rows.map(r=>{
              rowIdx++;
              const ri=rowIdx;
              const fi=ri-1;
              const isEven=ri%2===0;
              const {ev,cli,contactoNombre,esMultidia,a1,a2,i1N,i2N,par,detalleEq,provNom,detalleInst,mesStr}=r;
              const esHoy=ev.fecha_inicio?.slice(0,10)===hoyISO;
              const esFilaActiva=celdaActiva?.fila===fi;
              const rowBg=esFilaActiva?"#EFF6FF":(esHoy?"#EFF6FF":(isEven?"#F9FAFB":"#FFFFFF"));
              const td={padding:"8px 10px",fontSize:"13px",borderBottom:"1px solid #CBD5E1",borderRight:"1px solid #E2E8F0",verticalAlign:"top",color:"#161616",lineHeight:1.4,...(esHoy?{fontWeight:"600"}:{})};
              const cs=(ci,base={})=>({...td,...base,...(celdaActiva?.fila===fi&&celdaActiva?.col===ci?{background:"#DBEAFE",outline:"2px solid #1A6FD4",outlineOffset:"-2px"}:{})});
              return (
                <tr id={`grilla-evento-${ev.fecha_inicio?.slice(0,10)}`} key={ev.id}
                  style={{background:rowBg,cursor:"default"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#EFF6FF"}
                  onMouseLeave={e=>e.currentTarget.style.background=rowBg}>
                  <td data-celda={`${fi}-0`} onClick={()=>setCeldaActiva({fila:fi,col:0})}
                    style={{...td,padding:"4px",textAlign:"center",position:"sticky",left:0,zIndex:1,background:celdaActiva?.fila===fi&&celdaActiva?.col===0?"#DBEAFE":(esFilaActiva?"#EFF6FF":(esHoy?"#EFF6FF":(isEven?"#F9FAFB":"#FFFFFF"))),outline:celdaActiva?.fila===fi&&celdaActiva?.col===0?"2px solid #1A6FD4":"none",outlineOffset:"-2px"}}>
                    <div onClick={e=>{e.stopPropagation();esMultidia?onVerMultidia(ev.id):onAbrir(ev);}} title="Abrir evento"
                      style={{display:"flex",alignItems:"center",justifyContent:"center",width:"32px",height:"32px",borderRadius:"6px",background:"#EFF6FF",color:"#1A6FD4",cursor:"pointer",border:"1px solid #BFDBFE",fontSize:"16px",margin:"auto"}}>
                      📋
                    </div>
                  </td>
                  <td data-celda={`${fi}-1`} onClick={()=>setCeldaActiva({fila:fi,col:1})} style={esHoy?cs(1,{borderLeft:"4px solid #22C55E"}):cs(1)}>{mesStr}</td>
                  <td data-celda={`${fi}-2`} onClick={()=>setCeldaActiva({fila:fi,col:2})} style={cs(2)}>{ev.nro_oc||""}</td>
                  <td data-celda={`${fi}-3`} onClick={()=>setCeldaActiva({fila:fi,col:3})} style={cs(3,{fontWeight:600})}>{cli?.nombre_empresa||"—"}</td>
                  <td data-celda={`${fi}-4`} onClick={()=>setCeldaActiva({fila:fi,col:4})} style={cs(4)}>{contactoNombre}</td>
                  <td data-celda={`${fi}-5`} onClick={()=>setCeldaActiva({fila:fi,col:5})} style={cs(5,{textAlign:"center"})}>{ri}</td>
                  <td data-celda={`${fi}-6`} onClick={()=>setCeldaActiva({fila:fi,col:6})} style={cs(6)}>{detalleEq}</td>
                  <td data-celda={`${fi}-7`} onClick={()=>setCeldaActiva({fila:fi,col:7})} style={cs(7)}>{provNom}</td>
                  <td data-celda={`${fi}-8`} onClick={()=>setCeldaActiva({fila:fi,col:8})} style={cs(8)}>{detalleInst}</td>
                  <td data-celda={`${fi}-9`} onClick={()=>setCeldaActiva({fila:fi,col:9})} style={cs(9)}>{LBL_MODAL[ev.modalidad]||ev.modalidad||""}</td>
                  <td data-celda={`${fi}-10`} onClick={()=>setCeldaActiva({fila:fi,col:10})} style={cs(10)}>{tiposArr(ev.tipo).join(", ")}</td>
                  <td data-celda={`${fi}-11`} onClick={()=>setCeldaActiva({fila:fi,col:11})} style={cs(11)}>{ev.nombre_evento||""}</td>
                  <td data-celda={`${fi}-12`} onClick={()=>setCeldaActiva({fila:fi,col:12})} style={cs(12)}>{ev.lugar||""}</td>
                  <td data-celda={`${fi}-13`} onClick={()=>setCeldaActiva({fila:fi,col:13})} style={cs(13)}>{par?.descripcion||""}</td>
                  <td data-celda={`${fi}-14`} onClick={()=>setCeldaActiva({fila:fi,col:14})} style={cs(14)}>{pluralizarJornada(ev.jornada)||""}</td>
                  <td data-celda={`${fi}-15`} onClick={()=>setCeldaActiva({fila:fi,col:15})} style={cs(15,{whiteSpace:"nowrap"})}>{ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)}</td>
                  <td data-celda={`${fi}-16`} onClick={()=>setCeldaActiva({fila:fi,col:16})} style={cs(16,{whiteSpace:"nowrap"})}>{formatCorto(ev.fecha_inicio)}</td>
                  <td data-celda={`${fi}-17`} onClick={()=>setCeldaActiva({fila:fi,col:17})} style={cs(17,{whiteSpace:"nowrap"})}>{formatCorto(ev.fecha_termino)}</td>
                  <td data-celda={`${fi}-18`} onClick={()=>setCeldaActiva({fila:fi,col:18})} style={cs(18)}>{ev.comentarios||""}</td>
                  <td data-celda={`${fi}-19`} onClick={()=>setCeldaActiva({fila:fi,col:19})} style={cs(19)}>{i1N}</td>
                  <td data-celda={`${fi}-20`} onClick={()=>setCeldaActiva({fila:fi,col:20})} style={cs(20)}>{a1?.nro_ot||""}</td>
                  <td data-celda={`${fi}-21`} onClick={()=>setCeldaActiva({fila:fi,col:21})} style={cs(21)}>{a1?.nro_boleta||""}</td>
                  <td data-celda={`${fi}-22`} onClick={()=>setCeldaActiva({fila:fi,col:22})} style={cs(22)}>{i2N}</td>
                  <td data-celda={`${fi}-23`} onClick={()=>setCeldaActiva({fila:fi,col:23})} style={cs(23)}>{a2?.nro_ot||""}</td>
                  <td data-celda={`${fi}-24`} onClick={()=>setCeldaActiva({fila:fi,col:24})} style={cs(24)}>{ev.nro_boleta_2||""}</td>
                </tr>
              );
            })}
          </tbody>
        ))}
        {mesesFiltro.size>0&&(()=>{
          const totalBoleta1=filtered.reduce((sum,r)=>sum+(Number(r.a1?.nro_boleta)||0),0);
          const totalBoleta2=filtered.reduce((sum,r)=>sum+(Number(r.ev.nro_boleta_2)||0),0);
          const totalBoletas=totalBoleta1+totalBoleta2;
          return(
            <tfoot>
              <tr style={{background:"#EFF6FF",borderTop:"2px solid #1A6FD4"}}>
                <td colSpan={20} style={{padding:"8px 12px",fontSize:"12px",fontWeight:"600",color:"#1A6FD4",textAlign:"right"}}>Total Boletas Intérprete 1:</td>
                <td style={{padding:"8px 12px",fontSize:"13px",fontWeight:"700",color:"#1A6FD4"}}>{totalBoleta1>0?totalBoleta1.toLocaleString("es-CL"):"—"}</td>
                <td colSpan={3}/>
              </tr>
              <tr style={{background:"#EFF6FF"}}>
                <td colSpan={23} style={{padding:"8px 12px",fontSize:"12px",fontWeight:"600",color:"#1A6FD4",textAlign:"right"}}>Total Boletas Intérprete 2:</td>
                <td style={{padding:"8px 12px",fontSize:"13px",fontWeight:"700",color:"#1A6FD4"}}>{totalBoleta2>0?totalBoleta2.toLocaleString("es-CL"):"—"}</td>
              </tr>
              <tr style={{background:"#DBEAFE",borderTop:"1px solid #93C5FD"}}>
                <td colSpan={23} style={{padding:"10px 12px",fontSize:"13px",fontWeight:"700",color:"#1D4ED8",textAlign:"right"}}>TOTAL BOLETAS DEL MES:</td>
                <td style={{padding:"10px 12px",fontSize:"14px",fontWeight:"800",color:"#1D4ED8"}}>{totalBoletas>0?totalBoletas.toLocaleString("es-CL"):"—"}</td>
              </tr>
            </tfoot>
          );
        })()}
      </table>
      </div>
    </div>
  );
}

// ─── VISTA AGENDA (F8) ───────────────────────────────────────────────────────
function VistaAgenda({eventos,clientes,interpretes,pares,proveedores=[],lugares=[],filtros,setFiltros,onAbrir,onVerMultidia,vista}) {
  const hoyISO=hoy();
  const sorted=[...eventos].sort((a,b)=>a.fecha_inicio.localeCompare(b.fecha_inicio));
  const byDay={};
  sorted.forEach(ev=>{
    const ini=desdeISO(ev.fecha_inicio);
    const fin=desdeISO(ev.fecha_termino||ev.fecha_inicio);
    let cur=new Date(ini);
    while(cur<=fin){
      const key=toISO(cur);
      if(!byDay[key])byDay[key]=[];
      byDay[key].push(ev);
      cur.setDate(cur.getDate()+1);
    }
  });
  if(!byDay[hoyISO])byDay[hoyISO]=[];
  const fechas=Object.keys(byDay).sort();
  useEffect(()=>{if(vista!=="agenda")return;setTimeout(()=>{const hoy=new Date();const idHoy=`agenda-dia-${hoy.getFullYear()}-${hoy.getMonth()}-${hoy.getDate()}`;let el=document.getElementById(idHoy);if(!el){const todos=Array.from(document.querySelectorAll("[id^='agenda-dia-']"));const hoyMs=new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate()).getTime();el=todos.find(e=>{const parts=e.id.replace("agenda-dia-","").split("-");const fechaEl=new Date(Number(parts[0]),Number(parts[1]),Number(parts[2])).getTime();return fechaEl>=hoyMs;})||todos[0];}if(el){const offset=160;const top=el.getBoundingClientRect().top+window.scrollY-offset;window.scrollTo({top,behavior:"instant"});}},300);},[vista]);
  return (
    <div style={{padding:"16px 24px 80px",width:"100%",maxWidth:"100%"}}>
      {!fechas.length&&<div style={{textAlign:"center",padding:"80px 20px",color:"#fff"}}>
        <div style={{fontSize:"18px",marginBottom:"12px"}}>📅</div>
        <div style={{fontWeight:"500",fontSize:"14px",color:"#fff"}}>No hay eventos que mostrar</div>
      </div>}
      {fechas.map(fecha=>{
        const evs=byDay[fecha];
        const esHoy=fecha===hoyISO;
        const d=desdeISO(fecha);
        const idDia=`agenda-dia-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        return (
          <div key={fecha} id={idDia} data-fecha={fecha} style={{marginBottom:"32px"}}>
            <div style={{position:"sticky",top:"140px",zIndex:10,background:esHoy?"rgba(34,197,94,0.18)":"rgba(26,47,90,0.97)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",color:"#fff",fontSize:"14px",fontWeight:"500",padding:"10px 16px",borderRadius:"8px",margin:"16px 0 8px",letterSpacing:"0.03em",border:esHoy?"1px solid rgba(34,197,94,0.4)":"1px solid rgba(255,255,255,0.12)"}}>
              {esHoy?"📅 Hoy — ":""}{formatLargo(fecha)} · {evs.length} evento{evs.length!==1?"s":""}
            </div>
            {evs.length===0
              ?<div style={{padding:"16px 20px",color:"#646870",fontSize:"14px",fontStyle:"normal",display:"flex",alignItems:"center",gap:"8px",background:"#FAFAFA",borderRadius:"8px",border:"1px dashed #E5E7EB",marginBottom:"8px"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B9E4B" strokeWidth="2.9"><circle cx="12" cy="12" r="10"/></svg>Sin eventos este día</div>
              :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginTop:"12px"}}>
                {evs.map(ev=>(
                  <EventCard key={ev.id} ev={ev} diaDe={fecha} clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} lugares={lugares} onClick={()=>onAbrir(ev)} onVerMultidia={onVerMultidia} pillsHalf={true} agendaSmall={true}/>
                ))}
              </div>
            }
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

// ─── MODAL NUEVO LUGAR ─────────────────────────────────────────────────────────
function ModalNuevoLugar({onGuardado,onCerrar}) {
  const TIPOS=[
    {v:"hotel",l:"Hotel"},{v:"centro_eventos",l:"Centro de eventos"},
    {v:"universidad",l:"Universidad"},{v:"edificio_corporativo",l:"Edificio corporativo"},
    {v:"oficina_cliente",l:"Oficina del cliente"},{v:"planta_produccion",l:"Planta de producción"},
    {v:"faena_minera",l:"Faena minera"},{v:"ministerio",l:"Ministerio"},
    {v:"edificio_gobierno",l:"Edificio de gobierno"},
  ];
  const CT={tipo:"",nombre:"",salon:"",espacio:"",tipo_espacio:"auditorio",piso:"",calle:"",numero:"",comuna:"",ciudad:"Santiago",pais:"Chile",otro:""};
  const [f,setFl]=useState(CT);
  const [guardando,setGuardando]=useState(false);
  const [error,setError]=useState("");
  const u=(k,v)=>setFl(x=>({...x,[k]:v}));
  const hasSalon=["hotel","centro_eventos"].includes(f.tipo);
  const hasUniv=f.tipo==="universidad";
  const hasPiso=["edificio_corporativo","oficina_cliente","edificio_gobierno"].includes(f.tipo);
  const computeNombre=()=>{
    let n=f.nombre.trim();if(!n)return"";
    if(hasSalon&&f.salon.trim())n+=`, Sala ${f.salon.trim()}`;
    if(hasUniv&&f.espacio.trim())n+=`, ${f.tipo_espacio==="auditorio"?"Auditorio ":""}${f.espacio.trim()}`;
    if(hasPiso&&f.piso.trim())n+=`, Piso ${f.piso.trim()}`;
    return n;
  };
  const computeDireccion=()=>{
    const pts=[f.calle.trim(),f.numero.trim(),f.comuna.trim(),f.ciudad.trim(),f.pais.trim()].filter(Boolean);
    let d=pts.join(", ");if(f.otro.trim())d+=(d?" · ":"")+f.otro.trim();return d;
  };
  const guardar=async()=>{
    const nombre=computeNombre();
    if(!nombre){setError("El nombre del lugar es obligatorio.");return;}
    setGuardando(true);setError("");
    const payload={nombre,activo:true};
    if(f.tipo)payload.tipo=f.tipo;
    const dir=computeDireccion();if(dir)payload.direccion=dir;
    const{data,error:err}=await sb.from("lugares").insert(payload).select().single();
    setGuardando(false);
    if(err){setError("Error al guardar: "+err.message);return;}
    onGuardado(data);
  };
  const INP={width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:"8px",fontSize:"14px",color:"#0F172A",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit",height:"42px"};
  const LBL={fontSize:"11px",fontWeight:"600",color:"#475569",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"5px",display:"block"};
  const GRP={marginBottom:"14px"};
  return(
    <div style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0,0,0,0.6)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",boxSizing:"border-box"}}>
      <div style={{background:"#FFFFFF",borderRadius:"16px",width:"100%",maxWidth:"540px",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 80px rgba(0,0,0,0.3)"}}>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{fontSize:"16px",fontWeight:"700",color:"#0F172A"}}>📍 Nuevo lugar</div>
          <button onClick={onCerrar} style={{background:"none",border:"none",cursor:"pointer",fontSize:"20px",color:"#64748B",padding:"4px",lineHeight:1}}>×</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          <div style={GRP}>
            <label style={LBL}>Tipo de lugar</label>
            <select style={{...INP,cursor:"pointer"}} value={f.tipo} onChange={e=>u("tipo",e.target.value)}>
              <option value="">Seleccionar…</option>
              {TIPOS.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
              <option value="otro">Otro</option>
            </select>
          </div>
          <div style={GRP}>
            <label style={LBL}>Nombre del lugar *</label>
            <input style={INP} autoFocus value={f.nombre} onChange={e=>u("nombre",e.target.value)} placeholder={
              f.tipo==="hotel"?"Marriott, Sheraton…":f.tipo==="centro_eventos"?"Centro de Convenciones…":
              f.tipo==="universidad"?"Universidad de Chile…":f.tipo==="ministerio"?"de Economía, de Salud…":"Nombre del lugar…"
            }/>
          </div>
          {hasSalon&&<div style={GRP}>
            <label style={LBL}>Nombre del salón</label>
            <input style={INP} value={f.salon} onChange={e=>u("salon",e.target.value)} placeholder="Salón Andes, Sala Principal…"/>
          </div>}
          {hasUniv&&<div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:"12px",...GRP}}>
            <div>
              <label style={LBL}>Tipo de espacio</label>
              <select style={{...INP,cursor:"pointer"}} value={f.tipo_espacio} onChange={e=>u("tipo_espacio",e.target.value)}>
                <option value="auditorio">Auditorio</option>
                <option value="sala">Sala</option>
                <option value="otro">Otro espacio</option>
              </select>
            </div>
            <div>
              <label style={LBL}>Nombre del espacio</label>
              <input style={INP} value={f.espacio} onChange={e=>u("espacio",e.target.value)} placeholder="Principal, Sala 301…"/>
            </div>
          </div>}
          {hasPiso&&<div style={GRP}>
            <label style={LBL}>Piso</label>
            <input style={{...INP,width:"120px"}} value={f.piso} onChange={e=>u("piso",e.target.value)} placeholder="Ej: 12"/>
          </div>}
          <div style={{background:"#F8FAFC",borderRadius:"10px",padding:"14px 16px",marginBottom:"14px"}}>
            <div style={{fontSize:"11px",fontWeight:"700",color:"#475569",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"12px"}}>Dirección</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 100px",gap:"10px",marginBottom:"10px"}}>
              <div><label style={LBL}>Calle</label><input style={INP} value={f.calle} onChange={e=>u("calle",e.target.value)} placeholder="Av. Kennedy"/></div>
              <div><label style={LBL}>Número</label><input style={INP} value={f.numero} onChange={e=>u("numero",e.target.value)} placeholder="4601"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
              <div><label style={LBL}>Comuna</label><input style={INP} value={f.comuna} onChange={e=>u("comuna",e.target.value)} placeholder="Las Condes"/></div>
              <div><label style={LBL}>Ciudad</label><input style={INP} value={f.ciudad} onChange={e=>u("ciudad",e.target.value)}/></div>
            </div>
            <div><label style={LBL}>País</label><input style={{...INP,width:"160px"}} value={f.pais} onChange={e=>u("pais",e.target.value)}/></div>
          </div>
          <div style={GRP}>
            <label style={LBL}>Otro / información adicional</label>
            <textarea style={{...INP,height:"auto",minHeight:"58px",resize:"vertical",lineHeight:1.5}} value={f.otro} onChange={e=>u("otro",e.target.value)} placeholder="Estacionamiento, acceso, referencia…"/>
          </div>
          {error&&<div style={{color:"#EF4444",fontSize:"13px",marginBottom:"10px"}}>{error}</div>}
        </div>
        <div style={{padding:"16px 24px",borderTop:"1px solid #E2E8F0",display:"flex",gap:"10px",justifyContent:"flex-end",flexShrink:0}}>
          <button onClick={onCerrar} style={S.btnCancel}>Cancelar</button>
          <button onClick={guardar} disabled={guardando} style={S.btnA}>{guardando?"Guardando…":"💾 Guardar lugar"}</button>
        </div>
      </div>
    </div>
  );
}

function VistaDisponibilidad({ eventos, interpretes, pares, clientes=[], onAbrir, busqueda="" }) {
  const [mesOff, setMesOff] = useState(0);
  const [popover, setPopover] = useState(null);
  const hoyFecha = new Date();
  const base = new Date(hoyFecha.getFullYear(), hoyFecha.getMonth() + mesOff, 1);
  const año = base.getFullYear();
  const mes = base.getMonth();
  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  const { ocupacion, colorMap } = useMemo(() => {
    const ocu = {};  // [interpId][dNum] = { am:[{ev_id,nombre,cliNombre,hora,ev}], pm:[...] }
    const clrMap = {};

    // Build color map
    for (const ev of eventos) {
      for (const a of (ev.asignaciones||[])) {
        if (a.interprete_id && a.par_id && !clrMap[a.interprete_id]) {
          const par = pares.find(p => p.id === a.par_id);
          if (par) clrMap[a.interprete_id] = IDIOMA_PILL_CLR[par.idioma_origen] || "#1A6FD4";
        }
      }
      for (const dia of (ev.evento_dias||[])) {
        for (const a of (dia.asignaciones_dia||[])) {
          if (a.interprete_id && a.par_id && !clrMap[a.interprete_id]) {
            const par = pares.find(p => p.id === a.par_id);
            if (par) clrMap[a.interprete_id] = IDIOMA_PILL_CLR[par.idioma_origen] || "#1A6FD4";
          }
        }
      }
    }

    const addItem = (interpId, dNum, item, hora) => {
      if (!ocu[interpId]) ocu[interpId] = {};
      if (!ocu[interpId][dNum]) ocu[interpId][dNum] = { am:[], pm:[] };
      const slot = (!hora || hora.slice(0,5) < "13:00") ? "am" : "pm";
      const list = ocu[interpId][dNum][slot];
      if (!list.find(x => x.ev_id === item.ev_id)) list.push({ ...item, hora });
    };

    for (const ev of eventos) {
      const cli = clientes.find(c => c.id === ev.cliente_id);
      const item = { ev_id: ev.id, nombre: ev.nombre_evento || "(sin nombre)", cliNombre: cli?.nombre_empresa || "", ev };
      if (ev.asignaciones?.length) {
        const fi = new Date(ev.fecha_inicio + 'T12:00:00');
        const ft = new Date((ev.fecha_termino || ev.fecha_inicio) + 'T12:00:00');
        const cur = new Date(fi);
        while (cur <= ft) {
          if (cur.getFullYear() === año && cur.getMonth() === mes) {
            const dNum = cur.getDate();
            for (const a of ev.asignaciones) {
              if (a.interprete_id) addItem(a.interprete_id, dNum, item, ev.hora_inicio);
            }
          }
          cur.setDate(cur.getDate() + 1);
        }
      }
      for (const dia of (ev.evento_dias||[])) {
        if (!dia.fecha || !dia.asignaciones_dia?.length) continue;
        const dDate = new Date(dia.fecha + 'T12:00:00');
        if (dDate.getFullYear() === año && dDate.getMonth() === mes) {
          const dNum = dDate.getDate();
          const horaD = dia.hora_inicio || ev.hora_inicio;
          for (const a of dia.asignaciones_dia) {
            if (a.interprete_id) addItem(a.interprete_id, dNum, item, horaD);
          }
        }
      }
    }
    return { ocupacion: ocu, colorMap: clrMap };
  }, [eventos, pares, clientes, año, mes]);

  const interpsActivos = interpretes.filter(i => {
    if(i.activo===false) return false;
    if(!busqueda.trim()) return true;
    const b=busqueda.toLowerCase().trim();
    return (`${i.nombre||""} ${i.apellido||""}`).toLowerCase().includes(b);
  });
  const dias = Array.from({ length: diasEnMes }, (_, i) => i + 1);
  const btnNav = { background:"rgba(255,255,255,0.15)", color:"#FFFFFF", border:"none", borderRadius:"8px", padding:"7px 14px", fontSize:"15px", cursor:"pointer", fontFamily:"inherit" };

  const openPopover = (e, interpId, d) => {
    e.stopPropagation();
    const slot = ocupacion[interpId]?.[d] || { am:[], pm:[] };
    const items = [...slot.am, ...slot.pm];
    if (!items.length) return;
    const rect = e.currentTarget.closest("td").getBoundingClientRect();
    setPopover({ items, d, x: Math.min(rect.left, window.innerWidth - 290), y: Math.min(rect.bottom + 6, window.innerHeight - 220) });
  };

  const SlotCell = ({ items, label }) => {
    const ocupado = items.length > 0;
    const item = items[0];
    const tooltip = ocupado ? (item.cliNombre ? `${item.cliNombre} · ${item.nombre}` : item.nombre) : "";
    return (
      <div title={tooltip} style={{ height:"21px", display:"flex", alignItems:"center", gap:"3px", padding:"0 4px", background: ocupado ? "#FFEDD5" : "transparent", cursor: ocupado ? "pointer" : "default" }}>
        <span style={{ fontSize:"10px", fontWeight:"700", color: ocupado ? "#92400E" : "rgba(255,255,255,0.45)", flexShrink:0, minWidth:"12px", lineHeight:1 }}>{label}</span>
        {ocupado && (
          <div style={{ width:"13px", height:"13px", borderRadius:"50%", background:"#F97316", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:"auto" }}>
            <span style={{ fontSize:"10px", color:"#fff", fontWeight:"900", lineHeight:1 }}>×</span>
          </div>
        )}
        {!ocupado && (
          <div style={{ width:"13px", height:"13px", borderRadius:"50%", background:"#22C55E", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <polyline points="1.5,6 4.5,9 10.5,3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding:"28px 24px" }} onClick={() => setPopover(null)}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
        <button onClick={()=>setMesOff(o=>o-1)} style={btnNav} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>← Ant</button>
        <button onClick={()=>setMesOff(0)} style={btnNav} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>Hoy</button>
        <button onClick={()=>setMesOff(o=>o+1)} style={btnNav} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>Sig →</button>
        <span style={{ color:"#FFFFFF", fontSize:"20px", fontWeight:"600", marginLeft:"6px" }}>{MESES[mes]} {año}</span>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ borderCollapse:"collapse", fontSize:"12px", minWidth:"max-content" }}>
          <thead>
            <tr>
              <th style={{ padding:"6px 14px", textAlign:"left", color:"#FFFFFF", fontWeight:"700", fontSize:"14.4px", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"1px solid rgba(255,255,255,0.15)", position:"sticky", left:0, background:"#162654", zIndex:2, whiteSpace:"nowrap" }}>Intérprete</th>
              {dias.map(d=>(
                <th key={d} style={{ padding:"4px 2px", textAlign:"center", color:"rgba(255,255,255,0.65)", fontWeight:"500", borderBottom:"1px solid rgba(255,255,255,0.15)", minWidth:"54px", fontSize:"11px" }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {interpsActivos.map((interp, idx)=>(
              <tr key={interp.id} style={{ background: idx%2===0 ? "rgba(255,255,255,0.03)" : "transparent" }}>
                <td style={{ padding:"5px 14px", color:"#FFFFFF", fontWeight:"500", borderBottom:"2px solid rgba(255,255,255,0.22)", position:"sticky", left:0, background: idx%2===0 ? "rgba(22,40,76,0.98)" : "rgba(18,32,60,0.98)", zIndex:1, whiteSpace:"nowrap", fontSize:"13px", verticalAlign:"middle" }}>
                  {interp.nombre}{interp.apellido?" "+interp.apellido:""}
                </td>
                {dias.map(d=>{
                  const slot = ocupacion[interp.id]?.[d] || { am:[], pm:[] };
                  const anyOcupado = slot.am.length > 0 || slot.pm.length > 0;
                  return (
                    <td key={d} onClick={anyOcupado ? e=>openPopover(e, interp.id, d) : undefined}
                      style={{ padding:"1px 1px", borderBottom:"2px solid rgba(255,255,255,0.22)", borderLeft:"1px solid rgba(255,255,255,0.06)", verticalAlign:"middle", cursor: anyOcupado ? "pointer" : "default" }}>
                      <SlotCell items={slot.am} label="AM"/>
                      <div style={{ height:"1px", background:"rgba(255,255,255,0.08)" }}/>
                      <SlotCell items={slot.pm} label="PM"/>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {interpsActivos.length===0 && <div style={{ color:"rgba(255,255,255,0.5)", textAlign:"center", marginTop:"40px", fontSize:"15px" }}>No hay intérpretes activos.</div>}

      {popover && (
        <div onClick={e=>e.stopPropagation()} style={{ position:"fixed", top:popover.y, left:popover.x, zIndex:9999, background:"#FFFFFF", borderRadius:"10px", boxShadow:"0 4px 24px rgba(0,0,0,0.25)", border:"1px solid #E5E7EB", minWidth:"240px", maxWidth:"300px", padding:"12px 14px" }}>
          <div style={{ fontSize:"11px", fontWeight:"700", color:"#64748B", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:"8px" }}>Día {popover.d}</div>
          {popover.items.map((item, i) => (
            <div key={i} onClick={()=>{ if(onAbrir&&item.ev){onAbrir(item.ev);setPopover(null);} }}
              style={{ padding:"7px 10px", marginBottom:"4px", background:"#F8FAFC", borderRadius:"7px", cursor:onAbrir?"pointer":"default", border:"1px solid #E2E8F0" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#EFF6FF"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#F8FAFC"; }}>
              {item.cliNombre && <div style={{ fontSize:"12px", fontWeight:"600", color:"#1E293B" }}>{item.cliNombre}</div>}
              <div style={{ fontSize:"11px", color:"#475569" }}>{item.nombre}</div>
              {item.hora && <div style={{ fontSize:"10px", color:"#94A3B8", marginTop:"2px" }}>🕐 {item.hora.slice(0,5)}</div>}
            </div>
          ))}
          <div onClick={()=>setPopover(null)} style={{ textAlign:"center", fontSize:"11px", color:"#9CA3AF", marginTop:"4px", cursor:"pointer", paddingTop:"4px", borderTop:"1px solid #F1F5F9" }}>Cerrar</div>
        </div>
      )}
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
  const [semanaOff,setSemanaOff]=useState(()=>{const d=new Date().getDay();return(d===0||d===6)?1:0;});
  const [mesOff,setMesOff]=useState(0);
  const [diaActual,setDiaActual]=useState(hoy());
  const [modoMultidia,setModoMultidia]=useState(false);
  const [eventoMultidiaId,setEventoMultidiaId]=useState(null);
  const [diaMultidiaSeleccionado,setDiaMultidiaSeleccionado]=useState(0);
  const [vistaAnterior,setVistaAnterior]=useState("semana");
  const [pantalla,setPantalla]=useState("calendario");
  const [modalEvento,setModalEvento]=useState(null);
  const [modalDetalle,setModalDetalle]=useState(null);
  const [modalFicha,setModalFicha]=useState(null);
  const [modalFichasMultiples,setModalFichasMultiples]=useState(null);
  const [modalNuevoCli,setModalNuevoCli]=useState(false);
  const [modalNuevoInt,setModalNuevoInt]=useState(null);
  const [modalNuevoContacto,setModalNuevoContacto]=useState(null);
  const [modalNuevoLugar,setModalNuevoLugar]=useState(null);
  // Búsqueda, filtros y toasts
  const [busqueda,setBusqueda]=useState("");
  const [buscando,setBuscando]=useState(false);
  const [filtros,setFiltros]=useState({estado:"",modalidad:"",tipo:"",interprete_id:"",cliente_id:"",par_id:"",proveedor_av:"",mes:""});
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
    if(evR.data) setEventos(evR.data.filter((e,i,a)=>a.findIndex(x=>x.id===e.id)===i));
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

  const clientesConEventos=useMemo(()=>{const ids=new Set(eventos.map(e=>e.cliente_id));return clientes.filter(c=>ids.has(c.id)).sort((a,b)=>(a.nombre_empresa||"").localeCompare(b.nombre_empresa||""));},[eventos,clientes]);
  const paresConEventos=useMemo(()=>{const ids=new Set(eventos.flatMap(e=>(e.asignaciones||[]).map(a=>a.par_id).filter(Boolean)));return pares.filter(p=>ids.has(p.id)).sort((a,b)=>(a.descripcion||"").localeCompare(b.descripcion||""));},[eventos,pares]);
  const proveedoresConEventos=useMemo(()=>{const ids=new Set(eventos.flatMap(e=>(e.evento_dias||[]).flatMap(d=>(d.equipos_dia||[]).map(eq=>eq.proveedor_id).filter(Boolean))));return proveedores.filter(p=>ids.has(p.id)).sort((a,b)=>(a.nombre||"").localeCompare(b.nombre||""));},[eventos,proveedores]);

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
    if(filtros.estado==="no_incluir") evs=evs.filter(e=>!e.estado);
    else if(filtros.estado) evs=evs.filter(e=>e.estado===filtros.estado);
    if(filtros.modalidad) evs=evs.filter(e=>e.modalidad===filtros.modalidad);
    if(filtros.tipo) evs=evs.filter(e=>tiposArr(e.tipo).includes(filtros.tipo));
    if(filtros.interprete_id) evs=evs.filter(e=>(e.asignaciones||[]).some(a=>String(a.interprete_id)===String(filtros.interprete_id)));
    if(filtros.cliente_id) evs=evs.filter(e=>String(e.cliente_id)===String(filtros.cliente_id));
    if(filtros.par_id) evs=evs.filter(e=>(e.asignaciones||[]).some(a=>String(a.par_id)===String(filtros.par_id)));
    if(filtros.proveedor_av) evs=evs.filter(e=>{const eqs=(e.evento_dias||[]).flatMap(d=>d.equipos_dia||[]);if(filtros.proveedor_av==="sin_proveedor")return eqs.length>0&&eqs.every(eq=>!eq.proveedor_id);return eqs.some(eq=>String(eq.proveedor_id)===String(filtros.proveedor_av));});
    if(filtros.mes&&filtros.mes!=="todos"){const m=Number(filtros.mes);evs=evs.filter(e=>new Date(e.fecha_inicio+"T12:00:00").getMonth()+1===m);}
    const seen=new Set();
    return evs.filter(e=>{if(seen.has(e.id))return false;seen.add(e.id);return true;});
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

  const exportarExcelFiltrado=()=>{
    const rows=eventosFiltrados.map(ev=>{
      const cli=clientes.find(c=>c.id===ev.cliente_id);
      const asigs=(ev.asignaciones||[]).map(a=>{const i=interpretes.find(x=>x.id===a.interprete_id);const p=pares.find(x=>x.id===a.par_id);return i?`${i.nombre}${i.apellido?" "+i.apellido:""}${p?" ("+p.descripcion+")":""}`:""}).filter(Boolean).join("; ");
      return{"Cliente":cli?.nombre_empresa||"","Evento":ev.nombre_evento||"","Tipo":ev.tipo||"","Modalidad":LBL_MODAL[ev.modalidad]||ev.modalidad,"Estado":ev.estado||"","Fecha inicio":ev.fecha_inicio,"Fecha término":ev.fecha_termino,"Hora inicio":ev.hora_inicio?.slice(0,5),"Hora término":ev.hora_termino?.slice(0,5),"Jornada":ev.jornada,"N° OC":ev.nro_oc||"","Lugar":ev.lugar||"","Plataforma":ev.plataforma||"","Intérpretes":asigs};
    });
    const ws=XLSX.utils.json_to_sheet(rows);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Eventos");
    XLSX.writeFile(wb,`MundoChile_${new Date().toISOString().slice(0,10)}_filtrado.xlsx`);
    addToast("Excel filtrado exportado","success");
  };

  const generarFichaMultiple=()=>{
    if(!eventosFiltrados.length){addToast("No hay eventos filtrados","error");return;}
    setModalFichasMultiples(eventosFiltrados);
  };

  const navAnterior=()=>{if(vista==="semana")setSemanaOff(o=>o-1);else if(vista==="mes")setMesOff(o=>o-1);else if(vista==="dia"){const d=desdeISO(diaActual);d.setDate(d.getDate()-1);setDiaActual(toISO(d));}};
  const navSiguiente=()=>{if(vista==="semana")setSemanaOff(o=>o+1);else if(vista==="mes")setMesOff(o=>o+1);else if(vista==="dia"){const d=desdeISO(diaActual);d.setDate(d.getDate()+1);setDiaActual(toISO(d));}};

  const tituloNav=()=>{
    if(vista==="semana"){const d=diasSemana;const capM=(m)=>MESES_L[m].charAt(0).toUpperCase()+MESES_L[m].slice(1);return `${d[0].getDate()} ${capM(d[0].getMonth())} – ${d[6].getDate()} ${capM(d[6].getMonth())} ${d[6].getFullYear()}`;}
    if(vista==="mes"){const n=new Date();n.setMonth(n.getMonth()+mesOff);return `${MESES_L[n.getMonth()].charAt(0).toUpperCase()+MESES_L[n.getMonth()].slice(1)} ${n.getFullYear()}`;}
    if(vista==="agenda") return "Agenda";
    if(vista==="grilla") return "Grilla";
    if(vista==="dia"&&modoMultidia&&eventoMultidiaId){const evM=eventosFiltrados.find(e=>e.id===eventoMultidiaId);const cli=clientes.find(c=>c.id===evM?.cliente_id);return `Evento Multidía — ${cli?.nombre_empresa||"—"}`;}
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

  const verTodosLosDias=(eventoId)=>{
    setVistaAnterior(vista);
    setEventoMultidiaId(eventoId);
    setDiaMultidiaSeleccionado(0);
    setModoMultidia(true);
    setVista("dia");
  };

  useEffect(()=>{if(vista!=="dia"){setModoMultidia(false);setEventoMultidiaId(null);}},[vista]);

  useEffect(()=>{
    if(!modoMultidia||diaMultidiaSeleccionado<1) return;
    const t=setTimeout(()=>{
      const hdr=document.querySelector('[data-multidia-header]');
      const off=136+(hdr?.offsetHeight||160)+8;
      const el=document.getElementById(`multidia-card-${diaMultidiaSeleccionado}`);
      if(el){const y=el.getBoundingClientRect().top+window.scrollY-off;window.scrollTo({top:Math.max(0,y),behavior:"smooth"});}
    },200);
    return()=>clearTimeout(t);
  },[modoMultidia,diaMultidiaSeleccionado]);

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
    const totalCeldas=Math.ceil((pri+total)/7)*7;
    const celdas=[];
    for(let i=0;i<totalCeldas;i++){
      const fecha=new Date(n.getFullYear(),n.getMonth(),1+(i-pri));
      celdas.push({fecha,esMes:fecha.getMonth()===n.getMonth()});
    }
    return (
      <div style={{padding:"16px 24px 80px",overflowX:"auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",minWidth:"800px"}}>
          {DIAS_SEM.map(d=><div key={d} style={{textAlign:"center",fontWeight:"500",fontSize:"15px",color:"#FFFFFF",padding:"8px 0",textTransform:"uppercase"}}>{d}</div>)}
          {celdas.map(({fecha,esMes},i)=>{
            const dia=fecha.getDate();
            const iso=`${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
            const evs=evsDia(iso),esHoy=iso===hoy();
            if(!esMes) return (
              <div key={i} onClick={()=>{setDiaActual(iso);setVista("dia");}}
                style={{minHeight:"90px",background:"#F3F4F6",borderRadius:"8px",padding:"8px",opacity:0.82,boxSizing:"border-box",cursor:"pointer"}}>
                <div style={{marginBottom:"4px",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                    <span style={{fontWeight:"400",fontSize:"15px",color:"#9CA3AF"}}>{dia}</span>
                    <span style={{fontWeight:"400",fontSize:"15px",color:"#C4C9D4"}}>{fecha.toLocaleDateString('es-CL',{weekday:'long'})}</span>
                  </div>
                  <span style={{fontSize:"13.5px",fontWeight:"400",fontStyle:"italic",color:"#C4C9D4"}}>{fecha.toLocaleDateString('es-CL',{month:'short'})}</span>
                </div>
                {evs.length>0&&<div style={{opacity:0.5}}>
                  {evs.slice(0,2).map((ev,j)=><div key={j} onClick={e=>{e.stopPropagation();abrirEvento(ev);}} style={{fontSize:"13px",fontWeight:"500",background:colorCliente(ev.cliente_id),color:"#fff",borderRadius:"4px",padding:"3px 8px",marginBottom:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clientes.find(c=>c.id===ev.cliente_id)?.nombre_empresa||ev.nombre_evento||"Evento"}</div>)}
                  {evs.length>2&&<div style={{fontSize:"13px",color:"#6B7280",fontWeight:"500",marginTop:"1px"}}>+{evs.length-2} más</div>}
                </div>}
              </div>
            );
            return <div key={i} onClick={()=>{setDiaActual(iso);setVista("dia");}}
              style={{minHeight:"90px",border:esHoy?"1.5px solid rgba(249,115,22,0.35)":"none",borderRadius:"8px",padding:"8px",cursor:"pointer",background:"#FFFFFF",boxSizing:"border-box"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"} onMouseLeave={e=>e.currentTarget.style.background="#FFFFFF"}>
              <div style={{marginBottom:"4px",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  {esHoy
                    ?<div style={{width:"26px",height:"26px",borderRadius:"50%",background:"#F97316",color:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"700",flexShrink:0}}>{dia}</div>
                    :<span style={{fontWeight:"700",fontSize:"15px",color:"#111827"}}>{dia}</span>
                  }
                  <span style={{fontWeight:"400",fontSize:"14px",color:"#6B7280"}}>{fecha.toLocaleDateString('es-CL',{weekday:'long'})}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  {esHoy&&evs.length>0&&<div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 6px #22C55E",flexShrink:0}}/>}
                  <span style={{fontSize:"13.5px",fontWeight:"400",fontStyle:"italic",color:"#9CA3AF"}}>{fecha.toLocaleDateString('es-CL',{month:'short'})}</span>
                </div>
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
    const hayFS=evsFinSemana.length>0;
    const nombresDia=["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"];

    const renderCol=(d,i,esWeekend=false)=>{
      const iso=toISO(d),evs=evsDia(iso),esHoy=iso===hoy();
      const mesLargo=MESES_L[d.getMonth()].charAt(0).toUpperCase()+MESES_L[d.getMonth()].slice(1);
      const colBg="rgba(255,255,255,0.14)";
      const hdrBg="rgba(255,255,255,0.10)";
      return <div key={`${esWeekend?"fs":"lf"}-${i}`} style={{background:colBg,borderRadius:"12px",padding:"10px",minHeight:"calc(100vh - 260px)"}}>
        <div onClick={()=>{setDiaActual(iso);setVista("dia");}} style={{padding:"8px 10px",borderRadius:"10px",marginBottom:"8px",background:hdrBg,cursor:"pointer",transition:"background 0.15s",border:esHoy?"3px solid #F97316":"none",textAlign:"center"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"}
          onMouseLeave={e=>{e.currentTarget.style.background=hdrBg;}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"7px",flexWrap:"nowrap"}}>
            <span style={{fontSize:"16px",fontWeight:"700",color:"#fff",textTransform:"uppercase",letterSpacing:"0.04em",flexShrink:0}}>{nombresDia[i]}</span>
            {esHoy
              ?<div style={{width:"30px",height:"30px",borderRadius:"50%",background:"#F97316",color:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",fontWeight:"700",flexShrink:0}}>{d.getDate()}</div>
              :<span style={{fontSize:"16px",fontWeight:"700",color:"#fff",flexShrink:0}}>{d.getDate()}</span>
            }
            <span style={{fontSize:"16px",fontWeight:"500",color:"rgba(255,255,255,0.90)",whiteSpace:"nowrap"}}>{mesLargo}</span>
          </div>
          {evs.length>0&&<div style={{display:"inline-block",background:"rgba(255,255,255,0.20)",color:"#fff",fontSize:"13px",fontWeight:"500",padding:"2px 10px",borderRadius:"20px",marginTop:"5px"}}>{evs.length} evento{evs.length!==1?"s":""}</div>}
        </div>
        {evs.map(ev=><EventCard key={ev.id} ev={ev} diaDe={iso} clientes={clientes} pares={pares} interpretes={interpretes} proveedores={proveedores} onClick={()=>abrirEvento(ev)} onNavegar={d=>{setDiaActual(d);setVista("dia");}} onVerMultidia={verTodosLosDias} solidPill/>)}
        {evs.length===0&&<div style={{textAlign:"center",color:esWeekend?"rgba(255,255,255,0.30)":"rgba(255,255,255,0.5)",fontWeight:"500",fontSize:"15px",padding:"20px 0"}}>Sin eventos</div>}
      </div>;
    };

    if(esMobile) return (
      <div style={{padding:"10px 12px 80px"}}>
        <div style={{display:"flex",gap:"8px",padding:"4px 4px 8px",alignItems:"center",position:"sticky",top:"136px",zIndex:40,background:"rgba(30,58,110,0.95)",backdropFilter:"blur(8px)",borderRadius:"10px",marginBottom:"4px"}}>
          <button onClick={()=>setPantalla("disponibilidad")} style={{flexShrink:0,display:"flex",alignItems:"center",gap:"6px",padding:"5.5px 12px",borderRadius:"10px",background:"rgba(253,230,138,0.12)",color:"#FDE68A",fontSize:"13px",fontWeight:"500",border:"1.5px solid #FCD34D",height:"29px",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",letterSpacing:"0.02em",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="20 6 9 17 4 12"/></svg>
            Disponibilidad
          </button>
          <div style={{flex:1}}/>
          {hayFS?<div style={{color:"rgba(255,255,255,0.70)",fontSize:"13px",fontStyle:"italic"}}>📅 {evsFinSemana.length} evento{evsFinSemana.length!==1?"s":""} este fin de semana</div>:<div style={{color:"rgba(255,255,255,0.65)",fontSize:"13px",fontStyle:"italic"}}>📅 Sin eventos este fin de semana</div>}
        </div>
        {diasLF.map((d,i)=>{
          const iso=toISO(d),evs=evsDia(iso),esHoy=iso===hoy();
          const mesLargo=MESES_L[d.getMonth()].charAt(0).toUpperCase()+MESES_L[d.getMonth()].slice(1);
          const colBg="rgba(255,255,255,0.20)";
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
            {evs.length>0&&<div style={{padding:"0 10px 10px"}}>{evs.map(ev=><EventCard key={ev.id} ev={ev} diaDe={iso} clientes={clientes} pares={pares} interpretes={interpretes} proveedores={proveedores} onClick={()=>abrirEvento(ev)} onNavegar={d=>{setDiaActual(d);setVista("dia");}} onVerMultidia={verTodosLosDias} solidPill/>)}</div>}
          </div>;
        })}
        {hayFS&&<div style={{height:"1px",background:"rgba(255,255,255,0.15)",margin:"8px 0"}}/>}
        {hayFS&&diasFS.map((d,i)=>{
          const iso=toISO(d),evs=evsDia(iso),esHoy=iso===hoy();
          const mesLargo=MESES_L[d.getMonth()].charAt(0).toUpperCase()+MESES_L[d.getMonth()].slice(1);
          const colBg="rgba(255,255,255,0.20)";
          return <div key={`fs-${i}`} style={{marginBottom:"10px",background:colBg,borderRadius:"12px",overflow:"hidden"}}>
            <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer"}} onClick={()=>{setDiaActual(iso);setVista("dia");}}>
              <div style={{textAlign:"center",minWidth:"54px"}}>
                <div style={{fontSize:"16px",fontWeight:"500",color:"#fff",textTransform:"uppercase",letterSpacing:"0.05em"}}>{nombresDia[i+5]}</div>
                <div style={{fontSize:"32px",fontWeight:"600",lineHeight:1,color:"#fff"}}>{d.getDate()}</div>
                <div style={{fontSize:"14px",color:"rgba(255,255,255,0.75)"}}>{mesLargo}</div>
              </div>
              <div style={{flex:1,color:"#fff",fontWeight:"500",fontSize:"17px"}}>{evs.length>0?`${evs.length} evento${evs.length!==1?"s":""}`:""}</div>
              <div style={{fontSize:"14px",color:"rgba(255,255,255,0.6)"}}>›</div>
            </div>
            {evs.length>0&&<div style={{padding:"0 10px 10px"}}>{evs.map(ev=><EventCard key={ev.id} ev={ev} diaDe={iso} clientes={clientes} pares={pares} interpretes={interpretes} proveedores={proveedores} onClick={()=>abrirEvento(ev)} onNavegar={d=>{setDiaActual(d);setVista("dia");}} onVerMultidia={verTodosLosDias} solidPill/>)}</div>}
          </div>;
        })}
      </div>
    );

    return (
      <div style={{padding:"16px 24px 80px"}}>
        <div style={{display:"flex",gap:"8px",padding:"6px 8px 6px",alignItems:"center",position:"sticky",top:"136px",zIndex:40,background:"rgba(30,58,110,0.95)",backdropFilter:"blur(8px)",borderRadius:"10px",marginBottom:"8px"}}>
          <button onClick={()=>setPantalla("disponibilidad")} style={{flexShrink:0,display:"flex",alignItems:"center",gap:"6px",padding:"5.5px 12px",borderRadius:"10px",background:"rgba(253,230,138,0.12)",color:"#FDE68A",fontSize:"13px",fontWeight:"500",border:"1.5px solid #FCD34D",height:"29px",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",letterSpacing:"0.02em",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="20 6 9 17 4 12"/></svg>
            Disponibilidad
          </button>
          <div style={{flex:1,display:"flex",justifyContent:"center"}}>
            {hayFS?<div style={{color:"rgba(255,255,255,0.70)",fontSize:"13px",fontStyle:"italic"}}>📅 {evsFinSemana.length} evento{evsFinSemana.length!==1?"s":""} este fin de semana</div>:<div style={{color:"rgba(255,255,255,0.65)",fontSize:"13px",fontStyle:"italic"}}>📅 Sin eventos este fin de semana</div>}
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center",visibility:hayFiltros?"visible":"hidden"}}>
            <button onClick={()=>setFiltros({estado:"",modalidad:"",tipo:"",interprete_id:"",cliente_id:"",par_id:"",proveedor_av:"",mes:""})} title="Limpiar filtros" style={{background:"#EF4444",color:"#FFFFFF",border:"none",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,fontWeight:700,flexShrink:0,padding:0,lineHeight:1}}>×</button>
            <button onClick={generarFichaMultiple} style={{display:"flex",alignItems:"center",gap:"4px",padding:"5px 12px",borderRadius:"12px",background:"#1A6FD4",color:"#FFFFFF",fontSize:"11px",fontWeight:"600",border:"none",height:"26px",boxShadow:"0 2px 4px rgba(26,111,212,0.3)",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>📋 Fichas</button>
            <button onClick={exportarExcelFiltrado} style={{display:"flex",alignItems:"center",gap:"4px",padding:"5px 12px",borderRadius:"12px",background:"#059669",color:"#FFFFFF",fontSize:"11px",fontWeight:"600",border:"none",height:"26px",boxShadow:"0 2px 4px rgba(5,150,105,0.3)",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>📊 Excel</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:hayFS?"repeat(7,minmax(0,1fr))":"repeat(5,minmax(0,1fr))",gap:"8px",padding:"8px",alignItems:"stretch"}}>
          {diasLF.map((d,i)=>renderCol(d,i,false))}
          {hayFS&&diasFS.map((d,i)=>renderCol(d,i+5,true))}
        </div>
      </div>
    );
  };

  // ── Vista DÍA ──
  const renderDia=()=>{
    const SLD=({t})=><div style={{fontSize:"13px",fontWeight:"600",color:"#0F172A",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"6px"}}>{t}</div>;
    const HRD=()=><hr style={{border:"none",borderTop:"1px solid #E5E7EB",margin:"14px 0"}}/>;
    const dk10=(hex)=>{const n=hex.replace("#","");const r=Math.round(parseInt(n.slice(0,2),16)*0.9);const g=Math.round(parseInt(n.slice(2,4),16)*0.9);const b=Math.round(parseInt(n.slice(4,6),16)*0.9);return`#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;};

    // ── Modo Multidía ──
    if(modoMultidia&&eventoMultidiaId){
      const evM=eventosFiltrados.find(e=>e.id===eventoMultidiaId);
      if(!evM){setModoMultidia(false);setEventoMultidiaId(null);return null;}
      const cli=clientes.find(c=>c.id===evM.cliente_id);
      const borderC=colorCliente(evM.cliente_id);
      const esPresD=evM.modalidad==="presencial"||evM.modalidad==="hibrido";
      const esZoomMCD=evM.plataforma==="Zoom MundoChile"||evM.plataforma==="Zoom";
      const bTipo=B_TIPO[tiposArr(evM.tipo)[0]]||{bg:"#EEF2FF",c:"#3B5BDB"};
      const bMod=B_MOD[evM.modalidad]||{bg:"#F7F7F5",c:"#565656"};
      const bEst=B_EST(evM.estado);
      const grupos={};
      const todasAsigsMD=[...(evM.asignaciones||[]),...(evM.evento_dias||[]).flatMap(d=>d.asignaciones_dia||[])];
      const seenMD=new Set();
      todasAsigsMD.forEach(a=>{
        const uid=`${a.interprete_id}-${a.par_id}`;
        if(seenMD.has(uid))return;
        seenMD.add(uid);
        const par=pares.find(p=>p.id===a.par_id);
        const interp=interpretes.find(x=>x.id===a.interprete_id);
        if(!interp)return;
        const key=par?.descripcion||"Sin par";
        const idioma=par?.idioma_origen||"";
        if(!grupos[key])grupos[key]={idioma,items:[]};
        grupos[key].items.push({interp,isHost:!!a.es_host_zoom,hora:a.hora_presentacion||null});
      });
      const grupoEntries=Object.entries(grupos);
      const ini=desdeISO(evM.fecha_inicio);
      const fin=desdeISO(evM.fecha_termino);
      const totalDias=Math.round((fin-ini)/86400000)+1;
      const dias=Array.from({length:totalDias},(_,i)=>{const d=new Date(ini.getTime()+i*86400000);return{iso:toISO(d),x:i+1};});
      return (
        <div style={{paddingBottom:"80px",margin:"0 auto",width:"100%",display:"flex",flexDirection:"row",alignItems:"flex-start"}}>
          <div data-multidia-header="" style={{width:"280px",flexShrink:0,position:"sticky",top:"136px",zIndex:50,background:"rgba(18,32,78,0.98)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",borderRight:"1px solid rgba(255,255,255,0.15)",overflowY:"auto",overflowX:"hidden",maxHeight:"calc(100vh - 136px)"}}>
            {/* Título + Volver inline */}
            <div style={{padding:"10px 12px 7px 17px",display:"flex",alignItems:"center",gap:"7px",flexWrap:"wrap"}}>
              <span style={{fontSize:"16px",fontWeight:"700",color:"#FFFFFF",whiteSpace:"normal",wordBreak:"break-word",overflow:"hidden",minWidth:0}}>🗓️ Evento Multidía</span>
              <span style={{fontSize:"16px",fontWeight:"600",color:"rgba(255,255,255,0.9)",whiteSpace:"normal",wordBreak:"break-word",overflow:"hidden",minWidth:0}}>{cli?.nombre_empresa||"—"}</span>
              <span style={{fontSize:"14px",color:"rgba(255,255,255,0.70)",whiteSpace:"normal",wordBreak:"break-word"}}>· {totalDias} días</span>
              <button onClick={()=>{setModoMultidia(false);setEventoMultidiaId(null);setVista(vistaAnterior);}} title="Volver" style={{marginLeft:"auto",display:"flex",alignItems:"center",justifyContent:"center",width:"31px",height:"31px",borderRadius:"50%",background:"rgba(255,255,255,0.15)",color:"#FFFFFF",border:"1px solid rgba(255,255,255,0.3)",cursor:"pointer",padding:0,flexShrink:0,fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.28)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
            </div>
            {/* Tabla agenda */}
            <div style={{margin:"0 12px 10px",borderRadius:"10px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.18)"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"rgba(255,255,255,0.12)"}}>
                  {["Día","Fecha","Horario","Jornada"].map(h=><th key={h} style={{padding:"5px 10px",textAlign:"left",fontSize:"12px",fontWeight:"600",color:"rgba(255,255,255,0.85)",letterSpacing:"0.05em",textTransform:"uppercase"}}>{h}</th>)}
                </tr></thead>
                <tbody>{dias.map(({iso,x})=>{
                  const ed=(evM.evento_dias||[]).find(d=>d.fecha===iso);
                  const hi=(ed?.hora_inicio||evM.hora_inicio)?.slice(0,5);
                  const ht=(ed?.hora_termino||evM.hora_termino)?.slice(0,5);
                  const jornada=pluralizarJornada(ed?.jornada||evM.jornada)||"";
                  return(<tr key={x} style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                    <td onClick={()=>{const hdr=document.querySelector('[data-multidia-header]');const off=136+(hdr?.offsetHeight||160)+8;const el=document.getElementById(`multidia-card-${x}`);if(el){const y=el.getBoundingClientRect().top+window.scrollY-off;window.scrollTo({top:Math.max(0,y),behavior:"smooth"});}}} style={{padding:"5px 10px",fontSize:"13px",fontWeight:"700",color:"#A3CEFD",whiteSpace:"nowrap",cursor:"pointer",textDecoration:"underline",textDecorationColor:"rgba(163,206,253,0.5)"}} onMouseEnter={e=>e.currentTarget.style.color="#BFDBFE"} onMouseLeave={e=>e.currentTarget.style.color="#A3CEFD"}>Día {x}</td>
                    <td style={{padding:"5px 10px",fontSize:"13px",color:"#FFFFFF",whiteSpace:"nowrap"}}>{formatLargo(iso)}</td>
                    <td style={{padding:"5px 10px",fontSize:"13px",color:"rgba(255,255,255,0.85)",whiteSpace:"nowrap"}}>{hi} – {ht} hrs</td>
                    <td style={{padding:"5px 10px",fontSize:"13px",color:"rgba(255,255,255,0.80)"}}>{jornada}</td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </div>
          <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",padding:"16px 8px 0",alignItems:"start"}}>
            {dias.map(({iso,x})=>{const diaEspecifico={...evM,fecha_inicio:iso,_diaNum:x};return(
              <div key={iso} id={`multidia-card-${x}`} onClick={()=>abrirEvento(diaEspecifico)} style={{background:"#FFFFFF",borderLeft:`16px solid ${borderC}`,borderTop:`6px solid ${borderC}`,borderRadius:"0 12px 12px 0",padding:"20px 29px",boxShadow:"0 2px 12px rgba(0,0,0,0.10)",cursor:"pointer",width:"100%"}}>
                <div onClick={(e)=>{e.stopPropagation();setDiaActual(iso);setModoMultidia(false);setEventoMultidiaId(null);setVista("dia");}} style={{fontSize:"15px",fontWeight:"700",color:"#C62828",marginBottom:"12px",cursor:"pointer",textDecoration:"underline",textDecorationColor:"rgba(198,40,40,0.35)"}} onMouseEnter={e=>e.currentTarget.style.color="#B71C1C"} onMouseLeave={e=>e.currentTarget.style.color="#C62828"}>📅 Día {x} de {totalDias} — {formatLargo(iso)}</div>
                <div style={{fontSize:"34px",fontWeight:"600",color:"#0F172A",lineHeight:1.2,marginBottom:4}}>{cli?.nombre_empresa||"—"}</div>
                {cli?.nombre_contacto&&<div style={{fontSize:"16px",fontWeight:"500",color:"#6B7280",fontStyle:"italic",marginBottom:4}}>Contacto: {cli.nombre_contacto}</div>}
                {(evM.nombre_evento||evM.titulo||evM.nombre||evM.descripcion)&&<div style={{fontSize:"16px",fontWeight:"500",color:"#111827",marginTop:2}}><span style={{fontWeight:"600",color:"#6B7280"}}>Nombre del evento: </span>{evM.nombre_evento||evM.titulo||evM.nombre||evM.descripcion}</div>}
                <HRD/>
                <div style={{fontSize:"17px",fontWeight:"500",color:"#1E293B",marginBottom:"4px"}}>📅 {formatMedioES(evM.fecha_inicio)} → {formatMedioES(evM.fecha_termino)}</div>
                <div style={{fontSize:"16px",fontWeight:"500",color:"#0F172A",marginBottom:"6px"}}>🕐 {evM.hora_inicio?.slice(0,5)} – {evM.hora_termino?.slice(0,5)} hrs{evM.jornada&&<span style={{fontWeight:"400",color:"#6B7280",fontSize:"14px"}}> · {pluralizarJornada(evM.jornada)}</span>}</div>
                <HRD/>
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center",marginBottom:"4px"}}>
                  {tiposArr(evM.tipo).map(t=>{const bt=B_TIPO[t]||{bg:"#1D4ED8",c:"#FFFFFF"};return(<span key={t} style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"5px 12px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",lineHeight:"1.4",color:bt.c,background:bt.bg,border:"none",whiteSpace:"nowrap"}}>{TIPO_ICON[t]} {t}</span>);})}
                  <span style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 12px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",lineHeight:"1.4",color:bMod.c,background:bMod.bg,border:"none",whiteSpace:"nowrap"}}>{MOD_ICON[evM.modalidad]||"💻"} {LBL_MODAL[evM.modalidad]||evM.modalidad}</span>
                </div>
                <HRD/>
                {esPresD&&evM.lugar&&<div style={{marginBottom:"12px"}}><SLD t="📍 Lugar"/><div style={{display:"flex",gap:6,flexWrap:"wrap"}}><span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 11px",borderRadius:6,fontSize:13,fontWeight:700,color:"#9A3A3A",background:"#FEF2F2",border:"2px solid #D34848",whiteSpace:"nowrap"}}>📍 {evM.lugar}</span>{evM.lugar_detalle&&<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 11px",borderRadius:6,fontSize:13,fontWeight:700,color:"#9A3A3A",background:"#FEF2F2",border:"2px solid #D34848",whiteSpace:"nowrap"}}>📍 {evM.lugar_detalle}</span>}</div></div>}
                {!esPresD&&evM.plataforma&&<div style={{marginBottom:"12px"}}><SLD t="💻 Plataforma"/><PlatformChip platform={evM.plataforma==="Zoom"?"Zoom MundoChile":evM.plataforma} isMundoChile={esZoomMCD} extra={esZoomMCD?evM.zoom_administrador:""}/></div>}
                {grupoEntries.length>0&&<div style={{marginBottom:"4px"}}>
                  <SLD t="🎙 Intérpretes"/>
                  {grupoEntries.map(([key,grupo])=>{
                    const pillClr=IDIOMA_PILL_CLR[grupo.idioma]||"#4C6EF5";
                    const hp=grupo.items.find(i=>i.hora)?.hora;
                    return(<div key={key} style={{marginBottom:"12px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}>
                        <span style={{fontSize:"12px",fontWeight:"600",color:pillClr,textTransform:"uppercase",letterSpacing:"0.06em"}}>{key}</span>
                        {hp&&<span style={{fontSize:"14px",color:"#4F5663",display:"flex",alignItems:"center",gap:"4px"}}>Hora de presentación intérprete{grupo.items.length!==1?"s":""}: 🕐 {hp.slice(0,5)} hrs</span>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
                        {grupo.items.map(({interp,isHost},i)=>(
                          <span key={i} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"5px",padding:"3px 8px",borderRadius:"20px",fontSize:"13px",fontWeight:"600",lineHeight:"1.4",color:"#1A1A1A",background:"#FFFFFF",border:`3px solid ${pillClr}`,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {isHost&&<span style={{fontSize:"11px"}}>🔑</span>}
                            <FlagImg idioma={grupo.idioma}/>
                            <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span>
                          </span>
                        ))}
                      </div>
                    </div>);
                  })}
                </div>}
                <HRD/>
                <div><SLD t="Información Contable"/>
                  <span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",lineHeight:"1.4",color:bEst.c,background:bEst.bg,border:`2px solid ${bEst.b||bEst.c}`,whiteSpace:"nowrap"}}>{evM.estado==="Facturado"?"✓ Facturado":"🟠 Facturación Pendiente"}</span>
                </div>
              </div>
            );})}
          </div>
        </div>
      );
    }

    const formatRangoCompacto=(f1,f2)=>{const d1=desdeISO(f1),d2=desdeISO(f2);if(d1.getMonth()===d2.getMonth()&&d1.getFullYear()===d2.getFullYear())return`${d1.getDate()} al ${d2.getDate()} de ${MESES_L[d2.getMonth()]} ${d2.getFullYear()}`;return`${d1.getDate()} ${MESES_L[d1.getMonth()]} al ${d2.getDate()} ${MESES_L[d2.getMonth()]} ${d2.getFullYear()}`;};
    const evs=evsDia(diaActual);
    return (
      <div style={{paddingTop:"16px",paddingBottom:"80px",paddingLeft:"24px",paddingRight:"24px",margin:"0 auto",maxWidth:"960px",width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
          <button onClick={()=>setVista(vistaAnterior)} style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"8px",background:"#F1F5F9",color:"#374151",border:"1px solid #94A3B8",cursor:"pointer",fontSize:"13px",fontWeight:"500",fontFamily:"inherit",flexShrink:0}} onMouseEnter={e=>{e.currentTarget.style.background="#E2E8F0";e.currentTarget.style.border="1px solid #64748B";}} onMouseLeave={e=>{e.currentTarget.style.background="#F1F5F9";e.currentTarget.style.border="1px solid #94A3B8";}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>Volver</button>
          <div style={{fontWeight:"500",fontSize:"14px",color:"#fff"}}>
            {formatLargo(diaActual)}<span style={{fontWeight:"400",color:"rgba(255,255,255,0.75)",fontSize:"16px",marginLeft:"12px"}}>{evs.length} evento{evs.length!==1?"s":""}</span>
          </div>
        </div>
        {evs.length===0
          ?<div style={{textAlign:"center",padding:"60px 20px",color:"rgba(255,255,255,0.7)",border:"2px dashed rgba(255,255,255,0.3)",borderRadius:"16px"}}><div style={{fontSize:"18px",marginBottom:"12px"}}>📅</div><div style={{fontWeight:"500",fontSize:"14px",color:"#fff"}}>Sin eventos este día</div></div>
          :<div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            {evs.map(ev=>{
              const cli=clientes.find(c=>c.id===ev.cliente_id);
              const borderC=colorCliente(ev.cliente_id);
              const esPresD=ev.modalidad==="presencial"||ev.modalidad==="hibrido";
              const esZoomMCD=ev.plataforma==="Zoom MundoChile"||ev.plataforma==="Zoom";
              const esMultidiaD=ev.fecha_inicio!==ev.fecha_termino;
              const bTipo=B_TIPO[tiposArr(ev.tipo)[0]]||{bg:"#EEF2FF",c:"#3B5BDB"};
              const bMod=B_MOD[ev.modalidad]||{bg:"#F7F7F5",c:"#565656"};
              const bEst=B_EST(ev.estado);
              let diaXdeY=null;
              if(esMultidiaD){const ini=desdeISO(ev.fecha_inicio);const col=desdeISO(diaActual);diaXdeY={x:Math.round((col-ini)/86400000)+1,y:Math.round((desdeISO(ev.fecha_termino)-ini)/86400000)+1};}
              const grupos={};
              const todasAsigsDia=[...(ev.asignaciones||[]),...(esMultidiaD?(ev.evento_dias||[]).flatMap(d=>d.asignaciones_dia||[]):[])];
              const seenDia=new Set();
              todasAsigsDia.forEach(a=>{
                const uid=`${a.interprete_id}-${a.par_id}`;
                if(seenDia.has(uid))return;
                seenDia.add(uid);
                const par=pares.find(p=>p.id===a.par_id);
                const interp=interpretes.find(x=>x.id===a.interprete_id);
                if(!interp) return;
                const key=par?.descripcion||"Sin par";
                const idioma=par?.idioma_origen||"";
                if(!grupos[key]) grupos[key]={idioma,items:[]};
                grupos[key].items.push({interp,isHost:!!a.es_host_zoom,hora:a.hora_presentacion||null});
              });
              const grupoEntries=Object.entries(grupos);
              return (
                <div key={ev.id} onClick={()=>abrirEvento(ev)} style={{background:"#FFFFFF",borderLeft:`16px solid ${borderC}`,borderTop:`6px solid ${borderC}`,borderRadius:"0 12px 12px 0",padding:"20px 24px",boxShadow:"0 2px 12px rgba(0,0,0,0.10)",cursor:"pointer"}}>
                  {/* Header full-width: nombre cliente + dots + pill multidía */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",flexWrap:"nowrap"}}>
                      <div style={{fontSize:"34px",fontWeight:"600",color:"#0F172A",lineHeight:1.2}}>{cli?.nombre_empresa||"—"}</div>
                      {(()=>{const hoyD=new Date();const manana=new Date();manana.setDate(hoyD.getDate()+1);const fechaEv=desdeISO(ev.fecha_inicio);const esHoyDot=fechaEv.toDateString()===hoyD.toDateString();const esManDot=fechaEv.toDateString()===manana.toDateString();if(!esHoyDot&&!esManDot)return null;return(<div style={{width:"12px",height:"12px",borderRadius:"50%",background:esHoyDot?"#22C55E":"#EAB308",boxShadow:esHoyDot?"0 0 8px #22C55E":"0 0 8px #EAB308",marginLeft:"16px",flexShrink:0}}/>);})()}
                    </div>
                    {diaXdeY&&<div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:20,background:"#E8F4FD",color:"#1971C2",fontSize:14,fontWeight:700,border:"1px solid #BAD7F0",whiteSpace:"nowrap",flexShrink:0}}>📅 Día {diaXdeY.x} de {diaXdeY.y}</div>}
                  </div>
                  {/* Dos columnas: info izquierda | intérpretes derecha */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",alignItems:"start"}}>
                    {/* Columna izquierda */}
                    <div>
                      <div style={{fontSize:"17px",fontWeight:"500",color:"#1E293B",marginBottom:"4px"}}>📅 {esMultidiaD?formatLargo(diaActual):formatLargo(ev.fecha_inicio)}</div>
                      <div style={{fontSize:"16px",fontWeight:"500",color:"#0F172A",marginBottom:"6px"}}>🕐 {ev.hora_inicio?.slice(0,5)} – {ev.hora_termino?.slice(0,5)} hrs{ev.jornada&&<span style={{fontWeight:"400",color:"#6B7280",fontSize:"14px"}}> · {pluralizarJornada(ev.jornada)}</span>}</div>
                      {cli?.nombre_contacto&&<div style={{fontSize:"15px",fontWeight:"500",color:"#6B7280",fontStyle:"italic",marginBottom:4}}>Contacto: {cli.nombre_contacto}</div>}
                      {ev.nombre_evento&&<div style={{fontSize:"14px",fontWeight:"500",color:"#374151",marginBottom:4}}>{ev.nombre_evento}</div>}
                      <HRD/>
                      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center",marginBottom:"4px"}}>
                        {tiposArr(ev.tipo).map(t=>{const bt=B_TIPO[t]||{bg:"#1D4ED8",c:"#FFFFFF"};return(<span key={t} style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"5px 12px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",lineHeight:"1.4",color:bt.c,background:bt.bg,border:"none",whiteSpace:"nowrap"}}>{TIPO_ICON[t]} {t}</span>);})}
                        <span style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 12px",borderRadius:"20px",fontSize:"14px",fontWeight:"500",lineHeight:"1.4",color:bMod.c,background:bMod.bg,border:"none",whiteSpace:"nowrap"}}>{MOD_ICON[ev.modalidad]||"💻"} {LBL_MODAL[ev.modalidad]||ev.modalidad}</span>
                      </div>
                      {(esPresD&&ev.lugar)||(!esPresD&&ev.plataforma)?<HRD/>:null}
                      {esPresD&&ev.lugar&&(()=>{const TL_={hotel:"Hotel",centro_eventos:"Centro de eventos",universidad:"Universidad",edificio_corporativo:"Edificio corporativo",oficina_cliente:"Oficina del cliente",planta_produccion:"Planta de producción",faena_minera:"Faena minera",ministerio:"Ministerio",edificio_gobierno:"Edificio de gobierno",otro:"Otro"};const lr=lugares.find(l=>ev.lugar===l.nombre||(l.tipo&&TL_[l.tipo]&&ev.lugar===TL_[l.tipo]+" – "+l.nombre));const disp=lr?(lr.tipo&&TL_[lr.tipo]?TL_[lr.tipo]+" "+lr.nombre:lr.nombre):ev.lugar;const dir=lr?.direccion||"";return<div style={{marginBottom:"8px"}}><div style={{display:"flex",gap:6,flexWrap:"wrap"}}><span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 11px",borderRadius:6,fontSize:13,fontWeight:700,color:"#9A3A3A",background:"#FEF2F2",border:"2px solid #D34848",whiteSpace:"nowrap"}}>📍 {disp}</span>{ev.lugar_detalle&&<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 11px",borderRadius:6,fontSize:13,fontWeight:700,color:"#9A3A3A",background:"#FEF2F2",border:"2px solid #D34848",whiteSpace:"nowrap"}}>📍 {ev.lugar_detalle}</span>}</div>{dir&&<div style={{marginTop:"5px",fontSize:"12px",fontWeight:"500",color:"#7A2929"}}>📌 {dir}</div>}</div>;})()}
                      {!esPresD&&ev.plataforma&&<div style={{marginBottom:"8px"}}><PlatformChip platform={ev.plataforma==="Zoom"?"Zoom MundoChile":ev.plataforma} isMundoChile={esZoomMCD} extra={esZoomMCD?ev.zoom_administrador:""}/></div>}
                      <HRD/>
                      <span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"500",lineHeight:"1.4",color:bEst.c,background:bEst.bg,border:`2px solid ${bEst.b||bEst.c}`,whiteSpace:"nowrap"}}>{ev.estado==="Facturado"?"✓ Facturado":"🟠 Facturación Pendiente"}</span>
                    </div>
                    {/* Columna derecha: intérpretes */}
                    <div>
                      <SLD t="🎙 Intérpretes"/>
                      {grupoEntries.length===0
                        ?<div style={{color:"#848B95",fontSize:14,fontStyle:"italic"}}>Sin intérpretes asignados</div>
                        :grupoEntries.map(([key,grupo])=>{
                          const pillClr=IDIOMA_PILL_CLR[grupo.idioma]||"#4C6EF5";
                          const hp=grupo.items.find(i=>i.hora)?.hora;
                          return(<div key={key} style={{marginBottom:"12px"}}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}>
                              <span style={{fontSize:"12px",fontWeight:"600",color:pillClr,textTransform:"uppercase",letterSpacing:"0.06em"}}>{key}</span>
                              {hp&&<span style={{fontSize:"13px",color:"#4F5663",display:"flex",alignItems:"center",gap:"4px"}}>🕐 {hp.slice(0,5)} hrs</span>}
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
                              {grupo.items.map(({interp,isHost},i)=>(
                                <span key={i} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"5px",padding:"3px 8px",borderRadius:"20px",fontSize:"13px",fontWeight:"600",lineHeight:"1.4",color:"#1A1A1A",background:"#FFFFFF",border:`3px solid ${pillClr}`,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  {isHost&&<span style={{fontSize:"11px"}}>🔑</span>}
                                  <FlagImg idioma={grupo.idioma}/>
                                  <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{interp.nombre}{interp.apellido?" "+interp.apellido:""}</span>
                                </span>
                              ))}
                            </div>
                          </div>);
                        })
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>
    );
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
    <div style={{fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",minHeight:"100vh",background:"linear-gradient(135deg, #1a2a4a 0%, #1e3a6e 50%, #2563a8 100%)",color:"#FFFFFF",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale",textRendering:"optimizeLegibility",overflowX:"clip"}}>
      {/* ── TOPBAR ── */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"#162654"}}>
        <div style={{padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"96px",gap:"14px"}}>
          {/* IZQUIERDA: logo + brand */}
          <div style={{display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
            <div style={{flexShrink:0,display:"flex",alignItems:"center"}}>
              <div style={{position:"relative",display:"inline-block"}}
                onMouseEnter={e=>{const t=e.currentTarget.querySelector(".logo-tooltip");if(t){t.style.visibility="visible";t.style.opacity="1";}}}
                onMouseLeave={e=>{const t=e.currentTarget.querySelector(".logo-tooltip");if(t){t.style.visibility="hidden";t.style.opacity="0";}}}>
                <div onClick={()=>{setVista("semana");setPantalla("calendario");}} title="HOME"
                  style={{width:"82px",height:"82px",borderRadius:"50%",background:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"center",padding:"2px",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",overflow:"hidden",cursor:"pointer"}}>
                  <img src={LOGO_SRC} alt="MundoChile" style={{width:"78px",height:"78px",objectFit:"contain",display:"block"}}/>
                </div>
                <span className="logo-tooltip" style={{visibility:"hidden",opacity:0,position:"absolute",bottom:"-28px",left:"50%",transform:"translateX(-50%)",background:"#1E293B",color:"#FFFFFF",fontSize:"11px",fontWeight:"500",padding:"3px 8px",borderRadius:"4px",whiteSpace:"nowrap",zIndex:100,transition:"opacity 0.2s",pointerEvents:"none"}}>HOME</span>
              </div>
            </div>
            <div>
              <div style={{fontWeight:"500",fontSize:"16px",color:"#FFFFFF",lineHeight:1,letterSpacing:"0.01em"}}>MundoChile</div>
              <div style={{fontSize:"13px",color:"rgba(255,255,255,0.70)",marginTop:"3px"}}>Translations & Interpreters · Since 2003</div>
            </div>
          </div>
          {/* CENTRO: tabs izquierda + pill derecho centrado */}
          {(pantalla==="calendario"||pantalla==="disponibilidad")&&<div style={{display:"flex",alignItems:"center",flex:1,minWidth:0,gap:"8px"}}>
            <div style={{display:"flex",gap:"4px",alignItems:"center",flexShrink:0}}>
              {[["semana","Semana"],["dia","Día"],["mes","Mes"],["agenda","Agenda"],["grilla","Grilla"]].map(([v,l])=>{
                const activo=pantalla==="calendario"&&vista===v;
                return(<button key={v} onClick={()=>{setVista(v);setPantalla("calendario");}} style={{padding:"6px 12px",background:activo?"#FFFFFF":"rgba(255,255,255,0.12)",border:"none",borderRadius:"8px",color:activo?"#1E3A6E":"#FFFFFF",fontWeight:activo?"600":"400",cursor:"pointer",fontSize:"13px",fontFamily:"inherit",transition:"all 0.15s",whiteSpace:"nowrap"}}>{l}</button>);
              })}
            </div>
            <div style={{flex:1,display:"flex",justifyContent:"center",alignItems:"center",minWidth:0,overflow:"hidden"}}>
              {pantalla==="calendario"&&vista==="agenda"&&(()=>{
                const semIni=toISO(diasSemana[0]);const semFin=toISO(diasSemana[6]);
                const n=eventosFiltrados.filter(e=>e.fecha_inicio<=semFin&&(e.fecha_termino||e.fecha_inicio)>=semIni).length;
                return(<div style={{padding:"6px 21px",border:"1px solid rgba(255,255,255,0.85)",borderRadius:"12px",background:"transparent",textAlign:"center",flexShrink:0}}>
                  <div style={{color:"#FFFFFF",fontSize:"17px",fontWeight:"550",lineHeight:1.3,whiteSpace:"nowrap"}}>{n} evento{n!==1?"s":""}</div>
                  <div style={{color:"rgba(255,255,255,0.70)",fontSize:"14px",whiteSpace:"nowrap"}}>esta semana</div>
                </div>);
              })()}
              {pantalla==="calendario"&&vista!=="agenda"&&vista!=="grilla"&&(()=>{
                const _t=tituloNav();
                const _fs=_t.length>40?11:_t.length>30?13:_t.length>22?15:17;
                return(
                <div style={{padding:"4.5px 16px",border:"1px solid rgba(255,255,255,0.85)",borderRadius:"9px",background:"transparent",textAlign:"center",minWidth:0,maxWidth:"100%"}}>
                  <div style={{color:"#FFFFFF",fontSize:`${_fs}px`,fontWeight:"500",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{_t}</div>
                  <div style={{color:"rgba(255,255,255,0.70)",fontSize:"13.5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{contadorSubtitulo()}</div>
                </div>);
              })()}
            </div>
          </div>}
          {/* DERECHA: nav + utilidades */}
          <div style={{display:"flex",gap:"6px",alignItems:"center",flexShrink:0}}>
            {pantalla==="calendario"&&vista!=="agenda"&&vista!=="grilla"&&<>
              <button onClick={navAnterior} style={{background:"rgba(255,255,255,0.15)",color:"#FFFFFF",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"15px",cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>← Ant</button>
              <button onClick={()=>{setSemanaOff(0);setMesOff(0);setDiaActual(hoy());}} style={{background:"rgba(255,255,255,0.15)",color:"#FFFFFF",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"15px",cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>Hoy</button>
              <button onClick={navSiguiente} style={{background:"rgba(255,255,255,0.15)",color:"#FFFFFF",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"15px",cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>Sig →</button>
            </>}
            {pantalla==="calendario"&&vista==="grilla"&&(()=>{const añoActual=new Date().getFullYear();const total=eventos.filter(ev=>ev.fecha_inicio&&new Date(ev.fecha_inicio).getFullYear()===añoActual).length;return(<div style={{textAlign:"right",marginRight:"6px"}}><span style={{fontSize:"13px",color:"rgba(255,255,255,0.75)",display:"block"}}>{total} evento{total!==1?"s":""} en {añoActual}</span></div>);})()}
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
        {vista!=="grilla"&&<div style={{position:"sticky",top:"96px",zIndex:90,background:"rgba(26,47,90,0.97)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderBottom:"1px solid rgba(255,255,255,0.10)",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px",boxSizing:"border-box",position:"sticky"}}>
          {/* CENTRO: FilterBar centrado */}
          <div style={{display:"flex",alignItems:"center",padding:"6px 0"}}>
            <FilterBar filters={filtros} onChange={setFiltros} interpreters={interpretes} clientes={clientesConEventos} pares={paresConEventos} proveedores={proveedoresConEventos} showClear={vista!=="semana"}/>
          </div>
          {/* DERECHA: Fichas/Excel fuera del flujo (no en semana, están en sub-bar) */}
          {vista!=="semana"&&<div style={{position:"absolute",right:"16px",top:"50%",transform:"translateY(-50%)",display:"flex",gap:"8px",transition:"opacity 0.2s, transform 0.2s",opacity:hayFiltros?1:0,pointerEvents:hayFiltros?"auto":"none",visibility:hayFiltros?"visible":"hidden"}}>
            <button onClick={generarFichaMultiple} style={{display:"flex",alignItems:"center",gap:"4px",padding:"5px 12px",borderRadius:"12px",background:"#1A6FD4",color:"#FFFFFF",fontSize:"11px",fontWeight:"600",border:"none",height:"26px",boxShadow:"0 2px 4px rgba(26,111,212,0.3)",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>📋 Fichas</button>
            <button onClick={exportarExcelFiltrado} style={{display:"flex",alignItems:"center",gap:"4px",padding:"5px 12px",borderRadius:"12px",background:"#059669",color:"#FFFFFF",fontSize:"11px",fontWeight:"600",border:"none",height:"26px",boxShadow:"0 2px 4px rgba(5,150,105,0.3)",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>📊 Excel</button>
          </div>}
        </div>}
        {vista==="semana"&&renderSemana()}
        {vista==="dia"&&renderDia()}
        {vista==="mes"&&renderMes()}
        {vista==="agenda"&&<VistaAgenda vista={vista} eventos={eventosFiltrados} clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} lugares={lugares} filtros={filtros} setFiltros={setFiltros} onAbrir={abrirEvento} onVerMultidia={verTodosLosDias}/>}
        {vista==="grilla"&&<VistaGrilla eventos={eventosFiltrados} clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} contactos={contactos} onAbrir={abrirEvento} onVerMultidia={verTodosLosDias} vista={vista}/>}
      </>}
      {pantalla==="disponibilidad"&&<VistaDisponibilidad eventos={eventos} interpretes={interpretes} pares={pares} clientes={clientes} onAbrir={abrirEvento} busqueda={busqueda}/>}
      {pantalla==="config"&&esAdmin&&<PantallaConfig clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} lugares={lugares} onActualizar={cargarDatos} perfil={perfil}/>}

      {/* ── MODALES ── */}
      {modalEvento&&<ModalEvento eventoInicial={modalEvento.data} clientes={clientes} interpretes={interpretes} pares={pares} proveedores={proveedores} lugares={lugares} contactos={contactos} todos_eventos={eventos} perfil={perfil} onGuardar={()=>{setModalEvento(null);cargarDatos();addToast("Evento guardado correctamente","success");}} onCerrar={()=>setModalEvento(null)} onNuevoCliente={(cb)=>setModalNuevoCli({cb})} onNuevoContacto={setModalNuevoContacto} onNuevoInterprete={(ai,di,cb)=>setModalNuevoInt({ai,di,cb})} onLugarCreado={cargarDatos} onNuevoLugar={(cb)=>setModalNuevoLugar({cb})} onNuevoProveedor={prov=>setProveedores(prev=>[...prev,prov])}/>}
      {modalDetalle&&<ModalDetalle evento={modalDetalle} clientes={clientes} interpretes={interpretes} pares={pares} perfil={perfil} lugares={lugares} onEditar={()=>editarEvento(modalDetalle)} onEliminar={()=>eliminarEvento(modalDetalle.id)} onCerrar={()=>setModalDetalle(null)} onVerFicha={()=>{setModalFicha(modalDetalle);setModalDetalle(null);}} onNavDia={(dIdx)=>{setVistaAnterior(vista);setEventoMultidiaId(modalDetalle.id);setDiaMultidiaSeleccionado(dIdx+1);setModoMultidia(true);setVista("dia");setModalDetalle(null);}} addToast={addToast}/>}
      {modalFicha&&<ModalFicha evento={modalFicha} clientes={clientes} interpretes={interpretes} pares={pares} lugares={lugares} onCerrar={()=>setModalFicha(null)}/>}
      {modalFichasMultiples&&<ModalFichasMultiples eventosLista={modalFichasMultiples} clientes={clientes} interpretes={interpretes} pares={pares} onCerrar={()=>setModalFichasMultiples(null)}/>}
      {modalNuevoCli&&<ModalNuevoCliente onGuardar={async(d)=>{const{notas,...dSinNotas}=d;console.log("[NuevoCliente] payload insert:",dSinNotas,"notas:",notas);const{data,error}=await sb.from("clientes").insert(dSinNotas).select().single();console.log("[NuevoCliente] result:",{data,error});if(data&&notas!==undefined)await sb.from("clientes").update({notas}).eq("id",data.id);if(data)setClientes(prev=>[...prev,data]);const cb=modalNuevoCli?.cb;setModalNuevoCli(false);if(data){cb?.(data.id);addToast("Cliente creado","success");}cargarDatos();}} onCerrar={()=>setModalNuevoCli(false)}/>}
      {modalNuevoInt&&<ModalNuevoInterprete pares={pares} onGuardar={async(d,parId)=>{const{notas,...dSinNotas}=d;const{data}=await sb.from("interpretes").insert(dSinNotas).select().single();if(data?.id&&notas!==undefined)await sb.from("interpretes").update({notas}).eq("id",data.id);await cargarDatos();if(data?.id&&modalNuevoInt?.cb)modalNuevoInt.cb(data.id,parId);setModalNuevoInt(null);addToast("Intérprete creado","success");}} onCerrar={()=>setModalNuevoInt(null)}/>}
      {modalNuevoContacto&&<ModalNuevoContacto clienteId={modalNuevoContacto.cliente_id} onGuardar={async(d)=>{const{data:nc}=await sb.from("contactos").insert({...d,cliente_id:Number(modalNuevoContacto.cliente_id),activo:true}).select().single();if(nc&&modalNuevoContacto.cb)modalNuevoContacto.cb(nc);await cargarDatos();setModalNuevoContacto(null);addToast("Contacto creado","success");}} onCerrar={()=>setModalNuevoContacto(null)}/>}
      {modalNuevoLugar&&<ModalNuevoLugar onGuardado={async(data)=>{if(modalNuevoLugar.cb)modalNuevoLugar.cb(data);await cargarDatos();setModalNuevoLugar(null);addToast("Lugar creado","success");}} onCerrar={()=>setModalNuevoLugar(null)}/>}
      <ToastContainer toasts={toasts} onRemove={removeToast}/>
    </div>
  );
}
