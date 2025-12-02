import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Logo from './Logo';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar glass">
            <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Logo size={36} />
                <span>CollabZen</span>
            </Link>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link to="/profile" className="profile-link" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    textDecoration: 'none', 
                    color: 'var(--text-light)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    transition: 'background 0.2s'
                }}>
                    <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: 'var(--primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        overflow: 'hidden'
                    }}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            user?.username?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <span>{user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
