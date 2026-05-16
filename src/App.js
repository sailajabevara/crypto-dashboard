import React, { useEffect, useMemo } from 'react';
import useCryptoStore from './store/useCryptoStore';
import { fetchTopCoins } from './services/coinGeckoService';
import { useWebSocket } from './hooks/useWebSocket';
import Header from './components/Header';
import AlertNotifications from './components/AlertNotifications';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Alerts from './pages/Alerts';

function AppContent() {
  const activeView = useCryptoStore(s => s.activeView);
  const coins = useCryptoStore(s => s.coins);
  const setCoins = useCryptoStore(s => s.setCoins);
  const setCoinsError = useCryptoStore(s => s.setCoinsError);
  const initTheme = useCryptoStore(s => s.initTheme);
  const loadPortfolio = useCryptoStore(s => s.loadPortfolio);
  const loadAlerts = useCryptoStore(s => s.loadAlerts);

  // Initialize theme and load persisted data
  useEffect(() => {
    initTheme();
    loadPortfolio();
    loadAlerts();
  }, [initTheme, loadPortfolio, loadAlerts]);

  // Fetch initial coins from CoinGecko
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchTopCoins(1, 100);
        if (!cancelled) setCoins(data);
      } catch (err) {
        if (!cancelled) setCoinsError(err.message || 'Failed to fetch market data');
      }
    }

    load();
    // Refresh every 60 seconds
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setCoins, setCoinsError]);

  // Build list of Binance symbols for WebSocket subscription
  const wsSymbols = useMemo(() => {
    const stablecoins = new Set(['usdt', 'usdc', 'busd', 'dai', 'tusd', 'usdp', 'fdusd']);
    return coins
      .filter(c => !stablecoins.has(c.symbol.toLowerCase()))
      .slice(0, 50)
      .map(c => `${c.symbol.toLowerCase()}usdt`);
  }, [coins]);

  // WebSocket connection
  useWebSocket(wsSymbols);

  return (
    <div style={styles.app}>
      <Header />
      <main style={styles.main}>
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'portfolio' && <Portfolio />}
        {activeView === 'alerts' && <Alerts />}
      </main>
      <AlertNotifications />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg-primary)',
  },
  main: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};
