import React, { useState, useRef, useEffect } from 'react';

import "./login.css"

function Login({ changeLoginState }) {

    const [password, setPassword] = useState("");
    const inputRef = useRef(null);

    const OnPasswordInput = (value) => {
        setPassword(value.target.value);
        setTimeout(() => {
            changeLoginState(value.target.value);
        }, 100);
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);


    return (
        <>
            <div className='login-container'>
                <h3 className='login-text'>LOGIN</h3>
                <input ref={inputRef} onChange={OnPasswordInput} value={password} className='password-input' autoComplete='off' type='password' maxLength={4}></input>
            </div>
        </>
    );
};

export default Login;