import React from 'react';
import useCryptoStore from '../store/useCryptoStore';

export default function AlertNotifications() {
  const triggeredAlerts = useCryptoStore(s => s.triggeredAlerts);
  const alerts = useCryptoStore(s => s.alerts);
  const coins = useCryptoStore(s => s.coins);
  const dismissAlert = useCryptoStore(s => s.dismissAlert);

  const triggered = Object.keys(triggeredAlerts);
  if (triggered.length === 0) return null;

  return (
    <div style={styles.container}>
      {triggered.map(id => {
        const alert = alerts.find(a => a.id === id);
        const coin = coins.find(c => c.id === id);
        return (
          <div
            key={id}
            data-testid={`alert-notification-${id}`}
            style={styles.notification}
            className="fade-in"
          >
            <div style={styles.alertIcon}>◉</div>
            <div style={styles.alertContent}>
              <div style={styles.alertTitle}>
                {coin?.name || id} Alert Triggered!
              </div>
              {alert && (
                <div style={styles.alertDesc}>
                  Price went {alert.condition} ${alert.targetPrice.toLocaleString()}
                </div>
              )}
            </div>
            <button
              onClick={() => dismissAlert(id)}
              style={styles.dismissBtn}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 500,
    maxWidth: '320px',
  },
  notification: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--accent)',
    borderRadius: 'var(--radius-lg)',
    padding: '14px 16px',
    boxShadow: 'var(--shadow-lg)',
    animation: 'slideIn 0.3s ease',
  },
  alertIcon: {
    fontSize: '18px',
    color: 'var(--accent)',
    lineHeight: 1,
    flexShrink: 0,
    marginTop: '1px',
  },
  alertContent: { flex: 1 },
  alertTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '13px',
    color: 'var(--text-primary)',
    marginBottom: '3px',
  },
  alertDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  dismissBtn: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '2px 4px',
    flexShrink: 0,
    background: 'none',
    border: 'none',
  },
};
