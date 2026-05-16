import React, { useState } from 'react';
import useCryptoStore from '../store/useCryptoStore';
import AlertManager from '../components/AlertManager';

export default function Alerts() {
  const alerts = useCryptoStore(s => s.alerts);
  const coins = useCryptoStore(s => s.coins);
  const livePrices = useCryptoStore(s => s.livePrices);
  const removeAlert = useCryptoStore(s => s.removeAlert);
  const triggeredAlerts = useCryptoStore(s => s.triggeredAlerts);
  const [showAdd, setShowAdd] = useState(false);

  const alertsWithData = alerts.map(alert => {
    const coin = coins.find(c => c.id === alert.id);
    const binanceSymbol = coin ? `${coin.symbol.toUpperCase()}USDT` : null;
    const livePrice = binanceSymbol ? parseFloat(livePrices[binanceSymbol]) : coin?.current_price;
    const isTriggered = !!triggeredAlerts[alert.id];
    const isNear = livePrice && (
      alert.condition === 'above'
        ? livePrice >= alert.targetPrice * 0.95
        : livePrice <= alert.targetPrice * 1.05
    );
    return { ...alert, coin, livePrice, isTriggered, isNear };
  });

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>◉ PRICE ALERTS</h2>
          <p style={styles.subtitle}>{alerts.length} alert{alerts.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={styles.addBtn}>
          + SET ALERT
        </button>
      </div>

      {alerts.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>◉</div>
          <div style={styles.emptyTitle}>No alerts set</div>
          <div style={styles.emptyDesc}>Configure price alerts to get notified when targets are hit.</div>
          <button onClick={() => setShowAdd(true)} style={styles.emptyAddBtn}>
            + SET FIRST ALERT
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {alertsWithData.map((alert, i) => (
            <div
              key={`${alert.id}-${alert.condition}-${i}`}
              style={{
                ...styles.card,
                ...(alert.isTriggered ? styles.cardTriggered : {}),
                ...(alert.isNear && !alert.isTriggered ? styles.cardNear : {}),
              }}
            >
              <div style={styles.cardHeader}>
                <div style={styles.coinInfo}>
                  {alert.coin?.image && (
                    <img src={alert.coin.image} alt={alert.coin.name} style={styles.coinImg} />
                  )}
                  <div>
                    <div style={styles.coinName}>{alert.coin?.name || alert.id}</div>
                    <div style={styles.coinSym}>{alert.coin?.symbol?.toUpperCase() || ''}</div>
                  </div>
                </div>
                <div style={styles.cardRight}>
                  {alert.isTriggered && (
                    <span style={styles.triggeredBadge}>◉ TRIGGERED</span>
                  )}
                  {alert.isNear && !alert.isTriggered && (
                    <span style={styles.nearBadge}>⚡ NEAR</span>
                  )}
                  <button
                    onClick={() => removeAlert(alert.id, alert.condition)}
                    style={styles.removeBtn}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div style={styles.alertDetails}>
                <div style={styles.conditionPill}>
                  <span style={{ color: alert.condition === 'above' ? 'var(--green)' : 'var(--red)' }}>
                    {alert.condition === 'above' ? '▲' : '▼'} {alert.condition.toUpperCase()}
                  </span>
                </div>
                <div style={styles.targetPrice}>
                  ${alert.targetPrice.toLocaleString('en-US', { maximumFractionDigits: 8 })}
                </div>
              </div>

              {alert.livePrice && (
                <div style={styles.currentPrice}>
                  <span style={styles.currentLabel}>CURRENT</span>
                  <span style={styles.currentValue}>
                    ${parseFloat(alert.livePrice).toLocaleString('en-US', { maximumFractionDigits: 6 })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && <AlertManager onClose={() => setShowAdd(false)} />}
    </div>
  );
}

const styles = {
  wrapper: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', letterSpacing: '0.05em', color: 'var(--text-primary)' },
  subtitle: { fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' },
  addBtn: {
    padding: '9px 18px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
    fontFamily: 'var(--font-mono)', color: 'var(--bg-primary)',
    background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '18px',
    display: 'flex', flexDirection: 'column', gap: '12px',
    transition: 'border-color 0.2s',
  },
  cardTriggered: { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)30' },
  cardNear: { borderColor: '#f5a623' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  coinInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  coinImg: { width: '32px', height: '32px', borderRadius: '50%' },
  coinName: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' },
  coinSym: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' },
  cardRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  triggeredBadge: { fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' },
  nearBadge: { fontSize: '10px', fontWeight: 700, color: '#f5a623', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' },
  removeBtn: {
    width: '22px', height: '22px', borderRadius: '50%',
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  alertDetails: { display: 'flex', alignItems: 'center', gap: '12px' },
  conditionPill: { fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' },
  targetPrice: { fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' },
  currentPrice: { display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' },
  currentLabel: { fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 },
  currentValue: { fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' },
  empty: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '14px',
    padding: '60px 20px', background: 'var(--bg-card)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
  },
  emptyIcon: { fontSize: '48px', color: 'var(--text-muted)', opacity: 0.4 },
  emptyTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' },
  emptyDesc: { fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' },
  emptyAddBtn: {
    marginTop: '8px', padding: '10px 24px', fontSize: '12px', fontWeight: 700,
    letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', color: 'var(--bg-primary)',
    background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
  },
};
