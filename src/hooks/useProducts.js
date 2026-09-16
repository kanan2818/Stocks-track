/**
 * useProducts.js — Phase 10
 *
 * Data layer switched from localStorage to Firestore.
 * The component API (products, addProduct, etc.) is unchanged —
 * no other files needed to be modified.
 *
 * Firestore structure:
 *   /products/{productId}  →  one document per product
 *   Each document contains all product fields + a `transactions` array.
 */

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db }             from '../firebase';
import { uid, deriveProduct } from '../utils';

/* ── Seed Data (first launch — only runs when Firestore collection is empty) ── */
function makeSeed() {
  const now = new Date();
  const ago = n => { const d = new Date(now); d.setDate(d.getDate() - n); return d.toISOString(); };
  const t   = (type, qty, date, note) => ({ id: uid(), type, qty, date, note });

  return [
    {
      id: uid(), name: 'SVP-08 Walnut', category: 'Vox',
      thickness: '3.85', thicknessUnit: 'mm', size: '8x4', sizeUnit: 'ft',
      supplier: 'Greenply', pricePerUnit: 1450, areaPerUnit: 2.97, areaUnit: 'm²',
      threshold: 5,
      transactions: [
        t('in',  30, ago(15), 'Opening stock'),
        t('out',  8, ago(10), 'Sold to Sharma Interiors'),
        t('out',  5, ago(4),  'Sold to Patel Decor'),
        t('in',  20, ago(2),  'New shipment'),
      ],
    },
    {
      id: uid(), name: 'Structural Plywood', category: 'Plywood',
      thickness: '19', thicknessUnit: 'mm', size: '8x4', sizeUnit: 'ft',
      supplier: 'Century Ply', pricePerUnit: 2100, areaPerUnit: 2.97, areaUnit: 'm²',
      threshold: 10,
      transactions: [
        t('in',  50, ago(20), 'Opening stock'),
        t('out', 12, ago(15), 'Site: Andheri project'),
        t('out', 18, ago(8),  'Site: Bandra project'),
        t('out', 15, ago(3),  'Sold to Kumar Builders'),
      ],
    },
    {
      id: uid(), name: 'Marine Plywood', category: 'Plywood',
      thickness: '12', thicknessUnit: 'mm', size: '8x4', sizeUnit: 'ft',
      supplier: 'Kitply', pricePerUnit: 1800, areaPerUnit: 2.97, areaUnit: 'm²',
      threshold: 8,
      transactions: [
        t('in',  25, ago(18), 'Opening stock'),
        t('out', 10, ago(12), 'Boat repair job'),
        t('out',  8, ago(5),  'Kitchen cabinet order'),
        t('in',   2, ago(1),  'Return from site'),
      ],
    },
    {
      id: uid(), name: 'SVP-12 Teak', category: 'Vox',
      thickness: '3.85', thicknessUnit: 'mm', size: '8x4', sizeUnit: 'ft',
      supplier: 'Greenply', pricePerUnit: 1650, areaPerUnit: 2.97, areaUnit: 'm²',
      threshold: 5,
      transactions: [
        t('in',  20, ago(14), 'Opening stock'),
        t('out',  6, ago(9),  'Sold to Desai Furniture'),
        t('out', 10, ago(3),  'Bulk order'),
      ],
    },
    {
      id: uid(), name: 'Flexi Ply', category: 'Plywood',
      thickness: '4', thicknessUnit: 'mm', size: '8x4', sizeUnit: 'ft',
      supplier: 'Century Ply', pricePerUnit: 950, areaPerUnit: 2.97, areaUnit: 'm²',
      threshold: 6,
      transactions: [
        t('in',  15, ago(20), 'Opening stock'),
        t('out',  5, ago(12), 'Sold retail'),
        t('out',  7, ago(6),  'Curved furniture project'),
      ],
    },
    {
      id: uid(), name: 'Acoustic Panel', category: 'Other',
      thickness: '12', thicknessUnit: 'mm', size: '8x4', sizeUnit: 'ft',
      supplier: 'Armstrong', pricePerUnit: 3200, areaPerUnit: 2.97, areaUnit: 'm²',
      threshold: 4,
      transactions: [
        t('in',  10, ago(30), 'Opening stock'),
        t('out',  4, ago(20), 'Studio project'),
        t('out',  3, ago(7),  'Conference room install'),
      ],
    },
  ];
}

/* ── Hook ─────────────────────────────────────────────────────────────────── */
export function useProducts() {
  const [raw,            setRaw]            = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);

  const colRef = collection(db, 'products');

  /* ── Real-time listener ──────────────────────────────────────────────── */
  useEffect(() => {
    const unsub = onSnapshot(
      colRef,
      async snap => {
        setFirestoreError(null);
        if (snap.empty) {
          // First launch — seed the database
          const seeds = makeSeed();
          await Promise.all(seeds.map(p => setDoc(doc(db, 'products', p.id), p)));
          // onSnapshot will fire again with the seeded data
          return;
        }
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRaw(data);
        setLoading(false);
      },
      err => {
        console.error('Firestore error:', err);
        setFirestoreError(err.code || err.message);
        setLoading(false);
      }
    );
    return unsub; // unsubscribe on unmount
  }, []);

  /* ── Add a new product ───────────────────────────────────────────────── */
  const addProduct = async ({ openingQty = 0, ...fields }) => {
    const id = uid();
    const product = {
      id,
      ...fields,
      transactions: openingQty > 0
        ? [{ id: uid(), type: 'in', qty: Number(openingQty), date: new Date().toISOString(), note: 'Opening stock' }]
        : [],
    };
    await setDoc(doc(db, 'products', id), product);
  };

  /* ── Edit metadata (never edits transactions directly) ───────────────── */
  const editProduct = async (id, fields) => {
    const { transactions, currentQty, totalArea, isLowStock, ...safeFields } = fields;
    await updateDoc(doc(db, 'products', id), safeFields);
  };

  /* ── Delete ─────────────────────────────────────────────────────────── */
  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
  };

  /* ── Add a transaction (stock in / out) ──────────────────────────────── */
  const addTransaction = async (productId, type, qty, note = '') => {
    const txn = { id: uid(), type, qty: Number(qty), date: new Date().toISOString(), note };
    await updateDoc(doc(db, 'products', productId), {
      transactions: arrayUnion(txn),
    });
  };

  return {
    products: raw.map(deriveProduct),
    loading,
    firestoreError,
    addProduct,
    editProduct,
    deleteProduct,
    addTransaction,
  };
}
