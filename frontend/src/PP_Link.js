import React from 'react';
export default function PP_Link({ S, card, Badge, patients, user, ...props }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: S.navy, fontSize: 20, fontWeight: 700 }}>Link</h2>
      <div style={{ ...card, textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 13, color: S.muted }}>Building full Link module...</div>
      </div>
    </div>
  );
}
