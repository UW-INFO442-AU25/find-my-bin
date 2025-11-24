export default function Home() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Welcome to Find My Bin</h1>
      <p>Your waste sorting companion - helping you dispose of items correctly and minimize contamination.</p>

      <div style={{ marginTop: '30px' }}>
        <h2>Features</h2>
        <ul>
          <li><strong>Quick Sort:</strong> Navigate through categories to find the right bin</li>
          <li><strong>Waste Sort:</strong> Upload a photo to identify waste and get bin recommendations</li>
          <li><strong>Quiz:</strong> Test your waste sorting knowledge and track your progress</li>
          <li><strong>Search:</strong> Quickly search for specific items</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Get Started</h2>
        <p>Sign up for an account to save your quiz scores and track your learning progress!</p>
      </div>
    </div>
  );
}
