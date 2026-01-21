import styles from "./PostPDF.module.scss";
import { useState, useEffect } from "react";

interface PostPDFProps {
    source: string;
    filename?: string;
}

export default function PostPDF({ source, filename }: PostPDFProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const [error, setError] = useState(false);

    // Extract filename from URL if not provided
    const displayName = filename || source.split('/').pop() || 'document.pdf';

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 480);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleDownload = async () => {
        try {
            const response = await fetch(source);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = displayName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download failed:', err);
            // Fallback: open in new tab
            window.open(source, '_blank');
        }
    };

    const handleOpenNewTab = () => {
        window.open(source, '_blank');
    };

    const toggleViewer = () => {
        setShowViewer(!showViewer);
    };

    // Mobile view: compact download card
    if (isMobile) {
        return (
            <div className={styles.pdfContainer}>
                <div className={styles.pdfCardCompact}>
                    <div className={styles.pdfIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,18.61C6.43,17.5 9.23,16.07 9.23,16.07C10.68,13.72 10.9,12.35 10.92,12.31Z"/>
                        </svg>
                    </div>
                    <span className={styles.pdfName}>{displayName}</span>
                    <button className={styles.downloadBtn} onClick={handleDownload} title="Download PDF">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    // Desktop view: full viewer with embed
    return (
        <div className={styles.pdfContainer}>
            {/* Header */}
            <div className={styles.pdfHeader}>
                <div className={styles.pdfHeaderLeft}>
                    <div className={styles.pdfIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,18.61C6.43,17.5 9.23,16.07 9.23,16.07C10.68,13.72 10.9,12.35 10.92,12.31Z"/>
                        </svg>
                    </div>
                    <div className={styles.pdfInfo}>
                        <span className={styles.pdfName}>{displayName}</span>
                        <span className={styles.pdfLabel}>PDF Document</span>
                    </div>
                </div>
                <button 
                    className={styles.toggleBtn} 
                    onClick={toggleViewer}
                >
                    {showViewer ? 'Hide Preview' : 'Show Preview'}
                </button>
            </div>

            {/* Embedded Viewer */}
            {showViewer && !error && (
                <div className={styles.pdfViewer}>
                    <iframe
                        src={`${source}#toolbar=0&navpanes=0`}
                        title={displayName}
                        className={styles.pdfFrame}
                        onError={() => setError(true)}
                    />
                </div>
            )}

            {showViewer && error && (
                <div className={styles.pdfError}>
                    <p>Unable to display PDF preview</p>
                </div>
            )}

            {/* Actions */}
            <div className={styles.pdfActions}>
                <button className={styles.actionBtn} onClick={handleDownload}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                    </svg>
                    <span>Download</span>
                </button>
                <button className={styles.actionBtn} onClick={handleOpenNewTab}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                    </svg>
                    <span>Open in New Tab</span>
                </button>
            </div>
        </div>
    );
}
