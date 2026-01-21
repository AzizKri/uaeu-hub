import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../api/admin';
import styles from './Dashboard.module.scss';
import defaultCommunityIcon from '../../assets/NicePng_community-icon-png_2066059.png';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [topCommunities, setTopCommunities] = useState<TopCommunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getAdminStats();
            setStats(data.stats);
            setTopCommunities(data.topCommunities);
        } catch (err) {
            console.error('Failed to load stats:', err);
            setError('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                <button onClick={loadStats}>Retry</button>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#4299e1' },
        { label: 'Total Posts', value: stats?.totalPosts || 0, icon: '📝', color: '#48bb78' },
        { label: 'Communities', value: stats?.totalCommunities || 0, icon: '🏘️', color: '#ed8936' },
        { label: 'Pending Reports', value: stats?.pendingReports || 0, icon: '🚨', color: '#f56565', onClick: () => navigate('/reports') },
        { label: 'Bug Reports', value: stats?.pendingBugReports || 0, icon: '🐛', color: '#9f7aea', onClick: () => navigate('/bug-reports') },
        { label: 'Feature Requests', value: stats?.pendingFeatureRequests || 0, icon: '💡', color: '#38b2ac', onClick: () => navigate('/feature-requests') },
    ];

    const formatDate = (timestamp: number | string) => {
        // Handle both Unix timestamps (seconds) and ISO/SQLite date strings
        const date = typeof timestamp === 'string' 
            ? new Date(timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T') + 'Z')
            : new Date(timestamp * 1000);
        
        if (isNaN(date.getTime())) return 'Unknown date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <h1>Dashboard</h1>
                <p>Welcome to the UAEU Chat Admin Panel</p>
            </header>

            <section className={styles.statsGrid}>
                {statCards.map((card, index) => (
                    <div 
                        key={index} 
                        className={`${styles.statCard} ${card.onClick ? styles.clickable : ''}`}
                        style={{ borderLeftColor: card.color }}
                        onClick={card.onClick}
                    >
                        <div className={styles.statIcon}>{card.icon}</div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{card.value.toLocaleString()}</span>
                            <span className={styles.statLabel}>{card.label}</span>
                        </div>
                    </div>
                ))}
            </section>

            <section className={styles.topCommunities}>
                <h2>Top 3 Communities</h2>
                <div className={styles.communitiesList}>
                    {topCommunities.length > 0 ? (
                        topCommunities.map((community, index) => (
                            <div key={community.id} className={styles.communityCard}>
                                <div className={styles.rank}>#{index + 1}</div>
                                <div className={styles.communityIcon}>
                                    <img 
                                        src={community.icon || defaultCommunityIcon} 
                                        alt={community.name}
                                        onError={(e) => {
                                            e.currentTarget.src = defaultCommunityIcon;
                                        }}
                                    />
                                </div>
                                <div className={styles.communityInfo}>
                                    <h3>{community.name}</h3>
                                    <p className={styles.description}>
                                        {community.description || 'No description'}
                                    </p>
                                    <div className={styles.meta}>
                                        <span>👥 {community.member_count.toLocaleString()} members</span>
                                        <span>📅 Created {formatDate(community.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noCommunities}>No communities yet</p>
                    )}
                </div>
            </section>
        </div>
    );
}
