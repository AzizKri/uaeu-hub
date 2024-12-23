export function formatRelativeTime(date: Date) {
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diff / (1000 * 3600 * 24));

    if (diffDays > 7) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear().toString().slice(-2);
        return day + "/" + month + "/" + year;
    }

    if (diffDays >= 1 && diffDays <= 7) {
        return diffDays + "d";
    }

    const diffHours = Math.floor(diff / (1000 * 3600));
    if (diffHours >= 1 && diffHours <= 24) {
        return diffHours + "h";
    }

    const diffMinutes = Math.floor(diff / (1000 * 60));
    if (diffMinutes >= 1 && diffMinutes <= 60) {
        return diffMinutes + "m";
    }

    const diffSeconds = Math.floor(diff / (1000));

    if (diffSeconds < 10) {
        return "now";
    }

    return diffSeconds + "s";
}
