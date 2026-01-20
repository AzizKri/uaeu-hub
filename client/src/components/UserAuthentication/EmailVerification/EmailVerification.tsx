import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Legacy email verification page - redirects to the new Firebase action handler
 * This page is kept for backwards compatibility with old verification links
 */
export default function EmailVerification() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    useEffect(() => {
        // Redirect old-style verification links to the new Firebase action handler
        // Old links won't work with Firebase, but we redirect anyway for UX
        if (token) {
            // Old token-based verification is no longer supported
            // Redirect to home with a message
            navigate("/", { replace: true });
        } else {
            navigate("/", { replace: true });
        }
    }, [token, navigate]);

    return null;
}
