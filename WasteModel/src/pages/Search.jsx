export default function Search() {
  return (
    <div className="page-container">
      <div className="content-card">
        <h1 className="feature-title">Search</h1>
        <p className="feature-sub">Search for waste items to find out which bin they belong in.</p>

        <div style={{ marginTop: '18px' }}>
          <input
            type="text"
            placeholder="Search for an item..."
            className="search-input"
          />
          <p style={{ marginTop: '16px', color: 'var(--muted)' }}>
            <em>This feature is under development. Your team can implement the search functionality here.</em>
          </p>
        </div>
      </div>
    </div>
  );
}
