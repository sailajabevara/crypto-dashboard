import React, { useState } from 'react';
import useCryptoStore from '../store/useCryptoStore';
import PortfolioModal from '../components/PortfolioModal';
import { formatPrice, formatChange } from '../utils/formatters';

export default function Portfolio() {
  const portfolio = useCryptoStore(s => s.portfolio);
  const coins = useCryptoStore(s => s.coins);
  const livePrices = useCryptoStore(s => s.livePrices);
  const removeFromPortfolio = useCryptoStore(s => s.removeFromPortfolio);
  const [showAdd, setShowAdd] = useState(false);

  // Compute holdings with current value
  const holdings = portfolio.map(item => {
    const coin = coins.find(c => c.id === item.id);
    const binanceSymbol = coin ? `${coin.symbol.toUpperCase()}USDT` : null;
    const livePrice = binanceSymbol ? parseFloat(livePrices[binanceSymbol]) : null;
    const currentPrice = livePrice || coin?.current_price || 0;
    const totalValue = currentPrice * item.quantity;
    const costBasis = item.purchasePrice * item.quantity;
    const pl = totalValue - costBasis;
    const plPct = costBasis > 0 ? ((pl / costBasis) * 100) : 0;

    return { ...item, coin, currentPrice, totalValue, costBasis, pl, plPct };
  });

  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
  const isPLPositive = totalPL >= 0;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>◎ MY PORTFOLIO</h2>
          <p style={styles.subtitle}>{portfolio.length} asset{portfolio.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={styles.addBtn}>
          + ADD HOLDING
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>TOTAL VALUE</div>
          <div
            data-testid="portfolio-total-value"
            style={styles.summaryValue}
          >
            ${formatPrice(totalValue)}
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>TOTAL COST</div>
          <div style={styles.summaryValue}>${formatPrice(totalCost)}</div>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: isPLPositive ? 'var(--green)' : 'var(--red)' }}>
          <div style={styles.summaryLabel}>PROFIT / LOSS</div>
          <div
            data-testid="portfolio-pl"
            style={{
              ...styles.summaryValue,
              color: isPLPositive ? 'var(--green)' : 'var(--red)',
            }}
          >
            {isPLPositive ? '+' : ''}${formatPrice(Math.abs(totalPL))}
            <span style={{ fontSize: '13px', marginLeft: '8px' }}>
              ({formatChange(totalPLPct)})
            </span>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      {portfolio.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>◎</div>
          <div style={styles.emptyTitle}>No holdings yet</div>
          <div style={styles.emptyDesc}>Add your first cryptocurrency holding to start tracking.</div>
          <button onClick={() => setShowAdd(true)} style={styles.emptyAddBtn}>
            + ADD FIRST HOLDING
          </button>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ASSET</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>QUANTITY</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>AVG BUY PRICE</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>CURRENT PRICE</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>TOTAL VALUE</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>P/L</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>REMOVE</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => (
                <tr
                  key={h.id}
                  data-testid={`portfolio-item-${h.id}`}
                  style={styles.row}
                >
                  <td style={styles.td}>
                    <div style={styles.coinInfo}>
                      {h.coin?.image && (
                        <img src={h.coin.image} alt={h.coin.name} style={styles.coinImg} />
                      )}
                      <div>
                        <div style={styles.coinName}>{h.coin?.name || h.id}</div>
                        <div style={styles.coinSym}>{h.coin?.symbol?.toUpperCase() || h.id.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {h.quantity}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    ${formatPrice(h.purchasePrice)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    ${formatPrice(h.currentPrice)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    ${formatPrice(h.totalValue)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <span style={{
                      color: h.pl >= 0 ? 'var(--green)' : 'var(--red)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}>
                      {h.pl >= 0 ? '+' : ''}${formatPrice(Math.abs(h.pl))}
                      <br />
                      <span style={{ fontSize: '11px', opacity: 0.8 }}>
                        {formatChange(h.plPct)}
                      </span>
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <button
                      onClick={() => removeFromPortfolio(h.id)}
                      style={styles.removeBtn}
                      title="Remove holding"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <PortfolioModal onClose={() => setShowAdd(false)} />}
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
    background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)',
    cursor: 'pointer',
  },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  summaryCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '18px 20px',
  },
  summaryLabel: { fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' },
  summaryValue: { fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' },
  tableWrapper: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', fontSize: '10px', letterSpacing: '0.1em', fontWeight: 700,
    color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
    background: 'var(--bg-secondary)', textAlign: 'left',
  },
  row: { borderBottom: '1px solid var(--border)', transition: 'background 0.12s' },
  td: { padding: '14px 16px', fontSize: '13px', color: 'var(--text-primary)' },
  coinInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  coinImg: { width: '28px', height: '28px', borderRadius: '50%' },
  coinName: { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px' },
  coinSym: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' },
  removeBtn: {
    width: '24px', height: '24px', borderRadius: '50%',
    background: 'var(--red-bg)', border: '1px solid var(--red)',
    color: 'var(--red)', cursor: 'pointer', fontSize: '11px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  },
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
