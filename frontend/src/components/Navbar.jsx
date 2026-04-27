import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiLogOut, FiUser, FiBarChart2, FiTrendingUp } from 'react-icons/fi';

const NAV_TABS = [
  { path: '/', label: 'Dashboard', icon: <FiBarChart2 /> },
  { path: '/portfolio', label: 'Portfolio', icon: <FiTrendingUp /> },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar-custom" id="main-navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-icon">₹</span>
          <span className="brand-text">FinSight</span>
        </div>

        {user && (
          <div className="nav-tabs-center">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`nav-tab ${location.pathname === tab.path ? 'nav-tab-active' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Link>
            ))}
          </div>
        )}

        {user && (
          <div className="navbar-user">
            <div className="user-info">
              <FiUser className="user-icon" />
              <span className="user-name">{user.name}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} id="logout-btn">
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
