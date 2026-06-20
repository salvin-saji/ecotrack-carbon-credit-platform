import { Component } from "react"

export default class ErrorBoundary extends Component {

  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error:    null,
      info:     null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Error:", error)
    console.error("[ErrorBoundary] Stack:", info?.componentStack)
    this.setState({ info })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    // If custom fallback provided (for non-critical components)
    if (this.props.fallback) {
      return this.props.fallback
    }

    // Default full-page error UI
    return (
      <div style={{
        minHeight:      "100vh",
        background:     "#070708",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "40px",
        fontFamily:     "Inter, sans-serif",
      }}>
        <div style={{
          background:   "#0e0e10",
          border:       "1px solid rgba(239,68,68,0.2)",
          borderRadius: "16px",
          padding:      "32px",
          maxWidth:     "640px",
          width:        "100%",
        }}>
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "12px",
            marginBottom: "20px"
          }}>
            <div style={{
              width:"36px", height:"36px",
              borderRadius:"8px",
              background:"rgba(239,68,68,0.1)",
              display:"flex", alignItems:"center",
              justifyContent:"center",
              fontSize:"18px",
            }}>
              ⚠
            </div>
            <div>
              <p style={{
                fontSize:"15px", fontWeight:500,
                color:"#f1f1f3", margin:"0 0 2px"
              }}>
                Render Error
              </p>
              <p style={{
                fontSize:"12px", color:"#6b6b7a", margin:0
              }}>
                A component crashed — details below
              </p>
            </div>
          </div>

          <div style={{
            background:   "rgba(239,68,68,0.06)",
            border:       "1px solid rgba(239,68,68,0.15)",
            borderRadius: "8px",
            padding:      "14px 16px",
            marginBottom: "20px",
          }}>
            <p style={{
              fontSize:"12px", color:"#ef4444",
              fontFamily:"monospace", lineHeight:1.6,
              wordBreak:"break-word", margin:0
            }}>
              {this.state.error?.toString() || "Unknown error"}
            </p>
          </div>

          {this.state.info && (
            <details style={{ marginBottom:"20px" }}>
              <summary style={{
                fontSize:"11px", color:"#3a3a45",
                cursor:"pointer", marginBottom:"8px"
              }}>
                Component Stack
              </summary>
              <pre style={{
                fontSize:"10px", color:"#6b6b7a",
                background:"#131316",
                padding:"12px", borderRadius:"6px",
                overflow:"auto", maxHeight:"160px",
                margin:0, whiteSpace:"pre-wrap",
                wordBreak:"break-word",
              }}>
                {this.state.info.componentStack}
              </pre>
            </details>
          )}

          <div style={{ display:"flex", gap:"10px" }}>
            <button
              onClick={() => this.setState({
                hasError:false, error:null, info:null
              })}
              style={{
                padding:"9px 16px",
                background:"#131316",
                color:"#888",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:"8px",
                fontSize:"12px", cursor:"pointer",
              }}>
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding:"9px 16px",
                background:"#22c55e", color:"#000",
                border:"none", borderRadius:"8px",
                fontSize:"12px", fontWeight:500,
                cursor:"pointer",
              }}>
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }
}
