/**
 * utils.js — Pure helper functions (no side effects, no React).
 */

/** Generate a short unique ID */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Format a number as Indian rupees (₹) */
export function fmtRupee(n) {
  if (n == null || isNaN(n)) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/** Format area with the unit label */
export function fmtArea(n, unit = 'm²') {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toFixed(2) + '\u00a0' + unit;
}

/** Format an ISO date string as "16 Sep 2026, 11:55 AM" */
export function fmtDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return (
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
}

/** Sanitise a string for safe HTML injection */
export function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Compute derived fields for a raw product object.
 * currentQty  = Σin − Σout
 * totalArea   = areaPerUnit × currentQty  (null if areaPerUnit not set)
 * isLowStock  = currentQty ≤ threshold
 */
export function deriveProduct(p) {
  const qty = (p.transactions ?? []).reduce(
    (acc, t) => (t.type === 'in' ? acc + t.qty : acc - t.qty),
    0
  );
  const area =
    p.areaPerUnit > 0 ? +(p.areaPerUnit * qty).toFixed(4) : null;

  return {
    ...p,
    currentQty: qty,
    totalArea: area,
    isLowStock: qty <= (p.threshold ?? 5),
  };
}
