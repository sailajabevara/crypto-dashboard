export function formatPrice(price, decimals = null) {
  if (price === null || price === undefined) return '—';
  const num = parseFloat(price);
  if (isNaN(num)) return '—';

  if (decimals !== null) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  if (num >= 1000) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  if (num >= 1) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(num);
  if (num >= 0.01) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(num);
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 }).format(num);
}

export function formatMarketCap(num) {
  if (!num) return '—';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(0)}`;
}

export function formatChange(change) {
  if (change === null || change === undefined) return '0.00%';
  const num = parseFloat(change);
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function formatVolume(num) {
  if (!num) return '—';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(0)}`;
}

export function coinIdToSymbol(id) {
  // common mappings
  const map = { bitcoin: 'BTC', ethereum: 'ETH', tether: 'USDT' };
  return map[id] || id.toUpperCase().slice(0, 5);
}
