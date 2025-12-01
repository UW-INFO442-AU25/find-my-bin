import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav>
      <div className="nav-container">
        <h2 className="nav-logo">
          <Link to="/" className="nav-logo-link">Find My Bin</Link>
        </h2>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link className="nav-link" to="/">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/image-recognition">Image Recognition</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/quick-sort">Quick Sort</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/quiz">Quiz</Link>
          </li>
        </ul>

        <div className="nav-actions">
          {currentUser ? (
            <>
              <span className="nav-user">Hi, {currentUser.displayName || currentUser.email}</span>
              <button onClick={handleLogout} className="nav-sign-out">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-sign-in">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
