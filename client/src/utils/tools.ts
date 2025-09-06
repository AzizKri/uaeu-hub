import { NavigateFunction } from "react-router-dom";
import { startTransition } from "react";

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

const colorOptions: {background: string, fontColor: string}[] = [
    { background: "#F44336", fontColor: "white" }, // Red
    { background: "#E91E63", fontColor: "white" }, // Pink
    { background: "#9C27B0", fontColor: "white" }, // Purple
    { background: "#673AB7", fontColor: "white" }, // Deep Purple
    { background: "#3F51B5", fontColor: "white" }, // Indigo
    { background: "#2196F3", fontColor: "white" }, // Blue
    { background: "#03A9F4", fontColor: "black" }, // Light Blue
    { background: "#00BCD4", fontColor: "black" }, // Cyan
    { background: "#009688", fontColor: "white" }, // Teal
    { background: "#4CAF50", fontColor: "white" }, // Green
    { background: "#8BC34A", fontColor: "black" }, // Light Green
    { background: "#CDDC39", fontColor: "black" }, // Lime
    { background: "#FFEB3B", fontColor: "black" }, // Yellow
    { background: "#FFC107", fontColor: "black" }, // Amber
    { background: "#FF9800", fontColor: "black" }, // Orange
    { background: "#FF5722", fontColor: "white" }, // Deep Orange
    { background: "#795548", fontColor: "white" }, // Brown
    { background: "#607D8B", fontColor: "white" }, // Blue Grey
];



let ind: number;
export function getDefaultIconForCommunity(communityName: string, newIcon: boolean) {
    const firstTwoLetters: string = communityName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
    console.log("first two letters", firstTwoLetters);

    if (newIcon || !ind) ind = Math.floor(Math.random() * colorOptions.length);

    const canvas = document.createElement("canvas");
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");

    if (ctx) {
        ctx.fillStyle = colorOptions[ind].background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = colorOptions[ind].fontColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 60px Arial";
        ctx.fillText(firstTwoLetters, canvas.width / 2, canvas.height / 2);
    }
    return canvas.toDataURL();
}

export function dataURLtoFile(dataURL: string | ArrayBuffer | ImageData | null | undefined, filename: string) {
    console.log("dataURL", dataURL);
    console.log("dataURL type", typeof dataURL);
    if (typeof dataURL !== "string") return null;
    console.log("here");
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
