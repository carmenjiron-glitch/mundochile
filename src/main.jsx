import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("MundoChile runtime error:", error, info);
  }
  render() {
    if (this.state.error) {
      const message = this.state.error?.message || String(this.state.error);
      return (
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F5F7FB",fontFamily:"Inter,Segoe UI,system-ui,sans-serif",padding:"24px",boxSizing:"border-box"}}>
          <div style={{maxWidth:"760px",width:"100%",background:"#fff",border:"1px solid #E5E7EB",borderRadius:"16px",padding:"28px",boxShadow:"0 8px 30px rgba(15,23,42,0.08)"}}>
            <div style={{fontSize:"22px",fontWeight:"700",color:"#162654",marginBottom:"8px"}}>La plataforma encontró un error al cargar</div>
            <div style={{fontSize:"14px",color:"#64748B",marginBottom:"18px"}}>La sesión está abierta, pero hubo un error de ejecución en la interfaz. Este mensaje reemplaza la pantalla en blanco para poder identificarlo.</div>
            <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:"10px",padding:"14px",fontSize:"13px",color:"#334155",margin:"0 0 18px"}}>{message}</pre>
            <button onClick={() => window.location.reload()} style={{padding:"10px 16px",background:"#2563A8",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"600"}}>Recargar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
