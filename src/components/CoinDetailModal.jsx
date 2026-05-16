import React, { useEffect, useRef } from 'react';
import useCryptoStore from '../store/useCryptoStore';
import PriceChart from './PriceChart';
import { formatPrice, formatChange, formatMarketCap, formatVolume } from '../utils/formatters';

export default function CoinDetailModal({ coin, onClose }) {
  const livePrices = useCryptoStore(s => s.livePrices);
  const overlayRef = useRef();

  const binanceSymbol = `${coin.symbol.toUpperCase()}USDT`;
  const livePrice = livePrices[binanceSymbol];
  const displayPrice = livePrice !== undefined ? parseFloat(livePrice) : coin.current_price;
  const change = coin.price_change_percentage_24h || 0;
  const isPositive = change >= 0;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={styles.overlay}
    >
      <div style={styles.modal} className="fade-in">
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={styles.coinHeaderLeft}>
            <img src={coin.image} alt={coin.name} style={styles.coinImg} />
            <div>
              <h2 style={styles.coinModalName}>{coin.name}</h2>
              <span style={styles.coinModalSymbol}>{coin.symbol.toUpperCase()}</span>
            </div>
          </div>
          <div style={styles.coinHeaderRight}>
            <div style={styles.livePrice}>${formatPrice(displayPrice)}</div>
            <span
              data-direction={isPositive ? 'up' : 'down'}
              style={{
                ...styles.changeBadge,
                color: isPositive ? 'var(--green)' : 'var(--red)',
                background: isPositive ? 'var(--green-bg)' : 'var(--red-bg)',
              }}
            >
              {formatChange(change)}
            </span>
            <button onClick={onClose} style={styles.closeBtn}>✕</button>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Market Cap', value: formatMarketCap(coin.market_cap) },
            { label: '24H Volume', value: formatVolume(coin.total_volume) },
            { label: 'Rank', value: `#${coin.market_cap_rank}` },
            { label: 'All Time High', value: `$${formatPrice(coin.ath)}` },
          ].map(stat => (
            <div key={stat.label} style={styles.statCard}>
              <div style={styles.statLabel}>{stat.label}</div>
              <div style={styles.statValue}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <PriceChart coin={coin} />
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '16px',
  },
  modal: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '760px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
  },
  coinHeaderLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  coinImg: { width: '48px', height: '48px', borderRadius: '50%' },
  coinModalName: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' },
  coinModalSymbol: { fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 700 },
  coinHeaderRight: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
  livePrice: { fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' },
  changeBadge: { padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 700 },
  closeBtn: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  statCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 14px',
  },
  statLabel: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '4px' },
  statValue: { fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' },
};
