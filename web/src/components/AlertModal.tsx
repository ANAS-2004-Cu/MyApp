import React from 'react';
import { AlertButton } from '../context/AlertContext';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onSelectButton: (button?: AlertButton) => void;
}

export default function AlertModal({
  visible,
  title,
  message,
  buttons,
  onSelectButton,
}: AlertModalProps) {
  if (!visible) return null;

  return (
    <div
      style={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div style={styles.modalCard}>
        <h3 id="alert-modal-title" style={styles.title}>
          {title}
        </h3>
        {message && <p style={styles.message}>{message}</p>}
        <div style={styles.buttonRow}>
          {buttons.map((btn, index) => {
            const isDestructive = btn.style === 'destructive';
            const isCancel = btn.style === 'cancel';
            return (
              <button
                key={index}
                type="button"
                style={{
                  ...styles.button,
                  ...(isDestructive
                    ? styles.destructiveButton
                    : isCancel
                    ? styles.cancelButton
                    : styles.defaultButton),
                }}
                onClick={() => onSelectButton(btn)}
              >
                {btn.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    border: '1px solid rgba(120, 240, 188, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 20,
    textAlign: 'center',
    whiteSpace: 'pre-line',
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: 90,
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  defaultButton: {
    backgroundColor: 'rgba(120, 240, 188, 0.2)',
    border: '1px solid #78F0BC',
    color: '#78F0BC',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#CCCCCC',
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    border: '1px solid #FF6B6B',
    color: '#FF6B6B',
  },
};
