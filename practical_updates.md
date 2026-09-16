# Practical Updates for Your Shop Stock Tracker

I've gone through every file. Here's what your app **already does well** and what's **actually missing** for daily shop use — sorted by how much time each would save you.

---

## 🔥 High Impact — You'll use these daily

### 1. Export to Excel / PDF
Right now there's **no way to get your data out**. If a supplier asks "send me your current stock list" or your CA needs inventory for tax filing, you're stuck screenshotting.

- **Export to Excel (.csv)** — one-click download of current stock with all columns
- **Export to PDF** — printable stock report with your shop name, date, totals

> **Effort**: Small — no backend changes needed

---

### 2. Sort the Table by Any Column
The product table has **no sorting**. When you have 50+ products, you can't quickly find the most expensive item, the lowest stock, or sort by supplier.

- Click any column header (Qty, Value, Name, Supplier) to sort ascending/descending
- Remember the last sort choice

> **Effort**: Small — pure UI change

---

### 3. Stock Out with Customer/Party Name
When you do Stock Out, the note field is optional and freeform. But in a real shop, **every outward transaction has a buyer**. 

- Add a dedicated **"Party / Customer"** field to Stock Out (separate from notes)
- This lets you later answer: *"How many sheets did Sharma Interiors buy this month?"*

> **Effort**: Small — just a field addition in StockModal + transaction data

---

### 4. Date-Range Filtering on Transaction History
The history modal shows **all transactions ever** in a single list. After a few months, this becomes unusable.

- Add "Today / This Week / This Month / Custom Range" filter to the history modal
- Show a running balance alongside each transaction

> **Effort**: Medium — UI + filtering logic

---

## ⚡ Medium Impact — Weekly/Monthly use

### 5. Dashboard: Today's Activity Summary
Your KPI cards show totals, but **nothing about today**. When you close shop, you want to know:

- Sheets sold today (total Stock Out count)
- Sheets received today (total Stock In count)
- Today's sale value

> A small "Today" section below the existing KPI cards would be very useful.

> **Effort**: Medium — needs date filtering on transactions

---

### 6. WhatsApp Share for Low Stock Alerts
You have a low-stock banner, but it **only shows on screen**. If you're away from the shop, you don't know stock is low.

- "Share via WhatsApp" button on the low-stock banner
- Formats a clean message: *"⚠️ Low Stock Alert — SVP-08 Walnut: 3 left, Century MR: 2 left"*
- Uses `https://wa.me/?text=...` — works on any phone, no API needed

> **Effort**: Small — just a URL builder + button

---

### 7. Bulk Stock In (for when a truck arrives)
When a new shipment comes, you're adding stock **one product at a time**. If 15 products arrive in one delivery:

- A "Bulk Stock In" mode where you see a list of all products with quantity input fields
- Fill in quantities for each item received, hit "Save All" once
- All get the same note (e.g., "Delivery from Century, Invoice #4521")

> **Effort**: Medium — new component + batch Firestore writes

---

### 8. Per-User Firestore Rules (Multi-shop / Multi-user)
Right now, **all logged-in users see all products**. The Firestore query has no `userId` filter. This means if you ever add a second user (your shop manager, partner, brother's shop), they all share the same data.

- Store `userId` on each product document
- Filter by `userId` in the Firestore query
- Each user only sees their own shop's stock

> **Effort**: Medium — data migration + rule changes

---

## 📋 Nice to Have — But genuinely useful

### 9. Column Visibility Toggle
Not every shop cares about "Area" or "Thickness". Let users hide/show columns so the table fits their screen without horizontal scrolling.

> **Effort**: Small

### 10. Dark Mode Toggle
You already have beautiful design tokens. A dark mode for evening / low-light use in the godown would be easy to add and practical for warehouse use.

> **Effort**: Small — CSS variable swap

### 11. Print-Friendly View
A "Print Stock Register" button that opens a clean, ink-friendly print layout (no gradients, no shadows, clear borders) for maintaining a physical backup register.

> **Effort**: Small — `@media print` CSS

### 12. Product Image Upload  
Attach a photo to each product (especially useful when products look similar — "which 19mm plywood is which?"). Firebase Storage can handle this easily since you're already on Firebase.

> **Effort**: Medium — Firebase Storage + UI

---

## What I'd recommend building first

| Priority | Feature | Why |
|----------|---------|-----|
| **1st** | Export to Excel/PDF | You **will** need this for tax/GST filing |
| **2nd** | Table sorting | Makes finding products 10x faster |
| **3rd** | WhatsApp low-stock share | Zero effort, high daily value |
| **4th** | Today's activity summary | Know your daily movement at a glance |
| **5th** | Customer name on Stock Out | Essential for any future "sales report" |

---

> [!TIP]
> Let me know which ones you want to build — I can start implementing them right away. I'd suggest starting with **Export + Sorting + WhatsApp share** since all three are small changes with immediate daily value.
