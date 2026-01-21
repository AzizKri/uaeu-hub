import styles from './SearchResult.module.scss';
import { Link } from "react-router-dom";
import { getFormattedDate } from "../../../utils/tools.ts";
import ProfilePictureComponent from "../../Reusable/ProfilePictureComponent/ProfilePictureComponent.tsx";

export default function SearchResult({ result }: { result: SearchResult }) {
    const postUrl = `/post/${result.public_id || result.id}`;
    const postTime = new Date(result.post_time);
    const timeText = getFormattedDate(postTime);
    
    // Truncate content
    const maxLength = 120;
    const truncatedContent = result.content.length > maxLength 
        ? result.content.slice(0, maxLength) + '...'
        : result.content;

    // Determine attachment type
    const hasImage = result.attachment && result.attachment_mime?.startsWith('image/');
    const hasPdf = result.attachment && result.attachment_mime === 'application/pdf';

    return (
        <Link to={postUrl} className={styles.postSearchLink}>
            <div className={styles.searchResult}>
                {/* Header: Avatar + Author + Community + Time */}
                <div className={styles.header}>
                    <div className={styles.avatarWrapper}>
                        <ProfilePictureComponent source={result.pfp} />
                    </div>
                    <div className={styles.meta}>
                        <div className={styles.topMeta}>
                            <span className={styles.author}>{result.displayname || result.author}</span>
                            {result.community && (
                                <>
                                    <span className={styles.separator}>•</span>
                                    <span className={styles.community}>{result.community}</span>
                                </>
                            )}
                        </div>
                        <span className={styles.time}>{timeText}</span>
                    </div>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {truncatedContent}
                </div>

                {/* Footer: Stats + Attachment indicator */}
                <div className={styles.footer}>
                    <div className={styles.stats}>
                        {/* Likes */}
                        <span className={styles.stat}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.1 18.55L12 18.65L11.89 18.55C7.14 14.24 4 11.39 4 8.5C4 6.5 5.5 5 7.5 5C9.04 5 10.54 6 11.07 7.36H12.93C13.46 6 14.96 5 16.5 5C18.5 5 20 6.5 20 8.5C20 11.39 16.86 14.24 12.1 18.55Z"/>
                            </svg>
                            {result.like_count ?? 0}
                        </span>
                        {/* Comments */}
                        <span className={styles.stat}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9Z"/>
                            </svg>
                            {result.comment_count ?? 0}
                        </span>
                    </div>
                    
                    {/* Attachment indicator */}
                    {(hasImage || hasPdf) && (
                        <div className={styles.attachmentIndicator}>
                            {hasImage && (
                                <span className={styles.attachmentBadge} title="Has image">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                                    </svg>
                                </span>
                            )}
                            {hasPdf && (
                                <span className={`${styles.attachmentBadge} ${styles.pdfBadge}`} title="Has PDF">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                    </svg>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
