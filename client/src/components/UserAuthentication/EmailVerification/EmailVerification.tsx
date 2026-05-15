import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../../api/client.ts";
import styles from "./EmailVerification.module.scss";
import successLogo from "../../../assets/check-mark-svgrepo.svg";
import failedLogo from "../../../assets/cross-mark-button-svgrepo.svg";
import LoadingFallback from "../../Reusable/LoadingFallback/LoadingFallback.tsx";

const authBase = (import.meta.env.VITE_API_URL || "https://api.uaeu.chat") + "/auth";

export default function EmailVerification() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function verify() {
            if (!token) {
                setStatus("error");
                setMessage("This verification link is invalid.");
                return;
            }

            try {
                const response = await apiFetch(`${authBase}/verifyEmail?token=${encodeURIComponent(token)}`);
                const data = await response.json();
                if (response.ok) {
                    setStatus("success");
                    setMessage("Your email has been verified.");
                } else {
                    setStatus("error");
                    setMessage(data.message || "This verification link is invalid or expired.");
                }
            } catch {
                setStatus("error");
                setMessage("Unable to verify email right now.");
            }
        }

        verify();
    }, [token]);

    return (
        <div className={styles.emailVerificationContainer}>
            {status === "loading" && <LoadingFallback />}
            {status !== "loading" && (
                <div className={styles.emailVerified}>
                    <img
                        src={status === "success" ? successLogo : failedLogo}
                        className={styles.verificationIcon}
                        alt={status}
                    />
                    <h2>{status === "success" ? "Email Verified" : "Verification Failed"}</h2>
                    <p>{message}</p>
                    <button onClick={() => navigate(status === "success" ? "/" : "/login")}>
                        Continue
                    </button>
                </div>
            )}
        </div>
    );
}
