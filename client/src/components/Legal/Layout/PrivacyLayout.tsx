import React from "react";
import styles from '../Legal.module.scss';
import logo from "../../../assets/logo-text-2.svg";

export default function PrivacyLayout({ page: Page }: { page: React.FC }) {
    return (
        <div className={styles.layout}>
                <div className={styles.menu}>
                    <div className={styles.menuBody}>

                        <a href={"/"}><img src={logo} alt="main logo" /></a>
                    <div className={styles.title}>Privacy Policy</div>

                    <ul className={styles.termsList}>
                        <li><a href={"#info-we-collect"}>1. Information We Collect</a></li>
                        <li><a href={"#how-info-collected"}>2. How Information is Collected</a></li>
                        <li><a href={"#use-personal-data"}>3. Use of Personal Information</a></li>
                        <li><a href={"#sharing"}>4. Sharing of Personal Information</a></li>
                        <li><a href={"#data-retention"}>5. Data Retention</a></li>
                        <li><a href={"#data-security"}>6. Data Security</a></li>
                        <li><a href={"#children-privacy"}>7. Children's Privacy</a></li>
                    </ul>
                    </div>
                </div>
                <div>
                    <Page />
                </div>
        </div>
    );
}
