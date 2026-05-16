import React, { useState, useMemo, useCallback } from 'react';
import useCryptoStore from '../store/useCryptoStore';
import SearchBar from '../components/SearchBar';
import CryptoTableRow from '../components/CryptoTableRow';
import CoinDetailModal from '../components/CoinDetailModal';
import PortfolioModal from '../components/PortfolioModal';

export default function Dashboard() {
  const coins = useCryptoStore(s => s.coins);
  const coinsLoading = useCryptoStore(s => s.coinsLoading);
  const coinsError = useCryptoStore(s => s.coinsError);
  const searchQuery = useCryptoStore(s => s.searchQuery);

  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery) return coins;
    const q = searchQuery.toLowerCase();
    return coins.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q)
    );
  }, [coins, searchQuery]);

  const handleSelect = useCallback((coin) => setSelectedCoin(coin), []);

  if (coinsLoading) {
    return (
      <div style={styles.loadingState}>
        <div style={styles.loadingIcon}>◈</div>
        <div style={styles.loadingText}>FETCHING MARKET DATA</div>
        <div style={styles.loadingDots}>
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    );
  }

  if (coinsError) {
    return (
      <div style={styles.errorState}>
        <div style={styles.errorIcon}>⚠</div>
        <div style={styles.errorTitle}>Failed to load market data</div>
        <div style={styles.errorDesc}>{coinsError}</div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <SearchBar />
          <span style={styles.count}>
            {filtered.length} / {coins.length} ASSETS
          </span>
        </div>
        <button
          onClick={() => setShowPortfolioModal(true)}
          style={styles.addBtn}
        >
          + ADD TO PORTFOLIO
        </button>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={{ ...styles.th, width: '48px', textAlign: 'center' }}>#</th>
              <th style={{ ...styles.th, textAlign: 'left' }}>ASSET</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>PRICE</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>24H CHANGE</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>MARKET CAP</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>7D TREND</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(coin => (
              <CryptoTableRow
                key={coin.id}
                coin={coin}
                onSelect={handleSelect}
              />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>◎</div>
            <div>No assets match "{searchQuery}"</div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedCoin && (
        <CoinDetailModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}
      {showPortfolioModal && (
        <PortfolioModal onClose={() => setShowPortfolioModal(false)} />
      )}
    </div>
  );
}

const styles = {
  wrapper: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  loadingState: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '12px',
  },
  loadingIcon: { fontSize: '40px', color: 'var(--accent)', animation: 'blink 1.2s infinite' },
  loadingText: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', letterSpacing: '0.2em', color: 'var(--text-muted)' },
  loadingDots: { color: 'var(--accent)', fontSize: '24px', letterSpacing: '4px' },
  errorState: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '10px',
  },
  errorIcon: { fontSize: '32px', color: 'var(--red)' },
  errorTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' },
  errorDesc: { fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
    gap: '16px',
    flexShrink: 0,
  },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: '16px', flex: 1 },
  count: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', whiteSpace: 'nowrap' },
  addBtn: {
    padding: '8px 16px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
    fontFamily: 'var(--font-mono)', color: 'var(--bg-primary)',
    background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)',
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.15s',
  },
  tableWrapper: { flex: 1, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 },
  th: {
    padding: '10px 16px',
    fontSize: '10px',
    letterSpacing: '0.1em',
    fontWeight: 700,
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontFamily: 'var(--font-mono)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  emptyIcon: { fontSize: '32px', opacity: 0.4 },
};
