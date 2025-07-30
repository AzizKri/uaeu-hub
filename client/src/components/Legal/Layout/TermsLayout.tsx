import React from "react";
import styles from '../Legal.module.scss';
import logo from "../../../assets/logo-text-2.svg";

export default function TermsLayout({ page: Page }: { page: React.FC }) {
    return (
        <div className={styles.layout}>
                <div className={styles.menu}>
                    <div className={styles.menuBody}>
                        <a href={"/"}><img src={logo} alt="main logo" /></a>
                        <div className={styles.title}>Terms of Service</div>

                        <ul className={styles.termsList}>
                            <li><a href={"#elibility"}>1. Eligibility</a></li>
                            <li><a href={"#privacy"}>2. Privacy</a></li>
                            <li><a href={"#your-use"}>3. Your Use of the Services</a></li>
                            <li><a href={"#content-platform"}>4. Content on the Platform</a></li>
                            <li><a href={"#content-moderation"}>5. Content Moderation</a></li>
                            <li><a href={"#no-guarantees"}>6. No Guarantees or Liability</a></li>
                            <li><a href={"#termination"}>7. Termination</a></li>
                            <li><a href={"#indemnity"}>8. Indemnity</a></li>
                            <li><a href={"#governing"}>9. Governing Law and Jurisdiction</a></li>
                            <li><a href={"#modification"}>10. Modification to the Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div>
                    <Page />
                </div>
        </div>
    );
}
