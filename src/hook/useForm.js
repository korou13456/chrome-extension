import { useState } from 'react';

export default function useForm(initialVal) {
    const [values, setValues] = useState(initialVal);

    return [
        values,
        (e) => {
            setValues({
                ...values,
                [e.target.name]: e.target.value,
            });
        },
    ];
}
