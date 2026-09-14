# 📋 Stocks — Plywood & Panels Register

A lightweight, offline-first stock register built for timber and panel businesses. Track every movement of your Plywood, Vox panels, and decorative panels — always know exactly what's left on your shelves.

---

## ✨ Features

### 📊 Live Dashboard (KPI Cards)
- **Products** — total number of distinct product SKUs
- **Total Units** — sum of all current stock quantities
- **Stock Value** — total inventory value in Indian Rupees (₹)
- **Low Stock** — count of products that have fallen at or below their threshold
- **Units Quick-Check** — hover any row to instantly see that product's current quantity; click a row to **pin** it to the card

### 🗂️ Category Tabs
Filter the product list by:
- **All** — show everything
- **Plywood** — structural, marine, flexi plywood, etc.
- **Vox** — Vox decorative panels
- **Other** — acoustic panels and miscellaneous items

### 🔍 Live Search
Search across product name, thickness, and supplier simultaneously — results update as you type.

### 📦 Product Management
| Field | Description |
|---|---|
| Product Name | Required; unique identifier for the SKU |
| Category | Plywood / Vox / Other |
| Thickness | Numeric value with selectable unit (mm, cm, m, ft) |
| Size | Sheet size with selectable unit (ft, m, cm) |
| Supplier | Supplier or manufacturer name |
| Price / Unit | Price per sheet/unit in ₹ |
| Area / Unit | Surface area per unit with selectable unit (m², ft², cm²) |
| Low-Stock Threshold | Alert triggers when stock ≤ this value (default: 5) |
| Opening Quantity | Set initial stock when adding a new product |

### ↕️ Stock Movements
- **Stock In (↓)** — record incoming inventory with quantity and an optional note
- **Stock Out (↑)** — record outgoing inventory; prevents going below zero
- Every movement is timestamped automatically

### 📋 Transaction History
View the complete in/out history for any product, displayed newest-first with date, time, quantity, and note.

### ⚠️ Low-Stock Alerts
- A banner across the top lists every product that is running low, with remaining quantity
- The **Low Stock** KPI card turns visually alert-colored
- Individual table rows are highlighted to make low-stock items immediately obvious with a **LOW** badge

### 🗑️ Safe Delete
A confirmation modal prevents accidental deletion; removing a product also removes all its transaction history.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic, accessible) |
| Styling | Vanilla CSS (custom properties, Grid, Flexbox) |
| Logic | Vanilla JavaScript (ES6+, strict mode, no dependencies) |
| Storage | `localStorage` — data persists across sessions in the browser |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |

**Zero build steps. Zero dependencies. Zero frameworks.**  
Just open `index.html` in any modern browser and it works.

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/kanan2818/Stocks-track.git
cd Stocks-track
```

Then simply open `index.html` in your browser — no server, no npm install, no build required.

> On first launch, the app seeds 6 sample products (Plywood, Vox, and Other categories) so you can immediately explore all features.

---

## 📁 Project Structure

```
Stocks-track/
├── index.html              # App shell, markup & modals
├── style.css               # All styles (design tokens, layout, components)
├── app.js                  # Application logic (state, rendering, events)
└── Stocks_Detailed_Plan.md # Original feature plan & design notes
```

---

## 🔑 Key Interactions

| Action | How |
|---|---|
| Add product | Click **+ Add Product** |
| Edit product | Click the ✏ button on any row |
| Record stock in | Click **↓ In** on any row |
| Record stock out | Click **↑ Out** on any row |
| View history | Click 📋 on any row |
| Delete product | Click 🗑 on any row → confirm |
| Quick stock check | Hover any row (or click to pin) |
| Filter by category | Click the category tabs (All / Plywood / Vox / Other) |
| Search | Type in the search box |
| Close any modal | Press `Escape` or click outside the modal |

---

## 💾 Data Persistence

All data is stored in the browser's **`localStorage`** under the key `stocks_data_v1`. This means:
- ✅ Data survives page refreshes and browser restarts
- ✅ No backend or internet connection required
- ⚠️ Data is tied to the specific browser and device
- ⚠️ Clearing browser storage will erase all data

---

## 🔒 Security

User-supplied strings are sanitised with an `escHtml()` helper before being injected into the DOM, preventing XSS attacks. No data ever leaves the device.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
