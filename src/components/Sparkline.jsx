import React, { memo } from 'react';

const Sparkline = memo(function Sparkline({ data, symbol, positive, width = 80, height = 32 }) {
  if (!data || data.length < 2) {
    return (
      <svg
        data-testid={`sparkline-${symbol}`}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="var(--border)" strokeWidth="1" />
      </svg>
    );
  }

  const prices = data.slice(-40);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M ${pts.join(' L ')}`;
  const fillD = `M 0,${height} L ${pts.join(' L ')} L ${width},${height} Z`;
  const color = positive ? 'var(--green)' : 'var(--red)';

  return (
    <svg
      data-testid={`sparkline-${symbol}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#grad-${symbol})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
});

export default Sparkline;
