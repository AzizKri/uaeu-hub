import styles from "./Content.module.scss";
import React, { useState } from "react";
import { assetsBase } from "../../../api/api.ts";
import PostImage from "../../Reusable/PostImage/PostImage.tsx";
import PostPDF from "../../Reusable/PostPDF/PostPDF.tsx";

export default function Content({
  content,
  filename,
  attachmentMime,
  type,
}: {
  content: string;
  filename: string | undefined;
  attachmentMime?: string;
  type: string;
}) {
  const [showContent, setShowContent] = useState<boolean>(content.length < 300);
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(filename != null && attachmentMime?.startsWith('image/'));

  const isImage = attachmentMime?.startsWith('image/') ?? true; // Default to image for backwards compatibility
  const isPDF = attachmentMime === 'application/pdf';

  const handleShowMore: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();
    setShowContent(true);
  };

  const handleImageLoad = (event?: React.SyntheticEvent<HTMLImageElement>) => {
    event?.stopPropagation();
    if (!isLoading) return;
    setIsLoading(false);
  };

  const handleImageError = (event?: React.SyntheticEvent<HTMLImageElement>) => {
    event?.stopPropagation();
    if (error) return;
    setError(true);
    setIsLoading(false);
  };

  return (
    <>
      <div className={styles.text}>
        {showContent || type === "post-page" ? (
          content
        ) : (
          <>
            {content.slice(0, 200)}
            <span>&#8230;</span>
          </>
        )}
        {!showContent && !(type === "post-page") && (
          <span className={styles.show_more} onClick={handleShowMore}>
            show more
          </span>
        )}
      </div>
      
      {/* PDF Attachment */}
      {filename && isPDF && (
        <PostPDF
          source={`${assetsBase}/attachments/${filename}`}
          filename={filename}
        />
      )}
      
      {/* Image Attachment */}
      {filename && isImage && !isPDF && !error && (
        <PostImage
          source={`${assetsBase}/attachments/${filename}`}
          alt="post attachment"
          onLoad={handleImageLoad}
          onError={handleImageError}
          isLoading={isLoading}
        />
      )}
      
      {error && isImage && <p>Error Loading the image</p>}
    </>
  );
}
