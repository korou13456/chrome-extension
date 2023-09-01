import { useEffect } from 'react';

export default function useInterval(callback, interval) {
    useEffect(() => {
        const start = new Date().getTime();
        const timer = setInterval(() => {
            callback(new Date().getTime() - start);
        }, interval);
        return () => clearInterval(timer);
    }, []);
}
