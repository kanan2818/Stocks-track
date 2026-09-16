import { useState, useMemo, useEffect } from 'react';
import { Plus }                         from 'lucide-react';
import { onAuthStateChanged, signOut }  from 'firebase/auth';
import { auth }                         from './firebase';
import { useProducts }                  from './hooks/useProducts';
import Login                            from './Login';
import Dashboard                        from './components/Dashboard';
import LowStockBanner                   from './components/LowStockBanner';
import CategoryTabs                     from './components/CategoryTabs';
import SearchBar                        from './components/SearchBar';
import ProductTable                     from './components/ProductTable';
import ProductModal                     from './components/ProductModal';
import StockModal                       from './components/StockModal';
import HistoryModal                     from './components/HistoryModal';
import DeleteModal                      from './components/DeleteModal';

export default function App() {
  /* ── Auth state (Phase 11) ─────────────────────────────────────────────── */
  const [user,        setUser]        = useState(undefined); // undefined = checking
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  /* ── Data layer ────────────────────────────────────────────────────────── */
  const { products, loading, firestoreError, addProduct, editProduct, deleteProduct, addTransaction } =
    useProducts();

  /* ── UI state ──────────────────────────────────────────────────────────── */
  const [activeCategory,   setActiveCategory]   = useState('All');
  const [searchQuery,      setSearchQuery]       = useState('');
  const [pinnedProductId,  setPinnedProductId]   = useState(null);
  const [hoveredProductId, setHoveredProductId]  = useState(null);

  /* ── Modal state ───────────────────────────────────────────────────────── */
  const [productModal, setProductModal] = useState({ open: false, product: null });
  const [stockModal,   setStockModal]   = useState({ open: false, product: null, type: 'in' });
  const [historyModal, setHistoryModal] = useState({ open: false, product: null });
  const [deleteModal,  setDeleteModal]  = useState({ open: false, product: null });

  /* ── Derived data ──────────────────────────────────────────────────────── */
  const visibleProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        String(p.thickness ?? '').toLowerCase().includes(q) ||
        (p.supplier ?? '').toLowerCase().includes(q)
      );
    });
  }, [products, activeCategory, searchQuery]);

  const lowStockProducts = useMemo(
    () => products.filter(p => p.isLowStock),
    [products]
  );

  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalUnits:    products.reduce((s, p) => s + p.currentQty, 0),
    totalValue:    products.reduce((s, p) => s + (p.pricePerUnit || 0) * p.currentQty, 0),
    lowStockCount: lowStockProducts.length,
  }), [products, lowStockProducts]);

  const quickCheckProduct = useMemo(() => {
    const id = pinnedProductId || hoveredProductId;
    return id ? (products.find(p => p.id === id) ?? null) : null;
  }, [pinnedProductId, hoveredProductId, products]);

  /* ── Handlers ──────────────────────────────────────────────────────────── */
  const handleProductSave = (data) => {
    if (productModal.product) editProduct(productModal.product.id, data);
    else addProduct(data);
    setProductModal({ open: false, product: null });
  };

  const handleStockSubmit = (qty, note) => {
    addTransaction(stockModal.product.id, stockModal.type, qty, note);
    setStockModal({ open: false, product: null, type: 'in' });
  };

  const handleDeleteConfirm = () => {
    const id = deleteModal.product?.id;
    if (!id) return;
    deleteProduct(id);
    if (pinnedProductId === id) setPinnedProductId(null);
    setDeleteModal({ open: false, product: null });
  };

  const handleRowHover = (product) => setHoveredProductId(product?.id ?? null);
  const handleRowClick = (product) => {
    setPinnedProductId(prev => prev === product.id ? null : product.id);
  };

  /* ── Auth gate ─────────────────────────────────────────────────────────── */

  // Still checking auth state — show nothing (avoids flash)
  if (!authChecked) {
    return (
      <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
        <div style={{ color:'var(--text-tertiary)', fontFamily:'var(--font-heading)', fontSize:'1.5rem' }}>
          Loading…
        </div>
      </div>
    );
  }

  // Not signed in — show login screen
  if (!user) {
    return <Login />;
  }

  /* ── Main app (signed in) ─────────────────────────────────────────────── */
  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-brand">
          <h1 className="header-title">Stocks</h1>
          <p className="header-subtitle">Plywood &amp; Panels Register</p>
        </div>
        <div style={{ display:'flex', gap:'var(--space-3)', alignItems:'center' }}>
          <span style={{ fontSize:'0.8125rem', color:'var(--green-muted)' }}>
            {user.email}
          </span>
          <button
            className="btn btn-ghost"
            style={{ height:36, color:'var(--green-muted)', borderColor:'rgba(255,255,255,0.2)', fontSize:'0.875rem' }}
            onClick={() => signOut(auth)}
          >
            Sign out
          </button>
          <button
            id="btn-add-product"
            className="btn btn-primary"
            onClick={() => setProductModal({ open: true, product: null })}
          >
            <Plus size={17} strokeWidth={2.5} />
            Add Product
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="app-main">

        {lowStockProducts.length > 0 && (
          <LowStockBanner products={lowStockProducts} />
        )}

        <Dashboard
          stats={stats}
          quickCheckProduct={quickCheckProduct}
          pinnedProductId={pinnedProductId}
        />

        <div className="toolbar">
          <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {firestoreError ? (
          <div style={{
            background: 'var(--red-subtle)',
            border: '1px solid #FECACA',
            borderLeft: '4px solid var(--red)',
            borderRadius: 'var(--r-md)',
            padding: 'var(--space-5) var(--space-6)',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--red-text)', marginBottom: 6 }}>
              ⚠️ Firestore permission denied
            </div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--red-text)', lineHeight: 1.6 }}>
              <p>Your Firestore database is blocking access. You need to update the security rules.</p>
              <br />
              <strong>Fix in 30 seconds:</strong>
              <ol style={{ marginLeft: 20, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>Go to the <a href="https://console.firebase.google.com/project/stocks-panels/firestore/rules" target="_blank" rel="noreferrer" style={{ color: 'var(--green)', textDecoration: 'underline' }}>Firebase Console → Firestore Rules</a></li>
                <li>Replace all the rules with this:</li>
              </ol>
              <pre style={{ background: '#fff', border: '1px solid #FECACA', borderRadius: 6, padding: 12, marginTop: 8, fontSize: '0.8125rem', overflowX: 'auto' }}>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read, write: if request.auth != null;
    }
  }
}`}</pre>
              <li style={{ marginLeft: 20, marginTop: 4 }}>Click <strong>Publish</strong> — then refresh this page.</li>
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign:'center', padding:'var(--space-12)', color:'var(--text-tertiary)' }}>
            Loading products…
          </div>
        ) : (
          <ProductTable
            products={visibleProducts}
            pinnedProductId={pinnedProductId}
            onRowHover={handleRowHover}
            onRowClick={handleRowClick}
            onEdit    ={(p) => setProductModal({ open: true,  product: p })}
            onStockIn ={(p) => setStockModal  ({ open: true,  product: p, type: 'in' })}
            onStockOut={(p) => setStockModal  ({ open: true,  product: p, type: 'out' })}
            onHistory ={(p) => setHistoryModal({ open: true,  product: p })}
            onDelete  ={(p) => setDeleteModal ({ open: true,  product: p })}
          />
        )}

      </main>

      {/* ── Modals ── */}
      {productModal.open && (
        <ProductModal
          product={productModal.product}
          onSave={handleProductSave}
          onClose={() => setProductModal({ open: false, product: null })}
        />
      )}
      {stockModal.open && (
        <StockModal
          product={stockModal.product}
          type={stockModal.type}
          onSubmit={handleStockSubmit}
          onClose={() => setStockModal({ open: false, product: null, type: 'in' })}
        />
      )}
      {historyModal.open && (
        <HistoryModal
          product={historyModal.product}
          onClose={() => setHistoryModal({ open: false, product: null })}
        />
      )}
      {deleteModal.open && (
        <DeleteModal
          product={deleteModal.product}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal({ open: false, product: null })}
        />
      )}

    </div>
  );
}
