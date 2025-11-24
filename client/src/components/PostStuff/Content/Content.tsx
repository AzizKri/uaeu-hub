import styles from "./Content.module.scss";
import React, { useState } from "react";
import { assetsBase } from "../../../api/api.ts";
import PostImage from "../../Reusable/PostImage/PostImage.tsx";
// import { getAttachmentDetails } from "../../../api/attachmets.ts";

export default function Content({
  content,
  filename,
  type,
}: {
  content: string;
  filename: string | undefined;
  type: string;
}) {
  const [showContent, setShowContent] = useState<boolean>(content.length < 300);
  // const [imageSrc, setImageSrc] = useState<string>("");
  // const [imageDims, setImageDims] = useState<{
  //     width: number;
  //     height: number;
  // }>({ width: 0, height: 0 });
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(filename != null);

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
      {/*<ReadOnlyEditor content={editorContent} />*/}
      {/*{isLoading && !error && <LineSpinner spinnerRadius="100px" />}*/}
      {filename && !error && (
        <PostImage
          source={`${assetsBase}/attachments/${filename}`}
          alt="post attachment"
          onLoad={handleImageLoad}
          onError={handleImageError}
          isLoading={isLoading}
        />
      )}
      {error && <p>Error Loading the image</p>}
    </>
  );
}
