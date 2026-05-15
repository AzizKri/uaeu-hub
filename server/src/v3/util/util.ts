export function parseId(id: string): number {
    const parsed = Number(id);
    return Number.isNaN(parsed) ? -1 : parsed;
}
