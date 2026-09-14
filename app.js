/* ═══════════════════════════════════════════════════════════
   Stocks — app.js
   Pure vanilla JS. No dependencies. Data in localStorage.
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a simple unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Format a number as Indian rupees (₹) */
function fmtRupee(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/** Format area m² */
function fmtArea(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toFixed(2) + ' m²';
}

/** Format a date string nicely */
function fmtDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
         ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ── Data Layer ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'stocks_data_v1';

/**
 * @returns {Array} products array from localStorage
 */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Persist current state */
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products));
}

/**
 * Compute derived values for a product.
 * currentQty = Σ(in) − Σ(out)
 * totalArea  = areaPerUnit × currentQty (null if not set)
 * isLowStock = currentQty <= threshold
 */
function deriveProduct(p) {
  const qty = p.transactions.reduce((acc, t) => {
    return t.type === 'in' ? acc + t.qty : acc - t.qty;
  }, 0);
  const area = (p.areaPerUnit > 0) ? p.areaPerUnit * qty : null;
  return {
    ...p,
    currentQty: qty,
    totalArea: area,
    isLowStock: qty <= (p.threshold ?? 5),
  };
}

// ── State ─────────────────────────────────────────────────────────────────────

const state = {
  products: loadData(),   // raw products (no derived fields)
  activeCategory: 'All',  // tab filter
  searchQuery: '',        // search string
  pinnedProductId: null,  // "Units" card pin
};

// ── DOM Refs ──────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

const dom = {
  // KPIs
  kpiProductsVal:  $('kpi-products-val'),
  kpiUnitsVal:     $('kpi-units-val'),
  kpiValueVal:     $('kpi-value-val'),
  kpiLowstockVal:  $('kpi-lowstock-val'),
  kpiLowstockCard: $('kpi-lowstock'),
  unitsCheckCard:  $('kpi-units-check'),
  unitsCheckLabel: $('units-check-label'),
  unitsCheckValue: $('units-check-value'),
  unitsCheckHint:  $('units-check-hint'),

  // Banner
  banner:          $('low-stock-banner'),
  bannerText:      $('banner-text'),

  // Toolbar
  catTabs:         $('cat-tabs'),
  searchInput:     $('search-input'),
  btnAddProduct:   $('btn-add-product'),

  // Table
  tbody:           $('products-tbody'),
  emptyState:      $('empty-state'),

  // Footer
  footerCount:     $('footer-count'),

  // ─ Modal: Product ─
  productOverlay:  $('modal-product-overlay'),
  productTitle:    $('modal-product-title'),
  productForm:     $('product-form'),
  productId:       $('product-id'),
  fieldName:          $('field-name'),
  fieldCategory:      $('field-category'),
  fieldThickness:     $('field-thickness'),
  fieldThicknessUnit: $('field-thickness-unit'),
  fieldSize:          $('field-size'),
  fieldSizeUnit:      $('field-size-unit'),
  fieldSupplier:      $('field-supplier'),
  fieldPrice:         $('field-price'),
  fieldArea:          $('field-area'),
  fieldAreaUnit:      $('field-area-unit'),
  fieldThreshold:     $('field-threshold'),
  fieldOpeningQty:    $('field-opening-qty'),
  openingQtyGroup:    $('opening-qty-group'),

  // ─ Modal: Transaction ─
  txnOverlay:      $('modal-txn-overlay'),
  txnTitle:        $('modal-txn-title'),
  txnProductId:    $('txn-product-id'),
  txnType:         $('txn-type'),
  txnProductName:  $('txn-product-name'),
  fieldTxnQty:     $('field-txn-qty'),
  fieldTxnNote:    $('field-txn-note'),

  // ─ Modal: History ─
  historyOverlay:  $('modal-history-overlay'),
  historyTitle:    $('modal-history-title'),
  historyProduct:  $('modal-history-product'),
  historyBody:     $('history-body'),

  // ─ Modal: Delete ─
  deleteOverlay:   $('modal-delete-overlay'),
  deleteMsg:       $('delete-msg'),
  btnConfirmDelete:$('btn-confirm-delete'),
};

