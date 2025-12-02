import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/users';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

const Profile = () => {
    const { user, login } = useAuth(); // We might need a way to refresh user data in context
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        location: '',
        website: '',
        avatar: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        document.title = 'Profile | CollabZen';
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await updateProfile(formData);
            setMessage('Profile updated successfully!');
            // Ideally trigger a user refresh in context, but for now a page reload or just local state update is fine
            // Since AuthContext doesn't expose a refreshUser method, we rely on the fact that next time /users/me is called it gets fresh data.
            // But to update the UI immediately, we might need to reload or update context manually.
            // Let's just show success message.
        } catch (err) {
            console.error(err);
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <Loader />;

    return (
        <div className="container">
            <Navbar />

            <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '1rem' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    ← Back to Dashboard
                </Link>
            </div>

            <div className="glass" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        overflow: 'hidden'
                    }}>
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            user.username.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h1 style={{ margin: 0 }}>{user.username}</h1>
                        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0' }}>{user.email}</p>
                        {formData.bio && <p style={{ margin: 0 }}>{formData.bio}</p>}
                    </div>
                </div>

                {message && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        background: message.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: message.includes('success') ? '#10b981' : '#ef4444'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Tell us about yourself"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="San Francisco, CA"
                            />
                        </div>
                        <div className="form-group">
                            <label>Website</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Avatar URL</label>
                        <input
                            type="url"
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleChange}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
