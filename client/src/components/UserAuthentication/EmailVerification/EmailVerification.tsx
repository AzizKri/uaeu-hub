import {useEffect, useState} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {verifyEmail} from "../../../api/authentication.ts";
import styles from "./EmailVerification.module.scss";
import LoadingFallback from "../../Reusable/LoadingFallback/LoadingFallback.tsx";
import successLogo from "../../../assets/check-mark-svgrepo.svg";
import failedLogo from "../../../assets/cross-mark-button-svgrepo.svg";


export default function EmailVerification () {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verification failed. Please try again.");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing verification token.");
            return;
        }

        // Call the verifyEmail API function
        verifyEmail(token)
            .then(async (data) => {
                if (data.status === 200) {
                    setStatus("success");
                    setMessage("Your email has been successfully verified!");
                } else {
                    const res = await data.json();
                    setStatus("error");
                    setMessage(res.message || "Verification failed. Please try again.");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("An error occurred while verifying your email.");
            });
    }, [token]);

    return (
        <div className={styles.emailVerificationContainer}>
            {status === "loading" && <LoadingFallback />}
            {status === "success" && (
                <div className={styles.emailVerified}>
                    <img src={successLogo} className={styles.verificationIcon} alt="success logo" />
                    <h2>Email Verified 🎉</h2>
                    <p>{message}</p>
                    <button onClick={() => navigate("/")}>Go to Home</button>
                </div>
            )}
            {status === "error" && (
                <div className={styles.emailVerified}>
                    <img src={failedLogo} className={styles.verificationIcon} alt="success logo"/>
                    <h2>Verification Failed ❌</h2>
                    <p>{message}</p>
                    <button onClick={() => navigate("/")}>Go to Home</button>
                </div>
            )}
        </div>
    );
};

