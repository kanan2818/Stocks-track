# Stocks — Project Plan

**A stock register for a plywood, Vox & decorative panels business**

---

## 1. Purpose

Stocks keeps track of exactly how much material is on hand — plywood, Vox panels, laminate, decorative panels — so nothing is guessed or manually counted. If 5 sheets are in stock and 3 are sold, the app shows 2 remaining automatically.

---

## 2. Goals

- Track every product with its own details (name, category, thickness, size, supplier, price)
- Record every stock movement — purchase (in) and sale (out) — and always show correct remaining quantity
- Show total area of stock on hand for products tracked by area (e.g. per-sheet area × quantity)
- Warn when a product is running low, before it runs out
- Separate stock by category (Plywood / Vox / Other) for quick browsing
- Keep a full history of transactions for each product
- Work well on a phone, tablet, or computer
- Be usable from anywhere via a web link, with data staying in sync across devices
- Restrict access to admin accounts only, so stock data is private
- Be easy to read and use for anyone, including older or less tech-comfortable users

---

## 3. Who Uses It

- Business owner and family members managing day-to-day stock
- Quick, frequent updates throughout the day — a sale here, a delivery there
- Large, legible text and a calm color palette so it's comfortable for extended daily use

---

## 4. Tech Stack

| Layer | Technology | Why this was chosen |
|---|---|---|
| **Frontend framework** | React (with Vite as the build tool) | Fast to build with, component-based, industry-standard |
| **UI icons** | lucide-react | Lightweight, clean icon set used throughout the app |
| **Styling** | Inline styles + custom color system | Full control over the calm, accessible look without extra dependencies |
| **Fonts** | Google Fonts — Fraunces (headings) + Inter (body text) | Warm, readable pairing loaded directly in the app |
| **Database** | Firebase Firestore | Real-time cloud database — every device sees updates within a second or two, no server to manage |
| **Authentication** | Firebase Authentication (Email/Password) | Restricts the app to approved admin accounts only |
| **Offline support** | Firestore's built-in offline persistence | App keeps working locally if the connection drops, then syncs automatically |
| **Hosting** | Netlify or Vercel (either works) | Free, fast, gives a live public link, redeploys easily when updates are made |

**Why this combination:** it needs no separate backend server to maintain — the app talks to Firestore directly and Firebase Authentication handles logins — so there's less that can break or need ongoing upkeep for a small business.

---

## 5. Project Structure

```
stocks-app/
├── src/
│   ├── main.jsx          → starts the React app
│   ├── App.jsx           → the entire app: dashboard, product table,
│   │                        forms, modals, all core logic
│   ├── Login.jsx         → admin sign-in screen shown when logged out
│   └── firebase.js       → connects the app to Firebase (database + auth)
├── firestore.rules       → database security rules (admin-only access)
├── index.html            → the page shell the app loads into
├── package.json          → lists the project's dependencies
├── vite.config.js        → build tool configuration
└── DEPLOY_GUIDE.md       → step-by-step instructions to set up Firebase
                             and publish the app live
```

**How the pieces fit together:**
- `main.jsx` loads `App.jsx` into the page
- `App.jsx` checks with `firebase.js` whether someone is logged in
  - If not → shows `Login.jsx`
  - If yes → subscribes to the product data in Firestore and renders the dashboard, table, and forms
- Every add / edit / delete / stock movement writes straight to Firestore through `firebase.js`, and `firestore.rules` makes sure only signed-in admins can do so

---

## 6. Data Model

### Product (one Firestore document per product)
| Field | Description |
|---|---|
| Name | e.g. "SVP-08 Walnut" |
| Category | Plywood / Vox / Other |
| Thickness | Optional free text, e.g. "19mm" |
| Size | Optional free text, e.g. "8x4 ft" |
| Supplier | Who it's sourced from |
| Price per unit | For stock value calculation |
| Area per unit | Optional — area of one sheet, for products tracked by area |
| Low stock threshold | Quantity at which to flag as low |
| Current quantity | Derived from transaction history |
| History | List of all in/out transactions |

### Transaction (stored inside its product's history)
| Field | Description |
|---|---|
| Type | "in" or "out" |
| Quantity | Units moved |
| Date | Auto-recorded |
| Note | Optional, e.g. "Sold to Sharma Interiors" |

**Why one document per product:** editing one product's stock never conflicts with someone else editing a different product at the same time, and the database stays fast and reliable as the catalog grows.

---

## 7. Core Principle: Quantity Is Always Calculated, Never Typed

Quantity is never edited directly — it's always the result of `(total stock in) − (total stock out)`. Every stock change happens through a transaction, so the number shown can never drift from reality.

The same applies to total area: `area of one unit × current quantity`, recalculated automatically as stock moves.

---

## 8. Features

1. **Product catalog** — add, view, delete products; only name is required
2. **Stock in / out** — log purchases and sales with an optional note; quantity updates instantly
3. **Total area tracking** — automatic for any product with an area-per-unit value set
4. **Category tabs** — All / Plywood / Vox / Other, for quick filtering
5. **Low stock alerts** — visual flag on the product row, plus a summary banner and count
6. **Units quick-check** — hover or click a product row to see its live quantity in a dedicated card
7. **Transaction history** — full timestamped log per product
8. **Dashboard summary** — total products, total units, total stock value, low stock count
9. **Search** — by name, thickness, or supplier
10. **Admin login** — the app is only accessible after signing in with an approved admin account
11. **Multi-device sync** — changes made on one device (phone, tablet, computer) appear on all others automatically
12. **Accessible design** — large text, calm colors, generous spacing for comfortable daily use

---

## 9. Build Order

| Phase | What Happens |
|---|---|
| 1 | Set up project structure (Vite + React) |
| 2 | Product catalog — add, view, delete |
| 3 | Stock in / out with auto-calculated quantity |
| 4 | Low stock alerts and dashboard summary |
| 5 | Transaction history per product |
| 6 | Total area tracking |
| 7 | Category tabs (Plywood / Vox / Other) |
| 8 | Units quick-check card |
| 9 | Accessibility pass — font size, color, spacing |
| 10 | Connect Firebase — cloud database + multi-device sync |
| 11 | Add Firebase Authentication and lock down database rules |
| 12 | Deploy live via Netlify/Vercel |

*(All 12 phases are complete — this plan reflects the app exactly as it stands today.)*

---

## 10. Maintenance Notes

- Keep labels like thickness consistent (e.g. always "19mm") so search stays reliable
- Area-per-unit should always be the area of **one single sheet** — the app multiplies it by quantity automatically
- Use the note field on transactions — useful later for reviewing history
- Review the low-stock list regularly rather than waiting for something to run out
- Add new admin accounts only for people who should have full access to edit stock (done from the Firebase console, not inside the app)
- To publish future changes: rebuild the project (`npm run build`) and redeploy through Netlify or Vercel
