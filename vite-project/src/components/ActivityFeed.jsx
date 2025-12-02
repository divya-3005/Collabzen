import { useState, useEffect } from 'react';
import { getActivities } from '../api/activities';

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await getActivities();
                setActivities(res.data);
            } catch (err) {
                console.error("Failed to fetch activities", err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading activity...</div>;

    return (
        <div className="glass" style={{ padding: '1.5rem', height: '100%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activities.length > 0 ? (
                    activities.map(activity => (
                        <div key={activity._id} style={{ display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                            <div style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                background: 'var(--primary)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                flexShrink: 0,
                                overflow: 'hidden'
                            }}>
                                {activity.user.avatar ? (
                                    <img src={activity.user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    activity.user.username.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{activity.user.username}</span>
                                    {' '}
                                    <span style={{ color: 'var(--text-muted)' }}>{activity.text}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                    {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(activity.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No recent activity.</div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
