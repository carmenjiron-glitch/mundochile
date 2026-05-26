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
  'Simultánea':           {bg:'#EEF2FF',c:'#3B5BDB',b:'#3B5BDB'},
  'Consecutiva':          {bg:'#F0FFF4',c:'#2F9E44',b:'#2F9E44'},
  'Whispering':           {bg:'#F5F3FF',c:'#9C36B5',b:'#9C36B5'},
  'presencial':           {bg:'#FFF0F6',c:'#C2255C',b:'#C2255C'},
  'remoto':               {bg:'#E6FCF5',c:'#0CA678',b:'#0CA678'},
  'hibrido':              {bg:'#FFF4E6',c:'#E67700',b:'#E67700'},
  'Presencial':           {bg:'#FFF0F6',c:'#C2255C',b:'#C2255C'},
  'Remoto':               {bg:'#E6FCF5',c:'#0CA678',b:'#0CA678'},
  'Híbrido':              {bg:'#FFF4E6',c:'#E67700',b:'#E67700'},
  'Facturado':            {bg:'#E7F5FF',c:'#1971C2',b:'#1971C2'},
  'Facturación Pendiente':{bg:'#FFF9DB',c:'#E67700',b:'#E67700'},
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
    'Simultánea':            { bg: '#EEF2FF', text: '#3B5BDB', border: '#3B5BDB' },
    'Consecutiva':           { bg: '#F0FFF4', text: '#2F9E44', border: '#2F9E44' },
    'Whispering':            { bg: '#F5F3FF', text: '#9C36B5', border: '#9C36B5' },
    'Presencial':            { bg: '#FFF0F6', text: '#C2255C', border: '#C2255C' },
    'Remoto':                { bg: '#E6FCF5', text: '#0CA678', border: '#0CA678' },
    'Híbrido':               { bg: '#FFF4E6', text: '#E67700', border: '#E67700' },
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
