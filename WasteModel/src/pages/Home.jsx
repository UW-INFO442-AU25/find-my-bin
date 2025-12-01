import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">UN SDG Goal 12</div>
          <h1 className="hero-title">
            Find My Bin
          </h1>
          <p className="hero-subtitle">
            Your intelligent waste sorting companion for a sustainable future
          </p>
          <p className="hero-description">
            Helping you dispose of items correctly and minimize contamination in the recycling stream
          </p>
          <div className="hero-buttons">
            <Link to="/image-recognition" className="btn-primary-hero">
              Try Image Recognition
            </Link>
            <Link to="/quiz" className="btn-secondary-hero">
              Test Your Knowledge
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-bin recycle-bin">
            <span className="bin-icon">♻️</span>
            <span className="bin-label">Recycle</span>
          </div>
          <div className="floating-bin compost-bin">
            <span className="bin-icon">🌱</span>
            <span className="bin-label">Compost</span>
          </div>
          <div className="floating-bin trash-bin">
            <span className="bin-icon">🗑️</span>
            <span className="bin-label">Trash</span>
          </div>
        </div>
      </section>

      {/* UN SDG Section */}
      <section className="sdg-section">
        <div className="sdg-content">
          <div className="sdg-header">
            <div className="sdg-icon">🌍</div>
            <h2>Supporting UN Sustainable Development Goal 12</h2>
            <h3>Responsible Consumption and Production</h3>
          </div>

          <div className="sdg-grid">
            <div className="sdg-card">
              <div className="sdg-card-icon">⚠️</div>
              <h4>The Problem</h4>
              <p>
                Consumers often lack clarity on which bin to use at waste sorting stations.
                This uncertainty leads to contamination when recyclables are mixed with
                inappropriate materials which causes entire batches to be rejected and sent to landfills.
              </p>
            </div>

            <div className="sdg-card">
              <div className="sdg-card-icon">💡</div>
              <h4>Our Solution</h4>
              <p>
                Find My Bin reduces uncertainty by providing clear guidance on waste disposal that
                helps you confidently place items in the correct bin and prevent contamination
                in the recycling process.
              </p>
            </div>

            <div className="sdg-card">
              <div className="sdg-card-icon">🎯</div>
              <h4>The Impact</h4>
              <p>
                By improving waste sorting accuracy, we work toward a circular economy that
                minimizes waste, preserves resources, and reduces greenhouse gas emissions
                from landfills and incinerators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Choose the method that works best for you</p>

        <div className="features-grid">
          <Link to="/quick-sort" className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Quick Sort Assistant</h3>
            <p>
              Navigate through categories step-by-step to find the right bin for your waste item.
              Perfect for when you know what you have but aren't sure where it goes.
            </p>
            <span className="feature-link">Start Sorting →</span>
          </Link>

          <Link to="/image-recognition" className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>AI Waste Recognition</h3>
            <p>
              Upload a photo and let our AI identify the material and recommend the correct bin.
              Fast, accurate, and convenient for tricky items.
            </p>
            <span className="feature-link">Try AI Sort →</span>
          </Link>

          <Link to="/quiz" className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Learning Quiz</h3>
            <p>
              Test and improve your waste sorting knowledge with our interactive quiz.
              Track your progress and compete on the leaderboard!
            </p>
            <span className="feature-link">Take Quiz →</span>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">75%</div>
            <div className="stat-label">of recyclables are contaminated</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50%</div>
            <div className="stat-label">reduction in sorting errors with guidance</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100+</div>
            <div className="stat-label">items in our database</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>
            {currentUser ? (
              <>Welcome back, {currentUser.displayName || 'Recycler'}! Continue your journey toward sustainable waste management.</>
            ) : (
              <>Join our community and start tracking your waste sorting progress today.</>
            )}
          </p>
          <div className="cta-buttons">
            {currentUser ? (
              <>
                <Link to="/quiz" className="btn-cta-primary">
                  Take a Quiz
                </Link>
                <Link to="/quiz" className="btn-cta-secondary">
                  Continue Quiz
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn-cta-primary">
                  Sign Up Free
                </Link>
                <Link to="/quick-sort" className="btn-cta-secondary">
                  Try It Now
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="info-section">
        <div className="info-content">
          <h3>Why Proper Waste Sorting Matters</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-emoji">♻️</span>
              <p><strong>Preserves Resources:</strong> Proper recycling conserves raw materials and energy</p>
            </div>
            <div className="info-item">
              <span className="info-emoji">🌱</span>
              <p><strong>Reduces Emissions:</strong> Less waste in landfills means lower greenhouse gases</p>
            </div>
            <div className="info-item">
              <span className="info-emoji">💰</span>
              <p><strong>Saves Money:</strong> Contamination costs cities millions in processing fees</p>
            </div>
            <div className="info-item">
              <span className="info-emoji">🌍</span>
              <p><strong>Protects Earth:</strong> Contributing to a circular economy for future generations</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
