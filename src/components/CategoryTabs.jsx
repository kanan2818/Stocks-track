const CATEGORIES = ['All', 'Plywood', 'Vox', 'Other'];

export default function CategoryTabs({ activeCategory, onChange }) {
  return (
    <div className="category-tabs" role="tablist" aria-label="Filter by category">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          id={`cat-tab-${cat.toLowerCase()}`}
          role="tab"
          aria-selected={activeCategory === cat}
          className={`cat-tab${activeCategory === cat ? ' cat-tab--active' : ''}`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
