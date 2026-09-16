import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';

export default function StockModal({ product, type, onSubmit, onClose }) {
  const [qty,   setQty]   = useState('');
  const [note,  setNote]  = useState('');
  const [error, setError] = useState('');

  const isIn = type === 'in';

  /* Reset on open */
  useEffect(() => {
    setQty('');
    setNote('');
    setError('');
  }, [product, type]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = Number(qty);
    if (!qty || n <= 0 || !Number.isInteger(n)) {
      setError('Enter a whole number greater than zero.');
      return;
    }
    if (!isIn && n > product.currentQty) {
      setError(`Only ${product.currentQty} unit${product.currentQty !== 1 ? 's' : ''} in stock — cannot remove more.`);
      return;
    }
    onSubmit(n, note.trim());
  };

  const accent = isIn ? 'var(--green)' : 'var(--amber)';

  return (
    <div
      className="modal-overlay"
      id="modal-txn-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-txn-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal modal--sm">

        <div className="modal-header">
          <h2 className="modal-title" id="modal-txn-title" style={{ color: accent }}>
            {isIn
              ? <><Plus size={20} style={{ display:'inline', marginRight:6 }} />Stock In</>
              : <><Minus size={20} style={{ display:'inline', marginRight:6 }} />Stock Out</>
            }
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="modal-body" id="txn-form" onSubmit={handleSubmit} noValidate>

          <p className="txn-product-name" id="txn-product-name">
            {product?.name}
          </p>

          {!isIn && (
            <p style={{ textAlign:'center', fontSize:'0.875rem', color:'var(--text-secondary)', marginTop:-8 }}>
              Currently: <strong style={{ color:'var(--text-primary)' }}>{product?.currentQty}</strong> units
            </p>
          )}

          <div className="form-group form-group--full">
            <label className="form-label" htmlFor="field-txn-qty">
              Quantity <span className="required">*</span>
            </label>
            <input
              id="field-txn-qty"
              type="number"
              className="form-input form-input--lg"
              placeholder="0"
              min="1" step="1"
              value={qty}
              onChange={e => { setQty(e.target.value); setError(''); }}
              autoFocus
              required
            />
            {error && (
              <span style={{ color:'var(--red)', fontSize:'0.8125rem', textAlign:'center' }}>{error}</span>
            )}
          </div>

          <div className="form-group form-group--full">
            <label className="form-label" htmlFor="field-txn-note">Note</label>
            <input
              id="field-txn-note"
              type="text"
              className="form-input"
              placeholder="e.g. Sold to Sharma Interiors"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" id="btn-cancel-txn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-save-txn"
              style={{ background: accent, boxShadow: `0 2px 6px ${accent}44` }}
            >
              Confirm
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
