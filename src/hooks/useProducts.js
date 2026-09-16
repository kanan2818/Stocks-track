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

/* ── Hook ─────────────────────────────────────────────────────────────────── */
export function useProducts(userId) {
  const [raw,            setRaw]            = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);

  const colRef = collection(db, 'products');

  /* ── Real-time listener — only starts once auth is confirmed ────────── */
  useEffect(() => {
    // userId is undefined while auth is still initialising,
    // and null when signed out. Wait until it's a real string.
    if (!userId) return;

    const unsub = onSnapshot(
      colRef,
      snap => {
        setFirestoreError(null);
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
    return unsub;
  }, [userId]); // re-run whenever the authenticated user changes

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
