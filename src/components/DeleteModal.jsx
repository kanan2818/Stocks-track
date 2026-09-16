import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function DeleteModal({ product, onConfirm, onClose }) {
  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      id="modal-delete-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-delete-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal modal--sm modal--danger">

        <div className="modal-header">
          <h2 className="modal-title" id="modal-delete-title" style={{ color:'var(--red)' }}>
            <AlertTriangle size={20} style={{ display:'inline', marginRight:8, verticalAlign:'sub' }} />
            Delete Product?
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-msg" id="delete-msg">
            Delete &ldquo;{product?.name}&rdquo;?
          </p>
          <p className="delete-sub">
            This will permanently remove the product and all its transaction
            history. This cannot be undone.
          </p>
        </div>

        <div className="modal-footer modal-footer--standalone">
          <button type="button" className="btn btn-ghost" id="btn-cancel-delete" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" id="btn-confirm-delete" onClick={onConfirm}>
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}