// ── Render ────────────────────────────────────────────────────────────────────

function getVisibleProducts() {
  const derived = state.products.map(deriveProduct);
  return derived.filter(p => {
    const matchCat = state.activeCategory === 'All' || p.category === state.activeCategory;
    if (!matchCat) return false;
    if (!state.searchQuery) return true;
    const q = state.searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.thickness || '').toLowerCase().includes(q) ||
      (p.supplier || '').toLowerCase().includes(q)
    );
  });
}

function renderDashboard() {
  const all = state.products.map(deriveProduct);
  const totalProducts = all.length;
  const totalUnits    = all.reduce((a, p) => a + p.currentQty, 0);
  const totalValue    = all.reduce((a, p) => {
    return (p.pricePerUnit > 0) ? a + p.pricePerUnit * p.currentQty : a;
  }, 0);
  const lowCount = all.filter(p => p.isLowStock).length;

  dom.kpiProductsVal.textContent = totalProducts;
  dom.kpiUnitsVal.textContent    = totalUnits.toLocaleString('en-IN');
  dom.kpiValueVal.textContent    = fmtRupee(totalValue);
  dom.kpiLowstockVal.textContent = lowCount;

  // Toggle alert styling on low-stock card
  if (lowCount > 0) {
    dom.kpiLowstockCard.classList.remove('no-alert');
  } else {
    dom.kpiLowstockCard.classList.add('no-alert');
  }

  // Low-stock banner
  const lowItems = all.filter(p => p.isLowStock);
  if (lowItems.length > 0) {
    dom.bannerText.textContent = 'Low stock: ' +
      lowItems.map(p => `${p.name} (${p.currentQty} left)`).join(' · ');
    dom.banner.hidden = false;
  } else {
    dom.banner.hidden = true;
  }

  // Footer
  const visible = getVisibleProducts().length;
  dom.footerCount.textContent = `Showing ${visible} of ${totalProducts} product${totalProducts !== 1 ? 's' : ''}`;
}

