export function toDateDisplay(input: number): string {
    const date = new Date(input);
    return date && date.toISOString().slice(0, 10);
}
