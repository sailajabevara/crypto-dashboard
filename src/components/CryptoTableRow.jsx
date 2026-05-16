import React, { memo, useEffect, useRef, useState } from 'react';
import useCryptoStore from '../store/useCryptoStore';
import Sparkline from './Sparkline';
import { formatPrice, formatChange, formatMarketCap } from '../utils/formatters';

const CryptoTableRow = memo(function CryptoTableRow({ coin, onSelect }) {
  const binanceSymbol = `${coin.symbol.toUpperCase()}USDT`;
  const livePrices = useCryptoStore(s => s.livePrices);
  const priceHistory = useCryptoStore(s => s.priceHistory);
  const priceDirections = useCryptoStore(s => s.priceDirections);

  const livePrice = livePrices[binanceSymbol];
  const displayPrice = livePrice !== undefined ? parseFloat(livePrice) : coin.current_price;
  const direction = priceDirections[binanceSymbol] || 'up';
  const history = priceHistory[binanceSymbol];

  const sparkData = history && history.length > 1
    ? history
    : (coin.sparkline_in_7d?.price || []);

  const change = coin.price_change_percentage_24h || 0;
  const isPositive = change >= 0;

  // Flash animation on price change
  const [flashClass, setFlashClass] = useState('');
  const prevPriceRef = useRef(livePrice);
  useEffect(() => {
    if (prevPriceRef.current !== livePrice && livePrice !== undefined) {
      const dir = parseFloat(livePrice) >= parseFloat(prevPriceRef.current || livePrice) ? 'price-up' : 'price-down';
      setFlashClass(dir);
      const t = setTimeout(() => setFlashClass(''), 700);
      prevPriceRef.current = livePrice;
      return () => clearTimeout(t);
    }
  }, [livePrice]);

  return (
    <tr
      data-testid={`crypto-row-${binanceSymbol}`}
      onClick={() => onSelect(coin)}
      style={styles.row}
    >
      <td style={styles.rankCell}>{coin.market_cap_rank}</td>
      <td style={styles.nameCell}>
        <div style={styles.coinInfo}>
          {coin.image && (
            <img src={coin.image} alt={coin.name} style={styles.coinIcon} loading="lazy" />
          )}
          <div>
            <div style={styles.coinName}>{coin.name}</div>
            <div style={styles.coinSymbol}>{coin.symbol.toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td style={styles.priceCell}>
        <span
          data-testid={`price-${binanceSymbol}`}
          className={flashClass}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '700' }}
        >
          ${formatPrice(displayPrice)}
        </span>
      </td>
      <td style={styles.changeCell}>
        <span
          data-testid={`price-change-24h-${binanceSymbol}`}
          data-direction={isPositive ? 'up' : 'down'}
          style={{
            color: isPositive ? 'var(--green)' : 'var(--red)',
            fontSize: '12px',
            fontWeight: '700',
            background: isPositive ? 'var(--green-bg)' : 'var(--red-bg)',
            padding: '2px 6px',
            borderRadius: '3px',
          }}
        >
          {formatChange(change)}
        </span>
      </td>
      <td style={styles.mcCell}>
        <span style={styles.secondary}>{formatMarketCap(coin.market_cap)}</span>
      </td>
      <td style={styles.sparkCell}>
        <Sparkline
          data={sparkData}
          symbol={binanceSymbol}
          positive={isPositive}
          width={80}
          height={32}
        />
      </td>
    </tr>
  );
});

const styles = {
  row: {
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  rankCell: {
    padding: '12px 8px 12px 16px',
    color: 'var(--text-muted)',
    fontSize: '12px',
    width: '48px',
    textAlign: 'center',
  },
  nameCell: { padding: '10px 16px 10px 8px', minWidth: '180px' },
  coinInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  coinIcon: { width: '28px', height: '28px', borderRadius: '50%' },
  coinName: { fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' },
  coinSymbol: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '1px' },
  priceCell: { padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap' },
  changeCell: { padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap' },
  mcCell: { padding: '10px 16px', textAlign: 'right', display: 'none' },
  sparkCell: { padding: '10px 16px 10px 8px', textAlign: 'right' },
  secondary: { fontSize: '12px', color: 'var(--text-secondary)' },
};

export default CryptoTableRow;
