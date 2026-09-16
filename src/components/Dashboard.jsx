import { Package, Layers, IndianRupee, AlertTriangle } from 'lucide-react';
import { fmtRupee } from '../utils';

export default function Dashboard({ stats }) {
  const { totalProducts, totalUnits, totalValue, lowStockCount } = stats;

  return (
    <section className="dashboard" aria-label="Summary">

      {/* Total Products */}
      <div className="kpi-card">
        <div className="kpi-label">
          <Package size={12} style={{ display:'inline', marginRight:5 }} />
          Products
        </div>
        <div className="kpi-value">{totalProducts}</div>
        <div className="kpi-subtext">distinct SKUs</div>
      </div>

      {/* Total Units */}
      <div className="kpi-card">
        <div className="kpi-label">
          <Layers size={12} style={{ display:'inline', marginRight:5 }} />
          Total Units
        </div>
        <div className="kpi-value kpi-value--green">{totalUnits.toLocaleString('en-IN')}</div>
        <div className="kpi-subtext">sheets on hand</div>
      </div>

      {/* Stock Value */}
      <div className="kpi-card">
        <div className="kpi-label">
          <IndianRupee size={12} style={{ display:'inline', marginRight:5 }} />
          Stock Value
        </div>
        <div className="kpi-value" style={{ fontSize: totalValue >= 1_000_000 ? '1.5rem' : undefined }}>
          {fmtRupee(totalValue)}
        </div>
        <div className="kpi-subtext">total inventory</div>
      </div>

      {/* Low Stock */}
      <div className={`kpi-card${lowStockCount > 0 ? ' kpi-card--alert' : ''}`}>
        <div className="kpi-label">
          <AlertTriangle size={12} style={{ display:'inline', marginRight:5 }} />
          Low Stock
        </div>
        <div className={`kpi-value${lowStockCount > 0 ? ' kpi-value--alert' : ''}`}>
          {lowStockCount}
        </div>
        <div className="kpi-subtext">
          {lowStockCount === 0 ? 'all levels OK' : `product${lowStockCount !== 1 ? 's' : ''} need restocking`}
        </div>
      </div>

    </section>
  );
}
