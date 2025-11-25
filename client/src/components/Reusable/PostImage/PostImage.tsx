import styles from "./PostImage.module.scss";
import LineSpinner from "../Animations/LineSpinner/LineSpinner.tsx";
import { useEffect, useRef } from "react";

export default function PostImage({
  source,
  alt,
  onError,
  onLoad,
  isLoading,
}: {
  source: string;
  alt: string;
  onError: () => void;
  onLoad: () => void;
  isLoading: boolean;
}) {
  const loadAnimationFrame = useRef<number>();
  const errorAnimationFrame = useRef<number>();
  const hasSettled = useRef(false);

  useEffect(() => {
    return () => {
      if (loadAnimationFrame.current != null) {
        cancelAnimationFrame(loadAnimationFrame.current);
      }
      if (errorAnimationFrame.current != null) {
        cancelAnimationFrame(errorAnimationFrame.current);
      }
    };
  }, []);

  const handleLoad = () => {
    if (hasSettled.current) return;
    if (loadAnimationFrame.current != null) {
      cancelAnimationFrame(loadAnimationFrame.current);
    }
    loadAnimationFrame.current = requestAnimationFrame(() => {
      hasSettled.current = true;
      onLoad();
    });
  };

  const handleError = () => {
    if (hasSettled.current) return;
    if (errorAnimationFrame.current != null) {
      cancelAnimationFrame(errorAnimationFrame.current);
    }
    errorAnimationFrame.current = requestAnimationFrame(() => {
      hasSettled.current = true;
      onError();
    });
  };

  const visibilityClass = isLoading ? styles.hidden : styles.visible;
  const imageClassName = `${styles.postImage} ${visibilityClass}`;

  return (
    <div className={styles.postImageWrapper}>
      <div
        className={styles.postImageBlur}
        style={{ backgroundImage: `url(${source})` }}
      ></div>
      <div className={styles.blurredBackground}>
        {isLoading && (
          <LineSpinner
            containerHeight={"300px"}
            spinnerThickness={"5px"}
            spinnerRadius={"50px"}
          />
        )}
        <img
          loading="lazy"
          src={source}
          className={imageClassName}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    </div>
  );
}
