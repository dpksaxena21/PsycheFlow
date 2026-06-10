import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoSave(data, saveFn, delay = 2000) {
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const timerRef = useRef();
  const prevDataRef = useRef(data);

  const save = useCallback(async () => {
    if (JSON.stringify(data) === JSON.stringify(prevDataRef.current)) return;
    setStatus('saving');
    try {
      await saveFn(data);
      prevDataRef.current = data;
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
    }
  }, [data, saveFn]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (JSON.stringify(data) !== JSON.stringify(prevDataRef.current)) {
      timerRef.current = setTimeout(save, delay);
    }
    return () => clearTimeout(timerRef.current);
  }, [data, save, delay]);

  return { status, saveNow: save };
}

export function AutoSaveIndicator({ status, t }) {
  if (status === 'idle') return null;
  const config = {
    saving: { text: 'Saving...', color: '#94a3b8' },
    saved: { text: 'Saved', color: '#059669' },
    error: { text: 'Save failed', color: '#DC2626' },
  };
  const c = config[status];
  return (
    <span style={{ fontSize: 11, color: c.color, display: 'flex', alignItems: 'center', gap: 4 }}>
      {status === 'saving' && <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #94a3b8', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }}/>}
      {status === 'saved' && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      {c.text}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
