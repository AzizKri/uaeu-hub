export function getFormattedDate(postDate: Date) {
    if (typeof postDate === 'string') {
        postDate = new Date(postDate);
    }

    const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const curDate = new Date();
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
