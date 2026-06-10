import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to console in dev only
    if (process.env.NODE_ENV === 'development') {
      console.error('PsycheFlow Error:', error, errorInfo);
    }
    // TODO: Send to error tracking service (Sentry/LogRocket)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F8FAFF', fontFamily:"'Satoshi',-apple-system,sans-serif", padding:24 }}>
          <div style={{ maxWidth:480, textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="#DC2626"/></svg>
            </div>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#0C1A2E', marginBottom:8 }}>Something went wrong</h2>
            <p style={{ fontSize:14, color:'#94a3b8', marginBottom:24, lineHeight:1.6 }}>PsycheFlow encountered an unexpected error. Your data is safe.</p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => window.location.reload()} style={{ padding:'10px 20px', background:'#1D4ED8', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Reload page</button>
              <button onClick={() => this.setState({ hasError:false, error:null })} style={{ padding:'10px 20px', background:'transparent', color:'#1D4ED8', border:'1px solid #1D4ED8', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Try again</button>
            </div>
            <p style={{ fontSize:11, color:'#94a3b8', marginTop:20 }}>Crisis support: iCall 9152987821</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
