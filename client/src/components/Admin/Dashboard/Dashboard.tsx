import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetsBase } from '../../../api/api.ts';
import { getAdminStats } from '../../../api/admin';
import styles from './Dashboard.module.scss';
import defaultCommunityIcon from '../../../assets/community-default.svg';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [topCommunities, setTopCommunities] = useState<TopCommunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadStats = useCallback(async () => {
        try {
            const data = await getAdminStats();
            setStats(data.stats);
            setTopCommunities(data.topCommunities);
        } catch (err) {
            console.error('Failed to load stats:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not load dashboard data.',
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadStats();
    }, [loadStats]);

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
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥' },
        { label: 'Total Posts', value: stats?.totalPosts || 0, icon: '📝' },
        { label: 'Communities', value: stats?.totalCommunities || 0, icon: '🏘️' },
        { label: 'Pending Reports', value: stats?.pendingReports || 0, icon: '🚨', onClick: () => navigate('/admin/reports') },
        { label: 'Bug Reports', value: stats?.pendingBugReports || 0, icon: '🐛', onClick: () => navigate('/admin/bug-reports') },
        { label: 'Feature Requests', value: stats?.pendingFeatureRequests || 0, icon: '💡', onClick: () => navigate('/admin/feature-requests') },
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

    const getCommunityIconSource = (icon: string | null) => {
        if (!icon) return defaultCommunityIcon;
        return icon.startsWith('http') ? icon : `${assetsBase}/icon/${icon}`;
    };

    return (
        <div className={styles.dashboard}>
            <section className={styles.statsGrid}>
                {statCards.map((card, index) => (
                    <div 
                        key={index} 
                        className={`${styles.statCard} ${card.onClick ? styles.clickable : ''}`}
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
                                        src={getCommunityIconSource(community.icon)} 
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
