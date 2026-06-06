export const T = {
  bg: '#1A2F5A',
  bgTop: '#162654',
  surface: '#FFFFFF',
  primary: '#3B82F6',
  primaryDark: '#1E3A6E',
  red: '#EF4444',
  redLight: '#FFF5F5',
  green: '#22C55E',
  yellow: '#F59E0B',
  border: 'rgba(255,255,255,0.12)',
  shadow: '0 2px 12px rgba(0,0,0,0.15)',
  shadowHover: '0 6px 24px rgba(0,0,0,0.22)',
  textOnDark: '#FFFFFF',
  textOnDarkSoft: 'rgba(255,255,255,0.72)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMeta: '#6B7280',
  radius: '10px',
  radiusPill: '20px',
  font: "'Inter','Segoe UI',system-ui,sans-serif",
}

export const PALETA = ['#E03131','#C2255C','#9C36B5','#3B5BDB','#1971C2','#0C8599','#2F9E44','#E67700','#D9480F','#5C7CFA','#F06595','#20C997']
export const clientColor = (id) => PALETA[(id||0)%12]

// backwards compat
export const PALETA_CLIENTE = PALETA
export const colorCliente = clientColor

export const BADGE = {
  'Simultánea':           {bg:'#1D4ED8',c:'#FFFFFF',b:'#1D4ED8'},
  'Consecutiva':          {bg:'#9B1349',c:'#FFFFFF',b:'#9B1349'},
  'Whispering':           {bg:'#6D28D9',c:'#FFFFFF',b:'#6D28D9'},
  'presencial':           {bg:'#00AF57',c:'#FFFFFF',b:'#00AF57'},
  'remoto':               {bg:'#0E7490',c:'#FFFFFF',b:'#0E7490'},
  'hibrido':              {bg:'#D97706',c:'#FFFFFF',b:'#D97706'},
  'Presencial':           {bg:'#00AF57',c:'#FFFFFF',b:'#00AF57'},
  'Remoto':               {bg:'#0E7490',c:'#FFFFFF',b:'#0E7490'},
  'Híbrido':              {bg:'#D97706',c:'#FFFFFF',b:'#D97706'},
  'Facturado':            {bg:'#E3F2FD',c:'#1565C0',b:'#1565C0'},
  'Facturación Pendiente':{bg:'#FFEB3B',c:'#C62828',b:'#F9A825'},
}

export const INTERP_LANG = {
  'Inglés':    {bg:'#4A90D9',border:'#1A4476',flag:'gb'},
  'Francés':   {bg:'#8B0000',border:'#5C0000',flag:'fr'},
  'Portugués': {bg:'#1B7A2F',border:'#0F4D1C',flag:'br'},
  'Español':   {bg:'#C2820A',border:'#8B5E08',flag:'es'},
  'Alemán':    {bg:'#555555',border:'#333333',flag:'de'},
  'Italiano':  {bg:'#CC5500',border:'#993D00',flag:'it'},
  'Chino':     {bg:'#DE2910',border:'#9E1D0B',flag:'cn'},
  'Japonés':   {bg:'#6A0DAD',border:'#4A0878',flag:'jp'},
  default:     {bg:'#0C6E8C',border:'#084F65',flag:null},
}

// backwards compat for existing components
export const tokens = {
  color: {
    bg: '#1E3A6E', bgDeep: '#162d57', surface: '#FFFFFF', surfaceHover: '#F8FAFC',
    textOnBg: '#FFFFFF', textOnBgSoft: 'rgba(255,255,255,0.75)',
    textPrimary: '#0F172A', textSecondary: '#475569', textMeta: '#6B7280',
    shadow: '0 2px 12px rgba(0,0,0,0.15)', shadowHover: '0 4px 20px rgba(0,0,0,0.22)',
  },
  font: { family: "'Inter', 'Segoe UI', system-ui, sans-serif" },
  badge: {
    'Simultánea':            { bg: '#1D4ED8', text: '#FFFFFF', border: '#1D4ED8' },
    'Consecutiva':           { bg: '#9B1349', text: '#FFFFFF', border: '#9B1349' },
    'Whispering':            { bg: '#6D28D9', text: '#FFFFFF', border: '#6D28D9' },
    'Presencial':            { bg: '#00AF57', text: '#FFFFFF', border: '#00AF57' },
    'Remoto':                { bg: '#0E7490', text: '#FFFFFF', border: '#0E7490' },
    'Híbrido':               { bg: '#D97706', text: '#FFFFFF', border: '#D97706' },
    'Facturado':             { bg: '#E7F5FF', text: '#1971C2', border: '#1971C2' },
    'Facturación Pendiente': { bg: '#FFF9DB', text: '#E67700', border: '#E67700' },
  },
  interpreter: {
    'Inglés':    { bg: '#4A90D9', border: '#2563A8', flag: 'gb' },
    'Francés':   { bg: '#8B0000', border: '#5C0000', flag: 'fr' },
    'Portugués': { bg: '#1B7A2F', border: '#0F4D1C', flag: 'br' },
    'Español':   { bg: '#C2820A', border: '#8B5E08', flag: 'es' },
    'Alemán':    { bg: '#555555', border: '#333333', flag: 'de' },
    'Italiano':  { bg: '#CC5500', border: '#993D00', flag: 'it' },
    'Chino':     { bg: '#DE2910', border: '#9E1D0B', flag: 'cn' },
    'Japonés':   { bg: '#6A0DAD', border: '#4A0878', flag: 'jp' },
    default:     { bg: '#0C6E8C', border: '#084F65', flag: null },
  },
}
