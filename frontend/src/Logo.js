import React from 'react';

export default function Logo({ size = 'md', dark = false, iconOnly = false }) {
  const sizes = {
    sm: { bars:[5,9,14,11,7],    h:16, gap:3, r:2,  fontSize:14, subSize:7  },
    md: { bars:[8,13,20,16,10],  h:28, gap:4, r:3,  fontSize:24, subSize:9  },
    lg: { bars:[10,16,24,19,12], h:36, gap:5, r:4,  fontSize:32, subSize:11 },
  };

  const s       = sizes[size] || sizes.md;
  const barW    = s.gap * 2;
  const spacing = 2;
  const iconW   = s.bars.length * (barW + spacing) - spacing;

  const barColor = (i) => {
    if (dark) return i < 4 ? 'white' : '#10B981';
    return i < 4 ? '#4F46E5' : '#10B981';
  };

  const barOpacity = [0.28, 0.55, 1, 0.72, 0.55];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: iconOnly ? 0 : 12
    }}>
      <svg
        width={iconW}
        height={s.h}
        viewBox={`0 0 ${iconW} ${s.h}`}
        style={{ display:'block', flexShrink:0 }}
      >
        {s.bars.map((h, i) => (
          <rect
            key={i}
            x={i * (barW + spacing)}
            y={s.h - h}
            width={barW}
            height={h}
            rx={s.r}
            fill={barColor(i)}
            opacity={barOpacity[i]}
          />
        ))}
      </svg>

      {!iconOnly && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          lineHeight: 1
        }}>
          <span style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: s.fontSize,
            fontWeight: 400,
            color: dark ? '#ffffff' : '#111827',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            display: 'block'
          }}>
            Psyche
          </span>
          <span style={{
            fontFamily: "-apple-system, sans-serif",
            fontSize: s.subSize,
            fontWeight: 700,
            color: dark ? '#10B981' : '#4F46E5',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginTop: 3,
            display: 'block'
          }}>
            Flow
          </span>
        </div>
      )}
    </div>
  );
}