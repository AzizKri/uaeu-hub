import styles from "./PostImage.module.scss";
import LineSpinner from "../Animations/LineSpinner/LineSpinner.tsx";

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
                    className={styles.postImage}
                    alt={alt}
                    onLoad={onLoad}
                    onError={onError}
                    style={{
                        display: isLoading ? "none" : "block",
                    }}
                />
            </div>
        </div>
    );
}
