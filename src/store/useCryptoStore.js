import { create } from 'zustand';

// LocalStorage helpers
const safeGetLS = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const safeSetLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
};

const useCryptoStore = create((set, get) => ({
  // ── Coins ──────────────────────────────────────────────
  coins: [],
  coinsLoading: true,
  coinsError: null,
  setCoins: (coins) => set({ coins, coinsLoading: false }),
  setCoinsError: (err) => set({ coinsError: err, coinsLoading: false }),

  // ── Live Prices (symbol -> price string) ───────────────
  livePrices: {},
  priceHistory: {}, // symbol -> last 20 prices for sparkline updates
  updatePrice: (symbol, price) => {
    const sym = symbol.toUpperCase();
    set((state) => {
      const prev = state.livePrices[sym];
      const history = state.priceHistory[sym] || [];
      const newHistory = [...history.slice(-49), parseFloat(price)];
      return {
        livePrices: { ...state.livePrices, [sym]: price },
        priceHistory: { ...state.priceHistory, [sym]: newHistory },
        // Track direction for animation
        priceDirections: {
          ...state.priceDirections,
          [sym]: prev !== undefined
            ? (parseFloat(price) >= parseFloat(prev) ? 'up' : 'down')
            : 'up'
        }
      };
    });

    // Check alerts
    get().checkAlerts(sym, parseFloat(price));
  },
  priceDirections: {},

  // ── WebSocket State ────────────────────────────────────
  wsState: 'CLOSED',
  setWsState: (wsState) => set({ wsState }),

  // ── Search ─────────────────────────────────────────────
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // ── Theme ──────────────────────────────────────────────
  isDark: true,
  toggleTheme: () => {
    set((state) => {
      const next = !state.isDark;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDark: next };
    });
  },
  initTheme: () => {
    const isDark = safeGetLS('cryptoTheme', true);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    set({ isDark });
  },

  // ── Portfolio ──────────────────────────────────────────
  portfolio: safeGetLS('cryptoPortfolio', []),
  addToPortfolio: (item) => {
    set((state) => {
      // item: { id, quantity, purchasePrice }
      const existing = state.portfolio.findIndex(p => p.id === item.id);
      let updated;
      if (existing >= 0) {
        updated = state.portfolio.map((p, i) => i === existing ? { ...p, ...item } : p);
      } else {
        updated = [...state.portfolio, item];
      }
      safeSetLS('cryptoPortfolio', updated);
      return { portfolio: updated };
    });
  },
  removeFromPortfolio: (id) => {
    set((state) => {
      const updated = state.portfolio.filter(p => p.id !== id);
      safeSetLS('cryptoPortfolio', updated);
      return { portfolio: updated };
    });
  },
  loadPortfolio: () => {
    const portfolio = safeGetLS('cryptoPortfolio', []);
    set({ portfolio });
  },

  // ── Alerts ─────────────────────────────────────────────
  alerts: safeGetLS('cryptoAlerts', []),
  triggeredAlerts: {}, // id -> true
  addAlert: (alert) => {
    set((state) => {
      const updated = [...state.alerts.filter(a => !(a.id === alert.id && a.condition === alert.condition)), alert];
      safeSetLS('cryptoAlerts', updated);
      return { alerts: updated };
    });
  },
  removeAlert: (id, condition) => {
    set((state) => {
      const updated = state.alerts.filter(a => !(a.id === id && a.condition === condition));
      safeSetLS('cryptoAlerts', updated);
      return { alerts: updated };
    });
  },
  loadAlerts: () => {
    const alerts = safeGetLS('cryptoAlerts', []);
    set({ alerts });
  },
  checkAlerts: (symbol, price) => {
    const { alerts, coins } = get();
    // Map symbol (BTCUSDT) to coin id (bitcoin)
    const sym = symbol.replace('USDT', '').toLowerCase();
    const coin = coins.find(c => c.symbol.toLowerCase() === sym);
    if (!coin) return;

    alerts.forEach(alert => {
      if (alert.id !== coin.id) return;
      const triggered =
        (alert.condition === 'above' && price > alert.targetPrice) ||
        (alert.condition === 'below' && price < alert.targetPrice);
      if (triggered) {
        set(state => ({
          triggeredAlerts: { ...state.triggeredAlerts, [alert.id]: true }
        }));
        // Auto-dismiss after 10s
        setTimeout(() => {
          set(state => {
            const t = { ...state.triggeredAlerts };
            delete t[alert.id];
            return { triggeredAlerts: t };
          });
        }, 10000);
      }
    });
  },
  dismissAlert: (id) => {
    set(state => {
      const t = { ...state.triggeredAlerts };
      delete t[id];
      return { triggeredAlerts: t };
    });
  },

  // ── Active view ────────────────────────────────────────
  activeView: 'dashboard', // 'dashboard' | 'portfolio' | 'alerts'
  setActiveView: (v) => set({ activeView: v }),
}));

export default useCryptoStore;
