import { useState, useEffect } from 'react';
import { getBugReports, updateFeedbackStatus } from '../../api/feedback';
import styles from './Feedback.module.scss';

export default function BugReports() {
    const [reports, setReports] = useState<BugReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    useEffect(() => {
        loadReports();
    }, [filterStatus]);

    const loadReports = async () => {
        setIsLoading(true);
        try {
            const data = await getBugReports(filterStatus || undefined);
            setReports(data.reports || []);
        } catch (err) {
            console.error('Failed to load bug reports:', err);
            setError('Failed to load bug reports');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (reportId: number, newStatus: 'pending' | 'reviewed' | 'resolved' | 'closed') => {
        try {
            const result = await updateFeedbackStatus('bug', reportId, newStatus);
            if (result === 200) {
                setReports(reports.map(r => 
                    r.id === reportId ? { ...r, status: newStatus } : r
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
                <h1>Bug Reports</h1>
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
                {reports.length > 0 ? (
                    reports.map((report) => (
                        <div key={report.id} className={styles.feedbackCard}>
                            <div className={styles.feedbackHeader}>
                                <span className={`${styles.status} ${styles[getStatusColor(report.status)]}`}>
                                    {report.status}
                                </span>
                                <span className={styles.id}>#{report.public_id}</span>
                            </div>
                            
                            <div className={styles.feedbackContent}>
                                <p className={styles.description}>{report.description}</p>
                                
                                {report.screenshot && (
                                    <div className={styles.screenshot}>
                                        <a 
                                            href={report.screenshot.startsWith('http') ? report.screenshot : `https://r2.uaeu.chat/attachments/${report.screenshot}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <img 
                                                src={report.screenshot.startsWith('http') ? report.screenshot : `https://r2.uaeu.chat/attachments/${report.screenshot}`}
                                                alt="Bug screenshot"
                                            />
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className={styles.feedbackFooter}>
                                <span className={styles.meta}>
                                    By: {report.reporter_username || `User #${report.reporter_id}`}
                                </span>
                                <span className={styles.meta}>
                                    {formatDate(report.created_at)}
                                </span>
                                
                                <select
                                    className={styles.statusSelect}
                                    value={report.status}
                                    onChange={(e) => handleStatusChange(report.id, e.target.value as any)}
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
                        <p>No bug reports found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
