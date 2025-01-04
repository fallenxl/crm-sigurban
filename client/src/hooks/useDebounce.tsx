import {useRef} from "react";

export function useDebounce(callback: (...args: any[]) => void, delay: number) {
    const timeoutRef = useRef<number | undefined>();

    return (...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            callback(...args);
        }, delay);
    };
}
