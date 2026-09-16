import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DEFAULTS = {
  name:          '',
  category:      'Plywood',
  thickness:     '',
  thicknessUnit: 'mm',
  size:          '',
  sizeUnit:      'ft',
  supplier:      '',
  pricePerUnit:  '',
  areaPerUnit:   '',
  areaUnit:      'm²',
  threshold:     5,
  openingQty:    0,
};

export default function ProductModal({ product, onSave, onClose }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});

  /* Pre-fill when editing */
  useEffect(() => {
    if (product) {
      setForm({
        name:          product.name          ?? '',
        category:      product.category      ?? 'Plywood',
        thickness:     product.thickness     ?? '',
        thicknessUnit: product.thicknessUnit ?? 'mm',
        size:          product.size          ?? '',
        sizeUnit:      product.sizeUnit      ?? 'ft',
        supplier:      product.supplier      ?? '',
        pricePerUnit:  product.pricePerUnit  ?? '',
        areaPerUnit:   product.areaPerUnit   ?? '',
        areaUnit:      product.areaUnit      ?? 'm²',
        threshold:     product.threshold     ?? 5,
        openingQty:    0, // not shown in edit mode
      });
    } else {
      setForm(DEFAULTS);
    }
    setErrors({});
  }, [product]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required.';
    if (form.threshold === '' || Number(form.threshold) < 0) errs.threshold = 'Enter a valid threshold.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSave({
      name:          form.name.trim(),
      category:      form.category,
      thickness:     form.thickness,
      thicknessUnit: form.thicknessUnit,
      size:          form.size,
      sizeUnit:      form.sizeUnit,
      supplier:      form.supplier.trim(),
      pricePerUnit:  form.pricePerUnit !== '' ? Number(form.pricePerUnit) : 0,
      areaPerUnit:   form.areaPerUnit  !== '' ? Number(form.areaPerUnit)  : 0,
      areaUnit:      form.areaUnit,
      threshold:     Number(form.threshold),
      openingQty:    isEdit ? 0 : Number(form.openingQty) || 0,
    });
  };

  return (
    <div
      className="modal-overlay"
      id="modal-product-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal">

        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="modal-product-title">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h2>
            {isEdit && (
              <p className="modal-subtitle">
                Editing — quantity cannot be changed directly; use Stock In / Out.
              </p>
            )}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit} noValidate id="product-form">

          {/* Name */}
          <div className="form-row form-row--full">
            <div className="form-group">
              <label className="form-label" htmlFor="field-name">
                Product Name <span className="required">*</span>
              </label>
              <input
                id="field-name"
                type="text"
                className="form-input"
                placeholder="e.g. SVP-08 Walnut"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                autoFocus
              />
              {errors.name && <span style={{ color:'var(--red)', fontSize:'0.8125rem' }}>{errors.name}</span>}
            </div>
          </div>

          {/* Category + Thickness */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="field-category">Category</label>
              <select
                id="field-category"
                className="form-input form-select"
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                <option value="Plywood">Plywood</option>
                <option value="Vox">Vox</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="field-thickness">Thickness</label>
              <div className="input-unit-combo">
                <input
                  id="field-thickness"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 19"
                  min="0" step="0.01"
                  value={form.thickness}
                  onChange={e => set('thickness', e.target.value)}
                />
                <select
                  id="field-thickness-unit"
                  className="unit-select"
                  aria-label="Thickness unit"
                  value={form.thicknessUnit}
                  onChange={e => set('thicknessUnit', e.target.value)}
                >
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Size + Supplier */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="field-size">Size</label>
              <div className="input-unit-combo">
                <input
                  id="field-size"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 8x4"
                  value={form.size}
                  onChange={e => set('size', e.target.value)}
                />
                <select
                  id="field-size-unit"
                  className="unit-select"
                  aria-label="Size unit"
                  value={form.sizeUnit}
                  onChange={e => set('sizeUnit', e.target.value)}
                >
                  <option value="ft">ft</option>
                  <option value="m">m</option>
                  <option value="cm">cm</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="field-supplier">Supplier</label>
              <input
                id="field-supplier"
                type="text"
                className="form-input"
                placeholder="e.g. Century Ply"
                value={form.supplier}
                onChange={e => set('supplier', e.target.value)}
              />
            </div>
          </div>

          {/* Price + Area */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="field-price">Price per Unit (₹)</label>
              <input
                id="field-price"
                type="number"
                className="form-input"
                placeholder="e.g. 1200"
                min="0" step="0.01"
                value={form.pricePerUnit}
                onChange={e => set('pricePerUnit', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="field-area">Area per Unit</label>
              <div className="input-unit-combo">
                <input
                  id="field-area"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2.97"
                  min="0" step="0.01"
                  value={form.areaPerUnit}
                  onChange={e => set('areaPerUnit', e.target.value)}
                />
                <select
                  id="field-area-unit"
                  className="unit-select"
                  aria-label="Area unit"
                  value={form.areaUnit}
                  onChange={e => set('areaUnit', e.target.value)}
                >
                  <option value="m²">m²</option>
                  <option value="ft²">ft²</option>
                  <option value="cm²">cm²</option>
                </select>
              </div>
            </div>
          </div>

          {/* Threshold + Opening Qty */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="field-threshold">Low-Stock Threshold</label>
              <input
                id="field-threshold"
                type="number"
                className="form-input"
                placeholder="e.g. 5"
                min="0" step="1"
                value={form.threshold}
                onChange={e => set('threshold', e.target.value)}
              />
              {errors.threshold && (
                <span style={{ color:'var(--red)', fontSize:'0.8125rem' }}>{errors.threshold}</span>
              )}
            </div>

            {!isEdit && (
              <div className="form-group" id="opening-qty-group">
                <label className="form-label" htmlFor="field-opening-qty">Opening Quantity</label>
                <input
                  id="field-opening-qty"
                  type="number"
                  className="form-input"
                  placeholder="Starting stock (0)"
                  min="0" step="1"
                  value={form.openingQty}
                  onChange={e => set('openingQty', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" id="btn-cancel-product" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-product">
              {isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
