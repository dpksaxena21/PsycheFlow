import { IconAlert } from './icons';
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('PsycheFlow Error:', error, info);
    // TODO: Send to Sentry when deployed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight:'100vh', display:'flex', alignItems:'center',
          justifyContent:'center', background:'#F0F9FF', fontFamily:"'Satoshi',-apple-system,sans-serif"
        }}>
          <div style={{ textAlign:'center', maxWidth:480, padding:40 }}>
            <div style={{ fontSize:48, marginBottom:16 }}><IconAlert size={48} color='#dc2626'/></div>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#0C1A2E', marginBottom:8 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize:14, color:'#3B5998', lineHeight:1.7, marginBottom:24 }}>
              PsycheFlow encountered an unexpected error. Your data is safe.
            </p>
            <button onClick={() => window.location.reload()}
              style={{
                background:'#1D4ED8', color:'#fff', border:'none',
                padding:'11px 24px', borderRadius:100, fontSize:14,
                fontWeight:600, cursor:'pointer', marginRight:10
              }}>Reload page</button>
            <button onClick={() => { this.setState({ hasError:false, error:null }); }}
              style={{
                background:'transparent', color:'#1D4ED8',
                border:'1px solid #1D4ED8', padding:'11px 24px',
                borderRadius:100, fontSize:14, cursor:'pointer'
              }}>Try again</button>
            <div style={{ marginTop:24, fontSize:12, color:'#94a3b8' }}>
              Crisis support: iCall 9152987821
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
