import { Link } from "react-router-dom";
import '../App.css';

export default function Navbar() {
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
						<Link className="nav-link" to="/quick-sort">Quick Sort</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="/ai-sort">AI Waste Sort</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="/quiz">Quiz</Link>
					</li>
				</ul>

				<div className="nav-actions">
					<Link to="/search" className="nav-search">Search</Link>
					<Link to="/signin" className="nav-sign-in">Sign In</Link>
				</div>

			</div>
    </nav>
  );
}