# Stocks — Project Plan

**A simple stock register for a plywood, Vox & decorative panels business**

---

## 1. Purpose

Stocks exists to solve one everyday problem: knowing exactly how much material is left, without manually counting or maintaining a paper register. If you have 5 plys and sell 3, Stocks should immediately and correctly show 2 remaining — no math, no guessing, no mismatched numbers.

It's built to be used daily by someone running the business day-to-day, so simplicity and readability matter as much as functionality.

---

## 2. Goals

- Track every product (plywood, Vox panels, laminate, decorative panels) with its own details
- Record every stock movement — purchase (in) and sale (out) — as it happens
- Always show accurate, auto-calculated remaining quantity
- Show total area of stock on hand, not just piece count, for products sold by area
- Warn when a product is running low, before it runs out
- Separate stock by brand/category (Plywood vs Vox vs Other) for quick filtering
- Keep a full history of transactions for reference
- Be easy to read and use for anyone, including older or less tech-comfortable users
- Save data automatically so nothing is lost between sessions

---

## 3. Who Uses It

- **Primary user:** business owner / family member managing day-to-day stock
- **Usage pattern:** quick, frequent updates throughout the day (a sale here, a delivery there) — not a one-time data entry job
- **Design implication:** large, legible text; calm colors; minimal clicks per action; clear visual signal for "this needs attention" (low stock)

---

## 4. Core Concept: Stock Is Always Calculated, Never Typed

The single most important design decision in Stocks:

> **Quantity is never edited directly.** It is always the result of `(total stock in) − (total stock out)`.

This is what prevents the classic inventory problem — the register saying one number while the shelf shows another. Every change to stock happens through a **transaction** (in or out), and the displayed quantity is simply the running total.

The same principle extends to **total area**: it is never typed in either — it's calculated as `area of one sheet × current quantity`, so it always stays correct as stock moves.

---

## 5. Data Model

### Product
| Field | Description |
|---|---|
| Name | e.g. "SVP-08 Walnut" |
| Category | Plywood / Vox / Other |
| Thickness | Free text, e.g. "19mm" or "3.85m" — not required |
| Size | Free text, e.g. "8x4 ft" — not required |
| Supplier | Who it's sourced from |
| Price per unit | For stock value calculation |
| Area per unit | Area of a single sheet (in m²) — not required, only for products tracked by area |
| Low stock threshold | Quantity at which to flag as "low" |
| Current quantity | *Derived* — not stored/edited directly |
| History | List of all transactions for this product |

### Transaction (per product)
| Field | Description |
|---|---|
| Type | "in" (purchase/received) or "out" (sold) |
| Quantity | How many units moved |
| Date | Auto-recorded |
| Note | Optional — e.g. "Sold to Sharma Interiors" |

---

## 6. Feature Breakdown

### 6.1 Product Catalog
- Add a new product with name, category, thickness, size, supplier, price, area per unit, and an opening quantity
- Only name is required — everything else can be left blank if it doesn't apply
- Edit/delete products as needed
- Search by name, thickness, or supplier

### 6.2 Stock In / Stock Out
- Two clear actions per product: **Stock In** (received/purchased) and **Stock Out** (sold)
- Enter quantity + optional note
- Quantity updates instantly and is reflected everywhere in the app

### 6.3 Total Area Tracking
- If a product has an area-per-unit value set (e.g. 3.85 m² per sheet), the table shows the **total area currently in stock**: `area per sheet × quantity`
- Example: 1 sheet = 3.85 m², 100 sheets in stock → 385 m² shown automatically
- Products without an area value simply show "—" in that column, so this only applies where it's relevant

### 6.4 Category Tabs (Plywood / Vox / Other)
- Every product is tagged with a category at creation
- Tabs at the top of the table — **All / Plywood / Vox / Other** — instantly filter the list to just that brand/category
- Keeps a mixed inventory (e.g. plywood sheets alongside Vox panels) easy to browse separately

