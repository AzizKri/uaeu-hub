import styles from "./Requirement.module.scss";
// import React from "react";

export default function Requirement({text, error}: { text: string, error: boolean }) {
    return (
        <div className={styles.reqContainer}>
          <span className={styles.reqIcon}>
                                {error ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                         stroke-width="1.5" stroke="red" className="size-6" width="24px" height="24px">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" id="check-mark" width="24px" height="24px">
                                        <path fill="green"
                                              d="M25.171 51.79a1.5 1.5 0 0 1-1.192-.589L8.8 31.346a1.5 1.5 0 0 1 .28-2.1l6.635-5.074a1.5 1.5 0 0 1 2.1.281l8.108 10.6 20.889-22.367a1.5 1.5 0 0 1 2.12-.073l6.1 5.7a1.5 1.5 0 0 1 .073 2.12L31.954 45.225a1.5 1.5 0 0 1-2.193-2.047l22.132-23.695-3.913-3.654L26.9 38.4a1.5 1.5 0 0 1-2.288-.113l-8.27-10.824-4.252 3.252 14.271 18.664a1.5 1.5 0 0 1-1.19 2.411Z"></path>
                                    </svg>
                                )}
          </span>
            <p className={`${error ? styles.invalid : styles.valid}`}>{text}</p>
        </div>
    );
};
