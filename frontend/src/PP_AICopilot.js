import React from 'react';
export default function PP_AICopilot({ S, card, Badge, patients, user, ...props }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: S.navy, fontSize: 20, fontWeight: 700 }}>AICopilot</h2>
      <div style={{ ...card, textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 13, color: S.muted }}>Building full AICopilot module...</div>
      </div>
    </div>
  );
}