### 6.5 Low Stock Alerts
- Each product has a reorder threshold
- Any product at or below that threshold is visually flagged (red border + badge) in the main table
- A banner above the table lists all currently low-stock items by name
- Dashboard shows a running count of how many items are low

### 6.6 "Units" Quick-Check Card
- A dedicated stat card labeled **"Units"** on the dashboard
- Hovering over any row shows that product's live quantity — the card updates to **"Units: [product name]"** with its current stock count
- Clicking a row "pins" that product so the card stays even after moving the mouse away; clicking again unpins it
- Answers the exact question "how many of *this* do I have left?" without scrolling through the whole table

### 6.7 Transaction History
- Every in/out movement is logged with date and note
- Viewable per product, most recent first
- Acts as a permanent audit trail — useful for resolving "did we actually sell that?" questions later

### 6.8 Dashboard Summary
At a glance, on opening the app:
- Total number of products tracked
- Total units currently in stock
- Total stock value (units × price, summed)
- Number of items currently low on stock
- Units card for whichever product is hovered/pinned

### 6.9 Accessibility & Usability
- Larger-than-default font sizes throughout
- Calm, low-contrast, muted sage/beige color palette instead of harsh bright white or saturated colors
- Generous padding and spacing so buttons and rows are easy to tap/click accurately
- Clear, plain-language labels — no jargon, no unnecessary "(optional)" clutter on fields that simply aren't required

### 6.10 Data Persistence
- All data is saved automatically after every change
- No manual "save" button needed — nothing is lost if the app is closed and reopened
- Data is private to the person using it

---

## 7. Build Phases

| Phase | What Happens | Outcome |
|---|---|---|
| 1. Core structure | Define product & transaction data shape | Foundation for everything else |
| 2. Product management | Add / search / delete products | Can build a catalog |
| 3. Transaction logic | Stock in / out actions, auto-calculated quantity | Numbers always stay accurate |
| 4. Low stock logic | Threshold check + visual flagging + alert banner | Prevents running out unnoticed |
| 5. History view | Per-product transaction log | Full audit trail |
| 6. Dashboard | Summary stats + Units quick-check card | At-a-glance business overview |
| 7. Area tracking | Area-per-unit field + auto-calculated total area | Correct area stock, not just piece count |
| 8. Categories | Category field + filter tabs (Plywood / Vox / Other) | Easy browsing of mixed inventory |
| 9. Persistence | Auto-save/load on every change | Nothing gets lost |
| 10. Accessibility pass | Font size, color, spacing, plain labels | Easy on the eyes, easy to use for any family member |

*(This app has already gone through all 10 phases and is functional — this plan reflects how it was built and can guide any future changes.)*

---

## 8. Future Improvements (Optional Roadmap)

| Idea | Why it'd help |
|---|---|
| Sales trend view (which sizes/categories sell fastest) | Better purchasing decisions |
| Export to Excel/PDF | Easy sharing with an accountant |
| Supplier-wise purchase summary | Track spending per supplier |
| Multiple staff logins | If more than one person manages stock |
| Reorder quantity suggestions | Based on how fast a product typically sells |
| Photos per product | Faster visual identification |

None of these are required for the app to work well today — they're natural next steps as the business or usage grows.

---

## 9. Maintenance Notes

- Keep product names and thickness labels consistent (e.g. always "19mm", not sometimes "19 mm") so search and grouping stay reliable.
- When entering "area per unit," make sure it's the area of **one single sheet** — the app multiplies this by quantity automatically, so an incorrect per-sheet value will throw off the total area for that whole product.
- Use the note field on transactions — it becomes very useful later when reviewing history (e.g. "why did this drop by 10 last week?").
- Review the low-stock list regularly, not just when something runs out — that's the whole point of the threshold system.
- Assign the correct category (Plywood / Vox / Other) when adding a product, so the filter tabs stay useful as the catalog grows.
