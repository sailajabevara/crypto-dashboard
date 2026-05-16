import React, { useState } from 'react';
import useCryptoStore from '../store/useCryptoStore';

export default function PortfolioModal({ onClose }) {
  const coins = useCryptoStore(s => s.coins);
  const addToPortfolio = useCryptoStore(s => s.addToPortfolio);
  const [coinId, setCoinId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!coinId || !quantity || !purchasePrice) {
      setError('All fields are required.');
      return;
    }
    const qty = parseFloat(quantity);
    const price = parseFloat(purchasePrice);
    if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      setError('Quantity and price must be positive numbers.');
      return;
    }

    addToPortfolio({ id: coinId, quantity: qty, purchasePrice: price });
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={styles.modal} className="fade-in">
        <div style={styles.header}>
          <h3 style={styles.title}>◎ ADD TO PORTFOLIO</h3>
          <button onClick={onClose} style={styles.close}>✕</button>
        </div>

        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>COIN</label>
            <select
              value={coinId}
              onChange={e => setCoinId(e.target.value)}
              style={styles.select}
            >
              <option value="">Select a coin...</option>
              {coins.slice(0, 100).map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>QUANTITY</label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PURCHASE PRICE (USD)</label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={purchasePrice}
              onChange={e => setPurchasePrice(e.target.value)}
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <button onClick={onClose} style={styles.cancelBtn}>CANCEL</button>
            <button onClick={handleSubmit} style={styles.addBtn}>+ ADD HOLDING</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
    padding: '16px',
  },
  modal: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '420px',
    padding: '24px',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', letterSpacing: '0.1em', color: 'var(--text-primary)' },
  close: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '10px', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-muted)' },
  select: {
    padding: '10px 12px',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    outline: 'none',
    cursor: 'pointer',
  },
  input: {
    padding: '10px 12px',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    outline: 'none',
  },
  error: { color: 'var(--red)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  actions: { display: 'flex', gap: '10px', marginTop: '8px' },
  cancelBtn: {
    flex: 1, padding: '10px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
    fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', cursor: 'pointer',
  },
  addBtn: {
    flex: 2, padding: '10px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
    fontFamily: 'var(--font-mono)', color: 'var(--bg-primary)',
    background: 'var(--accent)', border: 'none',
    borderRadius: 'var(--radius)', cursor: 'pointer',
  },
};
