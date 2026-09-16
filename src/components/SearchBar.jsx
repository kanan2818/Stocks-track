import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-wrap">
      <Search className="search-icon" size={16} />
      <input
        id="search-input"
        type="search"
        className="search-input"
        placeholder="Search name, thickness, supplier…"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Search products"
      />
    </div>
  );
}
