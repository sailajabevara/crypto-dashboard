import React from 'react';
import useCryptoStore from '../store/useCryptoStore';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useCryptoStore();

  return (
    <div style={styles.wrapper}>
      <span style={styles.icon}>⌕</span>
      <input
        data-testid="search-input"
        type="text"
        placeholder="Search by name or symbol..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        style={styles.input}
        autoComplete="off"
        spellCheck={false}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          style={styles.clear}
        >
          ✕
        </button>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '1',
    maxWidth: '400px',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
    fontSize: '18px',
    pointerEvents: 'none',
    lineHeight: 1,
  },
  input: {
    width: '100%',
    padding: '9px 36px 9px 38px',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  clear: {
    position: 'absolute',
    right: '10px',
    color: 'var(--text-muted)',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
  },
};
