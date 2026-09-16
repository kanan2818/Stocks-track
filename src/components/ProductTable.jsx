import { Pencil, Plus, Minus, ClipboardList, Trash2 } from 'lucide-react';
import { fmtRupee, fmtArea } from '../utils';

const CAT_BADGE = {
  Plywood: 'badge--cat-plywood',
  Vox:     'badge--cat-vox',
  Other:   'badge--cat-other',
};

export default function ProductTable({
  products,
  pinnedProductId,
  onRowHover,
  onRowClick,
  onEdit,
  onStockIn,
  onStockOut,
  onHistory,
  onDelete,
}) {
  if (products.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-text">No products found</div>
          <div className="empty-state-sub">
            Try adjusting your search or category filter, or add a new product.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="product-table" aria-label="Product stock list">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Thickness</th>
              <th>Size</th>
              <th>Supplier</th>
              <th>Qty</th>
              <th>Area</th>
              <th>Value</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody id="products-tbody">
            {products.map(p => {
              const isPinned  = p.id === pinnedProductId;
              const isLow     = p.isLowStock;
              const qtyClass  = isLow ? 'cell-qty cell-qty--low' : 'cell-qty cell-qty--ok';

              let rowClass = '';
              if (isPinned)  rowClass += ' row--pinned';
              if (isLow)     rowClass += ' row--lowstock';

              return (
                <tr
                  key={p.id}
                  className={rowClass.trim()}
                  onMouseEnter={() => onRowHover(p)}
                  onMouseLeave={() => onRowHover(null)}
                  onClick={() => onRowClick(p)}
                  title="Click to pin this product to the Quick-Check card"
                >
                  {/* Name */}
                  <td>
                    <div className="cell-name">{p.name}</div>
                    {isLow && (
                      <span className="badge badge--low" style={{ marginTop: 3 }}>
                        ⚠ LOW
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td>
                    <span className={`badge ${CAT_BADGE[p.category] ?? ''}`}>
                      {p.category}
                    </span>
                  </td>

                  {/* Thickness */}
                  <td className="cell-muted">
                    {p.thickness ? `${p.thickness} ${p.thicknessUnit}` : '—'}
                  </td>

                  {/* Size */}
                  <td className="cell-muted">
                    {p.size ? `${p.size} ${p.sizeUnit}` : '—'}
                  </td>

                  {/* Supplier */}
                  <td className="cell-muted">{p.supplier || '—'}</td>

                  {/* Quantity */}
                  <td>
                    <span className={qtyClass}>
                      {p.currentQty.toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Area */}
                  <td className="cell-muted">
                    {p.totalArea != null
                      ? fmtArea(p.totalArea, p.areaUnit)
                      : '—'}
                  </td>

                  {/* Value */}
                  <td className="cell-value">
                    {p.pricePerUnit
                      ? fmtRupee(p.pricePerUnit * p.currentQty)
                      : '—'}
                  </td>

                  {/* Actions */}
                  <td onClick={e => e.stopPropagation()}>
                    <div className="row-actions">
                      <button
                        className="action-btn action-btn--in"
                        title="Stock In"
                        aria-label={`Stock In: ${p.name}`}
                        onClick={() => onStockIn(p)}
                      >
                        <Plus size={15} strokeWidth={2.5} />
                      </button>
                      <button
                        className="action-btn action-btn--out"
                        title="Stock Out"
                        aria-label={`Stock Out: ${p.name}`}
                        onClick={() => onStockOut(p)}
                      >
                        <Minus size={15} strokeWidth={2.5} />
                      </button>
                      <button
                        className="action-btn"
                        title="Edit product"
                        aria-label={`Edit ${p.name}`}
                        onClick={() => onEdit(p)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="action-btn"
                        title="Transaction history"
                        aria-label={`History: ${p.name}`}
                        onClick={() => onHistory(p)}
                      >
                        <ClipboardList size={15} />
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        title="Delete product"
                        aria-label={`Delete ${p.name}`}
                        onClick={() => onDelete(p)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="table-footer" id="footer-count">
        Showing {products.length} product{products.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
