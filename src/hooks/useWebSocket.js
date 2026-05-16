import { useEffect, useRef, useCallback } from 'react';
import useCryptoStore from '../store/useCryptoStore';

const WS_URL = process.env.REACT_APP_BINANCE_WS_URL || 'wss://stream.binance.com:9443/ws';

// Expose WS state to window for test verification
let _wsRef = null;
window.getWebSocketState = () => {
  if (!_wsRef) return 'CLOSED';
  const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
  return states[_wsRef.readyState] || 'CLOSED';
};

export function useWebSocket(symbols) {
  const wsRef = useRef(null);
  const retryTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);
  const { setWsState, updatePrice } = useCryptoStore.getState();

  const connect = useCallback(() => {
    if (!symbols || symbols.length === 0) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      _wsRef = ws;
      setWsState('CONNECTING');

      ws.onopen = () => {
        if (!mountedRef.current) return;
        retryCountRef.current = 0;
        setWsState('OPEN');

        // Subscribe to mini ticker streams for all symbols
        const streams = symbols.map(s => `${s.toLowerCase()}@miniTicker`);
        // Binance allows max 200 streams per connection
        const batch = streams.slice(0, 200);
        ws.send(JSON.stringify({
          method: 'SUBSCRIBE',
          params: batch,
          id: 1
        }));
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          // miniTicker: { e: '24hrMiniTicker', s: 'BTCUSDT', c: '65000.00', ... }
          if (data.e === '24hrMiniTicker' && data.s && data.c) {
            updatePrice(data.s, data.c);
          }
          // Combined stream format
          if (data.data && data.data.e === '24hrMiniTicker') {
            updatePrice(data.data.s, data.data.c);
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setWsState('CLOSED');
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setWsState('CLOSED');
        _wsRef = null;

        // Exponential backoff retry
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
        retryCountRef.current += 1;
        retryTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, delay);
      };
    } catch (err) {
      setWsState('CLOSED');
    }
  }, [symbols, setWsState, updatePrice]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      clearTimeout(retryTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        _wsRef = null;
      }
    };
  }, [connect]);

  return { wsRef };
}
