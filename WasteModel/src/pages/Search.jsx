export default function Search() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Search</h1>
      <p>Search for waste items to find out which bin they belong in.</p>

      <div style={{ marginTop: '30px' }}>
        <input
          type="text"
          placeholder="Search for an item..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #e0e0e0',
            borderRadius: '5px'
          }}
        />
        <p style={{ marginTop: '20px' }}><em>This feature is under development. Your team can implement the search functionality here.</em></p>
      </div>
    </div>
  );
}
