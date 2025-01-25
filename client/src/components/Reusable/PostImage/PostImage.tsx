import styles from "./PostImage.module.scss";

export default function PostImage({source, alt, onError, onLoad}: {source: string, alt: string, onError: () => void, onLoad: () => void}) {

    return (
        <div
            className={styles.postImageWrapper}
        >
            <div
                className={styles.postImageBlur}
                style={{backgroundImage: `url(${source})`}}
            ></div>
            <div
                className={styles.blurredBackground}
            >
                <img
                    src={source}
                    className={styles.postImage}
                    alt={alt}
                    onLoad={onLoad}
                    onError={onError}
                />
            </div>
        </div>
    )
}
