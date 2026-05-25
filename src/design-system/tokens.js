export const PALETA_CLIENTE = ["#E03131","#C2255C","#9C36B5","#3B5BDB","#1971C2","#0C8599","#2F9E44","#E67700","#D9480F","#5C7CFA","#F06595","#20C997"];
export const colorCliente = (id) => PALETA_CLIENTE[(id||0) % 12];

export const tokens = {
  color: {
    bg: '#1E3A6E',
    bgDeep: '#162d57',
    surface: '#FFFFFF',
    surfaceHover: '#F8FAFC',
    textOnBg: '#FFFFFF',
    textOnBgSoft: 'rgba(255,255,255,0.75)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMeta: '#6B7280',
    shadow: '0 2px 12px rgba(0,0,0,0.15)',
    shadowHover: '0 4px 20px rgba(0,0,0,0.22)',
  },
  font: {
    family: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
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
    'Francés':   { bg: '#002395', border: '#001570', flag: 'fr' },
    'Portugués': { bg: '#009C3B', border: '#006B28', flag: 'br' },
    'Español':   { bg: '#AA151B', border: '#750E12', flag: 'es' },
    'Alemán':    { bg: '#555555', border: '#333333', flag: 'de' },
    'Italiano':  { bg: '#009246', border: '#006330', flag: 'it' },
    'Chino':     { bg: '#DE2910', border: '#9E1D0B', flag: 'cn' },
    'Japonés':   { bg: '#BC002D', border: '#84001F', flag: 'jp' },
    default:     { bg: '#4C6EF5', border: '#3451D1', flag: null },
  },
};
