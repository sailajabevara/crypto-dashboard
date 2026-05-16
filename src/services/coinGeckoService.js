const BASE_URL = process.env.REACT_APP_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

export async function fetchTopCoins(page = 1, perPage = 100) {
  const url = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
  return res.json();
}

export async function fetchCoinDetail(id) {
  const url = `${BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
  return res.json();
}

export async function fetchCoinMarketChart(id, days = 7) {
  const url = `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
  return res.json();
}

// Map CoinGecko symbol to Binance stream symbol
export function toBinanceSymbol(symbol) {
  return `${symbol.toUpperCase()}USDT`;
}

// Map Binance symbol back to display
export function fromBinanceSymbol(symbol) {
  return symbol.replace('USDT', '').toUpperCase();
}
