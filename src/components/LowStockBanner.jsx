import { AlertTriangle } from 'lucide-react';

export default function LowStockBanner({ products }) {
  if (!products.length) return null;

  const items = products
    .map(p => `${p.name} (${p.currentQty} left)`)
    .join(' · ');

  return (
    <div className="low-stock-banner" role="alert" aria-live="polite">
      <AlertTriangle className="banner-icon" size={18} strokeWidth={2.5} />
      <div className="banner-content">
        <div className="banner-title">
          {products.length} product{products.length !== 1 ? 's' : ''} running low — reorder soon
        </div>
        <div className="banner-items">{items}</div>
      </div>
    </div>
  );
}
