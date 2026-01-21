import { useState, useEffect } from 'react';
import { getFeatureRequests, updateFeedbackStatus } from '../../api/feedback';
import styles from './Feedback.module.scss';

export default function FeatureRequests() {
    const [requests, setRequests] = useState<FeatureRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    useEffect(() => {
        loadRequests();
    }, [filterStatus]);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const data = await getFeatureRequests(filterStatus || undefined);
            setRequests(data.requests || []);
        } catch (err) {
            console.error('Failed to load feature requests:', err);
            setError('Failed to load feature requests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (requestId: number, newStatus: 'pending' | 'reviewed' | 'resolved' | 'closed') => {
        try {
            const result = await updateFeedbackStatus('feature', requestId, newStatus);
            if (result === 200) {
                setRequests(requests.map(r => 
                    r.id === requestId ? { ...r, status: newStatus } : r
                ));
            }
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status');
        }
    };

    const formatDate = (timestamp: number | string) => {
        // Handle both Unix timestamps (seconds) and ISO/SQLite date strings
        const date = typeof timestamp === 'string' 
            ? new Date(timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T') + 'Z')
            : new Date(timestamp * 1000);
        
        if (isNaN(date.getTime())) return 'Unknown date';
        
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'pending': 'warning',
            'reviewed': 'info',
            'resolved': 'success',
            'closed': 'secondary'
        };
        return colors[status] || 'secondary';
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.feedback}>
            <header className={styles.header}>
                <h1>Feature Requests</h1>
                <div className={styles.filters}>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </header>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.feedbackList}>
                {requests.length > 0 ? (
                    requests.map((request) => (
                        <div key={request.id} className={styles.feedbackCard}>
                            <div className={styles.feedbackHeader}>
                                <span className={`${styles.status} ${styles[getStatusColor(request.status)]}`}>
                                    {request.status}
                                </span>
                                <span className={styles.id}>#{request.public_id}</span>
                            </div>
                            
                            <div className={styles.feedbackContent}>
                                <p className={styles.description}>{request.description}</p>
                                
                                {request.screenshot && (
                                    <div className={styles.screenshot}>
                                        <a 
                                            href={request.screenshot.startsWith('http') ? request.screenshot : `https://r2.uaeu.chat/attachments/${request.screenshot}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <img 
                                                src={request.screenshot.startsWith('http') ? request.screenshot : `https://r2.uaeu.chat/attachments/${request.screenshot}`}
                                                alt="Feature screenshot"
                                            />
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className={styles.feedbackFooter}>
                                <span className={styles.meta}>
                                    By: {request.reporter_username || `User #${request.reporter_id}`}
                                </span>
                                <span className={styles.meta}>
                                    {formatDate(request.created_at)}
                                </span>
                                
                                <select
                                    className={styles.statusSelect}
                                    value={request.status}
                                    onChange={(e) => handleStatusChange(request.id, e.target.value as any)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <p>No feature requests found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
