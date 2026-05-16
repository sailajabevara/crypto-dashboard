import React from 'react';
import useCryptoStore from '../store/useCryptoStore';

export default function Header() {
  const { isDark, toggleTheme, wsState, activeView, setActiveView } = useCryptoStore();

  const statusColor = wsState === 'OPEN' ? 'var(--green)' : wsState === 'CONNECTING' ? '#f5a623' : 'var(--red)';

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div style={styles.logo}>
          <span style={styles.logoSymbol}>◈</span>
          <span style={styles.logoText}>CRYPTO<span style={styles.logoAccent}>STREAM</span></span>
        </div>
        <nav style={styles.nav}>
          {['dashboard', 'portfolio', 'alerts'].map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              style={{
                ...styles.navBtn,
                ...(activeView === view ? styles.navBtnActive : {})
              }}
            >
              {view === 'dashboard' && '▦ '}
              {view === 'portfolio' && '◎ '}
              {view === 'alerts' && '◉ '}
              {view.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>
      <div style={styles.right}>
        <div style={styles.wsStatus}>
          <span style={{ ...styles.wsDot, background: statusColor }} />
          <span style={styles.wsText}>{wsState}</span>
        </div>
        <button
          data-testid="theme-switcher"
          onClick={toggleTheme}
          style={styles.themeBtn}
          title="Toggle theme"
        >
          {isDark ? '◐ LIGHT' : '◑ DARK'}
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '56px',
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: { display: 'flex', alignItems: 'center', gap: '32px' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoSymbol: { fontSize: '20px', color: 'var(--accent)' },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '15px',
    letterSpacing: '0.1em',
    color: 'var(--text-primary)',
  },
  logoAccent: { color: 'var(--accent)' },
  nav: { display: 'flex', gap: '4px' },
  navBtn: {
    padding: '6px 14px',
    fontSize: '11px',
    letterSpacing: '0.08em',
    fontWeight: '700',
    color: 'var(--text-muted)',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.15s',
  },
  navBtnActive: {
    color: 'var(--accent)',
    borderColor: 'var(--accent)',
    background: 'var(--accent)10',
  },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  wsStatus: { display: 'flex', alignItems: 'center', gap: '6px' },
  wsDot: { width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block' },
  wsText: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em' },
  themeBtn: {
    padding: '6px 14px',
    fontSize: '11px',
    letterSpacing: '0.08em',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.15s',
  },
};
