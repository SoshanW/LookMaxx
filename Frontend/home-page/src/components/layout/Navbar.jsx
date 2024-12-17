import { Link } from 'react-router-dom';

const navigation = [
  { name: 'Study', href: '/study' },
  { name: 'FFR', href: '/ffr' },
  { name: 'Retail', href: '/retail' },
  { name: 'Casting', href: '/casting' },
  { name: 'Community', href: '/community' },
  { name: 'About', href: '/about' },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          LookMaxx
        </Link>

        <div className="nav-links">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="nav-link"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="auth-buttons">
          <button className="btn btn-text">Login</button>
          <button className="btn btn-primary">Sign Up</button>
        </div>
      </div>
    </nav>
  );
}