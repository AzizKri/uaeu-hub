import { useState, useEffect } from 'react';
import { getReports, takeReportAction } from '../../api/reports';
import styles from './Reports.module.scss';

export default function Reports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showResolved, setShowResolved] = useState(false);
    const [filterType, setFilterType] = useState<string>('');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [actionModal, setActionModal] = useState(false);
    const [contentModal, setContentModal] = useState(false);
    const [viewingReport, setViewingReport] = useState<Report | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadReports();
    }, [showResolved, filterType]);

    const loadReports = async () => {
        setIsLoading(true);
        try {
            const data = await getReports(0, showResolved, filterType || undefined);
            setReports(data.reports || []);
        } catch (err) {
            console.error('Failed to load reports:', err);
            setError('Failed to load reports');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (action: 'delete' | 'delete_suspend' | 'delete_ban' | 'warn' | 'dismiss') => {
        if (!selectedReport) return;
        
        if (action !== 'dismiss' && !actionReason.trim()) {
            alert('Please provide a reason for this action');
            return;
        }

        setIsSubmitting(true);
        try {
            await takeReportAction(selectedReport.id, action, actionReason);
            setActionModal(false);
            setSelectedReport(null);
            setActionReason('');
            loadReports();
        } catch (err) {
            console.error('Failed to take action:', err);
            alert('Failed to execute action');
        } finally {
            setIsSubmitting(false);
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

    const getEntityTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'post': 'Post',
            'comment': 'Comment',
            'subcomment': 'Reply',
            'community': 'Community',
            'user': 'User'
        };
        return labels[type] || type;
    };

    const getActionOptions = (entityType: string) => {
        if (entityType === 'community') {
            return [
                { action: 'warn' as const, label: 'Warn Admins', color: 'warning' },
                { action: 'dismiss' as const, label: 'Dismiss', color: 'secondary' },
            ];
        }
        return [
            { action: 'delete' as const, label: 'Delete', color: 'error' },
            { action: 'delete_suspend' as const, label: 'Delete & Suspend (7 days)', color: 'warning' },
            { action: 'delete_ban' as const, label: 'Delete & Ban', color: 'danger' },
            { action: 'dismiss' as const, label: 'Dismiss', color: 'secondary' },
        ];
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.reports}>
            <header className={styles.header}>
                <h1>Reports</h1>
                <div className={styles.filters}>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">All Types</option>
                        <option value="post">Posts</option>
                        <option value="comment">Comments</option>
                        <option value="subcomment">Replies</option>
                        <option value="community">Communities</option>
                        <option value="user">Users</option>
                    </select>
                    <label className={styles.checkbox}>
                        <input 
                            type="checkbox" 
                            checked={showResolved}
                            onChange={(e) => setShowResolved(e.target.checked)}
                        />
                        Show Resolved
                    </label>
                </div>
            </header>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.reportsList}>
                {reports.length > 0 ? (
                    reports.map((report) => (
                        <div 
                            key={report.id} 
                            className={`${styles.reportCard} ${!!report.resolved ? styles.resolved : ''}`}
                        >
                            <div className={styles.reportHeader}>
                                <span className={styles.entityType}>
                                    {getEntityTypeLabel(report.entity_type)}
                                </span>
                                <span className={styles.reportType}>{report.report_type}</span>
                                {!!report.resolved && <span className={styles.resolvedBadge}>Resolved</span>}
                            </div>
                            
                            <div className={styles.reportContent}>
                                <p className={styles.reason}>
                                    <strong>Report Reason:</strong> {report.reason || 'No reason provided'}
                                </p>
                                
                                <button 
                                    className={styles.viewContentBtn}
                                    onClick={() => {
                                        setViewingReport(report);
                                        setContentModal(true);
                                    }}
                                >
                                    View {getEntityTypeLabel(report.entity_type)}
                                </button>
                            </div>

                            <div className={styles.reportFooter}>
                                <span className={styles.meta}>
                                    Reported by: {report.reporter_username || `User #${report.reporter_id}`}
                                </span>
                                <span className={styles.meta}>
                                    {formatDate(report.created_at)}
                                </span>
                                
                                {!report.resolved && (
                                    <button 
                                        className={styles.actionBtn}
                                        onClick={() => {
                                            setSelectedReport(report);
                                            setActionModal(true);
                                        }}
                                    >
                                        Take Action
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <p>No reports found</p>
                    </div>
                )}
            </div>

            {/* Content Modal */}
            {contentModal && viewingReport && (
                <div className={styles.modalOverlay} onClick={() => setContentModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Reported {getEntityTypeLabel(viewingReport.entity_type)}</h2>
                        
                        <div className={styles.contentPreview}>
                            {viewingReport.entity ? (
                                <>
                                    <p className={styles.contentText}>
                                        {viewingReport.entity.content || viewingReport.entity.name || viewingReport.entity.username || 'No content available'}
                                    </p>
                                    {viewingReport.entity.attachment && viewingReport.entity.attachment_mime?.startsWith('image/') && (
                                        <img 
                                            src={`${import.meta.env.VITE_ASSETS_URL || 'https://assets.uaeu.chat'}/attachments/${viewingReport.entity.attachment}`}
                                            alt="Attachment"
                                            className={styles.attachmentImage}
                                        />
                                    )}
                                    {viewingReport.entity.author_username && (
                                        <span className={styles.author}>By: @{viewingReport.entity.author_username}</span>
                                    )}
                                </>
                            ) : (
                                <p className={styles.deletedContent}>
                                    Content has been deleted (ID: {viewingReport.entity_id})
                                </p>
                            )}
                        </div>

                        <button 
                            className={styles.cancelBtn}
                            onClick={() => {
                                setContentModal(false);
                                setViewingReport(null);
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {actionModal && selectedReport && (
                <div className={styles.modalOverlay} onClick={() => setActionModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Take Action</h2>
                        <p className={styles.modalInfo}>
                            Report #{selectedReport.id} - {getEntityTypeLabel(selectedReport.entity_type)}
                        </p>
                        
                        <div className={styles.reasonInput}>
                            <label>Reason for action:</label>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                placeholder="Enter reason for this action..."
                                rows={3}
                            />
                        </div>

                        <div className={styles.actionButtons}>
                            {getActionOptions(selectedReport.entity_type).map((option) => (
                                <button
                                    key={option.action}
                                    className={`${styles.modalBtn} ${styles[option.color]}`}
                                    onClick={() => handleAction(option.action)}
                                    disabled={isSubmitting}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <button 
                            className={styles.cancelBtn}
                            onClick={() => {
                                setActionModal(false);
                                setSelectedReport(null);
                                setActionReason('');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
