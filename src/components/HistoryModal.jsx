import { useEffect } from 'react';
import { X } from 'lucide-react';
import { fmtDate } from '../utils';

export default function HistoryModal({ product, onClose }) {
  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const txns = product ? [...(product.transactions ?? [])].reverse() : [];

  return (
    <div
      className="modal-overlay"
      id="modal-history-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-history-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal modal--history">

        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="modal-history-title">Transaction History</h2>
            <p className="modal-subtitle" id="modal-history-product">{product?.name}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" id="history-body">
          {txns.length === 0 ? (
            <p className="history-empty">No transactions yet for this product.</p>
          ) : (
            <div className="history-list">
              {txns.map(t => (
                <div key={t.id} className={`history-item history-item--${t.type}`}>
                  <span className={`history-type-badge badge-${t.type}`}>
                    {t.type === 'in' ? '↑ IN' : '↓ OUT'}
                  </span>
                  <div className="history-info">
                    <div className="history-qty">
                      {t.qty.toLocaleString('en-IN')} unit{t.qty !== 1 ? 's' : ''}
                    </div>
                    {t.note && <div className="history-note">{t.note}</div>}
                  </div>
                  <div className="history-date">{fmtDate(t.date)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
