import styles from "./LineSpinner.module.scss";

export default function LineSpinner({
    containerHeight = "50px",
    spinnerRadius = "40px",
    spinnerThickness = "4px",
}: {
    containerHeight?: string;
    spinnerRadius?: string;
    spinnerThickness?: string;
}) {
    return (
        <div className={styles.container} style={{
            height: containerHeight,
        }}>
            <div
                className={styles.loader}
                style={{
                    width: spinnerRadius,
                    height: spinnerRadius,
                    borderWidth: spinnerThickness,
                }}
            ></div>
            {/*<div*/}
            {/*    className={styles.inner}*/}
            {/*    style={{ width: width, height: width }}*/}
            {/*></div>*/}
        </div>
    );
}