function renderTable() {
  const rows = getVisibleProducts();

  if (rows.length === 0) {
    dom.tbody.innerHTML = '';
    dom.emptyState.hidden = false;
    return;
  }

  dom.emptyState.hidden = true;

  dom.tbody.innerHTML = rows.map(p => {
    const isLow    = p.isLowStock;
    const isPinned = p.id === state.pinnedProductId;
    const rowClass = [
      isLow    ? 'row-low'    : '',
      isPinned ? 'row-pinned' : '',
    ].filter(Boolean).join(' ');

    const qtyBadge = isLow
      ? `<span class="low-badge">LOW</span>`
      : '';

    const thicknessDisplay = p.thickness
      ? `${escHtml(p.thickness)} ${escHtml(p.thicknessUnit || 'mm')}`
      : null;
    const sizeDisplay = p.size
      ? `${escHtml(p.size)} ${escHtml(p.sizeUnit || 'ft')}`
      : null;
    const areaDisplay = p.totalArea !== null
      ? `${Number(p.totalArea).toFixed(2)} ${escHtml(p.areaUnit || 'm²')}`
      : '<span class="text-muted">—</span>';
    const priceDisplay = p.pricePerUnit > 0 ? fmtRupee(p.pricePerUnit) : '<span class="text-muted">—</span>';

    return `
      <tr class="${rowClass}"
          data-id="${p.id}"
          data-action="row-hover">
        <td>
          <div class="product-name">${escHtml(p.name)}</div>
          ${p.thickness || p.size ? `<div class="product-meta">${[thicknessDisplay, sizeDisplay].filter(Boolean).join(' · ')}</div>` : ''}
        </td>
        <td><span class="cat-badge cat-badge--${escHtml(p.category)}">${escHtml(p.category)}</span></td>
        <td>${p.thickness ? `${escHtml(p.thickness)} ${escHtml(p.thicknessUnit || 'mm')}` : '<span class="text-muted">—</span>'}</td>
        <td>${p.size ? `${escHtml(p.size)} ${escHtml(p.sizeUnit || 'ft')}` : '<span class="text-muted">—</span>'}</td>
        <td>${p.supplier ? escHtml(p.supplier) : '<span class="text-muted">—</span>'}</td>
        <td class="col-num">
          <div class="qty-cell">
            <span class="qty-num">${p.currentQty.toLocaleString('en-IN')}</span>
            ${qtyBadge}
          </div>
        </td>
        <td class="col-num">${areaDisplay}</td>
        <td class="col-num">${priceDisplay}</td>
        <td class="col-actions">
          <div class="action-cell">
            <button class="btn btn-sm btn-in"
                    data-id="${p.id}" data-action="stock-in"
                    title="Stock In"
                    aria-label="Stock In for ${escHtml(p.name)}">↓ In</button>
            <button class="btn btn-sm btn-out"
                    data-id="${p.id}" data-action="stock-out"
                    title="Stock Out"
                    aria-label="Stock Out for ${escHtml(p.name)}">↑ Out</button>
            <button class="btn btn-sm btn-history"
                    data-id="${p.id}" data-action="history"
                    title="Transaction History"
                    aria-label="History for ${escHtml(p.name)}">📋</button>
            <button class="btn btn-sm btn-edit"
                    data-id="${p.id}" data-action="edit"
                    title="Edit Product"
                    aria-label="Edit ${escHtml(p.name)}">✏</button>
            <button class="btn btn-sm btn-delete"
                    data-id="${p.id}" data-action="delete"
                    title="Delete Product"
                    aria-label="Delete ${escHtml(p.name)}">🗑</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function render() {
  renderDashboard();
  renderTable();
}

// ── Units Quick-Check Card ────────────────────────────────────────────────────

function updateUnitsCard(productId, pinned) {
  if (!productId) {
    // Nothing hovered & nothing pinned
    dom.unitsCheckLabel.textContent = 'Units';
    dom.unitsCheckValue.textContent = 'Hover a row';
    dom.unitsCheckHint.textContent  = '';
    dom.unitsCheckCard.classList.remove('pinned');
    return;
  }

  const p = state.products.find(x => x.id === productId);
  if (!p) return;

  const d = deriveProduct(p);
  dom.unitsCheckLabel.textContent = d.name;
  dom.unitsCheckValue.textContent = `${d.currentQty.toLocaleString('en-IN')} units`;
  dom.unitsCheckCard.classList.toggle('pinned', pinned);
  dom.unitsCheckHint.textContent = pinned ? 'Pinned — click row to unpin' : 'Click row to pin';
}

// ── Category Tabs ─────────────────────────────────────────────────────────────

dom.catTabs.addEventListener('click', e => {
  const tab = e.target.closest('.cat-tab');
  if (!tab) return;
  state.activeCategory = tab.dataset.cat;

  dom.catTabs.querySelectorAll('.cat-tab').forEach(t => {
    t.classList.toggle('active', t === tab);
    t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
  });
  render();
});

// ── Search ────────────────────────────────────────────────────────────────────

dom.searchInput.addEventListener('input', e => {
  state.searchQuery = e.target.value.trim();
  render();
});

// ── Table Click Delegation ────────────────────────────────────────────────────

dom.tbody.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action    = btn.dataset.action;
  const productId = btn.dataset.id;

  switch (action) {
    case 'stock-in':  openTxnModal(productId, 'in');  break;
    case 'stock-out': openTxnModal(productId, 'out'); break;
    case 'history':   openHistoryModal(productId);    break;
    case 'edit':      openEditProductModal(productId);break;
    case 'delete':    openDeleteModal(productId);     break;
  }
});

// Row hover & pin for Units card
dom.tbody.addEventListener('mouseover', e => {
  if (state.pinnedProductId) return; // pinned → ignore hover
  const row = e.target.closest('tr[data-id]');
  if (!row) return;
  updateUnitsCard(row.dataset.id, false);
});

dom.tbody.addEventListener('mouseleave', () => {
  if (state.pinnedProductId) return;
  updateUnitsCard(null, false);
});

dom.tbody.addEventListener('click', e => {
  // Ignore clicks on action buttons
  if (e.target.closest('[data-action]:not([data-action="row-hover"])')) return;
  const row = e.target.closest('tr[data-id]');
  if (!row) return;

  const id = row.dataset.id;
  if (state.pinnedProductId === id) {
    // Unpin
    state.pinnedProductId = null;
    updateUnitsCard(null, false);
  } else {
    state.pinnedProductId = id;
    updateUnitsCard(id, true);
  }
  render(); // re-render to update pinned row highlight
});

// ── Escape HTML (security) ────────────────────────────────────────────────────

function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── MODAL: Add / Edit Product ─────────────────────────────────────────────────

function openAddProductModal() {
  dom.productId.value           = '';
  dom.productTitle.textContent  = 'Add Product';
  dom.productForm.reset();
  dom.fieldThreshold.value      = '5';
  dom.fieldOpeningQty.value     = '0';
  dom.fieldThicknessUnit.value  = 'mm';
  dom.fieldSizeUnit.value       = 'ft';
  dom.fieldAreaUnit.value       = 'm²';
  dom.openingQtyGroup.hidden    = false;
  dom.productOverlay.hidden     = false;
  dom.fieldName.focus();
}

function openEditProductModal(productId) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;

  dom.productId.value           = p.id;
  dom.productTitle.textContent  = 'Edit Product';
  dom.fieldName.value           = p.name;
  dom.fieldCategory.value       = p.category || 'Plywood';
  dom.fieldThickness.value      = p.thickness || '';
  dom.fieldThicknessUnit.value  = p.thicknessUnit || 'mm';
  dom.fieldSize.value           = p.size || '';
  dom.fieldSizeUnit.value       = p.sizeUnit || 'ft';
  dom.fieldSupplier.value       = p.supplier || '';
  dom.fieldPrice.value          = p.pricePerUnit > 0 ? p.pricePerUnit : '';
  dom.fieldArea.value           = p.areaPerUnit > 0  ? p.areaPerUnit  : '';
  dom.fieldAreaUnit.value       = p.areaUnit || 'm²';
  dom.fieldThreshold.value      = p.threshold ?? 5;
  dom.openingQtyGroup.hidden    = true;
  dom.productOverlay.hidden     = false;
  dom.fieldName.focus();
}

function closeProductModal() {
  dom.productOverlay.hidden = true;
  dom.productForm.reset();
}

dom.btnAddProduct.addEventListener('click', openAddProductModal);
$('btn-close-product-modal').addEventListener('click', closeProductModal);
$('btn-cancel-product').addEventListener('click', closeProductModal);

dom.productOverlay.addEventListener('click', e => {
  if (e.target === dom.productOverlay) closeProductModal();
});

dom.productForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = dom.fieldName.value.trim();
  if (!name) {
    dom.fieldName.focus();
    dom.fieldName.setCustomValidity('Product name is required');
    dom.fieldName.reportValidity();
    return;
  }
  dom.fieldName.setCustomValidity('');

  const existingId = dom.productId.value;

  if (existingId) {
    // Edit
    const idx = state.products.findIndex(p => p.id === existingId);
    if (idx === -1) return;
    state.products[idx] = {
      ...state.products[idx],
      name,
      category:      dom.fieldCategory.value,
      thickness:     dom.fieldThickness.value.trim() || null,
      thicknessUnit: dom.fieldThicknessUnit.value || 'mm',
      size:          dom.fieldSize.value.trim() || null,
      sizeUnit:      dom.fieldSizeUnit.value || 'ft',
      supplier:      dom.fieldSupplier.value.trim() || null,
      pricePerUnit:  parseFloat(dom.fieldPrice.value) || 0,
      areaPerUnit:   parseFloat(dom.fieldArea.value)  || 0,
      areaUnit:      dom.fieldAreaUnit.value || 'm²',
      threshold:     parseInt(dom.fieldThreshold.value, 10) || 0,
    };
  } else {
    // Add new
    const openingQty = parseInt(dom.fieldOpeningQty.value, 10) || 0;
    const product = {
      id:            uid(),
      name,
      category:      dom.fieldCategory.value,
      thickness:     dom.fieldThickness.value.trim() || null,
      thicknessUnit: dom.fieldThicknessUnit.value || 'mm',
      size:          dom.fieldSize.value.trim() || null,
      sizeUnit:      dom.fieldSizeUnit.value || 'ft',
      supplier:      dom.fieldSupplier.value.trim() || null,
      pricePerUnit:  parseFloat(dom.fieldPrice.value) || 0,
      areaPerUnit:   parseFloat(dom.fieldArea.value)  || 0,
      areaUnit:      dom.fieldAreaUnit.value || 'm²',
      threshold:     parseInt(dom.fieldThreshold.value, 10) || 0,
      transactions:  [],
    };

    if (openingQty > 0) {
      product.transactions.push({
        id:   uid(),
        type: 'in',
        qty:  openingQty,
        date: new Date().toISOString(),
        note: 'Opening stock',
      });
    }

    state.products.push(product);
  }

  saveData();
  closeProductModal();
  render();
});

// ── MODAL: Stock In / Stock Out ───────────────────────────────────────────────

function openTxnModal(productId, type) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;

  dom.txnProductId.value    = productId;
  dom.txnType.value         = type;
  dom.txnTitle.textContent  = type === 'in' ? '↓ Stock In' : '↑ Stock Out';
  dom.txnProductName.textContent = p.name;
  dom.fieldTxnQty.value     = '';
  dom.fieldTxnNote.value    = '';

  // Color the confirm button
  const confirmBtn = $('btn-save-txn');
  if (type === 'in') {
    confirmBtn.style.background = 'var(--clr-in)';
    confirmBtn.style.borderColor = 'var(--clr-in)';
  } else {
    confirmBtn.style.background = 'var(--clr-alert)';
    confirmBtn.style.borderColor = 'var(--clr-alert)';
  }

  dom.txnOverlay.hidden = false;
  dom.fieldTxnQty.focus();
}

function closeTxnModal() {
  dom.txnOverlay.hidden = true;
}

$('btn-close-txn-modal').addEventListener('click', closeTxnModal);
$('btn-cancel-txn').addEventListener('click', closeTxnModal);

dom.txnOverlay.addEventListener('click', e => {
  if (e.target === dom.txnOverlay) closeTxnModal();
});

$('txn-form').addEventListener('submit', e => {
  e.preventDefault();

  const productId = dom.txnProductId.value;
  const type      = dom.txnType.value;
  const qty       = parseInt(dom.fieldTxnQty.value, 10);
  const note      = dom.fieldTxnNote.value.trim();

  if (!qty || qty < 1) {
    dom.fieldTxnQty.focus();
    return;
  }

  const p = state.products.find(x => x.id === productId);
  if (!p) return;

  // Guard: prevent negative stock on stock-out
  if (type === 'out') {
    const d = deriveProduct(p);
    if (qty > d.currentQty) {
      alert(`Cannot stock out ${qty} — only ${d.currentQty} units available.`);
      return;
    }
  }

  p.transactions.push({
    id:   uid(),
    type,
    qty,
    date: new Date().toISOString(),
    note: note || null,
  });

  saveData();
  closeTxnModal();
  render();

  // If this product is pinned, update the card live
  if (state.pinnedProductId === productId) {
    updateUnitsCard(productId, true);
  }
});

// ── MODAL: Transaction History ────────────────────────────────────────────────

function openHistoryModal(productId) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;

  dom.historyTitle.textContent   = 'Transaction History';
  dom.historyProduct.textContent = p.name;

  const txns = [...p.transactions].reverse(); // newest first

  if (txns.length === 0) {
    dom.historyBody.innerHTML = `<p class="history-empty">No transactions yet for this product.</p>`;
  } else {
    dom.historyBody.innerHTML = `
      <div class="history-list">
        ${txns.map(t => `
          <div class="history-item history-item--${t.type}">
            <span class="history-type-badge badge-${t.type}">${t.type === 'in' ? '↓ IN' : '↑ OUT'}</span>
            <div class="history-info">
              <div class="history-qty">${t.qty.toLocaleString('en-IN')} unit${t.qty !== 1 ? 's' : ''}</div>
              ${t.note ? `<div class="history-note">${escHtml(t.note)}</div>` : ''}
            </div>
            <div class="history-date">${fmtDate(t.date)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  dom.historyOverlay.hidden = false;
}

function closeHistoryModal() {
  dom.historyOverlay.hidden = true;
}

$('btn-close-history-modal').addEventListener('click', closeHistoryModal);

dom.historyOverlay.addEventListener('click', e => {
  if (e.target === dom.historyOverlay) closeHistoryModal();
});

// ── MODAL: Delete ─────────────────────────────────────────────────────────────

let pendingDeleteId = null;

function openDeleteModal(productId) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;
  pendingDeleteId = productId;
  dom.deleteMsg.textContent = `Delete "${p.name}"?`;
  dom.deleteOverlay.hidden  = false;
}

function closeDeleteModal() {
  dom.deleteOverlay.hidden = true;
  pendingDeleteId = null;
}

$('btn-close-delete-modal').addEventListener('click', closeDeleteModal);
$('btn-cancel-delete').addEventListener('click', closeDeleteModal);

dom.deleteOverlay.addEventListener('click', e => {
  if (e.target === dom.deleteOverlay) closeDeleteModal();
});

dom.btnConfirmDelete.addEventListener('click', () => {
  if (!pendingDeleteId) return;
  state.products = state.products.filter(p => p.id !== pendingDeleteId);
  if (state.pinnedProductId === pendingDeleteId) {
    state.pinnedProductId = null;
    updateUnitsCard(null, false);
  }
  saveData();
  closeDeleteModal();
  render();
});

// ── Keyboard: close modals on Escape ─────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!dom.productOverlay.hidden) { closeProductModal();  return; }
  if (!dom.txnOverlay.hidden)     { closeTxnModal();      return; }
  if (!dom.historyOverlay.hidden) { closeHistoryModal();  return; }
  if (!dom.deleteOverlay.hidden)  { closeDeleteModal();   return; }
});

// ── Seed Data (first launch only) ────────────────────────────────────────────

function seedIfEmpty() {
  if (state.products.length > 0) return;

  const now = new Date();
  const daysAgo = n => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  state.products = [
    {
      id: uid(),
      name: 'SVP-08 Walnut',
      category: 'Vox',
      thickness: '3.85',
      thicknessUnit: 'mm',
      size: '8x4',
      sizeUnit: 'ft',
      supplier: 'Greenply',
      pricePerUnit: 1450,
      areaPerUnit: 2.97,
      areaUnit: 'm²',
      threshold: 5,
      transactions: [
        { id: uid(), type: 'in',  qty: 30, date: daysAgo(15), note: 'Opening stock' },
        { id: uid(), type: 'out', qty: 8,  date: daysAgo(10), note: 'Sold to Sharma Interiors' },
        { id: uid(), type: 'out', qty: 5,  date: daysAgo(4),  note: 'Sold to Patel Decor' },
        { id: uid(), type: 'in',  qty: 20, date: daysAgo(2),  note: 'New shipment' },
      ],
    },
    {
      id: uid(),
      name: 'Structural Plywood',
      category: 'Plywood',
      thickness: '19',
      thicknessUnit: 'mm',
      size: '8x4',
      sizeUnit: 'ft',
      supplier: 'Century Ply',
      pricePerUnit: 2100,
      areaPerUnit: 2.97,
      areaUnit: 'm²',
      threshold: 10,
      transactions: [
        { id: uid(), type: 'in',  qty: 50, date: daysAgo(20), note: 'Opening stock' },
        { id: uid(), type: 'out', qty: 12, date: daysAgo(15), note: 'Site: Andheri project' },
        { id: uid(), type: 'out', qty: 18, date: daysAgo(8),  note: 'Site: Bandra project' },
        { id: uid(), type: 'out', qty: 15, date: daysAgo(3),  note: 'Sold to Kumar Builders' },
      ],
    },
    {
      id: uid(),
      name: 'Marine Plywood',
      category: 'Plywood',
      thickness: '12',
      thicknessUnit: 'mm',
      size: '8x4',
      sizeUnit: 'ft',
      supplier: 'Kitply',
      pricePerUnit: 1800,
      areaPerUnit: 2.97,
      areaUnit: 'm²',
      threshold: 8,
      transactions: [
        { id: uid(), type: 'in',  qty: 25, date: daysAgo(18), note: 'Opening stock' },
        { id: uid(), type: 'out', qty: 10, date: daysAgo(12), note: 'Boat repair job' },
        { id: uid(), type: 'out', qty: 8,  date: daysAgo(5),  note: 'Kitchen cabinet order' },
        { id: uid(), type: 'in',  qty: 2,  date: daysAgo(1),  note: 'Return from site' },
      ],
    },
    {
      id: uid(),
      name: 'SVP-12 Teak',
      category: 'Vox',
      thickness: '3.85',
      thicknessUnit: 'mm',
      size: '8x4',
      sizeUnit: 'ft',
      supplier: 'Greenply',
      pricePerUnit: 1650,
      areaPerUnit: 2.97,
      areaUnit: 'm²',
      threshold: 5,
      transactions: [
        { id: uid(), type: 'in',  qty: 20, date: daysAgo(14), note: 'Opening stock' },
        { id: uid(), type: 'out', qty: 6,  date: daysAgo(9),  note: 'Sold to Desai Furniture' },
        { id: uid(), type: 'out', qty: 10, date: daysAgo(3),  note: 'Bulk order' },
      ],
    },
    {
      id: uid(),
      name: 'Flexi Ply',
      category: 'Plywood',
      thickness: '4',
      thicknessUnit: 'mm',
      size: '8x4',
      sizeUnit: 'ft',
      supplier: 'Century Ply',
      pricePerUnit: 950,
      areaPerUnit: 2.97,
      areaUnit: 'm²',
      threshold: 6,
      transactions: [
        { id: uid(), type: 'in',  qty: 15, date: daysAgo(20), note: 'Opening stock' },
        { id: uid(), type: 'out', qty: 5,  date: daysAgo(12), note: 'Sold retail' },
        { id: uid(), type: 'out', qty: 7,  date: daysAgo(6),  note: 'Curved furniture project' },
      ],
    },
    {
      id: uid(),
      name: 'Acoustic Panel',
      category: 'Other',
      thickness: '12',
      thicknessUnit: 'mm',
      size: '8x4',
      sizeUnit: 'ft',
      supplier: 'Armstrong',
      pricePerUnit: 3200,
      areaPerUnit: 2.97,
      areaUnit: 'm²',
      threshold: 4,
      transactions: [
        { id: uid(), type: 'in',  qty: 10, date: daysAgo(30), note: 'Opening stock' },
        { id: uid(), type: 'out', qty: 4,  date: daysAgo(20), note: 'Studio project' },
        { id: uid(), type: 'out', qty: 3,  date: daysAgo(7),  note: 'Conference room install' },
      ],
    },
  ];

  saveData();
}

// ── Init ──────────────────────────────────────────────────────────────────────

seedIfEmpty();
render();
