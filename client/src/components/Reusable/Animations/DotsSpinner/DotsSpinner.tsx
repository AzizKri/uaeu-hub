import styles from "./DotsSpinner.module.scss";
import React from "react";

export default function DotsSpinner({
    n = 8,
    r = "40px",
    w = "16px",
}: {
    n?: number;
    r?: string;
    w?: string;
}) {
    return (
        <div
            className={styles.container}
            style={{
                "--r": r,
                "--n": n,
                "--w": w
            } as React.CSSProperties}
        >
            <div className={styles.loader}>
                {Array.from({ length: n }, (_, index) => (
                    <span
                        key={index}
                        className={styles.inner}
                        style={{
                            top: `calc(${r} * sin(${360/n}deg * ${index}))`,
                            left: `calc(${r} * cos(${360/n}deg * ${index}))`,
                            animationDelay: `calc((${index} - 6) * var(--animation-dif))`,
                        }}
                    ></span>
                ))}
            </div>
        </div>
    );
}
