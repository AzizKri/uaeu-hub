import styles from './PostFooter.module.scss';

export default function PostFooter() {
    return (
        <div className={styles.footer}>
            <div className={styles.footerLeft}>
                <div className={styles.footerButton}>
                    <div className={styles.buttonIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em"
                             viewBox="0 0 24 24">
                            <g fill="none">
                                <path fill="currentColor"
                                      d="m15 10l-.74-.123a.75.75 0 0 0 .74.873zM4 10v-.75a.75.75 0 0 0-.75.75zm16.522 2.392l.735.147zM6 20.75h11.36v-1.5H6zm12.56-11.5H15v1.5h3.56zm-2.82.873l.806-4.835l-1.48-.247l-.806 4.836zm-.92-6.873h-.214v1.5h.213zm-3.335 1.67L8.97 8.693l1.248.832l2.515-3.773zM7.93 9.25H4v1.5h3.93zM3.25 10v8h1.5v-8zm16.807 8.54l1.2-6l-1.47-.295l-1.2 6zM8.97 8.692a1.25 1.25 0 0 1-1.04.557v1.5c.92 0 1.778-.46 2.288-1.225zm7.576-3.405A1.75 1.75 0 0 0 14.82 3.25v1.5a.25.25 0 0 1 .246.291zm2.014 5.462c.79 0 1.38.722 1.226 1.495l1.471.294A2.75 2.75 0 0 0 18.56 9.25zm-1.2 10a2.75 2.75 0 0 0 2.697-2.21l-1.47-.295a1.25 1.25 0 0 1-1.227 1.005zm-2.754-17.5a3.75 3.75 0 0 0-3.12 1.67l1.247.832a2.25 2.25 0 0 1 1.873-1.002zM6 19.25c-.69 0-1.25-.56-1.25-1.25h-1.5A2.75 2.75 0 0 0 6 20.75z"/>
                                <path stroke="currentColor" stroke-width="1.5" d="M8 10v10"/>
                            </g>
                        </svg>
                    </div>
                    <div className={styles.buttonNumber}>
                        <span>50</span>
                    </div>
                </div>
                <div className={styles.footerButton}>
                    <div className={styles.buttonIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em"
                             viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                  d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.89 1 4.127L3 21l4.873-1c1.236.639 2.64 1 4.127 1"/>
                        </svg>
                    </div>
                    <div className={styles.buttonNumber}>
                        <span>15</span>
                    </div>
                </div>
            </div>
            <div className={styles.footerRight}>
                <div className={styles.footerButton}>
                    <div className={styles.buttonIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="1.4em" viewBox="0 -960 960 960"
                             width="1.4em"
                             fill="currentColor">
                            <path
                                d="M632.43-136q-39.81 0-67.51-27.82-27.69-27.82-27.69-67.56 0-9 6.31-31.31L299.62-414.62q-12.93 14-30.77 22t-38.23 8q-39.43 0-67.02-28.07Q136-440.77 136-480q0-39.23 27.6-67.31 27.59-28.07 67.02-28.07 20.48 0 38.28 8 17.79 8 30.72 22l243.92-151.16q-2.77-7.77-4.54-15.73-1.77-7.96-1.77-16.35 0-39.74 27.87-67.56Q592.98-824 632.8-824q39.82 0 67.51 27.87Q728-768.25 728-728.43q0 39.81-27.82 67.51-27.82 27.69-67.56 27.69-20.7 0-38-8.39Q577.31-650 564.38-664L320.46-512.08q2.77 7.77 4.54 15.74 1.77 7.96 1.77 16.34 0 8.38-1.77 16.34-1.77 7.97-4.54 15.74L564.38-296q12.93-14 30.28-22.38 17.35-8.39 37.96-8.39 39.74 0 67.56 27.87Q728-271.02 728-231.2q0 39.82-27.87 67.51Q672.25-136 632.43-136Zm.19-32q26.93 0 45.16-18.22Q696-204.45 696-231.38q0-26.94-18.22-45.17-18.23-18.22-45.16-18.22-26.94 0-45.17 18.22-18.22 18.23-18.22 45.17 0 26.93 18.22 45.16Q605.68-168 632.62-168Zm-402-248.62q27.26 0 45.7-18.22 18.45-18.22 18.45-45.16 0-26.94-18.45-45.16-18.44-18.22-45.7-18.22-26.62 0-44.62 18.22-18 18.22-18 45.16 0 26.94 18 45.16 18 18.22 44.62 18.22Zm402-248.61q26.93 0 45.16-18.22Q696-701.68 696-728.62q0-26.93-18.22-45.16Q659.55-792 632.62-792q-26.94 0-45.17 18.22-18.22 18.23-18.22 45.16 0 26.94 18.22 45.17 18.23 18.22 45.17 18.22Zm0 433.85ZM231.38-480Zm401.24-248.62Z"/>
                        </svg>
                    </div>
                    <div className={styles.buttonText}>
                        <span>Share</span>
                    </div>
                </div>
                <div className={styles.footerButton}>
                    <div className={styles.buttonIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
                             width="24px"
                             fill="currentColor">
                            <path
                                d="M220-130v-650h323.84l16 80H780v360H536.16l-16-80H280v290h-60Zm280-430Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z"/>
                        </svg>
                    </div>
                    <div className={styles.buttonText}>
                        <span>Report</span>
                    </div>
                </div>
            </div>
        </div>
    )
}