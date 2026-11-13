import React from 'react';
import { IoCheckmark } from 'react-icons/io5';

export interface DomainSelectModalProps {
  visible: boolean;
  domains: string[];
  selectedDomain: string;
  onSelect: (domain: string) => void;
  onClose: () => void;
}

export default function DomainSelectModal({
  visible,
  domains,
  selectedDomain,
  onSelect,
  onClose,
}: DomainSelectModalProps) {
  if (!visible) return null;

  return (
    <div
      style={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        style={styles.domainModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.domainModalTitle}>Select Domain</div>
        <div style={styles.domainList}>
          {domains.map((item, index) => {
            const isSelected = selectedDomain === item;
            return (
              <button
                key={`${item}-${index}`}
                type="button"
                style={{
                  ...styles.domainListItem,
                  ...(isSelected ? styles.selectedDomainListItem : {}),
                }}
                onClick={() => onSelect(item)}
              >
                <span
                  style={{
                    ...styles.domainListItemText,
                    ...(isSelected ? styles.selectedDomainListItemText : {}),
                  }}
                >
                  @{item}
                </span>
                {isSelected && <IoCheckmark size={20} color="#78F0BC" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 900,
  },
  domainModalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 420,
    maxHeight: '70vh',
    border: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
  },
  domainModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  domainList: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  domainListItem: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'left',
  },
  selectedDomainListItem: {
    backgroundColor: 'rgba(120, 240, 188, 0.1)',
  },
  domainListItemText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedDomainListItemText: {
    color: '#78F0BC',
    fontWeight: 'bold',
  },
};
