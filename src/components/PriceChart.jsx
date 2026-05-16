import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { fetchCoinMarketChart } from '../services/coinGeckoService';
import { formatPrice } from '../utils/formatters';

const RANGES = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function PriceChart({ coin }) {
  const [chartData, setChartData] = useState([]);
  const [range, setRange] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coin?.id) return;
    setLoading(true);
    fetchCoinMarketChart(coin.id, range)
      .then(data => {
        const pts = (data.prices || []).map(([ts, price]) => ({
          time: new Date(ts).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
            ...(range === 1 ? { hour: '2-digit', minute: '2-digit' } : {}),
          }),
          price: parseFloat(price.toFixed(6)),
          ts,
        }));
        setChartData(pts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [coin?.id, range]);

  const isPositive = coin?.price_change_percentage_24h >= 0;
  const color = isPositive ? 'var(--green)' : 'var(--red)';

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        padding: '8px 12px',
        borderRadius: 'var(--radius)',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{payload[0]?.payload?.time}</div>
        <div style={{ color, fontWeight: 700 }}>${formatPrice(payload[0]?.value)}</div>
      </div>
    );
  };

  return (
    <div data-testid="price-chart" style={styles.wrapper}>
      <div style={styles.toolbar}>
        <span style={styles.chartTitle}>Price Chart</span>
        <div style={styles.rangeButtons}>
          {RANGES.map(r => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              style={{
                ...styles.rangeBtn,
                ...(range === r.days ? { color, borderColor: color } : {}),
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading chart data...</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${formatPrice(v)}`}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill="url(#chartGrad)"
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: 'var(--bg-card)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  chartTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '14px',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
  },
  rangeButtons: { display: 'flex', gap: '4px' },
  rangeBtn: {
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'all 0.15s',
  },
  loading: {
    height: '280px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
  },
};
