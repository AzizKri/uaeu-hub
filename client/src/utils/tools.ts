import { NavigateFunction } from "react-router-dom";
import { startTransition } from "react";

const assetIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getFormattedDate(postDate: Date) {
    const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let curDate = new Date();
    curDate = new Date(curDate.getTime() + curDate.getTimezoneOffset() * 60 * 1000);

    const diffInMs = curDate.getTime() - postDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInSeconds < 60) {
        return `${diffInSeconds} sec ago`;
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hr ago`;
    } else if (curDate.getFullYear() === postDate.getFullYear()) {
        return `${months[postDate.getMonth()]} ${postDate.getDate()}`;
    } else {
        return `${months[postDate.getMonth()]} ${postDate.getDate()}, ${postDate.getFullYear()}`;
    }
}

export function debounce<T extends (...args: never[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return function (...args: Parameters<T>): void {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

export function goToAuth(navigate: NavigateFunction, type: "SIGNUP" | "LOGIN") {
    const currentLocation = window.location.pathname;
    startTransition(() => {
        if (type === "SIGNUP") {
            navigate("/signup", { state: { from: currentLocation } });
        } else if (type === "LOGIN") {
            navigate("/login", { state: { from: currentLocation } });
        }
    });
}

export function inActivateLeft() {
    const left = document.getElementById('left');
    left?.classList.remove('active');
    document.getElementById("overlay")?.classList.remove('active');
}

export function isAssetId(value: string | null | undefined): value is string {
    return !!value && assetIdRegex.test(value);
}

export function parsePositiveInt(value: string | null): number | null {
    if (!value) return null;

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

const communityIconPalettes: { background: string, accent: string, secondary: string, text: string }[] = [
    { background: "#fff4ec", accent: "#ff7115", secondary: "#00a19a", text: "#2f4858" },
    { background: "#eefaf8", accent: "#00a19a", secondary: "#ff7115", text: "#2f4858" },
    { background: "#f4f7f9", accent: "#2f4858", secondary: "#ff7115", text: "#ffffff" },
    { background: "#fff8dc", accent: "#f4a261", secondary: "#00a19a", text: "#2f4858" },
];

function hashCommunityName(communityName: string) {
    return communityName.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

export function getDefaultIconForCommunity(communityName: string, newIcon: boolean) {
    const firstTwoLetters: string = communityName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
    const palette = communityIconPalettes[
        newIcon
            ? Math.floor(Math.random() * communityIconPalettes.length)
            : hashCommunityName(communityName) % communityIconPalettes.length
    ];

    const canvas = document.createElement("canvas");
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");

    if (ctx) {
        ctx.fillStyle = palette.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(75, 75, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = palette.secondary;
        ctx.beginPath();
        ctx.arc(48, 72, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(102, 72, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        ctx.arc(75, 58, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = palette.secondary;
        ctx.beginPath();
        ctx.roundRect(28, 88, 94, 42, 21);
        ctx.fill();

        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        ctx.roundRect(42, 78, 66, 52, 26);
        ctx.fill();

        if (firstTwoLetters) {
            ctx.fillStyle = palette.text;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold 42px Arial";
            ctx.fillText(firstTwoLetters, canvas.width / 2, 104);
        }
    }
    return canvas.toDataURL();
}

export function dataURLtoFile(dataURL: string | ArrayBuffer | ImageData | null | undefined, filename: string) {
    if (typeof dataURL !== "string") return null;
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]); // decode base64
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}
