import { useState } from 'react';
import useInterval from './useInterval';

export default function useSlider(N, speed = 5000) {
    const [slider, setSlider] = useState(0);
    useInterval((diff) => {
        setSlider((_) => Math.floor((diff / speed) % N));
    }, 2000);
    return slider;
}
